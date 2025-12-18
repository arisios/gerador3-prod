import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do LLM
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          businessAnalysis: {
            name: "Loja Teste",
            niche: "E-commerce",
            mainOffer: "Produtos diversos",
            uniqueValue: "Preços baixos",
            tone: "Informal",
            keywords: ["loja", "produtos", "online"]
          },
          potentialClients: [
            {
              name: "Maria Compradora",
              description: "Mulher que busca praticidade",
              demographics: {
                age: "25-35",
                gender: "Feminino",
                location: "Brasil",
                income: "R$ 3.000 - R$ 6.000",
                occupation: "Profissional liberal"
              },
              psychographics: {
                values: ["Praticidade", "Economia"],
                interests: ["Compras online", "Moda"],
                lifestyle: "Urbano e conectado",
                goals: ["Economizar tempo", "Encontrar boas ofertas"],
                frustrations: ["Frete caro", "Demora na entrega"]
              },
              buyingMotivation: "Busca praticidade e bons preços",
              mainPain: "Falta de tempo para ir a lojas físicas"
            }
          ]
        })
      }
    }]
  })
}));

// Mock do DB
vi.mock('./db', () => ({
  createProject: vi.fn().mockResolvedValue(1),
  getProjectById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    name: "Teste",
    sourceType: "site",
    sourceUrl: "https://exemplo.com",
    analysis: { name: "Loja Teste", niche: "E-commerce" }
  }),
  updateProject: vi.fn().mockResolvedValue(undefined),
  createIdealClients: vi.fn().mockResolvedValue(undefined),
  getIdealClientsByProject: vi.fn().mockResolvedValue([
    { id: 1, name: "Maria Compradora", isSelected: false },
    { id: 2, name: "João Executivo", isSelected: false }
  ]),
  updateIdealClient: vi.fn().mockResolvedValue(undefined),
  getSelectedIdealClientsByProject: vi.fn().mockResolvedValue([
    { id: 1, name: "Maria Compradora", isSelected: true }
  ]),
  deletePainsByProject: vi.fn().mockResolvedValue(undefined),
  deleteIdealClientsByProject: vi.fn().mockResolvedValue(undefined),
  createPains: vi.fn().mockResolvedValue(undefined),
}));

describe('Projects - Analyze Link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have analyzeLink route defined', async () => {
    // Verificar que a rota existe no router
    const { appRouter } = await import('./routers');
    expect(appRouter.projects.analyzeLink).toBeDefined();
  });

  it('should have selectClientsAndGeneratePains route defined', async () => {
    const { appRouter } = await import('./routers');
    expect(appRouter.projects.selectClientsAndGeneratePains).toBeDefined();
  });

  it('should have updateIdealClientSelection route defined', async () => {
    const { appRouter } = await import('./routers');
    expect(appRouter.projects.updateIdealClientSelection).toBeDefined();
  });
});

describe('Projects - Pains Generation', () => {
  it('should generate pains in 3 categories', async () => {
    // Verificar que o prompt de geração de dores existe
    const { generatePainsBySelectedClientsPrompt } = await import('./prompts');
    
    const prompt = generatePainsBySelectedClientsPrompt(
      JSON.stringify({ name: "Loja", niche: "E-commerce" }),
      JSON.stringify([{ name: "Maria Compradora" }])
    );
    
    expect(prompt).toContain("DORES PRINCIPAIS");
    expect(prompt).toContain("DORES SECUNDÁRIAS");
    expect(prompt).toContain("DORES INEXPLORADAS");
    expect(prompt).toContain("Maria Compradora");
  });

  it('should have analyzeLinkDeepPrompt defined', async () => {
    const { analyzeLinkDeepPrompt } = await import('./prompts');
    
    const prompt = analyzeLinkDeepPrompt("https://exemplo.com", "site");
    
    expect(prompt).toContain("https://exemplo.com");
    expect(prompt).toContain("site");
    expect(prompt).toContain("potentialClients");
    expect(prompt).toContain("businessAnalysis");
  });
});

describe('Database - Ideal Clients', () => {
  it('should have updateIdealClient function', async () => {
    const db = await import('./db');
    expect(db.updateIdealClient).toBeDefined();
  });

  it('should have getSelectedIdealClientsByProject function', async () => {
    const db = await import('./db');
    expect(db.getSelectedIdealClientsByProject).toBeDefined();
  });

  it('should have deleteIdealClientsByProject function', async () => {
    const db = await import('./db');
    expect(db.deleteIdealClientsByProject).toBeDefined();
  });
});
