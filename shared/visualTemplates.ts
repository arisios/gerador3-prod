// Templates Visuais para o Gerador 3 - Estilo @brandsdecoded__

export interface VisualTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
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

// ===== TEMPLATES VISUAIS (12 categorias) =====
export const visualTemplates: VisualTemplate[] = [
  // 1. LIFESTYLE EDITORIAL
  {
    id: "lifestyle-editorial",
    name: "Lifestyle Editorial",
    description: "Foto de pessoa real + overlay escuro + texto grande com palavra em neon",
    category: "editorial",
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
