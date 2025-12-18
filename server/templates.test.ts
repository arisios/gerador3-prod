import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";

// Mock do invokeLLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          templateId: "provocative-question",
          accentColorId: "neon-orange",
          reason: "Texto contém pergunta provocativa"
        })
      }
    }]
  })
}));

describe("Templates Router", () => {
  it("should have getVisualTemplates route defined", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.templates.getVisualTemplates();
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
  });

  it("should have getAccentColors route defined", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const colors = await caller.templates.getAccentColors();
    expect(colors).toBeDefined();
    expect(Array.isArray(colors)).toBe(true);
    expect(colors.length).toBeGreaterThan(0);
  });

  it("should have 24 visual templates", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.templates.getVisualTemplates();
    expect(templates.length).toBe(24);
  });

  it("should have 10 accent colors", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const colors = await caller.templates.getAccentColors();
    expect(colors.length).toBe(10);
  });

  it("should have selectAutoTemplate route defined", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, name: "Test", openId: "test", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.templates.selectAutoTemplate({
      text: "Por que você ainda não está usando essa estratégia?"
    });
    
    expect(result).toBeDefined();
    expect(result.templateId).toBeDefined();
    expect(result.accentColorId).toBeDefined();
    expect(result.reason).toBeDefined();
  });

  it("should have selectVariedTemplates route defined", async () => {
    // Este teste verifica apenas que a rota existe e aceita o input correto
    // O teste real precisa de um contentId válido no banco
    const caller = appRouter.createCaller({
      user: { id: 1, name: "Test", openId: "test", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Testar que a rota existe verificando o tipo
    expect(caller.templates.selectVariedTemplates).toBeDefined();
    expect(typeof caller.templates.selectVariedTemplates).toBe("function");
  });

  it("should have design templates with correct IDs", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.templates.getDesignTemplates();
    
    // Verificar que os IDs de fallback existem nos templates
    const fallbackIds = ['split-top-image', 'fullbleed-bottom', 'card-centered', 'minimal-text-only', 'bold-statement', 'split-left-image'];
    
    for (const id of fallbackIds) {
      const found = templates.find((t: { id: string }) => t.id === id);
      expect(found).toBeDefined();
    }
  });

  it("should have color palettes with correct IDs", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const palettes = await caller.templates.getColorPalettes();
    
    // Verificar que a paleta padrão existe
    const darkPurple = palettes.find((p: { id: string }) => p.id === 'dark-purple');
    expect(darkPurple).toBeDefined();
    expect(darkPurple.colors.background).toBe('#0a0a0a');
    expect(darkPurple.colors.text).toBe('#ffffff');
  });
});
