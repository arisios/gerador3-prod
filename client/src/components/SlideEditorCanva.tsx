import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  ChevronLeft, ChevronRight, Save, Download, Type, Image as ImageIcon,
  Palette, AlignLeft, AlignCenter, AlignRight, Plus, Minus, X, Check,
  Bold, Trash2
} from "lucide-react";

// Tipos
interface ImageObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  textAlign: "left" | "center" | "right";
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
}

interface SlideConfig {
  imageObject: ImageObject;
  textBlocks: TextBlock[];
  backgroundColor: string;
}

interface SlideEditorCanvaProps {
  imageUrl?: string;
  initialText?: string;
  backgroundColor?: string;
  slideIndex: number;
  totalSlides: number;
  slideId: number;
  savedConfig?: SlideConfig | null;
  onSave: (config: SlideConfig) => Promise<void>;
  onNavigate: (direction: "prev" | "next") => void;
  onDownload: (type: "current-with" | "current-without" | "all-with" | "all-without") => void;
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
};

const COLOR_PRESETS = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
  "#FF00FF", "#00FFFF", "#FF6B6B", "#4ECDC4", "#A855F7", "#F59E0B",
];

const FONT_OPTIONS = ["Inter", "Roboto", "Montserrat", "Playfair Display", "Oswald", "Poppins"];

const BG_PRESETS = [
  "#1a1a2e", "#0a0a0a", "#1a0a1a", "#0a1a2e", "#1a1a0a", "#2d1b4e",
];

type ActiveTool = "none" | "text" | "image" | "color" | "download";
type DragMode = "none" | "move-image" | "resize-image" | "move-text" | "resize-text";

