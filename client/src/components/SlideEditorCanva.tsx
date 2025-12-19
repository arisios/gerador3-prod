import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  ChevronLeft, ChevronRight, Save, Download, Type, Image as ImageIcon,
  Palette, AlignLeft, AlignCenter, AlignRight, Plus, Minus, X,
  Bold, Trash2, Droplet, Sun, Square
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
  // Sombra
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  // Borda/Contorno
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  // Glow
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
  // Espaçamento
  letterSpacing: number;
  lineHeight: number;
  // Fundo do texto
  bgEnabled: boolean;
  bgColor: string;
  bgPadding: number;
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
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  strokeEnabled: false,
  strokeColor: "#000000",
  strokeWidth: 2,
  glowEnabled: false,
  glowColor: "#FFFFFF",
  glowIntensity: 10,
  letterSpacing: 0,
  lineHeight: 1.2,
  bgEnabled: false,
  bgColor: "rgba(0,0,0,0.5)",
  bgPadding: 8,
};

const COLOR_PRESETS = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
  "#FF00FF", "#00FFFF", "#FF6B6B", "#4ECDC4", "#A855F7", "#F59E0B",
];

const FONT_OPTIONS = ["Inter", "Roboto", "Montserrat", "Playfair Display", "Oswald", "Poppins"];

const BG_PRESETS = [
  "#1a1a2e", "#0a0a0a", "#1a0a1a", "#0a1a2e", "#1a1a0a", "#2d1b4e",
  "#16213e", "#1a1a1a", "#2c003e", "#1e3a5f",
];

