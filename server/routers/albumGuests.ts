import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { albumGuests, collections } from "../../drizzle/schema";
import { eq, desc, sql , and } from "drizzle-orm";

export const albumGuestsRouter = router({
  // Registrar visualização do álbum (captura de lead)
  register: publicProcedure
    .input(
      z.object({
        collectionSlug: z.string(),
        email: z.string().email("Invalid email"),
        name: z.string().optional(),
        relationship: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find collection by slug
      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.slug, input.collectionSlug), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection) {
        throw new Error("Album not found");
      }

      // Check if email already registered for this collection
      const [existing] = await db
        .select()
        .from(albumGuests)
        .where(
          sql`${albumGuests.collectionId} = ${collection.id} AND ${albumGuests.email} = ${input.email}`
        )
        .limit(1);

      if (existing) {
        // Update viewedAt timestamp
        await db
          .update(albumGuests)
          .set({ viewedAt: new Date().toISOString() })
          .where(and(eq(albumGuests.id, existing.id), eq(albumGuests.tenantId, getTenantId(ctx))));
        
        return { success: true, alreadyRegistered: true };
      }

      // Register new guest
      await db.insert(albumGuests).values({
        collectionId: collection.id,
        email: input.email,
        name: input.name || null,
        relationship: input.relationship || null,
        viewedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        tenantId: getTenantId(ctx),
      });

      return { success: true, alreadyRegistered: false };
    }),

  // Verify se email already is registrado (para pular modal)
  checkEmail: publicProcedure
    .input(
      z.object({
        collectionSlug: z.string(),
        email: z.string().email(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { registered: false };

      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.slug, input.collectionSlug), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection) return { registered: false };

      const [existing] = await db
        .select()
        .from(albumGuests)
        .where(
          sql`${albumGuests.collectionId} = ${collection.id} AND ${albumGuests.email} = ${input.email}`
        )
        .limit(1);

      return { registered: !!existing };
    }),

  // Listar leads capturados (admin)
  listByCollection: protectedProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const guests = await db
        .select()
        .from(albumGuests)
        .where(and(eq(albumGuests.collectionId, input.collectionId), eq(albumGuests.tenantId, getTenantId(ctx))))
        .orderBy(desc(albumGuests.createdAt));

      return guests;
    }),

  // Listar todos os leads (admin)
  listAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const guests = await db
      .select({
        id: albumGuests.id,
        email: albumGuests.email,
        name: albumGuests.name,
        relationship: albumGuests.relationship,
        viewedAt: albumGuests.viewedAt,
        createdAt: albumGuests.createdAt,
        collectionId: albumGuests.collectionId,
        collectionName: collections.name,
        collectionSlug: collections.slug,
      })
      .from(albumGuests)
      .leftJoin(collections, eq(albumGuests.collectionId, collections.id))
      .orderBy(desc(albumGuests.createdAt));

    return guests;
  }),

  // Get leads by appointment ID
  getByAppointment: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      // Find collection by appointmentId
      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.appointmentId, input.appointmentId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection) return [];

      // Get guests for this collection
      const guests = await db
        .select({
          id: albumGuests.id,
          guestEmail: albumGuests.email,
          guestName: albumGuests.name,
          relationship: albumGuests.relationship,
          viewedAt: albumGuests.viewedAt,
          createdAt: albumGuests.createdAt,
        })
        .from(albumGuests)
        .where(and(eq(albumGuests.collectionId, collection.id), eq(albumGuests.tenantId, getTenantId(ctx))))
        .orderBy(desc(albumGuests.createdAt));

      return guests;
    }),

  // Estatísticas de leads (admin)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { total: 0, byCollection: [] };

    const [totalResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(albumGuests)
      .where(eq(albumGuests.tenantId, getTenantId(ctx)));

    const byCollection = await db
      .select({
        collectionId: albumGuests.collectionId,
        collectionName: collections.name,
        count: sql<number>`COUNT(*)`,
      })
      .from(albumGuests)
      .leftJoin(collections, eq(albumGuests.collectionId, collections.id))
      .groupBy(albumGuests.collectionId);

    return {
      total: totalResult?.count || 0,
      byCollection,
    };
  }),
});
