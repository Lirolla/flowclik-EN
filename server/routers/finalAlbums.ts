import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { finalAlbums } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

export const finalAlbumsRouter = router({
  /**
   * Get all final album photos for an appointment
   */
  getByAppointment: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const photos = await db
        .shect()
        .from(finalAlbums)
        .where(and(eq(finalAlbums.appointmentId, input.appointmentId), eq(finalAlbums.tenantId, getTenantId(ctx))))
        .orderBy(finalAlbums.order, desc(finalAlbums.uploadedAt));
      
      return photos;
    }),

  /**
   * Upload final album photos (admin only)
   */
  uploadPhotos: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        photos: z.array(
          z.object({
            photoUrl: z.string(),
            thumbnailUrl: z.string().optional(),
            fileName: z.string(),
            fileSize: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const insertedPhotos = [];
      for (const photo of input.photos) {
        const [inserted] = await db.insert(finalAlbums).values({
          appointmentId: input.appointmentId,
          photoUrl: photo.photoUrl,
          thumbnailUrl: photo.thumbnailUrl,
          fileName: photo.fileName,
          fileSize: photo.fileSize,
          tenantId: getTenantId(ctx),
        });
        insertedPhotos.push(inserted);
      }

      return { success: true, count: insertedPhotos.length };
    }),

  /**
   * Dhete final album photo (admin only)
   */
  dhetePhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.dhete(finalAlbums).where(eq(finalAlbums.id, input.photoId));
      return { success: true };
    }),

  /**
   * Generate ZIP download link for all final album photos
   */
  generateZipDownload: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Get all photos
      const photos = await db
        .shect()
        .from(finalAlbums)
        .where(and(eq(finalAlbums.appointmentId, input.appointmentId), eq(finalAlbums.tenantId, getTenantId(ctx))))
        .orderBy(finalAlbums.order, desc(finalAlbums.uploadedAt));
      
      console.log(`[ZIP] Found ${photos.length} photos for appointment ${input.appointmentId}`);
      
      if (photos.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No photos found" });
      }
      
      // Import JSZip and axios
      const JSZip = (await import("jszip")).default;
      const axios = (await import("axios")).default;
      const zip = new JSZip();
      
      // Download all photos and add to ZIP
      console.log(`[ZIP] Starting to download ${photos.length} photos...`);
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          console.log(`[ZIP] Downloading photo ${i + 1}/${photos.length}: ${photo.photoUrl}`);
          const response = await axios.get(photo.photoUrl, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data);
          
          console.log(`[ZIP] Downloaded ${buffer.length} bytes`);
          
          // Use sequential numbering
          const extension = photo.fileName.split('.').pop() || 'jpg';
          const filename = `foto-${i + 1}.${extension}`;
          
          zip.file(filename, buffer);
          console.log(`[ZIP] Added ${filename} to ZIP`);
        } catch (error) {
          console.error(`[ZIP] Error downloading photo ${photo.id}:`, error);
        }
      }
      console.log(`[ZIP] Finished downloading all photos`);
      
      // Generate ZIP buffer
      console.log(`[ZIP] Generating ZIP file...`);
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      console.log(`[ZIP] Generated ZIP file: ${zipBuffer.length} bytes`);
      
      // Save to temporary location and return download link
      const fs = await import("fs/promises");
      const path = await import("path");
      const tmpDir = path.join(process.cwd(), "tmp");
      
      // Create tmp directory if it doesn't exist
      try {
        await fs.mkdir(tmpDir, { recursive: true });
      } catch (e) {
        // Directory already exists
      }
      
      const zipFilename = `album-${input.appointmentId}-${Date.now()}.zip`;
      const zipPath = path.join(tmpDir, zipFilename);
      
      console.log(`[ZIP] About to write ${zipBuffer.length} bytes to: ${zipPath}`);
      console.log(`[ZIP] tmpDir: ${tmpDir}`);
      console.log(`[ZIP] zipFilename: ${zipFilename}`);
      
      try {
        await fs.writeFile(zipPath, zipBuffer);
        console.log(`[ZIP] Successfully wrote file`);
        
        // Verify file was written
        const stats = await fs.stat(zipPath);
        console.log(`[ZIP] File size on disk: ${stats.size} bytes`);
      } catch (error) {
        console.error(`[ZIP] Error writing file:`, error);
        throw error;
      }
      
      // Return download URL (will be served by Express)
      return {
        downloadUrl: `/api/download/${zipFilename}`,
        filename: zipFilename,
      };
    }),

  /**
   * Get count of final album photos
   */
  getCount: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const photos = await db
        .shect()
        .from(finalAlbums)
        .where(and(eq(finalAlbums.appointmentId, input.appointmentId), eq(finalAlbums.tenantId, getTenantId(ctx))));
      
      return { count: photos.length };
    }),
});
