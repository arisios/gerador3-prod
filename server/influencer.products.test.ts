import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Influencer Products API", () => {
  // IDs obtidos do banco de dados
  const TEST_USER_ID = 1;
  const TEST_INFLUENCER_ID = 510002;

  const ctx: TrpcContext = {
    user: { 
      id: TEST_USER_ID, 
      openId: "test-user", 
      name: "Test User", 
      email: "test@example.com", 
      role: "user" 
    },
    req: {} as any,
    res: {} as any,
  };

  it("should analyze product and return suggested approaches", async () => {
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.influencers.products.analyzeProduct({
      influencerId: TEST_INFLUENCER_ID,
      name: "Óleo de Motor Premium",
      description: "Óleo sintético de alta performance",
    });

    expect(result).toHaveProperty("approaches");
    expect(Array.isArray(result.approaches)).toBe(true);
    expect(result.approaches.length).toBeGreaterThan(0);
    console.log(`✅ ${result.approaches.length} abordagens sugeridas pela IA`);
  }, 30000); // 30s timeout para chamada de IA

  it("should create a product with suggested approaches", async () => {
    const caller = appRouter.createCaller(ctx);
    
    // Primeiro, analisar o produto
    const analysis = await caller.influencers.products.analyzeProduct({
      influencerId: TEST_INFLUENCER_ID,
      name: "Bateria Automotiva Test",
      description: "Bateria de longa duração para testes",
    });

    // Depois, criar o produto
    const result = await caller.influencers.products.createProduct({
      influencerId: TEST_INFLUENCER_ID,
      name: "Bateria Automotiva Test",
      description: "Bateria de longa duração para testes",
      suggestedApproaches: analysis.approaches,
      selectedApproaches: analysis.approaches.slice(0, 2),
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    console.log("✅ Produto criado com ID:", result.id);
  }, 30000);

  it("should list products for an influencer", async () => {
    const caller = appRouter.createCaller(ctx);
    
    const products = await caller.influencers.products.listProducts({
      influencerId: TEST_INFLUENCER_ID,
    });

    expect(Array.isArray(products)).toBe(true);
    console.log(`✅ ${products.length} produto(s) encontrado(s)`);
  });

  it("should update product selected approaches", async () => {
    const caller = appRouter.createCaller(ctx);
    
    // Listar produtos
    const products = await caller.influencers.products.listProducts({
      influencerId: TEST_INFLUENCER_ID,
    });

    if (products.length > 0) {
      const product = products[0];
      const newSelectedApproaches = product.suggestedApproaches.slice(0, 1);

      const result = await caller.influencers.products.updateProduct({
        id: product.id,
        selectedApproaches: newSelectedApproaches,
      });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      console.log("✅ Produto atualizado com sucesso");
    } else {
      console.log("⚠️  Nenhum produto para atualizar (rode o teste de criar primeiro)");
    }
  });

  it("should delete a test product", async () => {
    const caller = appRouter.createCaller(ctx);
    
    // Listar produtos
    const products = await caller.influencers.products.listProducts({
      influencerId: TEST_INFLUENCER_ID,
    });

    // Encontrar produto de teste
    const testProduct = products.find(p => p.name.includes("Test"));

    if (testProduct) {
      const initialCount = products.length;

      const result = await caller.influencers.products.deleteProduct({
        id: testProduct.id,
      });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      console.log("✅ Produto de teste excluído");

      // Verificar que foi excluído
      const updatedProducts = await caller.influencers.products.listProducts({
        influencerId: TEST_INFLUENCER_ID,
      });
      expect(updatedProducts.length).toBe(initialCount - 1);
    } else {
      console.log("⚠️  Nenhum produto de teste para excluir");
    }
  });
});
