// Serviço unificado de geração de vídeos
// Gerencia múltiplos providers e sistema de créditos

import { VIDEO_PROVIDERS, VideoOptions } from "./index";
import { generateVideoWithReplicateWan, generateVideoWithReplicateWanHD } from "./replicate";
import { generateVideoWithRunwareLuma } from "./runware";
import { useCredits } from "../db";
import { storagePut } from "../storage";

export type VideoProviderName = "kenburns" | "replicate_wan" | "replicate_wan_hd" | "runware_luma";

interface GenerateVideoParams {
  imageUrl: string;
  provider: VideoProviderName;
  userId: number;
  options?: VideoOptions;
  // API Keys
  replicateKey?: string;
  runwareKey?: string;
}

interface GenerateVideoResult {
  success: boolean;
  videoUrl?: string;
  creditsUsed?: number;
  newBalance?: number;
  error?: string;
}

export async function generateVideoWithProvider(params: GenerateVideoParams): Promise<GenerateVideoResult> {
  const { imageUrl, provider, userId, options } = params;
  
  // Obter configuração do provider
  const providerConfig = VIDEO_PROVIDERS[provider];
  if (!providerConfig) {
    return { success: false, error: `Provider desconhecido: ${provider}` };
  }
  
  // Verificar e debitar créditos
  const creditResult = await useCredits(
    userId,
    providerConfig.creditsPerUse,
    `Geração de vídeo (${providerConfig.displayName})`,
    provider,
    "video"
  );
  
  if (!creditResult.success) {
    return { success: false, error: creditResult.error };
  }
  
  try {
    let videoUrl: string;
    
    switch (provider) {
      case "kenburns":
        // Ken Burns é processado no frontend, retornamos sucesso
        // O vídeo será gerado no navegador do usuário
        return {
          success: true,
          videoUrl: "kenburns://local", // Marcador especial
          creditsUsed: providerConfig.creditsPerUse,
          newBalance: creditResult.newBalance,
        };
        
      case "replicate_wan":
        if (!params.replicateKey) throw new Error("Replicate API key não configurada");
        videoUrl = await generateVideoWithReplicateWan(imageUrl, params.replicateKey, options);
        break;
        
      case "replicate_wan_hd":
        if (!params.replicateKey) throw new Error("Replicate API key não configurada");
        videoUrl = await generateVideoWithReplicateWanHD(imageUrl, params.replicateKey, options);
        break;
        
      case "runware_luma":
        if (!params.runwareKey) throw new Error("Runware API key não configurada");
        videoUrl = await generateVideoWithRunwareLuma(imageUrl, params.runwareKey);
        break;
        
      default:
        throw new Error(`Provider não implementado: ${provider}`);
    }
    
    return {
      success: true,
      videoUrl,
      creditsUsed: providerConfig.creditsPerUse,
      newBalance: creditResult.newBalance,
    };
    
  } catch (error) {
    console.error(`[VideoService] Error with ${provider}:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido na geração",
    };
  }
}

// Função para obter providers disponíveis com suas configurações
export function getAvailableVideoProviders() {
  return Object.values(VIDEO_PROVIDERS).map(p => ({
    name: p.name as string,
    displayName: p.displayName,
    creditsPerUse: p.creditsPerUse,
    quality: p.quality,
  }));
}
