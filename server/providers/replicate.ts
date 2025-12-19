// Replicate API - Geração de imagens e vídeos
// Documentação: https://replicate.com/docs

import { ImageOptions, VideoOptions } from "./index";

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

interface ReplicatePrediction {
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
}

async function createPrediction(
  apiKey: string,
  model: string,
  input: Record<string, unknown>
): Promise<ReplicatePrediction> {
  const response = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: model,
      input,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  return response.json();
}

async function pollPrediction(apiKey: string, predictionId: string, maxAttempts = 120): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) continue;
    
    const prediction: ReplicatePrediction = await response.json();
    
    if (prediction.status === "succeeded") {
      if (Array.isArray(prediction.output)) {
        return prediction.output[0];
      }
      return prediction.output as string;
    } else if (prediction.status === "failed") {
      throw new Error(`Replicate generation failed: ${prediction.error || "Unknown error"}`);
    }
  }
  
  throw new Error("Replicate: Timeout waiting for generation");
}

// FLUX Schnell - Imagem rápida e barata
export async function generateWithReplicateFlux(
  prompt: string,
  apiKey: string,
  options?: ImageOptions
): Promise<string> {
  const width = options?.width || 1024;
  const height = options?.height || 1024;
  
  // FLUX Schnell model
  const modelVersion = "black-forest-labs/flux-schnell";
  
  const prediction = await createPrediction(apiKey, modelVersion, {
    prompt,
    width,
    height,
    num_outputs: 1,
    output_format: "webp",
    output_quality: 90,
  });
  
  return pollPrediction(apiKey, prediction.id);
}

// FLUX Dev - Imagem de maior qualidade
export async function generateWithReplicateFluxDev(
  prompt: string,
  apiKey: string,
  options?: ImageOptions
): Promise<string> {
  const width = options?.width || 1024;
  const height = options?.height || 1024;
  
  const modelVersion = "black-forest-labs/flux-dev";
  
  const prediction = await createPrediction(apiKey, modelVersion, {
    prompt,
    width,
    height,
    num_outputs: 1,
    guidance: 3.5,
    num_inference_steps: 28,
    output_format: "webp",
    output_quality: 90,
  });
  
  return pollPrediction(apiKey, prediction.id);
}

// Wan 2.1 - Vídeo a partir de imagem (480p)
export async function generateVideoWithReplicateWan(
  imageUrl: string,
  apiKey: string,
  options?: VideoOptions
): Promise<string> {
  // wavespeedai/wan-2.1-i2v-480p
  const modelVersion = "wavespeedai/wan-2.1-i2v-480p";
  
  const prediction = await createPrediction(apiKey, modelVersion, {
    image: imageUrl,
    prompt: "smooth motion, cinematic",
    num_frames: options?.duration ? options.duration * 24 : 81, // ~3.4s default
    fps: 24,
  });
  
  return pollPrediction(apiKey, prediction.id, 180); // Vídeo pode demorar mais
}

// Wan 2.1 HD - Vídeo a partir de imagem (720p)
export async function generateVideoWithReplicateWanHD(
  imageUrl: string,
  apiKey: string,
  options?: VideoOptions
): Promise<string> {
  // wavespeedai/wan-2.1-i2v-720p
  const modelVersion = "wavespeedai/wan-2.1-i2v-720p";
  
  const prediction = await createPrediction(apiKey, modelVersion, {
    image: imageUrl,
    prompt: "smooth motion, cinematic, high quality",
    num_frames: options?.duration ? options.duration * 24 : 81,
    fps: 24,
  });
  
  return pollPrediction(apiKey, prediction.id, 180);
}
