import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { downloadPermissions, downloadLogs, collections } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const downloadControlRouter = router({
  /**
   * Check if download is allowed for a collection (public - client checks before downloading)
   */
  checkPermission: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [permission] = await db
        .select()
        .from(downloadPermissions)
        .where(and(eq(downloadPermissions.collectionId, input.collectionId), eq(downloadPermissions.tenantId, getTenantId(ctx))));

      if (!permission) {
        return { allowed: false, expiresAt: null };
      }

      // Check if expired
      if (permission.downloadExpiresAt && new Date(permission.downloadExpiresAt) < new Date()) {
        return { allowed: false, expiresAt: permission.downloadExpiresAt };
      }

      return { 
        allowed: permission.allowDownload, 
        expiresAt: permission.downloadExpiresAt 
      };
    }),

  /**
   * Toggle download permission for a collection (admin only)
   */
  togglePermission: protectedProcedure
    .input(z.object({
      collectionId: z.number(),
      allowDownload: z.boolean(),
      downloadExpiresAt: z.string().optional(), // ISO date string
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Check if permission already exists
      const [existing] = await db
        .select()
        .from(downloadPermissions)
        .where(and(eq(downloadPermissions.collectionId, input.collectionId), eq(downloadPermissions.tenantId, getTenantId(ctx))));

      if (existing) {
        // Update existing permission
        await db
          .update(downloadPermissions)
          .set({
            allowDownload: input.allowDownload ? 1 : 0,
            downloadExpiresAt: input.downloadExpiresAt ? new Date(input.downloadExpiresAt).toISOString() : null,
          })
          .where(and(eq(downloadPermissions.collectionId, input.collectionId), eq(downloadPermissions.tenantId, getTenantId(ctx))));
      } else {
        // Create new permission
        await db.insert(downloadPermissions).values({
          collectionId: input.collectionId,
          allowDownload: input.allowDownload ? 1 : 0,
          downloadExpiresAt: input.downloadExpiresAt ? new Date(input.downloadExpiresAt).toISOString() : null,
          tenantId: getTenantId(ctx),
        });
      }

      return { success: true };
    }),

  /**
   * Log a download (track when client downloads photos)
   */
  logDownload: publicProcedure
    .input(z.object({
      collectionId: z.number(),
      userId: z.number(),
      downloadType: z.enum(["single_photo", "all_photos_zip"]),
      photoId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.insert(downloadLogs).values({
        collectionId: input.collectionId,
        userId: input.userId,
        downloadType: input.downloadType,
        photoId: input.photoId,
      });

      return { success: true };
    }),

  /**
   * Get download logs for a collection (admin only)
   */
  getLogs: protectedProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const logs = await db
        .select()
        .from(downloadLogs)
        .where(and(eq(downloadLogs.collectionId, input.collectionId), eq(downloadLogs.tenantId, getTenantId(ctx))));

      return logs;
    }),

  /**
   * Get all download permissions (admin only)
   */
  getAllPermissions: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const permissions = await db
        .select()
        .from(downloadPermissions)
        .where(eq(downloadPermissions.tenantId, getTenantId(ctx)));

      return permissions;
    }),
});
