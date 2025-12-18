import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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

describe("projects router", () => {
  it("should list projects for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.list();
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("content router", () => {
  it("should throw NOT_FOUND for non-existent project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // content.list requires projectId - should throw for non-existent project
    await expect(caller.content.list({ projectId: 999999 })).rejects.toThrow();
  });
});

describe("influencers router", () => {
  it("should list influencers for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.influencers.list();
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("trends router", () => {
  it("should list trends for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.trends.list({ source: "google", limit: 10 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("virals router", () => {
  it("should list virals for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.virals.list({ source: "viralhog", limit: 10 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});
