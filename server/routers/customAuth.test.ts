import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

describe("Custom Auth - Login com Email/Senha", () => {
  it("must fazer login com contato@flowclik.com", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {
        cookie: () => {},
      } as any,
    });

    const result = await caller.customAuth.login({
      email: "contato@flowclik.com",
      password: "Pagotto24",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("contato@flowclik.com");
    expect(result.user?.role).toBe("admin");
    expect(result.user?.name).toBe("Admin FlowClik");
    expect(result.token).toBeDefined();

    console.log("✅ Login bem-sucedido:", {
      email: result.user?.email,
      name: result.user?.name,
      role: result.user?.role,
      tenantId: result.user?.tenantId,
    });
  });

  it("must rejeitar senha incorreta", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {
        cookie: () => {},
      } as any,
    });

    await expect(
      caller.customAuth.login({
        email: "contato@flowclik.com",
        password: "senhaerrada",
      })
    ).rejects.toThrow();
  });
});
