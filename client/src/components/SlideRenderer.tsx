import { useRef, useEffect, useState } from "react";
import { designTemplates, colorPalettes, type DesignTemplate } from "../../../shared/designTemplates";

interface SlideRendererProps {
  text: string;
  imageUrl?: string;
  templateId: string;
  paletteId?: string;
  customColors?: {
    background?: string;
    text?: string;
    accent?: string;
  };
  logoUrl?: string;
  width?: number;
  height?: number;
  onRender?: (dataUrl: string) => void;
  className?: string;
}

export function SlideRenderer({
  text,
  imageUrl,
  templateId,
  paletteId,
  customColors,
  logoUrl,
  width = 1080,
  height = 1080,
  onRender,
  className = ""
}: SlideRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  const template = designTemplates.find(t => t.id === templateId) || designTemplates[0];
  const palette = paletteId ? colorPalettes.find(p => p.id === paletteId) : null;

  // Cores finais (customColors > palette > template default)
  const colors = {
    background: customColors?.background || palette?.colors.background || template.colors.background,
    text: customColors?.text || palette?.colors.text || template.colors.text,
    accent: customColors?.accent || palette?.colors.accent || template.colors.accent,
  };

  useEffect(() => {
    renderSlide();
  }, [text, imageUrl, templateId, paletteId, customColors, logoUrl]);

  const renderSlide = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Desenhar fundo
    await drawBackground(ctx, colors.background, width, height);

    // 2. Desenhar imagem na moldura/quadro
    if (imageUrl && template.imageFrame.position !== 'none') {
      await drawImageInFrame(ctx, imageUrl, template.imageFrame, width, height);
    }

    // 3. Desenhar overlay se existir
    if (template.overlay && template.overlay.type !== 'none') {
      drawOverlay(ctx, template.overlay, width, height);
    }

    // 4. Desenhar texto com estilo do template (respeitando área da imagem)
    drawText(ctx, text, template.textStyle, colors, width, height, template.imageFrame);

    // 5. Desenhar logo se houver
    if (logoUrl && template.logoPosition !== 'none') {
      await drawLogo(ctx, logoUrl, template.logoPosition, width, height);
    }

    setRendered(true);

    // Callback com dataUrl
    if (onRender) {
      const dataUrl = canvas.toDataURL('image/png');
      onRender(dataUrl);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}

// === FUNÇÕES AUXILIARES ===

async function drawBackground(ctx: CanvasRenderingContext2D, color: string, width: number, height: number) {
  if (color.startsWith('linear-gradient')) {
    const gradientMatch = color.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
    if (gradientMatch) {
      const angle = parseInt(gradientMatch[1]);
      const colorStops = gradientMatch[2].split(',').map(s => s.trim());
      
      const rad = (angle - 90) * Math.PI / 180;
      const x1 = width / 2 - Math.cos(rad) * width / 2;
      const y1 = height / 2 - Math.sin(rad) * height / 2;
      const x2 = width / 2 + Math.cos(rad) * width / 2;
      const y2 = height / 2 + Math.sin(rad) * height / 2;
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      
      colorStops.forEach((stop, i) => {
        const match = stop.match(/(#[a-fA-F0-9]+)\s*(\d+)?%?/);
        if (match) {
          const position = match[2] ? parseInt(match[2]) / 100 : i / (colorStops.length - 1);
          gradient.addColorStop(position, match[1]);
        }
      });
      
      ctx.fillStyle = gradient;
    }
  } else {
    ctx.fillStyle = color;
  }
  ctx.fillRect(0, 0, width, height);
}

async function drawImageInFrame(
  ctx: CanvasRenderingContext2D, 
  url: string, 
  frame: DesignTemplate['imageFrame'],
  canvasWidth: number,
  canvasHeight: number
) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calcular posição e tamanho do quadro/moldura
      const frameX = parseValue(frame.x, canvasWidth);
      const frameY = parseValue(frame.y, canvasHeight);
      const frameW = parseValue(frame.width, canvasWidth);
      const frameH = parseValue(frame.height, canvasHeight);
      const borderRadius = parseValue(frame.borderRadius, Math.min(canvasWidth, canvasHeight));

      // Salvar contexto para aplicar clip
      ctx.save();

      // Criar path com bordas arredondadas para o quadro
      if (borderRadius > 0) {
        roundedRect(ctx, frameX, frameY, frameW, frameH, borderRadius);
        ctx.clip();
      }

      // Calcular crop para manter aspect ratio (object-fit: cover)
      const imgRatio = img.width / img.height;
      const frameRatio = frameW / frameH;
      
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      
      if (imgRatio > frameRatio) {
        // Imagem mais larga - cortar lados
        sw = img.height * frameRatio;
        sx = (img.width - sw) / 2;
      } else {
        // Imagem mais alta - cortar topo/base
        sh = img.width / frameRatio;
        sy = (img.height - sh) / 2;
      }
      
      // Desenhar imagem no quadro
      ctx.drawImage(img, sx, sy, sw, sh, frameX, frameY, frameW, frameH);
      
      // Restaurar contexto
      ctx.restore();
      
      resolve();
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: NonNullable<DesignTemplate['overlay']>,
  width: number,
  height: number
) {
  const opacity = overlay.opacity;
  
  switch (overlay.type) {
    case 'gradient-bottom': {
      const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
      gradient.addColorStop(0, `rgba(0,0,0,0)`);
      gradient.addColorStop(1, `rgba(0,0,0,${opacity})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'gradient-top': {
      const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      gradient.addColorStop(0, `rgba(0,0,0,${opacity})`);
      gradient.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'gradient-left': {
      const gradient = ctx.createLinearGradient(0, 0, width * 0.6, 0);
      gradient.addColorStop(0, `rgba(0,0,0,${opacity})`);
      gradient.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'gradient-right': {
      const gradient = ctx.createLinearGradient(width * 0.4, 0, width, 0);
      gradient.addColorStop(0, `rgba(0,0,0,0)`);
      gradient.addColorStop(1, `rgba(0,0,0,${opacity})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'solid': {
      ctx.fillStyle = `rgba(0,0,0,${opacity})`;
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  textStyle: DesignTemplate['textStyle'],
  colors: { text: string; accent: string },
  width: number,
  height: number,
  imageFrame?: DesignTemplate['imageFrame']
) {
  // Tamanhos de fonte baseados no canvas
  const fontSizes: Record<string, number> = {
    'sm': Math.floor(width * 0.03),
    'base': Math.floor(width * 0.038),
    'lg': Math.floor(width * 0.045),
    'xl': Math.floor(width * 0.055),
    '2xl': Math.floor(width * 0.065),
    '3xl': Math.floor(width * 0.08)
  };
  
  const fontWeights: Record<string, string> = {
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'black': '900'
  };

  const lineHeights: Record<string, number> = {
    'tight': 1.1,
    'normal': 1.4,
    'relaxed': 1.6
  };
  
  const fontSize = fontSizes[textStyle.fontSize] || fontSizes['xl'];
  const fontWeight = fontWeights[textStyle.fontWeight] || '700';
  const lineHeight = lineHeights[textStyle.lineHeight] || 1.4;
  const padding = parseValue(textStyle.padding, width);
  const maxWidth = parseValue(textStyle.maxWidth, width);
  
  ctx.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = colors.text;
  ctx.textAlign = textStyle.alignment as CanvasTextAlign;
  ctx.textBaseline = 'top';
  
  // Calcular posição baseada no textStyle.position E área da imagem
  const { x, y, availableHeight } = getTextPositionWithImageBounds(textStyle.position, width, height, padding, imageFrame);
  
  // Aplicar sombra se necessário
  if (textStyle.textShadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }
  
  // Quebrar texto em linhas
  const lines = wrapText(ctx, text, maxWidth);
  const totalHeight = lines.length * fontSize * lineHeight;
  
  // Ajustar Y baseado na posição vertical
  let startY = y;
  if (textStyle.position.includes('center')) {
    startY = y - totalHeight / 2;
  } else if (textStyle.position.includes('bottom')) {
    startY = y - totalHeight;
  }
  
  // Desenhar cada linha
  lines.forEach((line, i) => {
    const lineY = startY + i * fontSize * lineHeight;
    
    // Processar palavras em **negrito** com cor de destaque
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    let currentX = x;
    
    if (textStyle.alignment === 'center') {
      // Para alinhamento central, desenhar linha inteira
      const cleanLine = line.replace(/\*\*/g, '');
      
      // Verificar se tem palavras destacadas
      if (parts.length > 1) {
        // Calcular largura total para centralizar
        let totalWidth = 0;
        parts.forEach(part => {
          const cleanPart = part.replace(/\*\*/g, '');
          totalWidth += ctx.measureText(cleanPart).width;
        });
        
        currentX = x - totalWidth / 2;
        ctx.textAlign = 'left';
        
        parts.forEach(part => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const word = part.slice(2, -2);
            ctx.fillStyle = colors.accent;
            ctx.fillText(word, currentX, lineY);
            currentX += ctx.measureText(word).width;
            ctx.fillStyle = colors.text;
          } else if (part) {
            ctx.fillText(part, currentX, lineY);
            currentX += ctx.measureText(part).width;
          }
        });
        
        ctx.textAlign = textStyle.alignment as CanvasTextAlign;
      } else {
        ctx.fillText(cleanLine, x, lineY);
      }
    } else {
      // Para outros alinhamentos
      parts.forEach(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const word = part.slice(2, -2);
          ctx.fillStyle = colors.accent;
          ctx.fillText(word, currentX, lineY);
          currentX += ctx.measureText(word).width;
          ctx.fillStyle = colors.text;
        } else if (part) {
          ctx.fillText(part, currentX, lineY);
          currentX += ctx.measureText(part).width;
        }
      });
    }
  });
  
  // Resetar sombra
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  url: string,
  position: DesignTemplate['logoPosition'],
  width: number,
  height: number
) {
  if (position === 'none') return;
  
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const logoSize = Math.floor(width * 0.08);
      const padding = Math.floor(width * 0.03);
      
      let x = padding;
      let y = padding;
      
      switch (position) {
        case 'top-right':
          x = width - logoSize - padding;
          break;
        case 'bottom-left':
          y = height - logoSize - padding;
          break;
        case 'bottom-right':
          x = width - logoSize - padding;
          y = height - logoSize - padding;
          break;
      }
      
      // Manter aspect ratio do logo
      const imgRatio = img.width / img.height;
      let drawW = logoSize;
      let drawH = logoSize;
      
      if (imgRatio > 1) {
        drawH = logoSize / imgRatio;
      } else {
        drawW = logoSize * imgRatio;
      }
      
      ctx.drawImage(img, x, y, drawW, drawH);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

// === HELPERS ===

function parseValue(value: string, reference: number): number {
  if (value.endsWith('%')) {
    return (parseFloat(value) / 100) * reference;
  }
  if (value.endsWith('px')) {
    return parseFloat(value);
  }
  return parseFloat(value) || 0;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Calcula a posição do texto respeitando a área da imagem
function getTextPositionWithImageBounds(
  position: string,
  width: number,
  height: number,
  padding: number,
  imageFrame?: DesignTemplate['imageFrame']
): { x: number; y: number; availableHeight: number } {
  // Calcular área ocupada pela imagem
  let imageTop = 0;
  let imageBottom = 0;
  let imageLeft = 0;
  let imageRight = 0;
  
  if (imageFrame && imageFrame.position !== 'none') {
    const imgY = parseValue(imageFrame.y, height);
    const imgH = parseValue(imageFrame.height, height);
    const imgX = parseValue(imageFrame.x, width);
    const imgW = parseValue(imageFrame.width, width);
    
    imageTop = imgY;
    imageBottom = imgY + imgH;
    imageLeft = imgX;
    imageRight = imgX + imgW;
  }
  
  // Calcular área disponível para texto baseado na posição da imagem
  let availableHeight = height;
  let textY = padding;
  
  if (position.includes('top')) {
    // Texto no topo: verificar se imagem está no topo
    if (imageFrame?.position === 'top' || imageTop < height * 0.3) {
      // Imagem no topo, texto não pode ficar lá - mover para baixo da imagem
      textY = imageBottom + padding;
      availableHeight = height - imageBottom - padding * 2;
    } else {
      availableHeight = imageTop > 0 ? imageTop - padding * 2 : height * 0.5;
    }
  } else if (position.includes('bottom')) {
    // Texto na base: verificar se imagem está na base
    if (imageFrame?.position === 'bottom' || imageBottom > height * 0.7) {
      // Imagem na base, texto deve ficar acima
      availableHeight = imageTop - padding * 2;
      textY = height - padding; // Será ajustado depois
    } else {
      availableHeight = height - imageBottom - padding * 2;
      textY = height - padding;
    }
  } else if (position.includes('center')) {
    // Texto no centro: calcular área livre
    if (imageFrame?.position === 'top') {
      availableHeight = height - imageBottom - padding * 2;
      textY = imageBottom + (height - imageBottom) / 2;
    } else if (imageFrame?.position === 'bottom') {
      availableHeight = imageTop - padding * 2;
      textY = imageTop / 2;
    } else {
      textY = height / 2;
    }
  }
  
  // Calcular X baseado no alinhamento horizontal
  let textX = padding;
  if (position.includes('center') && !position.includes('left') && !position.includes('right')) {
    textX = width / 2;
  } else if (position.includes('right')) {
    textX = width - padding;
  } else if (position.includes('left')) {
    // Se imagem está à esquerda, mover texto para direita
    if (imageFrame?.position === 'left' || (imageLeft < width * 0.3 && imageRight < width * 0.6)) {
      textX = imageRight + padding;
    }
  }
  
  // Se imagem está à direita, ajustar texto para esquerda
  if (imageFrame?.position === 'right' || (imageLeft > width * 0.4 && imageRight > width * 0.7)) {
    if (position.includes('right')) {
      textX = imageLeft - padding;
    }
  }
  
  return { x: textX, y: textY, availableHeight: Math.max(availableHeight, height * 0.2) };
}

function getTextPosition(
  position: string,
  width: number,
  height: number,
  padding: number
): { x: number; y: number } {
  const positions: Record<string, { x: number; y: number }> = {
    'top-left': { x: padding, y: padding },
    'top-center': { x: width / 2, y: padding },
    'top-right': { x: width - padding, y: padding },
    'center-left': { x: padding, y: height / 2 },
    'center': { x: width / 2, y: height / 2 },
    'center-right': { x: width - padding, y: height / 2 },
    'bottom-left': { x: padding, y: height - padding },
    'bottom-center': { x: width / 2, y: height - padding },
    'bottom-right': { x: width - padding, y: height - padding }
  };
  
  return positions[position] || positions['center'];
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  // Remover marcadores de negrito para cálculo de largura
  const cleanText = text.replace(/\*\*/g, '');
  const words = text.split(' ');
  const cleanWords = cleanText.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  let currentCleanLine = '';
  
  words.forEach((word, i) => {
    const cleanWord = cleanWords[i];
    const testCleanLine = currentCleanLine + (currentCleanLine ? ' ' : '') + cleanWord;
    const metrics = ctx.measureText(testCleanLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      currentCleanLine = cleanWord;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
      currentCleanLine = testCleanLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// === COMPONENTE DE PREVIEW (HTML/CSS) ===

interface SlidePreviewProps {
  text: string;
  imageUrl?: string;
  templateId: string;
  paletteId?: string;
  logoUrl?: string;
  className?: string;
  onClick?: () => void;
}

export function SlidePreview({
  text,
  imageUrl,
  templateId,
  paletteId,
  logoUrl,
  className = "",
  onClick
}: SlidePreviewProps) {
  const template = designTemplates.find(t => t.id === templateId) || designTemplates[0];
  const palette = paletteId ? colorPalettes.find(p => p.id === paletteId) : null;
  
  const colors = {
    background: palette?.colors.background || template.colors.background,
    text: palette?.colors.text || template.colors.text,
    accent: palette?.colors.accent || template.colors.accent,
  };

  // Processar texto com **destaque**
  const processText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} style={{ color: colors.accent }}>{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  // Estilos do texto baseados no template
  const textStyles: React.CSSProperties = {
    position: 'absolute',
    maxWidth: template.textStyle.maxWidth,
    padding: template.textStyle.padding,
    textAlign: template.textStyle.alignment,
    color: colors.text,
    fontWeight: template.textStyle.fontWeight === 'black' ? 900 : 
               template.textStyle.fontWeight === 'bold' ? 700 :
               template.textStyle.fontWeight === 'semibold' ? 600 :
               template.textStyle.fontWeight === 'medium' ? 500 : 400,
    lineHeight: template.textStyle.lineHeight === 'tight' ? 1.1 :
                template.textStyle.lineHeight === 'relaxed' ? 1.6 : 1.4,
    textShadow: template.textStyle.textShadow ? '2px 2px 8px rgba(0,0,0,0.8)' : 'none',
    ...getTextPositionStyles(template.textStyle.position)
  };

  // Classe de tamanho de fonte
  const fontSizeClass = {
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  }[template.textStyle.fontSize] || 'text-xl';

  return (
    <div 
      className={`relative aspect-square overflow-hidden ${className}`}
      style={{ background: colors.background }}
      onClick={onClick}
    >
      {/* Imagem na moldura/quadro */}
      {imageUrl && template.imageFrame.position !== 'none' && (
        <div
          style={{
            position: 'absolute',
            left: template.imageFrame.x,
            top: template.imageFrame.y,
            width: template.imageFrame.width,
            height: template.imageFrame.height,
            borderRadius: template.imageFrame.borderRadius,
            overflow: 'hidden'
          }}
        >
          <img
            src={imageUrl}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: template.imageFrame.objectFit
            }}
          />
        </div>
      )}

      {/* Overlay */}
      {template.overlay && template.overlay.type !== 'none' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            ...getOverlayStyles(template.overlay)
          }}
        />
      )}

      {/* Texto */}
      <div style={textStyles} className={fontSizeClass}>
        {processText(text)}
      </div>

      {/* Logo */}
      {logoUrl && template.logoPosition !== 'none' && (
        <img
          src={logoUrl}
          alt="Logo"
          className="absolute w-[8%] h-auto"
          style={getLogoPositionStyles(template.logoPosition)}
        />
      )}
    </div>
  );
}

function getTextPositionStyles(position: string): React.CSSProperties {
  const styles: Record<string, React.CSSProperties> = {
    'top-left': { top: 0, left: 0 },
    'top-center': { top: 0, left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: 0, right: 0 },
    'center-left': { top: '50%', left: 0, transform: 'translateY(-50%)' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'center-right': { top: '50%', right: 0, transform: 'translateY(-50%)' },
    'bottom-left': { bottom: 0, left: 0 },
    'bottom-center': { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: 0, right: 0 }
  };
  return styles[position] || styles['center'];
}

function getOverlayStyles(overlay: NonNullable<DesignTemplate['overlay']>): React.CSSProperties {
  const opacity = overlay.opacity;
  
  switch (overlay.type) {
    case 'gradient-bottom':
      return { background: `linear-gradient(to bottom, transparent 40%, rgba(0,0,0,${opacity}) 100%)` };
    case 'gradient-top':
      return { background: `linear-gradient(to top, transparent 40%, rgba(0,0,0,${opacity}) 100%)` };
    case 'gradient-left':
      return { background: `linear-gradient(to left, transparent 40%, rgba(0,0,0,${opacity}) 100%)` };
    case 'gradient-right':
      return { background: `linear-gradient(to right, transparent 40%, rgba(0,0,0,${opacity}) 100%)` };
    case 'solid':
      return { background: `rgba(0,0,0,${opacity})` };
    default:
      return {};
  }
}

function getLogoPositionStyles(position: string): React.CSSProperties {
  const padding = '3%';
  const styles: Record<string, React.CSSProperties> = {
    'top-left': { top: padding, left: padding },
    'top-right': { top: padding, right: padding },
    'bottom-left': { bottom: padding, left: padding },
    'bottom-right': { bottom: padding, right: padding }
  };
  return styles[position] || styles['bottom-right'];
}

// === SELETOR DE TEMPLATE ===

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  paletteId?: string;
  onPaletteSelect?: (id: string) => void;
}

export function TemplateSelector({ 
  selectedId, 
  onSelect,
  paletteId,
  onPaletteSelect
}: TemplateSelectorProps) {
  const [category, setCategory] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);
  
  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'split', name: 'Split' },
    { id: 'card', name: 'Card' },
    { id: 'fullbleed', name: 'Full Bleed' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'bold', name: 'Impacto' },
    { id: 'editorial', name: 'Editorial' }
  ];
  
  const filteredTemplates = category === 'all' 
    ? designTemplates 
    : designTemplates.filter(t => t.category === category);
  
  const displayTemplates = showAll ? filteredTemplates : filteredTemplates.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Filtros de categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              category === cat.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid de templates */}
      <div className="grid grid-cols-3 gap-2">
        {displayTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              selectedId === template.id 
                ? 'border-primary ring-2 ring-primary/50' 
                : 'border-transparent hover:border-muted-foreground/30'
            }`}
          >
            {/* Mini preview do template */}
            <div 
              className="w-full h-full"
              style={{ background: template.colors.background }}
            >
              {/* Área da imagem */}
              {template.imageFrame.position !== 'none' && (
                <div
                  className="absolute bg-muted/50"
                  style={{
                    left: template.imageFrame.x,
                    top: template.imageFrame.y,
                    width: template.imageFrame.width,
                    height: template.imageFrame.height,
                    borderRadius: template.imageFrame.borderRadius
                  }}
                />
              )}
              {/* Área do texto */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  ...getTextPositionStyles(template.textStyle.position),
                  padding: '8%',
                  maxWidth: template.textStyle.maxWidth
                }}
              >
                <div 
                  className="w-full space-y-1"
                  style={{ textAlign: template.textStyle.alignment }}
                >
                  <div className="h-1.5 rounded" style={{ background: template.colors.text, width: '80%', margin: template.textStyle.alignment === 'center' ? '0 auto' : undefined }} />
                  <div className="h-1.5 rounded" style={{ background: template.colors.text, width: '60%', margin: template.textStyle.alignment === 'center' ? '0 auto' : undefined }} />
                </div>
              </div>
            </div>
            {/* Nome do template */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
              <span className="text-[10px] text-white truncate block">{template.name}</span>
            </div>
            {/* Check de selecionado */}
            {selectedId === template.id && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Ver mais */}
      {filteredTemplates.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
        >
          <svg className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showAll ? 'Ver menos' : `Ver mais (${filteredTemplates.length - 6})`}
        </button>
      )}

      {/* Paleta de cores */}
      {onPaletteSelect && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            Paleta de Cores
          </h4>
          <div className="flex flex-wrap gap-2">
            {colorPalettes.map(palette => (
              <button
                key={palette.id}
                onClick={() => onPaletteSelect(palette.id)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  paletteId === palette.id 
                    ? 'border-white ring-2 ring-primary scale-110' 
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ background: palette.colors.accent }}
                title={palette.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
