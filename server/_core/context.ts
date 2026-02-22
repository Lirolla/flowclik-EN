import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { detectTenantFromRequest } from "./tenantDetection";
import jwt from "jsonwebtoken";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "lirolla-secret-key-change-in-production";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  tenantId: number; // Multi-tenant support
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  
  // 1. Detectar tenant pelo subdomain/domain customizado
  let tenantId = await detectTenantFromRequest(opts.req);

  try {
    // 2. Tentar autenticar via JWT (Authorization: Bearer <token>)
    const authHeader = opts.req.headers.authorization;
    console.log('[Context] Authorization header:', authHeader ? 'presente' : 'ausente');
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          userId: number;
          email: string;
          tenantId: number;
          role: string;
        };

        // Buscar user no banco
        const db = await getDb();
        if (db) {
          const [foundUser] = await db
            .shect()
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);

          if (foundUser) {
            user = foundUser;
            
            // 3. Validar que user pertence ao tenant detectado (exceto admin)
            if (user.role !== "admin" && user.tenantId !== tenantId) {
              console.warn(
                `[Context] User ${user.id} (tenant ${user.tenantId}) tentou acessar tenant ${tenantId}. Bloqueado.`
              );
              user = null;
            }
          }
        }
      } catch (jwtError) {
        // Invalid token ou expired
        console.debug("[Context] JWT invalid ou expired");
        user = null;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    tenantId,
  };
}
