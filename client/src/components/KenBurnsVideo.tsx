import { useRef, useEffect, useState } from "react";

interface KenBurnsVideoProps {
  imageUrl: string;
  duration?: number; // em segundos
  direction?: "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down";
  onComplete?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
}

export function KenBurnsVideo({
  imageUrl,
  duration = 5,
  direction = "zoom-in",
  onComplete,
  autoPlay = true,
  loop = false,
  className = "",
}: KenBurnsVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now();
    const durationMs = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / durationMs, 1);
      setProgress(currentProgress);

      if (currentProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (loop) {
          setProgress(0);
          setIsPlaying(true);
        } else {
          onComplete?.();
        }
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, duration, loop, onComplete]);

  const getTransform = () => {
    const easeProgress = easeInOutCubic(progress);
    
    switch (direction) {
      case "zoom-in":
        const scaleIn = 1 + easeProgress * 0.3; // 1 -> 1.3
        return `scale(${scaleIn})`;
      case "zoom-out":
        const scaleOut = 1.3 - easeProgress * 0.3; // 1.3 -> 1
        return `scale(${scaleOut})`;
      case "pan-left":
        const translateLeft = easeProgress * 10; // 0 -> 10%
        return `scale(1.2) translateX(-${translateLeft}%)`;
      case "pan-right":
        const translateRight = easeProgress * 10;
        return `scale(1.2) translateX(${translateRight}%)`;
      case "pan-up":
        const translateUp = easeProgress * 10;
        return `scale(1.2) translateY(-${translateUp}%)`;
      case "pan-down":
        const translateDown = easeProgress * 10;
        return `scale(1.2) translateY(${translateDown}%)`;
      default:
        return "scale(1)";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: "9/16" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform"
        style={{
          backgroundImage: `url(${imageUrl})`,
          transform: getTransform(),
          transitionDuration: "0ms",
        }}
      />
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Play/Pause overlay */}
      {!autoPlay && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
        >
          {isPlaying ? (
            <PauseIcon className="w-16 h-16 text-white/80" />
          ) : (
            <PlayIcon className="w-16 h-16 text-white/80" />
          )}
        </button>
      )}
    </div>
  );
}

// Easing function for smooth animation
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Simple icons
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

// Função para exportar Ken Burns como vídeo (usando canvas)
export async function exportKenBurnsAsVideo(
  imageUrl: string,
  duration: number = 5,
  direction: "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down" = "zoom-in",
  fps: number = 30,
  width: number = 1080,
  height: number = 1920
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const totalFrames = duration * fps;
      const frames: Blob[] = [];
      
      // Gerar frames
      for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;
        const easeProgress = easeInOutCubic(progress);
        
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        
        // Calcular transformação
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        
        switch (direction) {
          case "zoom-in":
            scale = 1 + easeProgress * 0.3;
            break;
          case "zoom-out":
            scale = 1.3 - easeProgress * 0.3;
            break;
          case "pan-left":
            scale = 1.2;
            translateX = -easeProgress * width * 0.1;
            break;
          case "pan-right":
            scale = 1.2;
            translateX = easeProgress * width * 0.1;
            break;
          case "pan-up":
            scale = 1.2;
            translateY = -easeProgress * height * 0.1;
            break;
          case "pan-down":
            scale = 1.2;
            translateY = easeProgress * height * 0.1;
            break;
        }
        
        // Aplicar transformação
        ctx.translate(width / 2 + translateX, height / 2 + translateY);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);
        
        // Desenhar imagem cobrindo o canvas
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          drawHeight = height;
          drawWidth = height * imgAspect;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgAspect;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      }
      
      // Criar vídeo usando MediaRecorder (se disponível)
      // Por enquanto, retornar um GIF ou sequência de imagens
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not create video blob"));
        }
      }, "image/webp", 0.9);
    };
    
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = imageUrl;
  });
}

export default KenBurnsVideo;
