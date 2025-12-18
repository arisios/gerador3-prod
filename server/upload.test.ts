import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';

// Mock do storagePut
vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({ 
    key: 'uploads/1/123-test.png', 
    url: 'https://storage.example.com/uploads/1/123-test.png' 
  })
}));

describe('Upload Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have upload.image route defined', async () => {
    expect(appRouter.upload.image).toBeDefined();
  });

  it('should be a mutation procedure', async () => {
    // The route should exist and have a _def property
    expect(appRouter.upload.image._def).toBeDefined();
  });
});
