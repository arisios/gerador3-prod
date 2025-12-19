// Runware API - Geração de imagens
// Documentação: https://docs.runware.ai/

import { ImageOptions } from "./index";

const RUNWARE_API_URL = "https://api.runware.ai/v1";

interface RunwareTask {
  taskUUID: string;
  imageURL?: string;
  error?: string;
}

export async function generateWithRunware(
  prompt: string,
  apiKey: string,
  options?: ImageOptions
): Promise<string> {
  const width = options?.width || 1024;
  const height = options?.height || 1024;
  
  const response = await fetch(RUNWARE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        negativePrompt: options?.negativePrompt || "text, watermark, logo, blurry, low quality, deformed",
        width,
        height,
        model: "runware:100@1", // FLUX.1 [dev]
        steps: 25,
        CFGScale: 7,
        numberResults: 1,
        outputFormat: "WEBP",
      },
    ]),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Runware API error: ${error}`);
  }

  const data = await response.json();
  
  if (data.data && data.data.length > 0) {
    const task = data.data[0] as RunwareTask;
    if (task.imageURL) {
      return task.imageURL;
    }
    if (task.error) {
      throw new Error(`Runware generation failed: ${task.error}`);
    }
  }
  
  throw new Error("Runware: No image returned");
}

// Versão com FLUX Schnell (mais rápido e barato)
export async function generateWithRunwareSchnell(
  prompt: string,
  apiKey: string,
  options?: ImageOptions
): Promise<string> {
  const width = options?.width || 1024;
  const height = options?.height || 1024;
  
  const response = await fetch(RUNWARE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        negativePrompt: options?.negativePrompt || "text, watermark, logo, blurry, low quality",
        width,
        height,
        model: "runware:101@1", // FLUX Schnell
        steps: 4,
        CFGScale: 1,
        numberResults: 1,
        outputFormat: "WEBP",
      },
    ]),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Runware API error: ${error}`);
  }

  const data = await response.json();
  
  if (data.data && data.data.length > 0) {
    const task = data.data[0] as RunwareTask;
    if (task.imageURL) {
      return task.imageURL;
    }
  }
  
  throw new Error("Runware: No image returned");
}

// Geração de vídeo com Luma
export async function generateVideoWithRunwareLuma(
  imageUrl: string,
  apiKey: string,
  prompt?: string
): Promise<string> {
  const response = await fetch(RUNWARE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        taskType: "videoInference",
        taskUUID: crypto.randomUUID(),
        inputImage: imageUrl,
        positivePrompt: prompt || "smooth cinematic motion",
        model: "luma:ray-flash-2", // Luma Ray Flash
        duration: 5,
        aspectRatio: "9:16", // Vertical para stories/reels
      },
    ]),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Runware Video API error: ${error}`);
  }

  const data = await response.json();
  
  // Runware pode retornar task para polling
  if (data.data && data.data.length > 0) {
    const task = data.data[0];
    if (task.videoURL) {
      return task.videoURL;
    }
    if (task.taskUUID) {
      return await pollRunwareVideo(task.taskUUID, apiKey);
    }
  }
  
  throw new Error("Runware: No video returned");
}

async function pollRunwareVideo(taskUUID: string, apiKey: string, maxAttempts = 120): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await fetch(`${RUNWARE_API_URL}/tasks/${taskUUID}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) continue;
    
    const data = await response.json();
    
    if (data.status === "completed" && data.videoURL) {
      return data.videoURL;
    } else if (data.status === "failed") {
      throw new Error(`Runware video generation failed: ${data.error || "Unknown error"}`);
    }
  }
  
  throw new Error("Runware: Timeout waiting for video generation");
}
