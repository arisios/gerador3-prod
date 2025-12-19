import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plus, Minus, Trash2, Download, Type, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight
} from "lucide-react";

// Tipos
interface ImageObject {
  x: number; // posição X em % (0-100)
  y: number; // posição Y em % (0-100)
  width: number; // largura em % (10-100)
  height: number; // altura em % (10-100)
}

interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number; // largura em % (10-100)
  height: number; // altura em % (10-100)
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  textAlign: "left" | "center" | "right";
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
  letterSpacing: number;
  lineHeight: number;
  bgEnabled: boolean;
  bgColor: string;
  bgPadding: number;
}

interface SlideComposerNewProps {
  imageUrl?: string;
  initialText?: string;
  backgroundColor?: string;
  onSave?: (data: any) => Promise<void>;
  slideIndex?: number;
}

// Valores padrão
const DEFAULT_IMAGE: ImageObject = {
  x: 0,
  y: 0,
  width: 100,
  height: 60,
};

const DEFAULT_TEXT_BLOCK: Omit<TextBlock, "id"> = {
  text: "Seu texto aqui",
  x: 5,
  y: 65,
  width: 90,
  height: 30,
  fontSize: 28,
  color: "#FFFFFF",
  fontFamily: "Inter",
  fontWeight: "bold",
  textAlign: "center",
  shadowEnabled: true,
  shadowColor: "#000000",
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  borderEnabled: false,
  borderColor: "#FFFFFF",
  borderWidth: 2,
  glowEnabled: false,
  glowColor: "#A855F7",
  glowIntensity: 10,
  letterSpacing: 0,
  lineHeight: 1.3,
  bgEnabled: false,
  bgColor: "#000000",
  bgPadding: 8,
};

const COLOR_PRESETS = [
  { name: "Branco", text: "#FFFFFF", bg: "#1a1a2e" },
  { name: "Neon Verde", text: "#39FF14", bg: "#0a0a0a" },
  { name: "Neon Rosa", text: "#FF10F0", bg: "#1a0a1a" },
  { name: "Neon Azul", text: "#00D4FF", bg: "#0a1a2e" },
  { name: "Dourado", text: "#FFD700", bg: "#1a1a0a" },
  { name: "Coral", text: "#FF6B6B", bg: "#1a0a0a" },
];

const FONT_OPTIONS = [
  "Inter", "Roboto", "Montserrat", "Playfair Display", 
  "Oswald", "Poppins", "Bebas Neue", "Anton"
];

type DragMode = "none" | "move-image" | "resize-image" | "move-text" | "resize-text";
type ResizeHandle = "nw" | "ne" | "sw" | "se";

