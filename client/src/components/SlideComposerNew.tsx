import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plus, Minus, Trash2, Download, Move, Type, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Bold
} from "lucide-react";

// Tipos
interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
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
const DEFAULT_TEXT_BLOCK: Omit<TextBlock, "id"> = {
  text: "Seu texto aqui",
  x: 50,
  y: 75,
  fontSize: 24,
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
  { name: "Neon Rosa", text: "#FF10F0", bg: "#0a0a0a" },
  { name: "Amarelo", text: "#FFFF00", bg: "#0a0a0a" },
  { name: "Laranja", text: "#FF6B00", bg: "#0a0a0a" },
  { name: "Azul", text: "#00D4FF", bg: "#0a0a0a" },
  { name: "Roxo", text: "#A855F7", bg: "#1a1a2e" },
];

const FONT_FAMILIES = ["Inter", "Arial", "Georgia", "Times New Roman", "Verdana", "Impact"];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function SlideComposerNew({
  imageUrl,
  initialText = "",
  backgroundColor: initialBgColor = "#1a1a2e",
  onSave,
  slideIndex = 0,
}: SlideComposerNewProps) {
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([
    { ...DEFAULT_TEXT_BLOCK, id: generateId(), text: initialText || "Seu texto aqui" }
  ]);
  const [backgroundColor, setBackgroundColor] = useState(initialBgColor);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("basico");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (initialText && textBlocks.length > 0) {
      setTextBlocks(prev => [{ ...prev[0], text: initialText }, ...prev.slice(1)]);
    }
  }, [initialText]);
  
  const selectedTextBlock = textBlocks.find(b => b.id === selectedElement);
  
  // Funções de texto
  const addTextBlock = () => {
    const newBlock: TextBlock = {
      ...DEFAULT_TEXT_BLOCK,
      id: generateId(),
      text: "Novo texto",
      y: 50 + textBlocks.length * 10,
    };
    setTextBlocks([...textBlocks, newBlock]);
    setSelectedElement(newBlock.id);
  };
  
  const removeTextBlock = (id: string) => {
    if (textBlocks.length <= 1) {
      toast.error("Deve haver pelo menos um bloco de texto");
      return;
    }
    setTextBlocks(textBlocks.filter(b => b.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };
  
  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(textBlocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  
  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const block = textBlocks.find(b => b.id === elementId);
    if (block) setDragOffset({ x: x - block.x, y: y - block.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y));
    
    updateTextBlock(selectedElement, { x, y });
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  const handleTouchStart = (e: React.TouchEvent, elementId: string) => {
    const touch = e.touches[0];
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    const block = textBlocks.find(b => b.id === elementId);
    if (block) setDragOffset({ x: x - block.x, y: y - block.y });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100 - dragOffset.x));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100 - dragOffset.y));
    
    updateTextBlock(selectedElement, { x, y });
  };
  
  // Download - USANDO A MESMA LÓGICA DO ARQUIVO QUE FUNCIONA
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
      
      // 2. Carregar e desenhar imagem (COBRINDO 100% DO CANVAS)
      if (imageUrl) {
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
        
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Falha ao carregar imagem"));
            img.src = proxyUrl;
          });
          
          // Desenhar imagem cobrindo TODO o canvas (cover)
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
        } catch (imgError) {
          console.warn("Erro ao carregar imagem:", imgError);
          toast.error("Erro ao carregar imagem, usando fundo sólido");
        }
      }
      
      // 3. Desenhar textos (se withText)
      if (withText) {
        const scale = canvas.width / 360;
        
        for (const block of textBlocks) {
          if (!block.text.trim()) continue;
          
          const fontSize = block.fontSize * scale;
          ctx.font = `${block.fontWeight} ${fontSize}px ${block.fontFamily}, sans-serif`;
          ctx.fillStyle = block.color;
          ctx.textAlign = block.textAlign;
          ctx.textBaseline = "middle";
          
          // Posição do texto
          let textX: number;
          if (block.textAlign === "center") textX = canvas.width / 2;
          else if (block.textAlign === "right") textX = canvas.width - 40;
          else textX = 40;
          
          const textY = (block.y / 100) * canvas.height;
          
          // Quebrar texto em linhas
          const maxWidth = canvas.width * 0.9;
          const words = block.text.split(" ");
          const lines: string[] = [];
          let currentLine = words[0] || "";
          
          for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + " " + words[i];
            if (ctx.measureText(testLine).width > maxWidth) {
              lines.push(currentLine);
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          const lineHeight = fontSize * block.lineHeight;
          const totalHeight = lines.length * lineHeight;
          const startY = textY - totalHeight / 2 + lineHeight / 2;
          
          // Fundo do texto
          if (block.bgEnabled) {
            ctx.save();
            ctx.fillStyle = block.bgColor;
            const padding = block.bgPadding * scale;
            
            lines.forEach((line, index) => {
              const metrics = ctx.measureText(line);
              const lineY = startY + index * lineHeight;
              let bgX = textX - metrics.width / 2 - padding;
              if (block.textAlign === "left") bgX = textX - padding;
              if (block.textAlign === "right") bgX = textX - metrics.width - padding;
              
              ctx.fillRect(bgX, lineY - fontSize / 2 - padding / 2, metrics.width + padding * 2, fontSize + padding);
            });
            ctx.restore();
          }
          
          // Sombra
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
          
          // Borda/contorno
          if (block.borderEnabled) {
            ctx.strokeStyle = block.borderColor;
            ctx.lineWidth = block.borderWidth * scale;
            ctx.lineJoin = "round";
            lines.forEach((line, index) => {
              ctx.strokeText(line, textX, startY + index * lineHeight);
            });
          }
          
          // Desenhar texto
          ctx.fillStyle = block.color;
          lines.forEach((line, index) => {
            ctx.fillText(line, textX, startY + index * lineHeight);
          });
          
          // Resetar sombra
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      }
      
      // 4. Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `slide_${slideIndex + 1}${withText ? "_com_texto" : "_sem_texto"}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Download iniciado!");
        }
      }, "image/png", 1.0);
      
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao gerar imagem");
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Header com botões de download */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Move className="w-4 h-4" />
          Editor Visual - Slide {slideIndex + 1}
        </h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleDownload(true)} disabled={downloading}>
            <Download className="w-4 h-4 mr-1" />
            Com Texto
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDownload(false)} disabled={downloading}>
            <Download className="w-4 h-4 mr-1" />
            Sem Texto
          </Button>
        </div>
      </div>
      
      {/* Preview */}
      <div
        ref={canvasRef}
        className="relative w-full max-w-md mx-auto aspect-[4/5] rounded-lg overflow-hidden cursor-crosshair select-none"
        style={{ backgroundColor }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Imagem de fundo (100%) */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Slide"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        )}
        
        {/* Textos arrastáveis */}
        {textBlocks.map((block) => (
          <div
            key={block.id}
            className={`absolute cursor-move px-2 py-1 ${selectedElement === block.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
            style={{
              left: block.textAlign === "center" ? "50%" : block.textAlign === "right" ? "auto" : `${block.x}%`,
              right: block.textAlign === "right" ? "5%" : "auto",
              top: `${block.y}%`,
              transform: block.textAlign === "center" ? "translateX(-50%)" : "none",
              fontSize: `${block.fontSize}px`,
              fontFamily: block.fontFamily,
              fontWeight: block.fontWeight,
              color: block.color,
              textAlign: block.textAlign,
              textShadow: block.shadowEnabled 
                ? `${block.shadowOffsetX}px ${block.shadowOffsetY}px ${block.shadowBlur}px ${block.shadowColor}`
                : block.glowEnabled ? `0 0 ${block.glowIntensity}px ${block.glowColor}` : "none",
              WebkitTextStroke: block.borderEnabled ? `${block.borderWidth}px ${block.borderColor}` : "none",
              letterSpacing: `${block.letterSpacing}px`,
              lineHeight: block.lineHeight,
              backgroundColor: block.bgEnabled ? block.bgColor : "transparent",
              padding: block.bgEnabled ? `${block.bgPadding}px` : "0",
              maxWidth: "90%",
            }}
            onMouseDown={(e) => handleMouseDown(e, block.id)}
            onTouchStart={(e) => handleTouchStart(e, block.id)}
          >
            {block.text}
          </div>
        ))}
      </div>
      
      {/* Seletor de elemento */}
      <div className="flex gap-2 flex-wrap justify-center">
        {textBlocks.map((block, i) => (
          <Button
            key={block.id}
            variant={selectedElement === block.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedElement(block.id)}
          >
            <Type className="w-4 h-4 mr-1" />
            Texto {i + 1}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={addTextBlock}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Controles de Texto */}
      {selectedTextBlock && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="cores">Cores</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>
          
          {/* Aba Básico */}
          <TabsContent value="basico" className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Texto {textBlocks.findIndex(b => b.id === selectedTextBlock.id) + 1}</h4>
              {textBlocks.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeTextBlock(selectedTextBlock.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
            
            <div>
              <Label>Texto</Label>
              <textarea
                value={selectedTextBlock.text}
                onChange={(e) => updateTextBlock(selectedTextBlock.id, { text: e.target.value })}
                className="w-full mt-1 p-2 rounded-md border bg-background text-sm min-h-[80px]"
              />
            </div>
            
            <div>
              <Label className="text-xs">Tamanho: {selectedTextBlock.fontSize}px</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => updateTextBlock(selectedTextBlock.id, { fontSize: Math.max(12, selectedTextBlock.fontSize - 2) })}>
                  <Minus className="w-3 h-3" />
                </Button>
                <Slider value={[selectedTextBlock.fontSize]} onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { fontSize: v })}
                  min={12} max={72} step={1} className="flex-1" />
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => updateTextBlock(selectedTextBlock.id, { fontSize: Math.min(72, selectedTextBlock.fontSize + 2) })}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Posição Y: {selectedTextBlock.y.toFixed(0)}%</Label>
              <Slider value={[selectedTextBlock.y]} onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { y: v })}
                min={5} max={95} step={1} />
            </div>
            
            <div>
              <Label>Alinhamento</Label>
              <div className="flex gap-1 mt-1">
                <Button variant={selectedTextBlock.textAlign === "left" ? "default" : "outline"} size="sm"
                  onClick={() => updateTextBlock(selectedTextBlock.id, { textAlign: "left" })}>
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant={selectedTextBlock.textAlign === "center" ? "default" : "outline"} size="sm"
                  onClick={() => updateTextBlock(selectedTextBlock.id, { textAlign: "center" })}>
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant={selectedTextBlock.textAlign === "right" ? "default" : "outline"} size="sm"
                  onClick={() => updateTextBlock(selectedTextBlock.id, { textAlign: "right" })}>
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fonte</Label>
                <select value={selectedTextBlock.fontFamily}
                  onChange={(e) => updateTextBlock(selectedTextBlock.id, { fontFamily: e.target.value })}
                  className="w-full mt-1 p-2 rounded-md border bg-background text-sm">
                  {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <Label>Peso</Label>
                <div className="flex gap-1 mt-1">
                  <Button variant={selectedTextBlock.fontWeight === "normal" ? "default" : "outline"} size="sm" className="flex-1"
                    onClick={() => updateTextBlock(selectedTextBlock.id, { fontWeight: "normal" })}>Normal</Button>
                  <Button variant={selectedTextBlock.fontWeight === "bold" ? "default" : "outline"} size="sm" className="flex-1"
                    onClick={() => updateTextBlock(selectedTextBlock.id, { fontWeight: "bold" })}><Bold className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Aba Cores */}
          <TabsContent value="cores" className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Cor do Texto</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={selectedTextBlock.color}
                  onChange={(e) => updateTextBlock(selectedTextBlock.id, { color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer" />
                <Input value={selectedTextBlock.color}
                  onChange={(e) => updateTextBlock(selectedTextBlock.id, { color: e.target.value })}
                  className="flex-1" />
              </div>
            </div>
            
            <div>
              <Label>Cor de Fundo do Slide</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer" />
                <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            
            <div>
              <Label>Presets</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLOR_PRESETS.map((preset) => (
                  <button key={preset.name}
                    onClick={() => {
                      updateTextBlock(selectedTextBlock.id, { color: preset.text });
                      setBackgroundColor(preset.bg);
                    }}
                    className="w-8 h-8 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: preset.text }}
                    title={preset.name} />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Fundo do Texto</Label>
                <Switch checked={selectedTextBlock.bgEnabled}
                  onCheckedChange={(v) => updateTextBlock(selectedTextBlock.id, { bgEnabled: v })} />
              </div>
              {selectedTextBlock.bgEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedTextBlock.bgColor}
                      onChange={(e) => updateTextBlock(selectedTextBlock.id, { bgColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer" />
                    <Label className="text-xs">Cor</Label>
                  </div>
                  <div>
                    <Label className="text-xs">Padding: {selectedTextBlock.bgPadding}px</Label>
                    <Slider value={[selectedTextBlock.bgPadding]}
                      onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { bgPadding: v })}
                      min={0} max={32} step={1} />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Aba Avançado */}
          <TabsContent value="avancado" className="space-y-4 p-4 bg-muted/50 rounded-lg">
            {/* Sombra */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sombra</Label>
                <Switch checked={selectedTextBlock.shadowEnabled}
                  onCheckedChange={(v) => updateTextBlock(selectedTextBlock.id, { shadowEnabled: v, glowEnabled: v ? false : selectedTextBlock.glowEnabled })} />
              </div>
              {selectedTextBlock.shadowEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedTextBlock.shadowColor}
                      onChange={(e) => updateTextBlock(selectedTextBlock.id, { shadowColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer" />
                    <Label className="text-xs">Cor da sombra</Label>
                  </div>
                  <div>
                    <Label className="text-xs">Blur: {selectedTextBlock.shadowBlur}px</Label>
                    <Slider value={[selectedTextBlock.shadowBlur]}
                      onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { shadowBlur: v })}
                      min={0} max={20} step={1} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Offset X: {selectedTextBlock.shadowOffsetX}px</Label>
                      <Slider value={[selectedTextBlock.shadowOffsetX]}
                        onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { shadowOffsetX: v })}
                        min={-10} max={10} step={1} />
                    </div>
                    <div>
                      <Label className="text-xs">Offset Y: {selectedTextBlock.shadowOffsetY}px</Label>
                      <Slider value={[selectedTextBlock.shadowOffsetY]}
                        onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { shadowOffsetY: v })}
                        min={-10} max={10} step={1} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Contorno */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Contorno</Label>
                <Switch checked={selectedTextBlock.borderEnabled}
                  onCheckedChange={(v) => updateTextBlock(selectedTextBlock.id, { borderEnabled: v })} />
              </div>
              {selectedTextBlock.borderEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedTextBlock.borderColor}
                      onChange={(e) => updateTextBlock(selectedTextBlock.id, { borderColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer" />
                    <Label className="text-xs">Cor</Label>
                  </div>
                  <div>
                    <Label className="text-xs">Espessura: {selectedTextBlock.borderWidth}px</Label>
                    <Slider value={[selectedTextBlock.borderWidth]}
                      onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { borderWidth: v })}
                      min={1} max={5} step={1} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Glow */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Glow</Label>
                <Switch checked={selectedTextBlock.glowEnabled}
                  onCheckedChange={(v) => updateTextBlock(selectedTextBlock.id, { glowEnabled: v, shadowEnabled: v ? false : selectedTextBlock.shadowEnabled })} />
              </div>
              {selectedTextBlock.glowEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedTextBlock.glowColor}
                      onChange={(e) => updateTextBlock(selectedTextBlock.id, { glowColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer" />
                    <Label className="text-xs">Cor</Label>
                  </div>
                  <div>
                    <Label className="text-xs">Intensidade: {selectedTextBlock.glowIntensity}px</Label>
                    <Slider value={[selectedTextBlock.glowIntensity]}
                      onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { glowIntensity: v })}
                      min={5} max={30} step={1} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Espaçamento */}
            <div>
              <Label className="text-xs">Espaçamento entre letras: {selectedTextBlock.letterSpacing}px</Label>
              <Slider value={[selectedTextBlock.letterSpacing]}
                onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { letterSpacing: v })}
                min={-2} max={10} step={0.5} />
            </div>
            
            <div>
              <Label className="text-xs">Altura da linha: {selectedTextBlock.lineHeight.toFixed(1)}</Label>
              <Slider value={[selectedTextBlock.lineHeight]}
                onValueChange={([v]) => updateTextBlock(selectedTextBlock.id, { lineHeight: v })}
                min={1} max={2} step={0.1} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