type ActiveTool = "none" | "text" | "image" | "color" | "download";
type TextSubPanel = "basic" | "shadow" | "stroke" | "glow" | "spacing";

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
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Estado
  const [imageObject, setImageObject] = useState<ImageObject>(
    savedConfig?.imageObject || DEFAULT_IMAGE
  );
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>(
    savedConfig?.textBlocks || [{ ...DEFAULT_TEXT_BLOCK, id: "text-1", text: initialText || "Seu texto aqui" }]
  );
  const [backgroundColor, setBackgroundColor] = useState(
    savedConfig?.backgroundColor || initialBg
  );
  
  const [activeTool, setActiveTool] = useState<ActiveTool>("none");
  const [textSubPanel, setTextSubPanel] = useState<TextSubPanel>("basic");
  const [selectedElement, setSelectedElement] = useState<string>("image");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Estado para edição direta de texto (duplo toque)
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapTarget, setLastTapTarget] = useState<string | null>(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragTarget, setDragTarget] = useState<"image" | string | null>(null);
  
  // Texto selecionado
  const selectedText = textBlocks.find(b => b.id === selectedElement);
  
  // Marcar mudanças
  useEffect(() => {
    setHasChanges(true);
  }, [imageObject, textBlocks, backgroundColor]);
  
  // Funções de texto
  const addTextBlock = () => {
    const newBlock: TextBlock = {
      ...DEFAULT_TEXT_BLOCK,
      id: `text-${Date.now()}`,
      y: 70 + textBlocks.length * 10,
    };
    setTextBlocks([...textBlocks, newBlock]);
    setSelectedElement(newBlock.id);
    setActiveTool("text");
  };
  
  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(blocks => blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  
  const removeTextBlock = (id: string) => {
    if (textBlocks.length > 1) {
      setTextBlocks(blocks => blocks.filter(b => b.id !== id));
      setSelectedElement(textBlocks[0].id === id ? textBlocks[1].id : textBlocks[0].id);
    }
  };
  
  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, target: "image" | string) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setDragTarget(target);
    setSelectedElement(target);
  };
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragTarget || !canvasRef.current) return;
    
    // Prevenir scroll da página durante o arrasto
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const rect = canvasRef.current.getBoundingClientRect();
    
    const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((clientY - dragStart.y) / rect.height) * 100;
    
    if (dragTarget === "image") {
      setImageObject(img => ({
        ...img,
        x: Math.max(-50, Math.min(50, img.x + deltaX)),
        y: Math.max(-50, Math.min(100, img.y + deltaY)),
      }));
    } else {
      updateTextBlock(dragTarget, {
        x: Math.max(0, Math.min(90, (textBlocks.find(b => b.id === dragTarget)?.x || 0) + deltaX)),
        y: Math.max(0, Math.min(90, (textBlocks.find(b => b.id === dragTarget)?.y || 0) + deltaY)),
      });
    }
    
    setDragStart({ x: clientX, y: clientY });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragTarget(null);
  };
  
  // Download interno
  const handleInternalDownload = async (withText: boolean) => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas não suportado");
      
      // Fundo
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 1080, 1350);
      
      // Imagem
      if (imageUrl) {
        await new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const x = (imageObject.x / 100) * 1080;
            const y = (imageObject.y / 100) * 1350;
            const w = (imageObject.width / 100) * 1080;
            const h = (imageObject.height / 100) * 1350;
            ctx.drawImage(img, x, y, w, h);
            resolve();
          };
          img.onerror = () => reject(new Error("Erro ao carregar imagem"));
          img.src = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
        });
      }
      
      // Textos
      if (withText) {
        for (const block of textBlocks) {
          const x = (block.x / 100) * 1080;
          const y = (block.y / 100) * 1350;
          const w = (block.width / 100) * 1080;
          const fontSize = block.fontSize * 3;
          
          ctx.font = `${block.fontWeight} ${fontSize}px ${block.fontFamily}`;
          ctx.textAlign = block.textAlign;
          ctx.textBaseline = "top";
          
          // Quebra de linha
          const words = block.text.split(" ");
          const lines: string[] = [];
          let currentLine = "";
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > w && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          const lineHeight = fontSize * block.lineHeight;
          const textX = block.textAlign === "center" ? x + w / 2 : block.textAlign === "right" ? x + w : x;
          
          // Fundo do texto
          if (block.bgEnabled) {
            const totalHeight = lines.length * lineHeight;
            ctx.fillStyle = block.bgColor;
            ctx.fillRect(x - block.bgPadding, y - block.bgPadding, w + block.bgPadding * 2, totalHeight + block.bgPadding * 2);
          }
          
          lines.forEach((line, i) => {
            const lineY = y + i * lineHeight;
            
            // Glow
            if (block.glowEnabled) {
              ctx.shadowColor = block.glowColor;
              ctx.shadowBlur = block.glowIntensity * 3;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              ctx.fillStyle = block.glowColor;
              ctx.fillText(line, textX, lineY);
            }
            
            // Sombra
            if (block.shadowEnabled) {
              ctx.shadowColor = block.shadowColor;
              ctx.shadowBlur = block.shadowBlur * 3;
              ctx.shadowOffsetX = block.shadowOffsetX * 3;
              ctx.shadowOffsetY = block.shadowOffsetY * 3;
            } else {
              ctx.shadowColor = "transparent";
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            }
            
            // Contorno
            if (block.strokeEnabled) {
              ctx.strokeStyle = block.strokeColor;
              ctx.lineWidth = block.strokeWidth * 3;
              ctx.strokeText(line, textX, lineY);
            }
            
            // Texto principal
            ctx.fillStyle = block.color;
            ctx.letterSpacing = `${block.letterSpacing}px`;
            ctx.fillText(line, textX, lineY);
          });
          
          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
      }
      
      // Download
      const link = document.createElement("a");
      link.download = `slide_${slideIndex}_${withText ? "com_texto" : "sem_texto"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Download realizado!");
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao baixar imagem");
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
  
  // Gerar estilo de texto para preview
  const getTextStyle = (block: TextBlock): React.CSSProperties => {
    let textShadow = "";
    
    if (block.glowEnabled) {
      textShadow += `0 0 ${block.glowIntensity}px ${block.glowColor}, `;
    }
    if (block.shadowEnabled) {
      textShadow += `${block.shadowOffsetX}px ${block.shadowOffsetY}px ${block.shadowBlur}px ${block.shadowColor}`;
    }
    
    return {
      fontSize: `${block.fontSize}px`,
      color: block.color,
      fontFamily: block.fontFamily,
      fontWeight: block.fontWeight,
      textAlign: block.textAlign,
      textShadow: textShadow || "none",
      letterSpacing: `${block.letterSpacing}px`,
      lineHeight: block.lineHeight,
      WebkitTextStroke: block.strokeEnabled ? `${block.strokeWidth}px ${block.strokeColor}` : "none",
      backgroundColor: block.bgEnabled ? block.bgColor : "transparent",
      padding: block.bgEnabled ? `${block.bgPadding}px` : "0",
    };
  };
  
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
      
      {/* Barra de ferramentas ACIMA da imagem */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2">
        <div className="flex justify-center gap-4">
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${activeTool === "text" ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:text-white"}`}
            onClick={() => { setActiveTool(activeTool === "text" ? "none" : "text"); setTextSubPanel("basic"); }}
          >
            <Type className="w-5 h-5" />
            <span className="text-sm">Texto</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${activeTool === "image" ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:text-white"}`}
            onClick={() => setActiveTool(activeTool === "image" ? "none" : "image")}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">Imagem</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${activeTool === "color" ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:text-white"}`}
            onClick={() => setActiveTool(activeTool === "color" ? "none" : "color")}
          >
            <Palette className="w-5 h-5" />
            <span className="text-sm">Fundo</span>
          </button>
        </div>
      </div>
      
      {/* Canvas - área principal */}
      <div 
        className="flex-1 flex items-center justify-center p-2 overflow-hidden"
        style={{ touchAction: "none" }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          ref={canvasRef}
          className="relative shadow-2xl"
          style={{
            aspectRatio: "1080 / 1350",
            maxHeight: activeTool !== "none" ? "calc(100vh - 340px)" : "calc(100vh - 160px)",
            maxWidth: "calc(100vw - 16px)",
            width: "100%",
            backgroundColor,
          }}
          onClick={() => setSelectedElement("image")}
        >
          {/* Imagem - SEM handles de redimensionar */}
          {imageUrl && (
            <div
              className={`absolute cursor-move ${selectedElement === "image" ? "ring-2 ring-purple-500" : ""}`}
              style={{
                left: `${imageObject.x}%`,
                top: `${imageObject.y}%`,
                width: `${imageObject.width}%`,
                height: `${imageObject.height}%`,
              }}
              onMouseDown={(e) => handleDragStart(e, "image")}
              onTouchStart={(e) => handleDragStart(e, "image")}
            >
              <img
                src={`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`}
                alt="Slide"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
          )}
          
          {/* Textos - SEM handles de redimensionar */}
          {textBlocks.map(block => (
            <div
              key={block.id}
              className={`absolute ${editingTextId === block.id ? "" : "cursor-move"} ${selectedElement === block.id ? "ring-2 ring-purple-500" : ""}`}
              style={{
                left: `${block.x}%`,
                top: `${block.y}%`,
                width: `${block.width}%`,
                minHeight: `${block.height}%`,
              }}
              onMouseDown={(e) => {
                if (editingTextId !== block.id) {
                  handleDragStart(e, block.id);
                }
              }}
              onTouchStart={(e) => {
                if (editingTextId !== block.id) {
                  handleDragStart(e, block.id);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                const now = Date.now();
                const isDoubleTap = lastTapTarget === block.id && (now - lastTapTime) < 300;
                
                if (isDoubleTap && editingTextId !== block.id) {
                  // Duplo toque - entrar no modo de edição
                  setEditingTextId(block.id);
                  setActiveTool("text");
                } else {
                  // Toque simples - selecionar
                  setSelectedElement(block.id);
                  setActiveTool("text");
                }
                
                setLastTapTime(now);
                setLastTapTarget(block.id);
              }}
            >
              {editingTextId === block.id ? (
                <textarea
                  autoFocus
                  value={block.text}
                  onChange={(e) => updateTextBlock(block.id, { text: e.target.value })}
                  onBlur={() => setEditingTextId(null)}
                  className="w-full h-full bg-transparent border-none outline-none resize-none"
                  style={{
                    ...getTextStyle(block),
                    minHeight: "50px",
                  }}
                />
              ) : (
                <span
                  className="block w-full break-words pointer-events-none"
                  style={getTextStyle(block)}
                >
                  {block.text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Painel de controles EMBAIXO - sempre visível quando ferramenta ativa */}
      {activeTool !== "none" && (
        <div className="bg-zinc-900 border-t border-zinc-800 p-3 max-h-[200px] overflow-y-auto">
          
          {/* TEXTO */}
          {activeTool === "text" && selectedText && (
            <div className="space-y-3">
              {/* Sub-abas */}
              <div className="flex gap-1 overflow-x-auto pb-2">
                {[
                  { id: "basic" as const, label: "Básico" },
                  { id: "shadow" as const, label: "Sombra" },
                  { id: "stroke" as const, label: "Borda" },
                  { id: "glow" as const, label: "Glow" },
                  { id: "spacing" as const, label: "Espaço" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`px-3 py-1 rounded text-sm whitespace-nowrap ${textSubPanel === tab.id ? "bg-purple-500 text-white" : "bg-zinc-800 text-zinc-400"}`}
                    onClick={() => setTextSubPanel(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Sub-painel: Básico */}
              {textSubPanel === "basic" && (
                <div className="space-y-3">
                  <Input
                    value={selectedText.text}
                    onChange={(e) => updateTextBlock(selectedText.id, { text: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white h-9"
                    placeholder="Digite o texto..."
                  />
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedText.fontFamily}
                      onChange={(e) => updateTextBlock(selectedText.id, { fontFamily: e.target.value })}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-white text-sm"
                    >
                      {FONT_OPTIONS.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    
                    <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-md px-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateTextBlock(selectedText.id, { fontSize: Math.max(12, selectedText.fontSize - 2) })}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-white text-sm w-6 text-center">{selectedText.fontSize}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateTextBlock(selectedText.id, { fontSize: Math.min(72, selectedText.fontSize + 2) })}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-center">
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
                          className={`h-8 w-8 ${selectedText.textAlign === align ? "bg-purple-500/20 text-purple-400" : ""}`}
                          onClick={() => updateTextBlock(selectedText.id, { textAlign: align })}
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 bg-zinc-800 border border-zinc-700 ${selectedText.fontWeight === "bold" ? "bg-purple-500/20 text-purple-400" : ""}`}
                      onClick={() => updateTextBlock(selectedText.id, { fontWeight: selectedText.fontWeight === "bold" ? "normal" : "bold" })}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-800 border border-zinc-700" onClick={addTextBlock}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    
                    {textBlocks.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-800 border border-zinc-700 text-red-400" onClick={() => removeTextBlock(selectedText.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map(color => (
                      <button
                        key={color}
                        className={`w-7 h-7 rounded-full border-2 ${selectedText.color === color ? "border-purple-500" : "border-zinc-600"}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTextBlock(selectedText.id, { color })}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sub-painel: Sombra */}
              {textSubPanel === "shadow" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedText.shadowEnabled}
                      onChange={(e) => updateTextBlock(selectedText.id, { shadowEnabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white text-sm">Ativar sombra</span>
                  </label>
                  
                  {selectedText.shadowEnabled && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm w-16">Cor</span>
                        <div className="flex gap-1.5 flex-wrap flex-1">
                          {["#000000", "#333333", "#666666", "#FFFFFF", "#FF0000", "#0000FF"].map(color => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded border ${selectedText.shadowColor === color ? "border-purple-500" : "border-zinc-600"}`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTextBlock(selectedText.id, { shadowColor: color })}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm w-16">Blur</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { shadowBlur: Math.max(0, selectedText.shadowBlur - 1) })}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white text-sm w-6 text-center">{selectedText.shadowBlur}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { shadowBlur: Math.min(20, selectedText.shadowBlur + 1) })}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm w-16">Offset X</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { shadowOffsetX: selectedText.shadowOffsetX - 1 })}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white text-sm w-6 text-center">{selectedText.shadowOffsetX}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { shadowOffsetX: selectedText.shadowOffsetX + 1 })}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm w-16">Offset Y</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { shadowOffsetY: selectedText.shadowOffsetY - 1 })}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white text-sm w-6 text-center">{selectedText.shadowOffsetY}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { shadowOffsetY: selectedText.shadowOffsetY + 1 })}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Sub-painel: Borda/Contorno */}
              {textSubPanel === "stroke" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedText.strokeEnabled}
                      onChange={(e) => updateTextBlock(selectedText.id, { strokeEnabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white text-sm">Ativar contorno</span>
                  </label>
                  
                  {selectedText.strokeEnabled && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm w-16">Cor</span>
                        <div className="flex gap-1.5 flex-wrap flex-1">
                          {["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"].map(color => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded border ${selectedText.strokeColor === color ? "border-purple-500" : "border-zinc-600"}`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTextBlock(selectedText.id, { strokeColor: color })}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm w-16">Espessura</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { strokeWidth: Math.max(1, selectedText.strokeWidth - 1) })}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white text-sm w-6 text-center">{selectedText.strokeWidth}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { strokeWidth: Math.min(10, selectedText.strokeWidth + 1) })}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Sub-painel: Glow */}
              {textSubPanel === "glow" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedText.glowEnabled}
                      onChange={(e) => updateTextBlock(selectedText.id, { glowEnabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white text-sm">Ativar glow</span>
                  </label>
                  
                  {selectedText.glowEnabled && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm w-16">Cor</span>
                        <div className="flex gap-1.5 flex-wrap flex-1">
                          {["#FFFFFF", "#FF00FF", "#00FFFF", "#FFFF00", "#FF0000", "#00FF00"].map(color => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded border ${selectedText.glowColor === color ? "border-purple-500" : "border-zinc-600"}`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTextBlock(selectedText.id, { glowColor: color })}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm w-16">Intensidade</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { glowIntensity: Math.max(5, selectedText.glowIntensity - 5) })}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white text-sm w-6 text-center">{selectedText.glowIntensity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { glowIntensity: Math.min(50, selectedText.glowIntensity + 5) })}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Sub-painel: Espaçamento */}
              {textSubPanel === "spacing" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm w-20">Entre letras</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { letterSpacing: Math.max(-5, selectedText.letterSpacing - 1) })}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-white text-sm w-6 text-center">{selectedText.letterSpacing}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { letterSpacing: Math.min(20, selectedText.letterSpacing + 1) })}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm w-20">Entre linhas</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { lineHeight: Math.max(0.8, selectedText.lineHeight - 0.1) })}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-white text-sm w-8 text-center">{selectedText.lineHeight.toFixed(1)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { lineHeight: Math.min(3, selectedText.lineHeight + 0.1) })}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm w-20">Largura</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { width: Math.max(20, selectedText.width - 5) })}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-white text-sm w-8 text-center">{selectedText.width}%</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => updateTextBlock(selectedText.id, { width: Math.min(100, selectedText.width + 5) })}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* IMAGEM */}
          {activeTool === "image" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm w-16">Tamanho</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-800" onClick={() => setImageObject(img => ({ ...img, width: Math.max(20, img.width - 5), height: Math.max(20, img.height - 5) }))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 bg-zinc-800 rounded-full h-2">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${imageObject.width}%` }} />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-800" onClick={() => setImageObject(img => ({ ...img, width: Math.min(150, img.width + 5), height: Math.min(150, img.height + 5) }))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm w-16">Largura</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-800" onClick={() => setImageObject(img => ({ ...img, width: Math.max(20, img.width - 5) }))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm w-12 text-center">{imageObject.width}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-800" onClick={() => setImageObject(img => ({ ...img, width: Math.min(150, img.width + 5) }))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm w-16">Altura</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-800" onClick={() => setImageObject(img => ({ ...img, height: Math.max(20, img.height - 5) }))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm w-12 text-center">{imageObject.height}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-800" onClick={() => setImageObject(img => ({ ...img, height: Math.min(150, img.height + 5) }))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-zinc-500 text-xs">Arraste a imagem no canvas para reposicionar</p>
            </div>
          )}
          
          {/* COR DE FUNDO */}
          {activeTool === "color" && (
            <div className="space-y-3">
              <span className="text-zinc-400 text-sm">Cor de fundo do slide</span>
              <div className="flex gap-2 flex-wrap">
                {BG_PRESETS.map(color => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-lg border-2 ${backgroundColor === color ? "border-purple-500" : "border-zinc-600"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackgroundColor(color)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* DOWNLOAD */}
          {activeTool === "download" && (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm">Este slide:</p>
              <div className="flex gap-2">
                <Button className="flex-1" disabled={downloading} onClick={() => handleInternalDownload(true)}>
                  {downloading ? "..." : "Com Texto"}
                </Button>
                <Button variant="outline" className="flex-1" disabled={downloading} onClick={() => handleInternalDownload(false)}>
                  {downloading ? "..." : "Sem Texto"}
                </Button>
              </div>
              
              <p className="text-zinc-400 text-sm mt-2">Todos os slides:</p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => onDownload("all-with")}>
                  Todos com Texto
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => onDownload("all-without")}>
                  Todos sem Texto
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
