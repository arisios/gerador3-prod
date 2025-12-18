import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';

// Mock do generateImage
vi.mock('./_core/imageGeneration', () => ({
  generateImage: vi.fn().mockResolvedValue({ url: 'https://example.com/image.png' })
}));

// Mock do DB
vi.mock('./db', () => ({
  getContentById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    projectId: 1,
    type: 'carousel',
    title: 'Teste',
  }),
  getSlidesByContent: vi.fn().mockResolvedValue([
    { id: 1, contentId: 1, order: 1, text: 'Slide 1', imagePrompt: 'prompt 1', imageBank: [] },
    { id: 2, contentId: 1, order: 2, text: 'Slide 2', imagePrompt: 'prompt 2', imageBank: [] },
  ]),
  getSlideById: vi.fn().mockResolvedValue({
    id: 1,
    contentId: 1,
    order: 1,
    text: 'Slide 1',
    imageBank: ['https://example.com/old.png'],
  }),
  updateSlide: vi.fn().mockResolvedValue(undefined),
}));

describe('Slides Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have generateAllImages route defined', async () => {
    expect(appRouter.slides.generateAllImages).toBeDefined();
  });

  it('should have uploadImage route defined', async () => {
    expect(appRouter.slides.uploadImage).toBeDefined();
  });

  it('should have update route defined', async () => {
    expect(appRouter.slides.update).toBeDefined();
  });

  it('should have generateImage route defined', async () => {
    expect(appRouter.slides.generateImage).toBeDefined();
  });
});
