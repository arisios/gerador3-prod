// Configuração dos providers de geração de imagem e vídeo

export interface ImageProvider {
  name: string;
  displayName: string;
  creditsPerUse: number;
  costPerUseCents: number; // custo real em centavos BRL
  quality: "economy" | "standard" | "premium";
  generate: (prompt: string, options?: ImageOptions) => Promise<string>; // retorna URL da imagem
}

export interface VideoProvider {
  name: string;
  displayName: string;
  creditsPerUse: number;
  costPerUseCents: number;
  quality: "economy" | "standard" | "premium";
  generate: (imageUrl: string, options?: VideoOptions) => Promise<string>; // retorna URL do vídeo
}

export interface ImageOptions {
  width?: number;
  height?: number;
  negativePrompt?: string;
  style?: string;
}

export interface VideoOptions {
  duration?: number; // segundos
  motion?: "slow" | "medium" | "fast";
}

// Providers de imagem disponíveis
export const IMAGE_PROVIDERS: Record<string, Omit<ImageProvider, "generate">> = {
  omniinfer: {
    name: "omniinfer",
    displayName: "OmniInfer (Econômico)",
    creditsPerUse: 1,
    costPerUseCents: 1, // R$0,01
    quality: "economy",
  },
  dezgo: {
    name: "dezgo",
    displayName: "Dezgo (Econômico)",
    creditsPerUse: 1,
    costPerUseCents: 1, // R$0,01
    quality: "economy",
  },
  replicate: {
    name: "replicate",
    displayName: "Replicate FLUX (Padrão)",
    creditsPerUse: 2,
    costPerUseCents: 2, // R$0,02
    quality: "standard",
  },
  runware: {
    name: "runware",
    displayName: "Runware (Padrão)",
    creditsPerUse: 2,
    costPerUseCents: 2, // R$0,02
    quality: "standard",
  },
  manus: {
    name: "manus",
    displayName: "Manus AI (Premium)",
    creditsPerUse: 2,
    costPerUseCents: 12, // R$0,12
    quality: "premium",
  },
};

// Providers de vídeo disponíveis
export const VIDEO_PROVIDERS: Record<string, Omit<VideoProvider, "generate">> = {
  kenburns: {
    name: "kenburns",
    displayName: "Ken Burns (Local)",
    creditsPerUse: 3,
    costPerUseCents: 0, // Grátis - processamento local
    quality: "economy",
  },
  replicate_wan: {
    name: "replicate_wan",
    displayName: "Replicate Wan 480p",
    creditsPerUse: 15,
    costPerUseCents: 279, // R$2,79
    quality: "standard",
  },
  replicate_wan_hd: {
    name: "replicate_wan_hd",
    displayName: "Replicate Wan 720p HD",
    creditsPerUse: 30,
    costPerUseCents: 570, // R$5,70
    quality: "premium",
  },
  runware_luma: {
    name: "runware_luma",
    displayName: "Runware Luma (Premium)",
    creditsPerUse: 40,
    costPerUseCents: 744, // R$7,44
    quality: "premium",
  },
};

// Pacotes de créditos disponíveis
export const CREDIT_PACKAGES = [
  {
    name: "Starter",
    credits: 30,
    priceInCents: 3990, // R$39,90
    isFeatured: false,
  },
  {
    name: "Popular",
    credits: 100,
    priceInCents: 9990, // R$99,90
    isFeatured: true,
  },
  {
    name: "Pro",
    credits: 300,
    priceInCents: 24990, // R$249,90
    isFeatured: false,
  },
];
