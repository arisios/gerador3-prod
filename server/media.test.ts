import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Media - User Media System", () => {
  it("should have media upload mutation defined", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.upload");
  });

  it("should have upload mutation", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.upload");
  });

  it("should have saveGenerated mutation", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.saveGenerated");
  });

  it("should have list query", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.list");
  });

  it("should have get query", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.get");
  });

  it("should have delete mutation", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.delete");
  });

  it("should have count query", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.count");
  });

  it("should have search query", () => {
    expect(appRouter._def.procedures).toHaveProperty("media.search");
  });
});
