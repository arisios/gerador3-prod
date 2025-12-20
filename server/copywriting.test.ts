import { describe, it, expect } from "vitest";
import { voiceTones, platforms } from "@shared/templates";
import { generateContentPrompt } from "./prompts";

describe("Copywriting - Voice Tones", () => {
  it("should have 8 voice tones defined", () => {
    expect(voiceTones).toHaveLength(8);
  });

  it("should have all required voice tone properties", () => {
    for (const tone of voiceTones) {
      expect(tone).toHaveProperty("id");
      expect(tone).toHaveProperty("name");
      expect(tone).toHaveProperty("description");
      expect(tone).toHaveProperty("characteristics");
      expect(tone).toHaveProperty("examples");
      expect(Array.isArray(tone.characteristics)).toBe(true);
      expect(Array.isArray(tone.examples)).toBe(true);
    }
  });

  it("should have casual voice tone", () => {
    const casual = voiceTones.find(t => t.id === "casual");
    expect(casual).toBeDefined();
    expect(casual?.name).toBe("Conversa entre Amigos");
  });

  it("should have professional voice tone", () => {
    const professional = voiceTones.find(t => t.id === "professional");
    expect(professional).toBeDefined();
    expect(professional?.name).toBe("Profissional/Corporativo");
  });

  it("should have storytelling voice tone", () => {
    const storytelling = voiceTones.find(t => t.id === "storytelling");
    expect(storytelling).toBeDefined();
    expect(storytelling?.name).toBe("Storytelling/Narrativo");
  });
});

describe("Copywriting - Platforms", () => {
  it("should have 2 platforms defined", () => {
    expect(platforms).toHaveLength(2);
  });

  it("should have Instagram platform with correct config", () => {
    const instagram = platforms.find(p => p.id === "instagram");
    expect(instagram).toBeDefined();
    expect(instagram?.maxCharsPerSlide).toBe(120);
    expect(instagram?.minSlides).toBe(5);
    expect(instagram?.maxSlides).toBe(10);
  });

  it("should have TikTok platform with correct config", () => {
    const tiktok = platforms.find(p => p.id === "tiktok");
    expect(tiktok).toBeDefined();
    expect(tiktok?.maxCharsPerSlide).toBe(60);
    expect(tiktok?.minSlides).toBe(3);
    expect(tiktok?.maxSlides).toBe(5);
  });
});

describe("Copywriting - Content Prompt", () => {
  it("should generate prompt with platform and voiceTone", () => {
    const prompt = generateContentPrompt({
      template: "antes-depois",
      templateStructure: ["Hook", "Antes", "Depois", "CTA"],
      pain: "Falta de tempo para cozinhar",
      niche: "Alimentação saudável",
      objective: "sale",
      person: "second",
      platform: "instagram",
      voiceTone: "casual",
      clickbait: false,
    });

    expect(prompt).toContain("Instagram");
    expect(prompt).toContain("casual");
    expect(prompt).toContain("Falta de tempo para cozinhar");
    expect(prompt).toContain("VENDA");
    expect(prompt).toContain("120");
  });

  it("should generate TikTok prompt with shorter character limit", () => {
    const prompt = generateContentPrompt({
      template: "antes-depois",
      templateStructure: ["Hook", "Antes", "Depois", "CTA"],
      pain: "Falta de tempo para cozinhar",
      niche: "Alimentação saudável",
      objective: "growth",
      person: "first",
      platform: "tiktok",
      voiceTone: "humorous",
      clickbait: true,
    });

    expect(prompt).toContain("TikTok");
    expect(prompt).toContain("60");
    expect(prompt).toContain("CRESCIMENTO");
    expect(prompt).toContain("humorous");
  });

  it("should include voice tone details when provided", () => {
    const prompt = generateContentPrompt({
      template: "antes-depois",
      templateStructure: ["Hook", "Antes", "Depois", "CTA"],
      pain: "Falta de tempo para cozinhar",
      niche: "Alimentação saudável",
      objective: "authority",
      person: "third",
      platform: "instagram",
      voiceTone: "professional",
      voiceToneDetails: {
        characteristics: ["Use termos técnicos", "Seja objetivo"],
        examples: ["Estudos comprovam que..."],
      },
      clickbait: false,
    });

    expect(prompt).toContain("Use termos técnicos");
    expect(prompt).toContain("Seja objetivo");
    expect(prompt).toContain("Estudos comprovam que...");
  });

  it("should include business context when provided", () => {
    const prompt = generateContentPrompt({
      template: "antes-depois",
      templateStructure: ["Hook", "Antes", "Depois", "CTA"],
      pain: "Falta de tempo para cozinhar",
      niche: "Alimentação saudável",
      objective: "sale",
      person: "second",
      platform: "instagram",
      voiceTone: "casual",
      clickbait: false,
      businessContext: "Marmitas Fit - Refeições saudáveis congeladas",
    });

    expect(prompt).toContain("Marmitas Fit");
    expect(prompt).toContain("Refeições saudáveis congeladas");
  });

  it("should include ideal client when provided", () => {
    const prompt = generateContentPrompt({
      template: "antes-depois",
      templateStructure: ["Hook", "Antes", "Depois", "CTA"],
      pain: "Falta de tempo para cozinhar",
      niche: "Alimentação saudável",
      objective: "sale",
      person: "second",
      platform: "instagram",
      voiceTone: "casual",
      clickbait: false,
      idealClient: "Mães que buscam praticidade na cozinha",
    });

    expect(prompt).toContain("Mães que buscam praticidade na cozinha");
  });
});
