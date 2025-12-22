import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Influencer Products - Clientes Ideais e Dores', () => {
  const mockUser = { id: 1, openId: 'test', name: 'Test User', email: 'test@test.com' };
  const mockContext = { user: mockUser };

  it('deve gerar 5 clientes ideais para um produto', async () => {
    const caller = appRouter.createCaller(mockContext as any);
    
    try {
      const result = await caller.influencers.products.generateIdealClients({
        productId: 7
      });
      
      console.log('✅ Clientes gerados:', result.clients.length);
      expect(result.clients).toBeDefined();
      expect(result.clients.length).toBe(5);
      expect(result.clients[0]).toHaveProperty('name');
      expect(result.clients[0]).toHaveProperty('description');
      expect(result.clients[0]).toHaveProperty('motivation');
      expect(result.clients[0]).toHaveProperty('objection');
      
      console.log('\nExemplo de cliente gerado:');
      console.log('Nome:', result.clients[0].name);
      console.log('Descrição:', result.clients[0].description.substring(0, 80) + '...');
      console.log('Motivação:', result.clients[0].motivation);
      console.log('Objeção:', result.clients[0].objection);
    } catch (error: any) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  });

  it('deve salvar cliente ideal escolhido', async () => {
    const caller = appRouter.createCaller(mockContext as any);
    
    try {
      const clienteEscolhido = "João, 28 anos, Mecânico Iniciante - Trabalha em oficina pequena e quer melhorar conhecimento técnico";
      
      const result = await caller.influencers.products.saveIdealClient({
        productId: 7,
        idealClient: clienteEscolhido
      });
      
      console.log('✅ Cliente salvo com sucesso');
      expect(result.success).toBe(true);
      
      // Verificar se foi salvo
      const product = await db.getInfluencerProductById(7);
      console.log('Cliente salvo no banco:', product?.idealClient);
      expect(product?.idealClient).toBe(clienteEscolhido);
    } catch (error: any) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  });

  it('deve gerar dores para o cliente ideal', async () => {
    const caller = appRouter.createCaller(mockContext as any);
    
    try {
      const result = await caller.influencers.products.generatePains({
        productId: 7
      });
      
      console.log('✅ Dores geradas:', result.pains.length);
      expect(result.pains).toBeDefined();
      expect(result.pains.length).toBeGreaterThan(0);
      
      console.log('\nDores geradas:');
      result.pains.forEach((dor, i) => {
        console.log(`${i+1}. ${dor}`);
      });
      
      // Verificar se foram salvas
      const product = await db.getInfluencerProductById(7);
      console.log('\nDores salvas no banco:', product?.pains?.length);
      expect(product?.pains).toBeDefined();
      expect(product?.pains?.length).toBeGreaterThan(0);
    } catch (error: any) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  });
});
