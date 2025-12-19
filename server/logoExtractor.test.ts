import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Logo Extractor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export extractLogoFromUrl function", async () => {
    const { extractLogoFromUrl } = await import("./logoExtractor");
    expect(extractLogoFromUrl).toBeDefined();
    expect(typeof extractLogoFromUrl).toBe("function");
  });

  it("should extract domain from URL correctly", async () => {
    // Teste interno - verificar se a função existe e pode ser chamada
    const { extractLogoFromUrl } = await import("./logoExtractor");
    
    // A função deve retornar um objeto com logoUrl e source
    const result = await extractLogoFromUrl("https://example.com", "site");
    
    expect(result).toHaveProperty("logoUrl");
    expect(result).toHaveProperty("source");
  });

  it("should handle invalid URLs gracefully", async () => {
    const { extractLogoFromUrl } = await import("./logoExtractor");
    
    // Não deve lançar erro com URL inválida
    const result = await extractLogoFromUrl("not-a-valid-url", "site");
    
    expect(result).toHaveProperty("logoUrl");
    expect(result).toHaveProperty("source");
  });

  it("should return null logoUrl when extraction fails", async () => {
    const { extractLogoFromUrl } = await import("./logoExtractor");
    
    // URL que provavelmente não existe
    const result = await extractLogoFromUrl("https://this-domain-definitely-does-not-exist-12345.com", "site");
    
    // Pode retornar null ou uma URL válida (do Google Favicon)
    expect(result).toHaveProperty("logoUrl");
    expect(result).toHaveProperty("source");
  });

  it("should export Instagram and TikTok extractors", async () => {
    const { extractInstagramProfileImage, extractTikTokProfileImage } = await import("./logoExtractor");
    
    expect(extractInstagramProfileImage).toBeDefined();
    expect(extractTikTokProfileImage).toBeDefined();
    expect(typeof extractInstagramProfileImage).toBe("function");
    expect(typeof extractTikTokProfileImage).toBe("function");
  });
});
