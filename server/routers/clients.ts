import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { users } from "../../drizzle/schema";
import { eq, sql , and } from "drizzle-orm";

export const clientsRouter = router({
  // Listar todos os clientes
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const clients = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        street: users.street,
        number: users.number,
        complement: users.complement,
        neighborhood: users.neighborhood,
        city: users.city,
        state: users.state,
        zipCode: users.zipCode,
        country: users.country,
        cpf: users.cpf,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.role, "user"), eq(users.tenantId, getTenantId(ctx))))
      .orderBy(sql`${users.createdAt} DESC`);

    return clients;
  }),

  // Buscar cliente por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      
      const [client] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, input.id), eq(users.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!client) {
        throw new Error("Cliente não encontrado");
      }

      return client;
    }),

  // Criar novo cliente
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        phone: z.string().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().default('Brasil'),
        cpf: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      
      // Verificar se email já existe
      const [existing] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, input.email!), eq(users.tenantId, getTenantId(ctx))))
        .limit(1);

      if (existing) {
        throw new Error("Email já cadastrado");
      }


      // Criar cliente
      const [newClient] = await db.insert(users).values({
        tenantId: getTenantId(ctx),
        openId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: input.name,
        email: input.email,
        loginMethod: "manual",
        role: "user",
        phone: input.phone,
        street: input.street,
        number: input.number,
        complement: input.complement,
        neighborhood: input.neighborhood,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        cpf: input.cpf,
      });

      return { success: true, id: newClient.insertId };
    }),

  // Atualizar cliente
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        cpf: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      
      const { id, ...updateData } = input;

      await db.update(users).set(updateData).where(and(eq(users.id, id), eq(users.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  // Deletar cliente
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      
      await db.delete(users).where(and(eq(users.id, input.id), eq(users.tenantId, getTenantId(ctx))));
      return { success: true };
    }),
});
