/**
 * Sistema de Downloads - PNG sequencial (sem ZIP)
 * Seguindo especificação do PDF Sistema-Downloads-Completo
 */

/**
 * Baixar slide individual de carrossel (com texto renderizado)
 */
export async function downloadCarouselSlide(
  imageUrl: string,
  text: string,
  filename: string,
  isFirst: boolean
): Promise<void> {
  // Criar canvas para este slide
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;

  // Carregar imagem via proxy para evitar CORS
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = proxyUrl;
  });

  // Desenhar imagem mantendo proporção (cover - preenche sem esticar)
  const imgRatio = img.width / img.height;
  const canvasRatio = canvas.width / canvas.height;
  
  let drawWidth, drawHeight, drawX, drawY;
  
  if (imgRatio > canvasRatio) {
    // Imagem mais larga - ajustar pela altura
    drawHeight = canvas.height;
    drawWidth = img.width * (canvas.height / img.height);
    drawX = (canvas.width - drawWidth) / 2;
    drawY = 0;
  } else {
    // Imagem mais alta - ajustar pela largura
    drawWidth = canvas.width;
    drawHeight = img.height * (canvas.width / img.width);
    drawX = 0;
    drawY = (canvas.height - drawHeight) / 2;
  }
  
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  // Adicionar gradiente
  const gradientStart = isFirst ? 0 : canvas.height * 0.5;
  const gradient = ctx.createLinearGradient(0, gradientStart, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Configurar e desenhar texto
  const fontSize = isFirst ? 60 : 48;
  const textPosition = isFirst ? 0.15 : 0.67;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Quebrar texto em linhas
  const maxWidth = canvas.width * 0.85;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let j = 1; j < words.length; j++) {
    const testLine = currentLine + ' ' + words[j];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[j];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  // Desenhar linhas
  const lineHeight = fontSize * 1.3;
  const startY = canvas.height * textPosition;

  lines.forEach((line, index) => {
    const y = startY + (index - lines.length / 2) * lineHeight;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(line, canvas.width / 2, y);
  });

  // Converter para blob e baixar
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png');
  });

  // Criar URL temporária e baixar
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Baixar imagem única selecionada (sem renderização de texto)
 */
export async function downloadSingleImage(
  imageUrl: string,
  filename: string
): Promise<void> {
  try {
    // Usar proxy para evitar CORS
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;

    // Buscar imagem
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error('Erro ao baixar imagem');
    }

    // Converter para blob
    const blob = await response.blob();

    // Criar URL temporária
    const url = URL.createObjectURL(blob);

    // Criar link de download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Limpar
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Erro ao baixar imagem:', error);
    alert('❌ Erro ao baixar imagem');
  }
}

/**
 * Baixar todos os slides de um carrossel como PNGs individuais (com texto)
 * Downloads sequenciais com intervalo para não sobrecarregar
 */
