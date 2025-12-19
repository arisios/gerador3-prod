// Serviço unificado de geração de imagens
// Gerencia múltiplos providers e sistema de créditos

import { IMAGE_PROVIDERS, ImageOptions } from "./index";
import { generateWithOmniInfer } from "./omniinfer";
import { generateWithDezgo } from "./dezgo";
import { generateWithReplicateFlux } from "./replicate";
import { generateWithRunware } from "./runware";
import { generateImage as generateWithManus } from "../_core/imageGeneration";
import { useCredits, getApiProviderByName } from "../db";
import { storagePut } from "../storage";

export type ImageProviderName = "omniinfer" | "dezgo" | "replicate" | "runware" | "manus";

interface GenerateImageParams {
  prompt: string;
  provider: ImageProviderName;
  userId: number;
  options?: ImageOptions;
  // API Keys (passadas do ambiente)
  omniinferKey?: string;
  dezgoKey?: string;
  replicateKey?: string;
  runwareKey?: string;
}

interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  creditsUsed?: number;
  newBalance?: number;
  error?: string;
}

export async function generateImageWithProvider(params: GenerateImageParams): Promise<GenerateImageResult> {
  const { prompt, provider, userId, options } = params;
  
  // Obter configuração do provider
  const providerConfig = IMAGE_PROVIDERS[provider];
  if (!providerConfig) {
    return { success: false, error: `Provider desconhecido: ${provider}` };
  }
  
  // Verificar e debitar créditos
  const creditResult = await useCredits(
    userId,
    providerConfig.creditsPerUse,
    `Geração de imagem (${providerConfig.displayName})`,
    provider,
    "image"
  );
  
  if (!creditResult.success) {
    return { success: false, error: creditResult.error };
  }
  
  try {
    let imageUrl: string;
    
    switch (provider) {
      case "omniinfer":
        if (!params.omniinferKey) throw new Error("OmniInfer API key não configurada");
        imageUrl = await generateWithOmniInfer(prompt, params.omniinferKey, options);
        break;
        
      case "dezgo":
        if (!params.dezgoKey) throw new Error("Dezgo API key não configurada");
        const dezgoResult = await generateWithDezgo(prompt, params.dezgoKey, options);
        // Se retornou base64, fazer upload para S3
        if (dezgoResult.startsWith("data:")) {
          const base64Data = dezgoResult.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const fileName = `generated/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
          const { url } = await storagePut(fileName, buffer, "image/png");
          imageUrl = url;
        } else {
          imageUrl = dezgoResult;
        }
        break;
        
      case "replicate":
        if (!params.replicateKey) throw new Error("Replicate API key não configurada");
        imageUrl = await generateWithReplicateFlux(prompt, params.replicateKey, options);
        break;
        
      case "runware":
        if (!params.runwareKey) throw new Error("Runware API key não configurada");
        imageUrl = await generateWithRunware(prompt, params.runwareKey, options);
        break;
        
      case "manus":
        const manusResult = await generateWithManus({ prompt });
        if (!manusResult.url) throw new Error("Manus não retornou URL da imagem");
        imageUrl = manusResult.url;
        break;
        
      default:
        throw new Error(`Provider não implementado: ${provider}`);
    }
    
    return {
      success: true,
      imageUrl,
      creditsUsed: providerConfig.creditsPerUse,
      newBalance: creditResult.newBalance,
    };
    
  } catch (error) {
    // Em caso de erro, devolver os créditos (implementar refund)
    console.error(`[ImageService] Error with ${provider}:`, error);
    
    // TODO: Implementar refund de créditos em caso de falha
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido na geração",
    };
  }
}

// Função para obter providers disponíveis com suas configurações
export function getAvailableImageProviders() {
  return Object.values(IMAGE_PROVIDERS).map(p => ({
    name: p.name as string,
    displayName: p.displayName,
    creditsPerUse: p.creditsPerUse,
    quality: p.quality,
  }));
}