export default function SlideEditorCanva({
  imageUrl,
  initialText = "",
  backgroundColor: initialBg = "#1a1a2e",
  slideIndex,
  totalSlides,
  slideId,
  savedConfig,
  onSave,
  onNavigate,
  onDownload,
}: SlideEditorCanvaProps) {
  // Inicializar com config salva ou valores padrão
  const [imageObject, setImageObject] = useState<ImageObject>(
    savedConfig?.imageObject || { ...DEFAULT_IMAGE }
  );
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>(
    savedConfig?.textBlocks || [{ ...DEFAULT_TEXT_BLOCK, id: "text-1", text: initialText || DEFAULT_TEXT_BLOCK.text }]
  );
  const [backgroundColor, setBackgroundColor] = useState(
    savedConfig?.backgroundColor || initialBg
  );
  
  const [selectedElement, setSelectedElement] = useState<"image" | string>("text-1");
  const [activeTool, setActiveTool] = useState<ActiveTool>("none");
  const [dragMode, setDragMode] = useState<DragMode>("none");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Marcar mudanças
  useEffect(() => {
    setHasChanges(true);
  }, [imageObject, textBlocks, backgroundColor]);
  
  // Bloquear scroll ao arrastar
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
  
  const selectedText = selectedElement !== "image" 
    ? textBlocks.find(b => b.id === selectedElement) || textBlocks[0]
    : null;
  
  // Funções de manipulação
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
    setSelectedElement(textBlocks[0].id === id ? textBlocks[1]?.id : textBlocks[0].id);
  };
  
  // Converter coordenadas
  const getEventPosition = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };
  
  // Handlers de drag
  const handleImageMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement("image");
    setDragMode("move-image");
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const pos = getEventPosition(clientX, clientY);
    setDragStart(pos);
    setElementStart({ ...imageObject });
  };
  
  const handleTextMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(id);
    setDragMode("move-text");
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const pos = getEventPosition(clientX, clientY);
    const block = textBlocks.find(b => b.id === id)!;
    setDragStart(pos);
    setElementStart({ x: block.x, y: block.y, width: block.width, height: block.height });
  };
  
  const handleGlobalMove = (clientX: number, clientY: number) => {
    if (dragMode === "none") return;
    const pos = getEventPosition(clientX, clientY);
    const deltaX = pos.x - dragStart.x;
    const deltaY = pos.y - dragStart.y;
    
    if (dragMode === "move-image") {
      setImageObject(img => ({
        ...img,
        x: Math.max(0, Math.min(100 - img.width, elementStart.x + deltaX)),
        y: Math.max(0, Math.min(100 - img.height, elementStart.y + deltaY)),
      }));
    } else if (dragMode === "move-text") {
      const id = selectedElement;
      if (id !== "image") {
        setTextBlocks(blocks => blocks.map(b => {
          if (b.id !== id) return b;
          return {
            ...b,
            x: Math.max(0, Math.min(100 - b.width, elementStart.x + deltaX)),
            y: Math.max(0, Math.min(100 - b.height, elementStart.y + deltaY)),
          };
        }));
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => handleGlobalMove(e.clientX, e.clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleGlobalMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleDragEnd = () => setDragMode("none");
  
  // Download interno
  const [downloading, setDownloading] = useState(false);
  
  const handleInternalDownload = async (withText: boolean) => {
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
      
      // 2. Desenhar imagem como OBJETO
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
          
          const imgX = (imageObject.x / 100) * canvas.width;
          const imgY = (imageObject.y / 100) * canvas.height;
          const imgWidth = (imageObject.width / 100) * canvas.width;
          const imgHeight = (imageObject.height / 100) * canvas.height;
          
          const imgRatio = img.width / img.height;
          const frameRatio = imgWidth / imgHeight;
          
          let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;
          
          if (imgRatio > frameRatio) {
            srcWidth = img.height * frameRatio;
            srcX = (img.width - srcWidth) / 2;
          } else {
            srcHeight = img.width / frameRatio;
            srcY = (img.height - srcHeight) / 2;
          }
          
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, imgX, imgY, imgWidth, imgHeight);
        } catch (imgError) {
          console.warn("Erro ao carregar imagem:", imgError);
        }
      }
      
      // 3. Desenhar textos
      if (withText) {
        for (const block of textBlocks) {
          if (!block.text.trim()) continue;
          
          const textX = (block.x / 100) * canvas.width;
          const textY = (block.y / 100) * canvas.height;
          const textWidth = (block.width / 100) * canvas.width;
          const textHeight = (block.height / 100) * canvas.height;
          
          const previewWidth = 360;
          const scale = canvas.width / previewWidth;
          const fontSize = block.fontSize * scale;
          ctx.font = `${block.fontWeight} ${fontSize}px ${block.fontFamily}, sans-serif`;
          ctx.fillStyle = block.color;
          ctx.textBaseline = "top";
          
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
          
          if (block.shadowEnabled) {
            ctx.shadowColor = block.shadowColor;
            ctx.shadowBlur = block.shadowBlur * scale;
            ctx.shadowOffsetX = 2 * scale;
            ctx.shadowOffsetY = 2 * scale;
          }
          
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
          
          const lineHeightPx = fontSize * 1.3;
          const totalTextHeight = lines.length * lineHeightPx;
          let startY = textY + (textHeight - totalTextHeight) / 2;
          
          for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], alignX, startY + i * lineHeightPx);
          }
          
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
      }
      
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
  
  // Salvar
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ imageObject, textBlocks, backgroundColor });
      setHasChanges(false);
      toast.success("Configuração salva!");
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };
  
  // Fechar painel
  const closePanel = () => setActiveTool("none");
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header fino */}
      <header className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onNavigate("prev")}
            disabled={slideIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-white">
            {slideIndex + 1} / {totalSlides}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onNavigate("next")}
            disabled={slideIndex === totalSlides - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={hasChanges ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? "..." : "Salvar"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8"
            onClick={() => setActiveTool(activeTool === "download" ? "none" : "download")}
          >
            <Download className="w-4 h-4 mr-1" />
            Baixar
          </Button>
        </div>
      </header>
      
      {/* Canvas - área principal */}
      <div 
        className="flex-1 flex items-center justify-center p-4 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          ref={canvasRef}
          className="relative bg-zinc-800 shadow-2xl"
          style={{
            aspectRatio: "1080 / 1350",
            maxHeight: "calc(100vh - 180px)",
            maxWidth: "calc(100vw - 32px)",
            width: "100%",
            backgroundColor,
          }}
          onClick={() => setSelectedElement("image")}
        >
          {/* Imagem */}
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
              onTouchStart={handleImageMouseDown}
            >
              <img
                src={`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`}
                alt="Slide"
                className="w-full h-full object-cover pointer-events-none"
              />
              {selectedElement === "image" && (
                <>
                  {["nw", "ne", "sw", "se"].map(handle => (
                    <div
                      key={handle}
                      className="absolute w-4 h-4 bg-white border-2 border-purple-500 rounded-sm"
                      style={{
                        top: handle.includes("n") ? -8 : "auto",
                        bottom: handle.includes("s") ? -8 : "auto",
                        left: handle.includes("w") ? -8 : "auto",
                        right: handle.includes("e") ? -8 : "auto",
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          )}
          
          {/* Textos */}
          {textBlocks.map(block => (
            <div
              key={block.id}
              className={`absolute cursor-move ${selectedElement === block.id ? "ring-2 ring-purple-500" : ""}`}
              style={{
                left: `${block.x}%`,
                top: `${block.y}%`,
                width: `${block.width}%`,
                minHeight: `${block.height}%`,
              }}
              onMouseDown={(e) => handleTextMouseDown(e, block.id)}
              onTouchStart={(e) => handleTextMouseDown(e, block.id)}
            >
              <span
                className="block w-full break-words pointer-events-none"
                style={{
                  fontSize: `${block.fontSize}px`,
                  color: block.color,
                  fontFamily: block.fontFamily,
                  fontWeight: block.fontWeight,
                  textAlign: block.textAlign,
                  textShadow: block.shadowEnabled 
                    ? `${block.shadowBlur}px ${block.shadowBlur}px ${block.shadowBlur * 2}px ${block.shadowColor}`
                    : "none",
                }}
              >
                {block.text}
              </span>
              {selectedElement === block.id && (
                <>
                  {["nw", "ne", "sw", "se"].map(handle => (
                    <div
                      key={handle}
                      className="absolute w-4 h-4 bg-white border-2 border-purple-500 rounded-sm"
                      style={{
                        top: handle.includes("n") ? -8 : "auto",
                        bottom: handle.includes("s") ? -8 : "auto",
                        left: handle.includes("w") ? -8 : "auto",
                        right: handle.includes("e") ? -8 : "auto",
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Barra de ferramentas fixa embaixo */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3">
        <div className="flex justify-center gap-6">
          <button
            className={`flex flex-col items-center gap-1 ${activeTool === "text" ? "text-purple-400" : "text-zinc-400"}`}
            onClick={() => setActiveTool(activeTool === "text" ? "none" : "text")}
          >
            <Type className="w-6 h-6" />
            <span className="text-xs">Texto</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 ${activeTool === "image" ? "text-purple-400" : "text-zinc-400"}`}
            onClick={() => setActiveTool(activeTool === "image" ? "none" : "image")}
          >
            <ImageIcon className="w-6 h-6" />
            <span className="text-xs">Imagem</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 ${activeTool === "color" ? "text-purple-400" : "text-zinc-400"}`}
            onClick={() => setActiveTool(activeTool === "color" ? "none" : "color")}
          >
            <Palette className="w-6 h-6" />
            <span className="text-xs">Cor</span>
          </button>
        </div>
      </div>
      
      {/* Painel deslizante - Texto */}
      {activeTool === "text" && selectedText && (
        <div className="absolute bottom-16 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Editar Texto</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Campo de texto */}
            <Input
              value={selectedText.text}
              onChange={(e) => updateTextBlock(selectedText.id, { text: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Digite o texto..."
            />
            
            {/* Fonte e tamanho */}
            <div className="flex gap-2">
              <select
                value={selectedText.fontFamily}
                onChange={(e) => updateTextBlock(selectedText.id, { fontFamily: e.target.value })}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-md px-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateTextBlock(selectedText.id, { fontSize: Math.max(12, selectedText.fontSize - 2) })}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm w-8 text-center">{selectedText.fontSize}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateTextBlock(selectedText.id, { fontSize: Math.min(72, selectedText.fontSize + 2) })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Alinhamento e negrito */}
            <div className="flex gap-2">
              <div className="flex bg-zinc-800 border border-zinc-700 rounded-md">
                {[
                  { align: "left" as const, icon: AlignLeft },
                  { align: "center" as const, icon: AlignCenter },
                  { align: "right" as const, icon: AlignRight },
                ].map(({ align, icon: Icon }) => (
                  <Button
                    key={align}
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 ${selectedText.textAlign === align ? "bg-purple-500/20 text-purple-400" : ""}`}
                    onClick={() => updateTextBlock(selectedText.id, { textAlign: align })}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 bg-zinc-800 border border-zinc-700 ${selectedText.fontWeight === "bold" ? "bg-purple-500/20 text-purple-400" : ""}`}
                onClick={() => updateTextBlock(selectedText.id, { fontWeight: selectedText.fontWeight === "bold" ? "normal" : "bold" })}
              >
                <Bold className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-zinc-800 border border-zinc-700"
                onClick={addTextBlock}
              >
                <Plus className="w-4 h-4" />
              </Button>
              
              {textBlocks.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 bg-zinc-800 border border-zinc-700 text-red-400"
                  onClick={() => removeTextBlock(selectedText.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Cores do texto */}
            <div className="flex gap-2 flex-wrap">
              {COLOR_PRESETS.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${selectedText.color === color ? "border-purple-500" : "border-zinc-600"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateTextBlock(selectedText.id, { color })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Painel deslizante - Imagem */}
      {activeTool === "image" && (
        <div className="absolute bottom-16 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Ajustar Imagem</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Tamanho */}
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 text-sm w-16">Tamanho</span>
              <div className="flex items-center gap-2 flex-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 bg-zinc-800"
                  onClick={() => setImageObject(img => ({ ...img, width: Math.max(20, img.width - 5), height: Math.max(20, img.height - 5) }))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-full rounded-full" 
                    style={{ width: `${imageObject.width}%` }}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 bg-zinc-800"
                  onClick={() => setImageObject(img => ({ ...img, width: Math.min(100, img.width + 5), height: Math.min(100, img.height + 5) }))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-zinc-500 text-xs">Arraste a imagem no canvas para reposicionar</p>
          </div>
        </div>
      )}
      
      {/* Painel deslizante - Cor de fundo */}
      {activeTool === "color" && (
        <div className="absolute bottom-16 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Cor de Fundo</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {BG_PRESETS.map(color => (
              <button
                key={color}
                className={`w-12 h-12 rounded-lg border-2 ${backgroundColor === color ? "border-purple-500" : "border-zinc-600"}`}
                style={{ backgroundColor: color }}
                onClick={() => setBackgroundColor(color)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Painel deslizante - Download */}
      {activeTool === "download" && (
        <div className="absolute bottom-16 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Baixar</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-zinc-400 text-sm mb-3">Este slide:</p>
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                disabled={downloading}
                onClick={() => { handleInternalDownload(true); closePanel(); }}
              >
                {downloading ? "..." : "Com Texto"}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                disabled={downloading}
                onClick={() => { handleInternalDownload(false); closePanel(); }}
              >
                {downloading ? "..." : "Sem Texto"}
              </Button>
            </div>
            
            <p className="text-zinc-400 text-sm mt-4 mb-3">Todos os slides:</p>
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => { onDownload("all-with"); closePanel(); }}
              >
                Todos com Texto
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => { onDownload("all-without"); closePanel(); }}
              >
                Todos sem Texto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
