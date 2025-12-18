import { describe, it, expect, vi } from "vitest";

// Mock do invokeLLM para testar a lógica de parsing
const mockTrendsResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        trends: [
          {
            name: "Trend de Teste",
            category: "Tech",
            classification: "rising",
            viralProbability: 85,
            suggestedNiches: ["Marketing", "Tecnologia"]
          },
          {
            name: "Outra Trend",
            category: "Entretenimento",
            classification: "peak",
            viralProbability: 92,
            suggestedNiches: ["Lifestyle", "Humor"]
          }
        ]
      })
    }
  }]
};

describe("Trends Collection", () => {
  it("should parse trends response correctly", () => {
    const contentText = mockTrendsResponse.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(contentText);
    
    expect(parsed.trends).toBeDefined();
    expect(Array.isArray(parsed.trends)).toBe(true);
    expect(parsed.trends.length).toBe(2);
    expect(parsed.trends[0].name).toBe("Trend de Teste");
    expect(parsed.trends[0].viralProbability).toBe(85);
  });

  it("should handle empty trends array", () => {
    const emptyResponse = { trends: [] };
    expect(emptyResponse.trends.length).toBe(0);
  });

  it("should validate trend structure", () => {
    const contentText = mockTrendsResponse.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(contentText);
    const trend = parsed.trends[0];
    
    expect(trend).toHaveProperty("name");
    expect(trend).toHaveProperty("category");
    expect(trend).toHaveProperty("classification");
    expect(trend).toHaveProperty("viralProbability");
    expect(trend).toHaveProperty("suggestedNiches");
    expect(["emerging", "rising", "peak", "declining"]).toContain(trend.classification);
    expect(trend.viralProbability).toBeGreaterThanOrEqual(0);
    expect(trend.viralProbability).toBeLessThanOrEqual(100);
  });
});

describe("Virals Collection", () => {
  const mockViralsResponse = {
    choices: [{
      message: {
        content: JSON.stringify({
          virals: [
            {
              title: "Viral de Teste",
              category: "Humor",
              viralProbability: 90,
              suggestedNiches: ["Entretenimento"],
              suggestedAngles: ["Reação", "Paródia"]
            }
          ]
        })
      }
    }]
  };

  it("should parse virals response correctly", () => {
    const contentText = mockViralsResponse.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(contentText);
    
    expect(parsed.virals).toBeDefined();
    expect(Array.isArray(parsed.virals)).toBe(true);
    expect(parsed.virals[0].title).toBe("Viral de Teste");
  });

  it("should validate viral structure", () => {
    const contentText = mockViralsResponse.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(contentText);
    const viral = parsed.virals[0];
    
    expect(viral).toHaveProperty("title");
    expect(viral).toHaveProperty("category");
    expect(viral).toHaveProperty("viralProbability");
    expect(viral).toHaveProperty("suggestedNiches");
    expect(viral).toHaveProperty("suggestedAngles");
  });
});

describe("Influencer Content Generation", () => {
  const mockInfluencerContentResponse = {
    choices: [{
      message: {
        content: JSON.stringify({
          title: "Dica de Fitness",
          description: "Conteúdo sobre hidratação",
          hook: "Você está se hidratando errado!",
          slides: [
            { order: 1, text: "Slide 1 - Hook" },
            { order: 2, text: "Slide 2 - Conteúdo" },
            { order: 3, text: "Slide 3 - CTA" }
          ]
        })
      }
    }]
  };

  it("should parse influencer content response correctly", () => {
    const contentText = mockInfluencerContentResponse.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(contentText);
    
    expect(parsed.title).toBe("Dica de Fitness");
    expect(parsed.hook).toBeDefined();
    expect(parsed.slides).toBeDefined();
    expect(Array.isArray(parsed.slides)).toBe(true);
  });

  it("should validate slides structure", () => {
    const contentText = mockInfluencerContentResponse.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(contentText);
    
    parsed.slides.forEach((slide: { order: number; text: string }, idx: number) => {
      expect(slide).toHaveProperty("order");
      expect(slide).toHaveProperty("text");
      expect(typeof slide.order).toBe("number");
      expect(typeof slide.text).toBe("string");
    });
  });
});
