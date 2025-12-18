// Templates Visuais para o Gerador 3 - Estilo @brandsdecoded__

export interface VisualTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[]; // Para matching com IA
  style: {
    layout: string;
    textPosition: string;
    overlayType: string;
    overlayOpacity: number;
    textAlign: string;
    accentColor: string;
    fontWeight: string;
    hasSubtitle: boolean;
    hasCTA: boolean;
    hasDecorations: boolean;
  };
  cssClasses: string;
}

// ===== TEMPLATES VISUAIS (24 categorias) =====
export const visualTemplates: VisualTemplate[] = [
  // 1. LIFESTYLE EDITORIAL
  {
    id: "lifestyle-editorial",
    name: "Lifestyle Editorial",
    description: "Foto de pessoa real + overlay escuro + texto grande com palavra em neon",
    category: "editorial",
    tags: ["lifestyle", "pessoal", "história", "narrativa", "emocional"],
    style: {
      layout: "full-bleed",
      textPosition: "bottom",
      overlayType: "gradient-bottom",
      overlayOpacity: 0.7,
      textAlign: "left",
      accentColor: "#00ff00",
      fontWeight: "800",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 2. CELEBRIDADE/AUTORIDADE
  {
    id: "celebrity-authority",
    name: "Celebridade/Autoridade",
    description: "Foto de pessoa famosa ou autoridade + texto menor",
    category: "authority",
    tags: ["autoridade", "expert", "citação", "quote", "famoso", "influencer"],
    style: {
      layout: "full-bleed",
      textPosition: "bottom",
      overlayType: "gradient-bottom",
      overlayOpacity: 0.6,
      textAlign: "left",
      accentColor: "#ffffff",
      fontWeight: "700",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: false,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 3. PROVOCATIVO/PERGUNTA
  {
    id: "provocative-question",
    name: "Provocativo/Pergunta",
    description: "Expressão intensa + pergunta grande em cor vibrante",
    category: "engagement",
    tags: ["pergunta", "provocação", "polêmica", "debate", "opinião", "?"],
    style: {
      layout: "full-bleed",
      textPosition: "center",
      overlayType: "solid",
      overlayOpacity: 0.5,
      textAlign: "center",
      accentColor: "#ff6b00",
      fontWeight: "900",
      hasSubtitle: false,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 4. TECH/CIÊNCIA
  {
    id: "tech-science",
    name: "Tech/Ciência",
    description: "Visual futurista + dados em azul/roxo",
    category: "tech",
    tags: ["tecnologia", "ciência", "inovação", "futuro", "digital", "ai", "dados"],
    style: {
      layout: "full-bleed",
      textPosition: "center",
      overlayType: "gradient-radial",
      overlayOpacity: 0.8,
      textAlign: "center",
      accentColor: "#00d4ff",
      fontWeight: "700",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 5. CASE DE MARCA
  {
    id: "brand-case",
    name: "Case de Marca",
    description: "Logo/produto + dados específicos",
    category: "business",
    tags: ["marca", "empresa", "case", "sucesso", "resultado", "negócio"],
    style: {
      layout: "split",
      textPosition: "right",
      overlayType: "none",
      overlayOpacity: 0,
      textAlign: "left",
      accentColor: "#ffd700",
      fontWeight: "700",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: false,
    },
    cssClasses: "bg-card",
  },
  // 6. DADOS/MERCADO
  {
    id: "data-market",
    name: "Dados/Mercado",
    description: "Números grandes + atletas/profissionais em amarelo",
    category: "data",
    tags: ["dados", "números", "estatística", "mercado", "crescimento", "%", "bilhões", "milhões"],
    style: {
      layout: "full-bleed",
      textPosition: "bottom",
      overlayType: "gradient-bottom",
      overlayOpacity: 0.7,
      textAlign: "left",
      accentColor: "#ffdd00",
      fontWeight: "900",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 7. TENDÊNCIA/GEN Z
  {
    id: "trend-genz",
    name: "Tendência/Gen Z",
    description: "Visual jovem + referências culturais",
    category: "trend",
    tags: ["tendência", "trend", "genz", "jovem", "viral", "meme", "cultura"],
    style: {
      layout: "full-bleed",
      textPosition: "center",
      overlayType: "gradient-diagonal",
      overlayOpacity: 0.6,
      textAlign: "center",
      accentColor: "#ff69b4",
      fontWeight: "800",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 8. CULTURA POP
  {
    id: "pop-culture",
    name: "Cultura Pop",
    description: "Personagens conhecidos + conexão emocional",
    category: "entertainment",
    tags: ["cultura pop", "filme", "série", "música", "entretenimento", "netflix", "disney"],
    style: {
      layout: "full-bleed",
      textPosition: "bottom",
      overlayType: "gradient-bottom",
      overlayOpacity: 0.8,
      textAlign: "center",
      accentColor: "#ff0000",
      fontWeight: "900",
      hasSubtitle: false,
      hasCTA: true,
      hasDecorations: false,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 9. SPLIT SCREEN
  {
    id: "split-screen",
    name: "Split Screen",
    description: "Imagem de um lado, texto do outro",
    category: "comparison",
    tags: ["comparação", "versus", "antes", "depois", "diferença", "vs"],
    style: {
      layout: "split",
      textPosition: "right",
      overlayType: "none",
      overlayOpacity: 0,
      textAlign: "left",
      accentColor: "#9b59b6",
      fontWeight: "700",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: false,
    },
    cssClasses: "grid grid-cols-2",
  },
  // 10. MINIMALISTA
  {
    id: "minimal",
    name: "Minimalista",
    description: "Fundo sólido ou gradiente suave + texto centralizado",
    category: "minimal",
    tags: ["minimalista", "clean", "simples", "elegante", "sofisticado"],
    style: {
      layout: "centered",
      textPosition: "center",
      overlayType: "none",
      overlayOpacity: 0,
      textAlign: "center",
      accentColor: "#ffffff",
      fontWeight: "600",
      hasSubtitle: false,
      hasCTA: false,
      hasDecorations: false,
    },
    cssClasses: "bg-gradient-to-br from-purple-900 to-black",
  },
  // 11. FULL BLEED
  {
    id: "full-bleed",
    name: "Full Bleed",
    description: "Imagem ocupando 100% + texto sobreposto com overlay",
    category: "impact",
    tags: ["impacto", "forte", "dramático", "intenso", "poderoso"],
    style: {
      layout: "full-bleed",
      textPosition: "center",
      overlayType: "solid",
      overlayOpacity: 0.4,
      textAlign: "center",
      accentColor: "#ffffff",
      fontWeight: "900",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 12. CARD/MOLDURA
  {
    id: "card-frame",
    name: "Card/Moldura",
    description: "Borda ou moldura ao redor + fundo texturizado",
    category: "premium",
    tags: ["premium", "luxo", "exclusivo", "vip", "especial"],
    style: {
      layout: "framed",
      textPosition: "center",
      overlayType: "none",
      overlayOpacity: 0,
      textAlign: "center",
      accentColor: "#d4af37",
      fontWeight: "700",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "border-4 border-amber-500 p-8",
  },
  // ===== NOVOS TEMPLATES =====
  // 13. URGÊNCIA/ESCASSEZ
  {
    id: "urgency-scarcity",
    name: "Urgência/Escassez",
    description: "Vermelho intenso + countdown visual + texto urgente",
    category: "sales",
    tags: ["urgente", "última chance", "agora", "hoje", "limitado", "escassez", "pressa"],
    style: {
      layout: "full-bleed",
      textPosition: "center",
      overlayType: "solid",
      overlayOpacity: 0.6,
      textAlign: "center",
      accentColor: "#ff0000",
      fontWeight: "900",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 14. LISTA/CHECKLIST
  {
    id: "list-checklist",
    name: "Lista/Checklist",
    description: "Layout de lista com checkmarks ou números",
    category: "educational",
    tags: ["lista", "passos", "dicas", "como", "tutorial", "checklist", "1", "2", "3"],
    style: {
      layout: "list",
      textPosition: "center",
      overlayType: "gradient-bottom",
      overlayOpacity: 0.8,
      textAlign: "left",
      accentColor: "#00ff00",
      fontWeight: "700",
      hasSubtitle: false,
      hasCTA: false,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 15. CITAÇÃO/QUOTE
  {
    id: "quote-inspiration",
    name: "Citação/Inspiração",
    description: "Aspas grandes + texto inspiracional",
    category: "inspiration",
    tags: ["citação", "quote", "inspiração", "motivação", "frase", "disse", "falou"],
    style: {
      layout: "centered",
      textPosition: "center",
      overlayType: "gradient-radial",
      overlayOpacity: 0.7,
      textAlign: "center",
      accentColor: "#ffffff",
      fontWeight: "600",
      hasSubtitle: true,
      hasCTA: false,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 16. MEME/HUMOR
  {
    id: "meme-humor",
    name: "Meme/Humor",
    description: "Estilo meme com texto em cima e embaixo",
    category: "entertainment",
    tags: ["meme", "humor", "engraçado", "piada", "zoeira", "kkk", "haha"],
    style: {
      layout: "meme",
      textPosition: "top-bottom",
      overlayType: "none",
      overlayOpacity: 0,
      textAlign: "center",
      accentColor: "#ffffff",
      fontWeight: "900",
      hasSubtitle: false,
      hasCTA: false,
      hasDecorations: false,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 17. ANTES/DEPOIS
  {
    id: "before-after",
    name: "Antes/Depois",
    description: "Split vertical com transformação",
    category: "transformation",
    tags: ["antes", "depois", "transformação", "resultado", "mudança", "evolução"],
    style: {
      layout: "split-vertical",
      textPosition: "bottom",
      overlayType: "gradient-bottom",
      overlayOpacity: 0.5,
      textAlign: "center",
      accentColor: "#00ff00",
      fontWeight: "800",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "grid grid-cols-2",
  },
  // 18. BREAKING NEWS
  {
    id: "breaking-news",
    name: "Breaking News",
    description: "Estilo notícia urgente com barra vermelha",
    category: "news",
    tags: ["notícia", "breaking", "urgente", "novo", "lançamento", "anúncio"],
    style: {
      layout: "news",
      textPosition: "center",
      overlayType: "solid",
      overlayOpacity: 0.7,
      textAlign: "left",
      accentColor: "#ff0000",
      fontWeight: "800",
      hasSubtitle: true,
      hasCTA: false,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 19. GRADIENTE NEON
  {
    id: "neon-gradient",
    name: "Gradiente Neon",
    description: "Fundo gradiente vibrante + texto branco",
    category: "modern",
    tags: ["moderno", "neon", "vibrante", "colorido", "jovem", "energia"],
    style: {
      layout: "centered",
      textPosition: "center",
      overlayType: "none",
      overlayOpacity: 0,
      textAlign: "center",
      accentColor: "#ffffff",
      fontWeight: "800",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: false,
    },
    cssClasses: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
  },
  // 20. DARK LUXURY
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    description: "Fundo preto + detalhes dourados + elegância",
    category: "premium",
    tags: ["luxo", "premium", "exclusivo", "elegante", "sofisticado", "rico", "caro"],
    style: {
      layout: "centered",
      textPosition: "center",
      overlayType: "none",
      overlayOpacity: 0,
      textAlign: "center",
      accentColor: "#d4af37",
      fontWeight: "600",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-black",
  },
  // 21. STORYTELLING
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Visual cinematográfico para contar histórias",
    category: "narrative",
    tags: ["história", "storytelling", "narrativa", "jornada", "experiência", "conta"],
    style: {
      layout: "cinematic",
      textPosition: "bottom",
      overlayType: "gradient-bottom",
      overlayOpacity: 0.8,
      textAlign: "left",
      accentColor: "#ffffff",
      fontWeight: "700",
      hasSubtitle: true,
      hasCTA: false,
      hasDecorations: false,
    },
    cssClasses: "bg-cover bg-center aspect-[16/9]",
  },
  // 22. INFOGRÁFICO
  {
    id: "infographic",
    name: "Infográfico",
    description: "Layout para dados visuais e estatísticas",
    category: "data",
    tags: ["infográfico", "dados", "estatística", "gráfico", "visual", "informação"],
    style: {
      layout: "infographic",
      textPosition: "top",
      overlayType: "solid",
      overlayOpacity: 0.9,
      textAlign: "center",
      accentColor: "#00d4ff",
      fontWeight: "700",
      hasSubtitle: true,
      hasCTA: false,
      hasDecorations: true,
    },
    cssClasses: "bg-slate-900",
  },
  // 23. CALL TO ACTION
  {
    id: "cta-focus",
    name: "Call to Action",
    description: "Foco total no CTA com botão destacado",
    category: "sales",
    tags: ["cta", "ação", "clique", "compre", "inscreva", "baixe", "acesse"],
    style: {
      layout: "cta",
      textPosition: "center",
      overlayType: "gradient-radial",
      overlayOpacity: 0.6,
      textAlign: "center",
      accentColor: "#00ff00",
      fontWeight: "800",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
  // 24. TESTEMUNHO/PROVA SOCIAL
  {
    id: "testimonial",
    name: "Testemunho",
    description: "Depoimento de cliente com foto e citação",
    category: "social-proof",
    tags: ["testemunho", "depoimento", "cliente", "resultado", "prova", "review"],
    style: {
      layout: "testimonial",
      textPosition: "center",
      overlayType: "gradient-bottom",
      overlayOpacity: 0.7,
      textAlign: "center",
      accentColor: "#ffd700",
      fontWeight: "600",
      hasSubtitle: true,
      hasCTA: true,
      hasDecorations: true,
    },
    cssClasses: "bg-cover bg-center",
  },
];

// ===== CORES DE DESTAQUE =====
export const accentColors = [
  { id: "neon-green", name: "Verde Neon", hex: "#00ff00", css: "neon-green" },
  { id: "neon-yellow", name: "Amarelo Neon", hex: "#ffd700", css: "neon-yellow" },
  { id: "neon-pink", name: "Rosa Neon", hex: "#ff69b4", css: "neon-pink" },
  { id: "neon-blue", name: "Azul Neon", hex: "#00d4ff", css: "text-cyan-400" },
  { id: "neon-orange", name: "Laranja Neon", hex: "#ff6b00", css: "text-orange-500" },
  { id: "neon-red", name: "Vermelho Neon", hex: "#ff0000", css: "text-red-500" },
  { id: "white", name: "Branco", hex: "#ffffff", css: "text-white" },
  { id: "gold", name: "Dourado", hex: "#d4af37", css: "text-amber-500" },
  { id: "neon-purple", name: "Roxo Neon", hex: "#a855f7", css: "text-purple-500" },
  { id: "neon-cyan", name: "Ciano Neon", hex: "#22d3ee", css: "text-cyan-400" },
];

// ===== PRESETS DE ESTILO =====
export const stylePresets = [
  {
    id: "brandsdecoded",
    name: "BrandsDecoded Style",
    style: {
      fontSize: 48,
      fontWeight: "800",
      textShadow: "0 4px 20px rgba(0,0,0,0.8)",
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
      textTransform: "uppercase",
    },
  },
  {
    id: "clean",
    name: "Clean & Modern",
    style: {
      fontSize: 42,
      fontWeight: "600",
      textShadow: "0 2px 10px rgba(0,0,0,0.5)",
      lineHeight: 1.2,
      letterSpacing: "0",
      textTransform: "none",
    },
  },
  {
    id: "bold",
    name: "Bold Impact",
    style: {
      fontSize: 56,
      fontWeight: "900",
      textShadow: "0 6px 30px rgba(0,0,0,0.9)",
      lineHeight: 1.0,
      letterSpacing: "-0.03em",
      textTransform: "uppercase",
    },
  },
  {
    id: "elegant",
    name: "Elegant",
    style: {
      fontSize: 38,
      fontWeight: "500",
      textShadow: "0 2px 8px rgba(0,0,0,0.4)",
      lineHeight: 1.3,
      letterSpacing: "0.02em",
      textTransform: "none",
    },
  },
];

// ===== OVERLAYS =====
export const overlayTypes = [
  { id: "none", name: "Nenhum", css: "" },
  { id: "solid", name: "Sólido", css: "bg-black" },
  { id: "gradient-bottom", name: "Gradiente Inferior", css: "bg-gradient-to-t from-black via-black/50 to-transparent" },
  { id: "gradient-top", name: "Gradiente Superior", css: "bg-gradient-to-b from-black via-black/50 to-transparent" },
  { id: "gradient-radial", name: "Gradiente Radial", css: "bg-radial-gradient" },
  { id: "gradient-diagonal", name: "Gradiente Diagonal", css: "bg-gradient-to-br from-black/80 to-transparent" },
];

// ===== POSIÇÕES DE TEXTO =====
export const textPositions = [
  { id: "top", name: "Topo", css: "items-start pt-12" },
  { id: "center", name: "Centro", css: "items-center" },
  { id: "bottom", name: "Inferior", css: "items-end pb-12" },
];

// ===== ALINHAMENTOS =====
export const textAlignments = [
  { id: "left", name: "Esquerda", css: "text-left" },
  { id: "center", name: "Centro", css: "text-center" },
  { id: "right", name: "Direita", css: "text-right" },
];

// ===== CATEGORIAS PARA FILTRO =====
export const templateCategories = [
  { id: "all", name: "Todos" },
  { id: "editorial", name: "Editorial" },
  { id: "authority", name: "Autoridade" },
  { id: "engagement", name: "Engajamento" },
  { id: "tech", name: "Tech" },
  { id: "business", name: "Negócios" },
  { id: "data", name: "Dados" },
  { id: "trend", name: "Tendências" },
  { id: "entertainment", name: "Entretenimento" },
  { id: "comparison", name: "Comparação" },
  { id: "minimal", name: "Minimalista" },
  { id: "impact", name: "Impacto" },
  { id: "premium", name: "Premium" },
  { id: "sales", name: "Vendas" },
  { id: "educational", name: "Educacional" },
  { id: "inspiration", name: "Inspiração" },
  { id: "transformation", name: "Transformação" },
  { id: "news", name: "Notícias" },
  { id: "modern", name: "Moderno" },
  { id: "narrative", name: "Narrativa" },
  { id: "social-proof", name: "Prova Social" },
];

// ===== FUNÇÃO PARA MATCHING DE TEMPLATE COM IA =====
export function getTemplateMatchScore(template: VisualTemplate, text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  // Verificar tags
  for (const tag of template.tags) {
    if (lowerText.includes(tag.toLowerCase())) {
      score += 10;
    }
  }
  
  // Verificar padrões específicos
  if (lowerText.includes("?") && template.category === "engagement") score += 15;
  if (lowerText.match(/\d+%/) && template.category === "data") score += 15;
  if (lowerText.match(/\d+ (bilhões|milhões|mil)/) && template.category === "data") score += 15;
  if (lowerText.includes("como") && template.category === "educational") score += 10;
  if (lowerText.includes("dica") && template.category === "educational") score += 10;
  if (lowerText.includes("urgente") && template.id === "urgency-scarcity") score += 20;
  if (lowerText.includes("última chance") && template.id === "urgency-scarcity") score += 20;
  if (lowerText.includes("antes") && lowerText.includes("depois") && template.id === "before-after") score += 25;
  if ((lowerText.includes("disse") || lowerText.includes("falou") || lowerText.includes('"')) && template.id === "quote-inspiration") score += 15;
  
  return score;
}

// ===== FUNÇÃO PARA SELECIONAR MELHOR TEMPLATE =====
export function selectBestTemplate(text: string): VisualTemplate {
  let bestTemplate = visualTemplates[0];
  let bestScore = 0;
  
  for (const template of visualTemplates) {
    const score = getTemplateMatchScore(template, text);
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }
  
  // Se nenhum match forte, usar lifestyle-editorial como padrão
  if (bestScore < 10) {
    return visualTemplates.find(t => t.id === "lifestyle-editorial") || visualTemplates[0];
  }
  
  return bestTemplate;
}
