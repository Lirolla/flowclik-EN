import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lirolla-secret-key-change-in-production";
const SALT_ROUNDS = 10;

export const customAuthRouter = router({
  // Registrar novo usuário
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Senha must ter pelo menos 6 caracteres"),
        name: z.string().min(2, "Nome must ter pelo menos 2 caracteres"),
        tenantId: z.number().optional(), // Para associar a um tenant specific
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if email already exists
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This email is already registered",
        });
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

      // Criar usuário
      const [newUser] = await db.insert(users).values({
        email: input.email,
        password: passwordHash,
        name: input.name,
        tenantId: input.tenantId || 1, // Tenant default
        loginMethod: "email",
        role: "user",
      });

      // Buscar usuário criado
      const [createdUser] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          tenantId: users.tenantId,
        })
        .from(users)
        .where(eq(users.id, newUser.insertId))
        .limit(1);

      if (!createdUser) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar usuário" });
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: createdUser.id,
          email: createdUser.email,
          tenantId: createdUser.tenantId,
          role: createdUser.role,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
          tenantId: createdUser.tenantId,
        },
        token,
      };
    }),

  // Login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(1, "Senha obrigatória"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar usuário por email
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          password: users.password,
          name: users.name,
          role: users.role,
          tenantId: users.tenantId,
          loginMethod: users.loginMethod,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user || !user.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Verify senha
      const passwordMatch = await bcrypt.compare(input.password, user.password);

      if (!passwordMatch) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Atualizar lastSignedIn
      const now = new Date();
      const mysqlTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
      await db
        .update(users)
        .set({ lastSignedIn: mysqlTimestamp })
        .where(eq(users.id, user.id));

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        },
        token,
      };
    }),

  // Obter usuário atual (via JWT)
  me: publicProcedure.query(async ({ ctx }) => {
    // Token JWT vem do header Authorization: Bearer <token>
    const authHeader = ctx.req?.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
        tenantId: number;
        role: string;
      };

      const db = await getDb();
      if (!db) return null;

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          tenantId: users.tenantId,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      };
    } catch (error) {
      return null;
    }
  }),

  // Logout (only limpa token no frontend)
  logout: protectedProcedure.mutation(async () => {
    return { success: true };
  }),

  // Change password
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, "Nova senha must ter pelo menos 6 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          password: users.password,
          name: users.name,
          role: users.role,
          tenantId: users.tenantId,
        })
        .from(users)
        .where(eq(users.id, ctx.user!.id))
        .limit(1);

      if (!user || !user.password) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Verify senha atual
      const passwordMatch = await bcrypt.compare(input.currentPassword, user.password);

      if (!passwordMatch) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha atual incorreta",
        });
      }

      // Hash da nova senha
      const newPasswordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

      // Atualizar senha
      await db
        .update(users)
        .set({ password: newPasswordHash })
        .where(eq(users.id, user.id));

      return { success: true };
    }),
});
