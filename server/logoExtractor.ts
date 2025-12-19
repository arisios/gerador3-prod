/**
 * Serviço de extração de logo de sites
 * Tenta extrair logo, favicon ou imagem de perfil de diferentes fontes
 */

import { storagePut } from "./storage";

interface LogoExtractionResult {
  logoUrl: string | null;
  source: "favicon" | "og-image" | "logo-tag" | "profile-image" | "clearbit" | null;
  error?: string;
}

/**
 * Extrai a logo de um site usando múltiplas estratégias
 */
export async function extractLogoFromUrl(url: string, sourceType: string): Promise<LogoExtractionResult> {
  try {
    const domain = extractDomain(url);
    
    // Estratégia 1: Usar Clearbit Logo API (gratuita, alta qualidade)
    const clearbitLogo = await tryGetClearbitLogo(domain);
    if (clearbitLogo) {
      const savedUrl = await downloadAndSaveLogo(clearbitLogo, domain);
      if (savedUrl) {
        return { logoUrl: savedUrl, source: "clearbit" };
      }
    }

    // Estratégia 2: Tentar favicon do Google
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    const savedFavicon = await downloadAndSaveLogo(googleFavicon, domain);
    if (savedFavicon) {
      return { logoUrl: savedFavicon, source: "favicon" };
    }

    // Estratégia 3: Tentar favicon direto do site
    const directFavicon = `https://${domain}/favicon.ico`;
    const savedDirectFavicon = await downloadAndSaveLogo(directFavicon, domain);
    if (savedDirectFavicon) {
      return { logoUrl: savedDirectFavicon, source: "favicon" };
    }

    return { logoUrl: null, source: null, error: "Não foi possível extrair logo" };
  } catch (error) {
    return { logoUrl: null, source: null, error: String(error) };
  }
}

/**
 * Extrai domínio de uma URL
 */
function extractDomain(url: string): string {
  try {
    // Adiciona protocolo se não tiver
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    // Se falhar, tenta extrair manualmente
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}

/**
 * Tenta obter logo via Clearbit API
 */
async function tryGetClearbitLogo(domain: string): Promise<string | null> {
  try {
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    const response = await fetch(clearbitUrl, { method: "HEAD" });
    if (response.ok) {
      return clearbitUrl;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Baixa uma imagem e salva no S3
 */
async function downloadAndSaveLogo(imageUrl: string, domain: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/png";
    
    // Verifica se é uma imagem válida
    if (!contentType.startsWith("image/")) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    
    // Verifica se tem tamanho mínimo (evita favicons muito pequenos)
    if (buffer.byteLength < 100) {
      return null;
    }

    // Gera nome único para o arquivo
    const extension = contentType.split("/")[1] || "png";
    const filename = `logos/${domain}-${Date.now()}.${extension}`;

    // Salva no S3
    const result = await storagePut(filename, Buffer.from(buffer), contentType);
    return result.url;
  } catch {
    return null;
  }
}

/**
 * Extrai logo de perfil do Instagram
 */
export async function extractInstagramProfileImage(username: string): Promise<string | null> {
  // Instagram bloqueia scraping direto, então usamos serviços alternativos
  // Por enquanto, retornamos null - pode ser implementado com APIs pagas
  return null;
}

/**
 * Extrai logo de perfil do TikTok
 */
export async function extractTikTokProfileImage(username: string): Promise<string | null> {
  // TikTok também bloqueia scraping direto
  // Por enquanto, retornamos null - pode ser implementado com APIs pagas
  return null;
}
