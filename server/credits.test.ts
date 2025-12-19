import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-credits",
    email: "testcredits@example.com",
    name: "Test User Credits",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Credits System", () => {
  it("should get user balance", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // O getBalance deve retornar um número (pode ser 0 para novo usuário)
    const result = await caller.credits.getBalance();
    
    expect(typeof result.balance).toBe("number");
    expect(result.balance).toBeGreaterThanOrEqual(0);
  });

  it("should get credit packages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const packages = await caller.credits.getPackages();
    
    expect(Array.isArray(packages)).toBe(true);
    // Verificar estrutura dos pacotes
    if (packages.length > 0) {
      expect(packages[0]).toHaveProperty("name");
      expect(packages[0]).toHaveProperty("credits");
      expect(packages[0]).toHaveProperty("priceInCents");
    }
  });

  it("should get transaction history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const transactions = await caller.credits.getTransactions();
    
    expect(Array.isArray(transactions)).toBe(true);
  });

  it("should get image providers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.credits.getProviders();
    
    expect(providers).toHaveProperty("image");
    expect(providers).toHaveProperty("video");
    expect(Array.isArray(providers.image)).toBe(true);
    expect(Array.isArray(providers.video)).toBe(true);
  });

  it("should have correct provider structure", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.credits.getProviders();
    
    // Verificar estrutura dos providers de imagem
    if (providers.image.length > 0) {
      const imageProvider = providers.image[0];
      expect(imageProvider).toHaveProperty("name");
      expect(imageProvider).toHaveProperty("displayName");
      expect(imageProvider).toHaveProperty("creditsPerUse");
      expect(imageProvider).toHaveProperty("quality");
    }
    
    // Verificar estrutura dos providers de vídeo
    if (providers.video.length > 0) {
      const videoProvider = providers.video[0];
      expect(videoProvider).toHaveProperty("name");
      expect(videoProvider).toHaveProperty("displayName");
      expect(videoProvider).toHaveProperty("creditsPerUse");
      expect(videoProvider).toHaveProperty("quality");
    }
  });
});
