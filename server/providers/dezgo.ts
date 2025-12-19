// Dezgo API - Geração de imagens econômica
// Documentação: https://dev.dezgo.com/

import { ImageOptions } from "./index";

const DEZGO_API_URL = "https://api.dezgo.com/text2image";

export async function generateWithDezgo(
  prompt: string,
  apiKey: string,
  options?: ImageOptions
): Promise<string> {
  const width = options?.width || 1024;
  const height = options?.height || 1024;
  
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("negative_prompt", options?.negativePrompt || "text, watermark, logo, blurry, low quality");
  formData.append("width", width.toString());
  formData.append("height", height.toString());
  formData.append("sampler", "dpmpp_2m_karras");
  formData.append("model", "sdxl_1_0"); // SDXL 1.0
  formData.append("steps", "30");
  formData.append("guidance", "7");
  
  const response = await fetch(DEZGO_API_URL, {
    method: "POST",
    headers: {
      "X-Dezgo-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dezgo API error: ${error}`);
  }

  // Dezgo retorna a imagem diretamente como blob
  const imageBlob = await response.blob();
  
  // Converter para base64 e fazer upload para S3
  const arrayBuffer = await imageBlob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  
  // Retornar como data URL temporariamente (será feito upload para S3 no router)
  return `data:image/png;base64,${base64}`;
}

// Versão alternativa usando FLUX
export async function generateWithDezgoFlux(
  prompt: string,
  apiKey: string,
  options?: ImageOptions
): Promise<string> {
  const width = options?.width || 1024;
  const height = options?.height || 1024;
  
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("width", width.toString());
  formData.append("height", height.toString());
  formData.append("steps", "4"); // FLUX usa menos steps
  formData.append("guidance", "3.5");
  
  const response = await fetch("https://api.dezgo.com/text2image_flux", {
    method: "POST",
    headers: {
      "X-Dezgo-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dezgo FLUX API error: ${error}`);
  }

  const imageBlob = await response.blob();
  const arrayBuffer = await imageBlob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  
  return `data:image/png;base64,${base64}`;
}