export default function SlideComposerNew({
  imageUrl,
  initialText = "",
  backgroundColor: initialBg = "#1a1a2e",
  onSave,
  slideIndex = 1,
}: SlideComposerNewProps) {
  // Estados
  const [imageObject, setImageObject] = useState<ImageObject>({ ...DEFAULT_IMAGE });
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([
    { ...DEFAULT_TEXT_BLOCK, id: "text-1", text: initialText || DEFAULT_TEXT_BLOCK.text }
  ]);
  const [selectedElement, setSelectedElement] = useState<"image" | string>("text-1");
  const [backgroundColor, setBackgroundColor] = useState(initialBg);
  const [dragMode, setDragMode] = useState<DragMode>("none");
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [downloading, setDownloading] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Bloquear/liberar scroll ao arrastar
  useEffect(() => {
    if (dragMode !== "none") {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [dragMode]);
  
  // Texto selecionado
  const selectedText = selectedElement !== "image" 
    ? textBlocks.find(b => b.id === selectedElement) || textBlocks[0]
    : null;
  
  // Funções de manipulação
  const updateImageObject = (updates: Partial<ImageObject>) => {
    setImageObject(img => ({ ...img, ...updates }));
  };
  
  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(blocks => blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  
  const addTextBlock = () => {
    const newId = `text-${Date.now()}`;
    setTextBlocks(blocks => [...blocks, { ...DEFAULT_TEXT_BLOCK, id: newId, y: 50 }]);
    setSelectedElement(newId);
  };
  
  const removeTextBlock = (id: string) => {
    if (textBlocks.length <= 1) {
      toast.error("Precisa ter pelo menos um texto");
      return;
    }
    setTextBlocks(blocks => blocks.filter(b => b.id !== id));
    if (selectedElement === id) {
      setSelectedElement(textBlocks[0].id === id ? textBlocks[1]?.id : textBlocks[0].id);
    }
  };
  
  // Converter coordenadas do evento para % do canvas
  const getEventPosition = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };
  
  // === HANDLERS DE IMAGEM ===
  const handleImageMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement("image");
    setDragMode("move-image");
    
    const pos = getEventPosition(e.clientX, e.clientY);
    setDragStart(pos);
    setElementStart({ x: imageObject.x, y: imageObject.y, width: imageObject.width, height: imageObject.height });
  };
  
  const handleImageTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement("image");
    setDragMode("move-image");
    
    const touch = e.touches[0];
    const pos = getEventPosition(touch.clientX, touch.clientY);
    setDragStart(pos);
    setElementStart({ x: imageObject.x, y: imageObject.y, width: imageObject.width, height: imageObject.height });
  };
  
  const handleImageResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement("image");
    setDragMode("resize-image");
    setResizeHandle(handle);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const pos = getEventPosition(clientX, clientY);
    setDragStart(pos);
    setElementStart({ x: imageObject.x, y: imageObject.y, width: imageObject.width, height: imageObject.height });
  };
  
  // === HANDLERS DE TEXTO ===
  const handleTextMouseDown = (e: React.MouseEvent, textId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(textId);
    setDragMode("move-text");
    
    const block = textBlocks.find(b => b.id === textId);
    if (!block) return;
    
    const pos = getEventPosition(e.clientX, e.clientY);
    setDragStart(pos);
    setElementStart({ x: block.x, y: block.y, width: block.width, height: block.height });
  };
  
  const handleTextTouchStart = (e: React.TouchEvent, textId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(textId);
    setDragMode("move-text");
    
    const block = textBlocks.find(b => b.id === textId);
    if (!block) return;
    
    const touch = e.touches[0];
    const pos = getEventPosition(touch.clientX, touch.clientY);
    setDragStart(pos);
    setElementStart({ x: block.x, y: block.y, width: block.width, height: block.height });
  };
  
  const handleTextResizeStart = (e: React.MouseEvent | React.TouchEvent, textId: string, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(textId);
    setDragMode("resize-text");
    setResizeHandle(handle);
    
    const block = textBlocks.find(b => b.id === textId);
    if (!block) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const pos = getEventPosition(clientX, clientY);
    setDragStart(pos);
    setElementStart({ x: block.x, y: block.y, width: block.width, height: block.height });
  };
  
  // === HANDLERS GLOBAIS DE MOVIMENTO ===
  const handleGlobalMove = (clientX: number, clientY: number) => {
    if (dragMode === "none") return;
    
    const pos = getEventPosition(clientX, clientY);
    const deltaX = pos.x - dragStart.x;
    const deltaY = pos.y - dragStart.y;
    
    if (dragMode === "move-image") {
      const newX = Math.max(0, Math.min(100 - imageObject.width, elementStart.x + deltaX));
      const newY = Math.max(0, Math.min(100 - imageObject.height, elementStart.y + deltaY));
      updateImageObject({ x: newX, y: newY });
    }
    else if (dragMode === "resize-image" && resizeHandle) {
      let newX = elementStart.x;
      let newY = elementStart.y;
      let newWidth = elementStart.width;
      let newHeight = elementStart.height;
      
      // Manter proporção 4:5 (1080:1350)
      const aspectRatio = 4 / 5;
      
      if (resizeHandle === "se") {
        newWidth = Math.max(20, Math.min(100 - elementStart.x, elementStart.width + deltaX));
        newHeight = newWidth / aspectRatio;
      } else if (resizeHandle === "sw") {
        const widthChange = -deltaX;
        newWidth = Math.max(20, Math.min(elementStart.x + elementStart.width, elementStart.width + widthChange));
        newHeight = newWidth / aspectRatio;
        newX = elementStart.x + elementStart.width - newWidth;
      } else if (resizeHandle === "ne") {
        newWidth = Math.max(20, Math.min(100 - elementStart.x, elementStart.width + deltaX));
        newHeight = newWidth / aspectRatio;
        newY = elementStart.y + elementStart.height - newHeight;
      } else if (resizeHandle === "nw") {
        const widthChange = -deltaX;
        newWidth = Math.max(20, Math.min(elementStart.x + elementStart.width, elementStart.width + widthChange));
        newHeight = newWidth / aspectRatio;
        newX = elementStart.x + elementStart.width - newWidth;
        newY = elementStart.y + elementStart.height - newHeight;
      }
      
      // Limitar dentro do canvas
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      if (newX + newWidth > 100) newWidth = 100 - newX;
      if (newY + newHeight > 100) newHeight = 100 - newY;
      
      updateImageObject({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
    else if (dragMode === "move-text" && selectedElement !== "image") {
      const block = textBlocks.find(b => b.id === selectedElement);
      if (!block) return;
      
      const newX = Math.max(0, Math.min(100 - block.width, elementStart.x + deltaX));
      const newY = Math.max(0, Math.min(100 - block.height, elementStart.y + deltaY));
      updateTextBlock(selectedElement, { x: newX, y: newY });
    }
    else if (dragMode === "resize-text" && resizeHandle && selectedElement !== "image") {
      let newX = elementStart.x;
      let newY = elementStart.y;
      let newWidth = elementStart.width;
      let newHeight = elementStart.height;
      
      if (resizeHandle === "se") {
        newWidth = Math.max(10, Math.min(100 - elementStart.x, elementStart.width + deltaX));
        newHeight = Math.max(10, Math.min(100 - elementStart.y, elementStart.height + deltaY));
      } else if (resizeHandle === "sw") {
        newWidth = Math.max(10, elementStart.width - deltaX);
        newHeight = Math.max(10, Math.min(100 - elementStart.y, elementStart.height + deltaY));
        newX = elementStart.x + elementStart.width - newWidth;
      } else if (resizeHandle === "ne") {
        newWidth = Math.max(10, Math.min(100 - elementStart.x, elementStart.width + deltaX));
        newHeight = Math.max(10, elementStart.height - deltaY);
        newY = elementStart.y + elementStart.height - newHeight;
      } else if (resizeHandle === "nw") {
        newWidth = Math.max(10, elementStart.width - deltaX);
        newHeight = Math.max(10, elementStart.height - deltaY);
        newX = elementStart.x + elementStart.width - newWidth;
        newY = elementStart.y + elementStart.height - newHeight;
      }
      
      // Limitar dentro do canvas
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      if (newX + newWidth > 100) newWidth = 100 - newX;
      if (newY + newHeight > 100) newHeight = 100 - newY;
      
      updateTextBlock(selectedElement, { x: newX, y: newY, width: newWidth, height: newHeight });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    handleGlobalMove(e.clientX, e.clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragMode !== "none") {
      e.preventDefault();
      e.stopPropagation();
    }
    const touch = e.touches[0];
    handleGlobalMove(touch.clientX, touch.clientY);
  };
  
  const handleDragEnd = () => {
    setDragMode("none");
    setResizeHandle(null);
  };
  
  // === DOWNLOAD ===
  const handleDownload = async (withText: boolean) => {
    setDownloading(true);
    
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Canvas não suportado");
      
      // 1. Preencher fundo
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 2. Desenhar imagem como OBJETO (não background)
      if (imageUrl) {
        try {
          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = proxyUrl;
          });
          
          // Calcular posição e tamanho do objeto imagem
          const imgX = (imageObject.x / 100) * canvas.width;
          const imgY = (imageObject.y / 100) * canvas.height;
          const imgWidth = (imageObject.width / 100) * canvas.width;
          const imgHeight = (imageObject.height / 100) * canvas.height;
          
          // Desenhar imagem com cover dentro do frame
          const imgRatio = img.width / img.height;
          const frameRatio = imgWidth / imgHeight;
          
          let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;
          
          if (imgRatio > frameRatio) {
            // Imagem mais larga - cortar laterais
            srcWidth = img.height * frameRatio;
            srcX = (img.width - srcWidth) / 2;
          } else {
            // Imagem mais alta - cortar topo/base
            srcHeight = img.width / frameRatio;
            srcY = (img.height - srcHeight) / 2;
          }
          
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, imgX, imgY, imgWidth, imgHeight);
        } catch (imgError) {
          console.warn("Erro ao carregar imagem:", imgError);
        }
      }
      
      // 3. Desenhar textos como OBJETOS
      if (withText) {
        for (const block of textBlocks) {
          if (!block.text.trim()) continue;
          
          // Calcular área do texto
          const textX = (block.x / 100) * canvas.width;
          const textY = (block.y / 100) * canvas.height;
          const textWidth = (block.width / 100) * canvas.width;
          const textHeight = (block.height / 100) * canvas.height;
          
          // Fundo do texto (se habilitado)
          if (block.bgEnabled) {
            ctx.fillStyle = block.bgColor;
            ctx.fillRect(
              textX - block.bgPadding,
              textY - block.bgPadding,
              textWidth + block.bgPadding * 2,
              textHeight + block.bgPadding * 2
            );
          }
          
          // Configurar fonte - usar mesma escala do preview
          // Preview tem ~360px de largura, canvas tem 1080px
          const previewWidth = 360;
          const scale = canvas.width / previewWidth;
          const fontSize = block.fontSize * scale;
          ctx.font = `${block.fontWeight} ${fontSize}px ${block.fontFamily}, sans-serif`;
          ctx.fillStyle = block.color;
          ctx.textBaseline = "top";
          
          // Configurar alinhamento
          let alignX = textX;
          if (block.textAlign === "center") {
            ctx.textAlign = "center";
            alignX = textX + textWidth / 2;
          } else if (block.textAlign === "right") {
            ctx.textAlign = "right";
            alignX = textX + textWidth;
          } else {
            ctx.textAlign = "left";
          }
          
          // Configurar sombra
          if (block.shadowEnabled) {
            ctx.shadowColor = block.shadowColor;
            ctx.shadowBlur = block.shadowBlur * scale;
            ctx.shadowOffsetX = block.shadowOffsetX * scale;
            ctx.shadowOffsetY = block.shadowOffsetY * scale;
          }
          
          // Glow
          if (block.glowEnabled) {
            ctx.shadowColor = block.glowColor;
            ctx.shadowBlur = block.glowIntensity * scale;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
          
          // Quebrar texto em linhas
          const words = block.text.split(" ");
          const lines: string[] = [];
          let currentLine = words[0] || "";
          
          for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + " " + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > textWidth) {
              lines.push(currentLine);
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
          lines.push(currentLine);
          
          // Desenhar linhas
          const lineHeightPx = fontSize * block.lineHeight;
          const totalTextHeight = lines.length * lineHeightPx;
          let startY = textY + (textHeight - totalTextHeight) / 2;
          
          // Contorno
          if (block.borderEnabled) {
            ctx.strokeStyle = block.borderColor;
            ctx.lineWidth = block.borderWidth * scale;
            for (let i = 0; i < lines.length; i++) {
              ctx.strokeText(lines[i], alignX, startY + i * lineHeightPx);
            }
          }
          
          // Texto principal
          for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], alignX, startY + i * lineHeightPx);
          }
          
          // Resetar sombra
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      }
      
      // 4. Download
      const link = document.createElement("a");
      link.download = `slide_${slideIndex}_${withText ? "com_texto" : "sem_texto"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Download realizado!");
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao fazer download");
    } finally {
      setDownloading(false);
    }
  };
  
  // === COMPONENTE DE HANDLES ===
  const ResizeHandles = ({ 
    onResizeStart 
  }: { 
    onResizeStart: (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => void 
  }) => (
    <>
      {(["nw", "ne", "sw", "se"] as ResizeHandle[]).map(handle => (
        <div
          key={handle}
          className={`absolute w-4 h-4 bg-white border-2 border-purple-500 rounded-sm cursor-${
            handle === "nw" || handle === "se" ? "nwse" : "nesw"
          }-resize z-20`}
          style={{
            top: handle.includes("n") ? -8 : "auto",
            bottom: handle.includes("s") ? -8 : "auto",
            left: handle.includes("w") ? -8 : "auto",
            right: handle.includes("e") ? -8 : "auto",
          }}
          onMouseDown={(e) => onResizeStart(e, handle)}
          onTouchStart={(e) => onResizeStart(e, handle)}
        />
      ))}
    </>
  );
  
  // === RENDER ===
  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      {/* Header com botões de download */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => handleDownload(true)}
          disabled={downloading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Com Texto
        </Button>
        <Button
          onClick={() => handleDownload(false)}
          disabled={downloading}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Sem Texto
        </Button>
      </div>
      
      {/* Canvas/Preview */}
      <div
        ref={canvasRef}
        className="relative w-full bg-gray-900 rounded-lg overflow-hidden select-none"
        style={{ 
          aspectRatio: "4/5",
          backgroundColor,
          touchAction: "none"
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Objeto Imagem */}
        {imageUrl && (
          <div
            className={`absolute cursor-move ${selectedElement === "image" ? "ring-2 ring-purple-500" : ""}`}
            style={{
              left: `${imageObject.x}%`,
              top: `${imageObject.y}%`,
              width: `${imageObject.width}%`,
              height: `${imageObject.height}%`,
            }}
            onMouseDown={handleImageMouseDown}
            onTouchStart={handleImageTouchStart}
          >
            <img
              src={imageUrl}
              alt="Slide"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
            {selectedElement === "image" && (
              <ResizeHandles onResizeStart={(e, h) => handleImageResizeStart(e, h)} />
            )}
          </div>
        )}
        
        {/* Objetos Texto */}
        {textBlocks.map(block => (
          <div
            key={block.id}
            className={`absolute cursor-move ${selectedElement === block.id ? "ring-2 ring-purple-500" : ""}`}
            style={{
              left: `${block.x}%`,
              top: `${block.y}%`,
              width: `${block.width}%`,
              height: `${block.height}%`,
              display: "flex",
              alignItems: "center",
              justifyContent: block.textAlign === "center" ? "center" : block.textAlign === "right" ? "flex-end" : "flex-start",
              padding: block.bgEnabled ? block.bgPadding : 0,
              backgroundColor: block.bgEnabled ? block.bgColor : "transparent",
            }}
            onMouseDown={(e) => handleTextMouseDown(e, block.id)}
            onTouchStart={(e) => handleTextTouchStart(e, block.id)}
          >
            <span
              className="pointer-events-none"
              style={{
                color: block.color,
                fontSize: `${block.fontSize}px`,
                fontFamily: block.fontFamily,
                fontWeight: block.fontWeight,
                textAlign: block.textAlign,
                letterSpacing: `${block.letterSpacing}px`,
                lineHeight: block.lineHeight,
                textShadow: block.shadowEnabled 
                  ? `${block.shadowOffsetX}px ${block.shadowOffsetY}px ${block.shadowBlur}px ${block.shadowColor}`
                  : block.glowEnabled
                  ? `0 0 ${block.glowIntensity}px ${block.glowColor}`
                  : "none",
                WebkitTextStroke: block.borderEnabled ? `${block.borderWidth}px ${block.borderColor}` : "none",
              }}
            >
              {block.text}
            </span>
            {selectedElement === block.id && (
              <ResizeHandles onResizeStart={(e, h) => handleTextResizeStart(e, block.id, h)} />
            )}
          </div>
        ))}
      </div>
      
      {/* Seletor de elementos */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedElement === "image" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedElement("image")}
          className={selectedElement === "image" ? "bg-purple-600" : ""}
        >
          <ImageIcon className="w-4 h-4 mr-1" />
          Imagem
        </Button>
        {textBlocks.map((block, i) => (
          <Button
            key={block.id}
            variant={selectedElement === block.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedElement(block.id)}
            className={selectedElement === block.id ? "bg-purple-600" : ""}
          >
            <Type className="w-4 h-4 mr-1" />
            Texto {i + 1}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={addTextBlock}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Controles baseados no elemento selecionado */}
      {selectedElement === "image" ? (
        /* Controles da Imagem */
        <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Configurações da Imagem
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-400">Posição X</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[imageObject.x]}
                  onValueChange={([v]) => updateImageObject({ x: v })}
                  min={0}
                  max={100 - imageObject.width}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">{Math.round(imageObject.x)}%</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Posição Y</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[imageObject.y]}
                  onValueChange={([v]) => updateImageObject({ y: v })}
                  min={0}
                  max={100 - imageObject.height}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">{Math.round(imageObject.y)}%</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Largura</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[imageObject.width]}
                  onValueChange={([v]) => updateImageObject({ width: v, height: v * 1.25 })}
                  min={20}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">{Math.round(imageObject.width)}%</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Altura</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[imageObject.height]}
                  onValueChange={([v]) => updateImageObject({ height: v })}
                  min={20}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">{Math.round(imageObject.height)}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-gray-400">Cor de Fundo</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 h-8 text-xs"
              />
            </div>
          </div>
        </div>
      ) : selectedText && (
        /* Controles do Texto */
        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="cores">Cores</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basico" className="space-y-4 mt-4">
            {/* Texto */}
            <div>
              <Label className="text-xs text-gray-400">Texto</Label>
              <textarea
                value={selectedText.text}
                onChange={(e) => updateTextBlock(selectedText.id, { text: e.target.value })}
                className="w-full h-20 p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm resize-none"
              />
            </div>
            
            {/* Tamanho da fonte */}
            <div>
              <Label className="text-xs text-gray-400">Tamanho: {selectedText.fontSize}px</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTextBlock(selectedText.id, { fontSize: Math.max(12, selectedText.fontSize - 2) })}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Slider
                  value={[selectedText.fontSize]}
                  onValueChange={([v]) => updateTextBlock(selectedText.id, { fontSize: v })}
                  min={12}
                  max={72}
                  step={1}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTextBlock(selectedText.id, { fontSize: Math.min(72, selectedText.fontSize + 2) })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Alinhamento */}
            <div>
              <Label className="text-xs text-gray-400">Alinhamento</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "left", icon: AlignLeft },
                  { value: "center", icon: AlignCenter },
                  { value: "right", icon: AlignRight },
                ].map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={selectedText.textAlign === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateTextBlock(selectedText.id, { textAlign: value as "left" | "center" | "right" })}
                    className={selectedText.textAlign === value ? "bg-purple-600" : ""}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Fonte */}
            <div>
              <Label className="text-xs text-gray-400">Fonte</Label>
              <select
                value={selectedText.fontFamily}
                onChange={(e) => updateTextBlock(selectedText.id, { fontFamily: e.target.value })}
                className="w-full h-9 px-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            
            {/* Peso */}
            <div>
              <Label className="text-xs text-gray-400">Peso</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={selectedText.fontWeight === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTextBlock(selectedText.id, { fontWeight: "normal" })}
                  className={selectedText.fontWeight === "normal" ? "bg-purple-600" : ""}
                >
                  Normal
                </Button>
                <Button
                  variant={selectedText.fontWeight === "bold" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTextBlock(selectedText.id, { fontWeight: "bold" })}
                  className={selectedText.fontWeight === "bold" ? "bg-purple-600" : ""}
                >
                  Bold
                </Button>
              </div>
            </div>
            
            {/* Deletar texto */}
            {textBlocks.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeTextBlock(selectedText.id)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Texto
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="cores" className="space-y-4 mt-4">
            {/* Cor do texto */}
            <div>
              <Label className="text-xs text-gray-400">Cor do Texto</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) => updateTextBlock(selectedText.id, { color: e.target.value })}
                  className="w-12 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={selectedText.color}
                  onChange={(e) => updateTextBlock(selectedText.id, { color: e.target.value })}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>
            
            {/* Presets */}
            <div>
              <Label className="text-xs text-gray-400">Presets</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {COLOR_PRESETS.map(preset => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateTextBlock(selectedText.id, { color: preset.text });
                      setBackgroundColor(preset.bg);
                    }}
                    className="text-xs"
                    style={{ color: preset.text, borderColor: preset.text }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Fundo do texto */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">Fundo do Texto</Label>
              <Switch
                checked={selectedText.bgEnabled}
                onCheckedChange={(v) => updateTextBlock(selectedText.id, { bgEnabled: v })}
              />
            </div>
            {selectedText.bgEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-purple-500">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedText.bgColor}
                    onChange={(e) => updateTextBlock(selectedText.id, { bgColor: e.target.value })}
                    className="w-12 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={selectedText.bgColor}
                    onChange={(e) => updateTextBlock(selectedText.id, { bgColor: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400">Padding: {selectedText.bgPadding}px</Label>
                  <Slider
                    value={[selectedText.bgPadding]}
                    onValueChange={([v]) => updateTextBlock(selectedText.id, { bgPadding: v })}
                    min={0}
                    max={32}
                    step={1}
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="avancado" className="space-y-4 mt-4">
            {/* Sombra */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">Sombra</Label>
              <Switch
                checked={selectedText.shadowEnabled}
                onCheckedChange={(v) => updateTextBlock(selectedText.id, { shadowEnabled: v, glowEnabled: v ? false : selectedText.glowEnabled })}
              />
            </div>
            {selectedText.shadowEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-purple-500">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedText.shadowColor}
                    onChange={(e) => updateTextBlock(selectedText.id, { shadowColor: e.target.value })}
                    className="w-12 h-8 p-0 border-0"
                  />
                  <span className="text-xs text-gray-400">Cor da sombra</span>
                </div>
                <div>
                  <Label className="text-xs text-gray-400">Blur: {selectedText.shadowBlur}px</Label>
                  <Slider
                    value={[selectedText.shadowBlur]}
                    onValueChange={([v]) => updateTextBlock(selectedText.id, { shadowBlur: v })}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-400">Offset X: {selectedText.shadowOffsetX}</Label>
                    <Slider
                      value={[selectedText.shadowOffsetX]}
                      onValueChange={([v]) => updateTextBlock(selectedText.id, { shadowOffsetX: v })}
                      min={-10}
                      max={10}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Offset Y: {selectedText.shadowOffsetY}</Label>
                    <Slider
                      value={[selectedText.shadowOffsetY]}
                      onValueChange={([v]) => updateTextBlock(selectedText.id, { shadowOffsetY: v })}
                      min={-10}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Contorno */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">Contorno</Label>
              <Switch
                checked={selectedText.borderEnabled}
                onCheckedChange={(v) => updateTextBlock(selectedText.id, { borderEnabled: v })}
              />
            </div>
            {selectedText.borderEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-purple-500">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedText.borderColor}
                    onChange={(e) => updateTextBlock(selectedText.id, { borderColor: e.target.value })}
                    className="w-12 h-8 p-0 border-0"
                  />
                  <span className="text-xs text-gray-400">Cor do contorno</span>
                </div>
                <div>
                  <Label className="text-xs text-gray-400">Espessura: {selectedText.borderWidth}px</Label>
                  <Slider
                    value={[selectedText.borderWidth]}
                    onValueChange={([v]) => updateTextBlock(selectedText.id, { borderWidth: v })}
                    min={1}
                    max={5}
                    step={0.5}
                  />
                </div>
              </div>
            )}
            
            {/* Glow */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">Glow</Label>
              <Switch
                checked={selectedText.glowEnabled}
                onCheckedChange={(v) => updateTextBlock(selectedText.id, { glowEnabled: v, shadowEnabled: v ? false : selectedText.shadowEnabled })}
              />
            </div>
            {selectedText.glowEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-purple-500">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedText.glowColor}
                    onChange={(e) => updateTextBlock(selectedText.id, { glowColor: e.target.value })}
                    className="w-12 h-8 p-0 border-0"
                  />
                  <span className="text-xs text-gray-400">Cor do glow</span>
                </div>
                <div>
                  <Label className="text-xs text-gray-400">Intensidade: {selectedText.glowIntensity}px</Label>
                  <Slider
                    value={[selectedText.glowIntensity]}
                    onValueChange={([v]) => updateTextBlock(selectedText.id, { glowIntensity: v })}
                    min={5}
                    max={30}
                    step={1}
                  />
                </div>
              </div>
            )}
            
            {/* Espaçamento */}
            <div>
              <Label className="text-xs text-gray-400">Espaçamento entre letras: {selectedText.letterSpacing}px</Label>
              <Slider
                value={[selectedText.letterSpacing]}
                onValueChange={([v]) => updateTextBlock(selectedText.id, { letterSpacing: v })}
                min={-2}
                max={10}
                step={0.5}
              />
            </div>
            
            {/* Altura da linha */}
            <div>
              <Label className="text-xs text-gray-400">Altura da linha: {selectedText.lineHeight}</Label>
              <Slider
                value={[selectedText.lineHeight]}
                onValueChange={([v]) => updateTextBlock(selectedText.id, { lineHeight: v })}
                min={0.8}
                max={2}
                step={0.1}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
