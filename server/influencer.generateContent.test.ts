import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

describe('Influencer Products - Generate Content', () => {
  const mockContext: TrpcContext = {
    user: { id: 1, openId: 'test', name: 'Test User', email: 'test@test.com', role: 'admin' },
  };

  const caller = appRouter.createCaller(mockContext);
  const influencerId = 510002;
  let productId: number;

  beforeAll(async () => {
    // Criar produto para testes
    const product = await caller.influencers.products.createProduct({
      influencerId,
      name: 'Filtro de Óleo Test',
      description: 'Filtro de óleo de alta qualidade para teste',
      selectedApproaches: [
        'Storytelling: O desastre da troca de óleo',
        'Educação: Mecânico para leigos',
        'Economia: Custo do esquecimento',
      ],
    });
    productId = product.id;
    console.log('Produto criado para testes:', productId);
  });

  it('should generate content with product and no context', { timeout: 30000 }, async () => {
    const result = await caller.influencers.products.generateContentWithProduct({
      productId,
      influencerId,
      contextType: 'none',
    });

    console.log('Conteúdo gerado:', JSON.stringify(result, null, 2));

    expect(result).toBeDefined();
    expect(result.hook).toBeDefined();
    expect(typeof result.hook).toBe('string');
    expect(result.hook.length).toBeGreaterThan(0);
    
    expect(result.script).toBeDefined();
    expect(typeof result.script).toBe('string');
    expect(result.script.length).toBeGreaterThan(0);
    
    expect(result.cta).toBeDefined();
    expect(typeof result.cta).toBe('string');
    
    expect(result.hashtags).toBeInstanceOf(Array);
    expect(result.hashtags.length).toBeGreaterThan(0);
    
    expect(result.tips).toBeDefined();
    expect(typeof result.tips).toBe('string');
  });

  it('should generate content with product and free subject', { timeout: 30000 }, async () => {
    const freeSubject = 'Viagem de férias para a praia';

    const result = await caller.influencers.products.generateContentWithProduct({
      productId,
      influencerId,
      contextType: 'subject',
      freeSubject,
    });

    console.log('Conteúdo gerado com assunto livre:', JSON.stringify(result, null, 2));

    expect(result).toBeDefined();
    expect(result.hook).toBeDefined();
    expect(result.script).toBeDefined();
    expect(result.cta).toBeDefined();
    expect(result.hashtags).toBeInstanceOf(Array);
    expect(result.hashtags.length).toBeGreaterThan(0);
    expect(result.tips).toBeDefined();
  });
});
