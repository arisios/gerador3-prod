/**
 * Ken Burns Video Generator
 * 
 * Este serviço gera vídeos usando o efeito Ken Burns (pan e zoom em imagens estáticas).
 * É processado localmente, sem custo de API externa.
 * 
 * O vídeo é gerado no frontend usando Canvas e MediaRecorder.
 * Este arquivo contém apenas a configuração e metadados.
 */

export interface KenBurnsConfig {
  imageUrl: string;
  duration: number; // segundos
  direction: "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down";
  width: number;
  height: number;
  fps: number;
}

export interface KenBurnsResult {
  success: boolean;
  config: KenBurnsConfig;
  message: string;
}

// Configurações padrão para diferentes formatos
export const KEN_BURNS_PRESETS = {
  // Formato vertical (Stories, Reels, TikTok)
  vertical: {
    width: 1080,
    height: 1920,
    fps: 30,
    duration: 5,
  },
  // Formato quadrado (Feed Instagram)
  square: {
    width: 1080,
    height: 1080,
    fps: 30,
    duration: 5,
  },
  // Formato horizontal (YouTube, Landscape)
  horizontal: {
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 5,
  },
};

// Direções disponíveis com descrições
export const KEN_BURNS_DIRECTIONS = [
  { value: "zoom-in", label: "Zoom In", description: "Aproxima gradualmente da imagem" },
  { value: "zoom-out", label: "Zoom Out", description: "Afasta gradualmente da imagem" },
  { value: "pan-left", label: "Pan Esquerda", description: "Move a câmera para a esquerda" },
  { value: "pan-right", label: "Pan Direita", description: "Move a câmera para a direita" },
  { value: "pan-up", label: "Pan Cima", description: "Move a câmera para cima" },
  { value: "pan-down", label: "Pan Baixo", description: "Move a câmera para baixo" },
] as const;

/**
 * Valida a configuração do Ken Burns
 */
export function validateKenBurnsConfig(config: Partial<KenBurnsConfig>): KenBurnsConfig {
  const preset = KEN_BURNS_PRESETS.vertical;
  
  return {
    imageUrl: config.imageUrl || "",
    duration: config.duration || preset.duration,
    direction: config.direction || "zoom-in",
    width: config.width || preset.width,
    height: config.height || preset.height,
    fps: config.fps || preset.fps,
  };
}

/**
 * Calcula o custo em créditos para Ken Burns
 * Ken Burns é gratuito (processamento local), mas cobramos um valor mínimo
 */
export function getKenBurnsCost(): number {
  return 3; // 3 créditos por vídeo Ken Burns
}

/**
 * Gera metadados para o vídeo Ken Burns
 * O vídeo real é gerado no frontend
 */
export function createKenBurnsJob(config: KenBurnsConfig): KenBurnsResult {
  const validConfig = validateKenBurnsConfig(config);
  
  if (!validConfig.imageUrl) {
    return {
      success: false,
      config: validConfig,
      message: "URL da imagem é obrigatória",
    };
  }
  
  return {
    success: true,
    config: validConfig,
    message: "Configuração válida. O vídeo será gerado no navegador.",
  };
}