export async function downloadAllSlidesWithText(
  slides: Array<{
    url: string;
    text: string;
    isFirst: boolean;
    style?: any[]; // Edições salvas (opcional)
  }>,
  carouselTitle: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < slides.length; i++) {
    onProgress?.(i + 1, slides.length);
    
    const filename = `${carouselTitle}_${i + 1}.png`;
    await downloadSlideWithStyle(
      slides[i].url,
      slides[i].text,
      filename,
      slides[i].style // Usar edições salvas se existirem
    );
    
    // Pequeno intervalo entre downloads para não sobrecarregar
    if (i < slides.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

/**
 * Baixar todos os slides de um carrossel como PNGs individuais (sem texto)
 * Downloads sequenciais com intervalo para não sobrecarregar
 */
export async function downloadAllSlidesWithoutText(
  slides: Array<{ url: string }>,
  carouselTitle: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < slides.length; i++) {
    onProgress?.(i + 1, slides.length);
    
    const filename = `${carouselTitle}_${i + 1}_sem_texto.png`;
    await downloadSingleImage(slides[i].url, filename);
    
    // Pequeno intervalo entre downloads para não sobrecarregar
    if (i < slides.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

/**
 * Baixar vídeo gerado
 */
export function downloadVideo(videoUrl: string, filename: string): void {
  try {
    // Criar link de download
    const a = document.createElement('a');
    a.href = videoUrl; // URL já é pública do S3
    a.download = filename;
    a.target = '_blank'; // Abrir em nova aba se download falhar
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (error) {
    console.error('Erro ao baixar vídeo:', error);
    alert('❌ Erro ao baixar vídeo');
  }
}

/**
 * Baixar slide com estilo personalizado (usa edições salvas ou padrão do preview)
 * @param imageUrl URL da imagem de fundo
 * @param text Texto do slide
 * @param filename Nome do arquivo para download
 * @param style Edições salvas do editor (opcional)
 */
export async function downloadSlideWithStyle(
  imageUrl: string,
  text: string,
  filename: string,
  style?: any[] // EditorElement[]
): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;

  // Carregar imagem via proxy
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = proxyUrl;
  });

  // Desenhar imagem FULL (cover)
  const imgRatio = img.width / img.height;
  const canvasRatio = canvas.width / canvas.height;
  
  let drawWidth, drawHeight, drawX, drawY;
  
  if (imgRatio > canvasRatio) {
    drawHeight = canvas.height;
    drawWidth = img.width * (canvas.height / img.height);
    drawX = (canvas.width - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = canvas.width;
    drawHeight = img.height * (canvas.width / img.width);
    drawX = 0;
    drawY = (canvas.height - drawHeight) / 2;
  }
  
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  // Se tem style salvo, usar ele
  if (style && Array.isArray(style) && style.length > 0) {
    // Renderizar usando edições salvas
    const scale = canvas.width / 400; // Editor usa 400px de largura
    
    style.forEach((element: any) => {
      if (element.type === 'text') {
        ctx.save();
        
        // Aplicar transformações
        const x = element.x * scale;
        const y = element.y * scale;
        ctx.translate(x + (element.width * scale) / 2, y + (element.height * scale) / 2);
        ctx.rotate((element.rotation || 0) * Math.PI / 180);
        
        // Configurar texto
        ctx.fillStyle = element.fill || '#FFFFFF';
        ctx.font = `${element.fontWeight || 700} ${(element.fontSize || 18) * scale}px ${element.fontFamily || 'Inter'}`;
        ctx.textAlign = element.textAlign || 'left';
        ctx.textBaseline = 'top';
        
        // Sombra
        if (element.textShadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 10 * scale;
          ctx.shadowOffsetX = 5 * scale;
          ctx.shadowOffsetY = 5 * scale;
        }
        
        // Desenhar texto (quebrar linhas se necessário)
        const maxWidth = element.width * scale;
        const words = (element.content || '').split(' ');
        const lines: string[] = [];
        let currentLine = words[0] || '';
        
        for (let j = 1; j < words.length; j++) {
          const testLine = currentLine + ' ' + words[j];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth) {
            lines.push(currentLine);
            currentLine = words[j];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        
        // Desenhar cada linha
        const lineHeight = (element.fontSize || 18) * (element.lineHeight || 1.2) * scale;
        const startY = -(element.height * scale) / 2;
        
        lines.forEach((line, index) => {
          const yPos = startY + index * lineHeight;
          ctx.fillText(line, -(element.width * scale) / 2, yPos);
        });
        
        ctx.restore();
      }
    });
  } else {
    // Usar layout padrão do preview (SEM overlay)
    // Texto embaixo à esquerda
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Sombra para legibilidade
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // Quebrar texto em linhas
    const padding = 64; // 24px * 2.7 (escala)
    const maxWidth = canvas.width - padding * 2;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];
    
    for (let j = 1; j < words.length; j++) {
      const testLine = currentLine + ' ' + words[j];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[j];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    // Desenhar linhas na parte de baixo
    const lineHeight = 48 * 1.2;
    const startY = canvas.height - padding - (lines.length * lineHeight);
    
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.fillText(line, padding, y);
    });
  }

  // Converter para blob e baixar
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png');
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
