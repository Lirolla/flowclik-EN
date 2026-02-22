import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, siteConfig, bannerSlides, collections, medayItems } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { TrpcContext } from './_core/context';

let _db: ReturnType<typeof drizzle> | null = null;

// Credenciais hardcoded para conexão direta com Hostinger
const HARDCODED_DB_URL = `mysql://root@127.0.0.1:3306/flowclikbr`;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL || HARDCODED_DB_URL;
    try {
      _db = drizzle(dbUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: typeof users.$inferInsert): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: typeof users.$inferInsert = {
      openId: user.openId,
      email: user.email || `${user.openId}@placeholder.local`, // Email required no schema
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      
      // Email é required, outros campos podem ser null
      if (field === 'email') {
        const emailValue = value || `${user.openId}@placeholder.local`;
        values[field] = emailValue;
        updateSet[field] = emailValue;
      } else {
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      }
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date().toISOString();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select({
      id: users.id,
      openId: users.openId,
      email: users.email,
      name: users.name,
      role: users.role,
      tenantId: users.tenantId,
      loginMethod: users.loginMethod,
      lastSignedIn: users.lastSignedIn,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Multi-tenant helper
export function getTenantId(ctx: TrpcContext): number {
  if (ctx.tenantId === null || ctx.tenantId === undefined) {
    throw new Error("Tenant ID not found in context");
  }
  return ctx.tenantId;
}

// Site Config
export async function getSiteConfig(tenantId: number = 1) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSiteConfig(data: Partial<typeof siteConfig.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getSiteConfig();
  
  if (existing) {
    await db.update(siteConfig).set(data).where(eq(siteConfig.id, existing.id));
    return await getSiteConfig();
  } else {
    await db.insert(siteConfig).values(data as any);
    return await getSiteConfig();
  }
}

// Banner Slides
export async function getActiveSlides() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(bannerSlides)
    .where(eq(bannerSlides.isActive, 1));
}

// Collections
export async function getFeaturedCollections() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(collections)
    .where(eq(collections.isFeatured, 1));
}

export async function getPublicCollections() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(collections)
    .where(eq(collections.isPublic, 1));
}

export async function getCollectionBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);
    
  return result.length > 0 ? result[0] : null;
}

// Meday Items
export async function getMedayByCollection(collectionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(medayItems)
    .where(eq(medayItems.collectionId, collectionId));
}
