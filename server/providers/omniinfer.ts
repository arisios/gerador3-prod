// OmniInfer API - Geração de imagens econômica
// Documentação: https://docs.omniinfer.io/

import { ImageOptions } from "./index";

const OMNIINFER_API_URL = "https://api.omniinfer.io/v2/txt2img";

export async function generateWithOmniInfer(
  prompt: string,
  apiKey: string,
  options?: ImageOptions
): Promise<string> {
  const width = options?.width || 1024;
  const height = options?.height || 1024;
  
  const response = await fetch(OMNIINFER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-OmniInfer-Key": apiKey,
    },
    body: JSON.stringify({
      model_name: "sd_xl_base_1.0.safetensors", // SDXL base
      prompt: prompt,
      negative_prompt: options?.negativePrompt || "text, watermark, logo, blurry, low quality",
      width,
      height,
      sampler_name: "DPM++ 2M Karras",
      steps: 20,
      cfg_scale: 7,
      seed: -1,
      batch_size: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OmniInfer API error: ${error}`);
  }

  const data = await response.json();
  
  // OmniInfer retorna task_id para polling
  if (data.data?.task_id) {
    return await pollOmniInferResult(data.data.task_id, apiKey);
  }
  
  throw new Error("OmniInfer: No task_id returned");
}

async function pollOmniInferResult(taskId: string, apiKey: string, maxAttempts = 60): Promise<string> {
  const pollUrl = `https://api.omniinfer.io/v2/progress?task_id=${taskId}`;
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos entre polls
    
    const response = await fetch(pollUrl, {
      headers: {
        "X-OmniInfer-Key": apiKey,
      },
    });
    
    if (!response.ok) continue;
    
    const data = await response.json();
    
    if (data.data?.status === 2) { // Completed
      if (data.data.imgs && data.data.imgs.length > 0) {
        return data.data.imgs[0];
      }
    } else if (data.data?.status === 3) { // Failed
      throw new Error(`OmniInfer generation failed: ${data.data.failed_reason || "Unknown error"}`);
    }
  }
  
  throw new Error("OmniInfer: Timeout waiting for image generation");
}
