import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plus, Minus, Trash2, Download, Type,
  AlignLeft, AlignCenter, AlignRight
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
  marginLeft: number;
  marginRight: number;
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
  fontSize: 28,
  color: "#FFFFFF",
  fontFamily: "Inter",
  fontWeight: "bold",
  textAlign: "center",
  marginLeft: 5,
  marginRight: 5,
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

export default function SlideComposerNew({
  imageUrl,
  initialText = "",
  backgroundColor: initialBg = "#1a1a2e",
  onSave,
  slideIndex = 1,
}: SlideComposerNewProps) {
  // Estados
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([
    { ...DEFAULT_TEXT_BLOCK, id: "text-1", text: initialText || DEFAULT_TEXT_BLOCK.text }
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string>("text-1");
  const [backgroundColor, setBackgroundColor] = useState(initialBg);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [downloading, setDownloading] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Bloquear/liberar scroll ao arrastar
  useEffect(() => {
    if (isDragging) {
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
  }, [isDragging]);
  
  // Texto selecionado
  const selectedText = textBlocks.find(b => b.id === selectedTextId) || textBlocks[0];
  
  // Funções de manipulação
  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(blocks => blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  
  const addTextBlock = () => {
    const newId = `text-${Date.now()}`;
    setTextBlocks(blocks => [...blocks, { ...DEFAULT_TEXT_BLOCK, id: newId, y: 50 }]);
    setSelectedTextId(newId);
  };
  
  const removeTextBlock = (id: string) => {
    if (textBlocks.length <= 1) {
      toast.error("Precisa ter pelo menos um texto");
      return;
    }
    setTextBlocks(blocks => blocks.filter(b => b.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(textBlocks[0].id === id ? textBlocks[1]?.id : textBlocks[0].id);
    }
  };
  
  // Handlers de drag - MOUSE
  const handleMouseDown = (e: React.MouseEvent, textId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTextId(textId);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const block = textBlocks.find(b => b.id === textId);
    if (block) setDragOffset({ x: x - block.x, y: y - block.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTextId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y));
    
    updateTextBlock(selectedTextId, { x, y });
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  // Handlers de drag - TOUCH
  const handleTouchStart = (e: React.TouchEvent, textId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTextId(textId);
    setIsDragging(true);
    
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    const block = textBlocks.find(b => b.id === textId);
    if (block) setDragOffset({ x: x - block.x, y: y - block.y });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !selectedTextId) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100 - dragOffset.x));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100 - dragOffset.y));
    
    updateTextBlock(selectedTextId, { x, y });
  };
  
  const handleTouchEnd = () => setIsDragging(false);
  
  // Função para calcular estilo do texto (usada no preview E no download)
  const getTextStyle = (block: TextBlock, containerWidth: number) => {
    const marginLeftPx = (block.marginLeft / 100) * containerWidth;
    const marginRightPx = (block.marginRight / 100) * containerWidth;
    const availableWidth = containerWidth - marginLeftPx - marginRightPx;
    
    let textX: number;
    if (block.textAlign === "center") {
      textX = marginLeftPx + availableWidth / 2;
    } else if (block.textAlign === "right") {
      textX = containerWidth - marginRightPx;
    } else {
      textX = marginLeftPx;
    }
    
    return { marginLeftPx, marginRightPx, availableWidth, textX };
  };
  
  // Download
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
      
      // 2. Desenhar imagem (100% cover)
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
          
          // Cover - preencher todo o canvas mantendo proporção
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
        } catch (imgError) {
          console.warn("Erro ao carregar imagem:", imgError);
        }
      }
      
      // 3. Desenhar textos
      if (withText) {
        const scale = canvas.width / 360; // Escala do preview para o canvas
        
        for (const block of textBlocks) {
          if (!block.text.trim()) continue;
          
          const fontSize = block.fontSize * scale;
          ctx.font = `${block.fontWeight} ${fontSize}px ${block.fontFamily}, sans-serif`;
          ctx.fillStyle = block.color;
          ctx.textAlign = block.textAlign;
          ctx.textBaseline = "middle";
          
          // Calcular posição usando margens
          const { availableWidth, textX } = getTextStyle(block, canvas.width);
          const textY = (block.y / 100) * canvas.height;
          
          // Quebrar texto em linhas
          const words = block.text.split(" ");
          const lines: string[] = [];
          let currentLine = words[0] || "";
          
          for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + " " + words[i];
            if (ctx.measureText(testLine).width > availableWidth) {
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
              
              ctx.fillRect(bgX, lineY - fontSize / 2 - padding, metrics.width + padding * 2, fontSize + padding * 2);
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
          
          // Contorno
          if (block.borderEnabled) {
            ctx.strokeStyle = block.borderColor;
            ctx.lineWidth = block.borderWidth * scale;
            lines.forEach((line, index) => {
              ctx.strokeText(line, textX, startY + index * lineHeight);
            });
          }
          
          // Texto
          ctx.letterSpacing = `${block.letterSpacing}px`;
          lines.forEach((line, index) => {
            ctx.fillText(line, textX, startY + index * lineHeight);
          });
          
          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      }
      
      // 4. Download
      const link = document.createElement("a");
      link.download = `slide_${slideIndex}_${withText ? "com" : "sem"}_texto.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao gerar imagem");
    } finally {
      setDownloading(false);
    }
  };
  
  // Render do preview de texto
  const renderTextPreview = (block: TextBlock) => {
    const previewWidth = 360; // Largura do preview em pixels
    const { availableWidth, textX } = getTextStyle(block, previewWidth);
    
    // Converter textX para porcentagem
    const leftPercent = (block.marginLeft);
    const rightPercent = (block.marginRight);
    const widthPercent = 100 - leftPercent - rightPercent;
    
    return (
      <div
        key={block.id}
        className={`absolute cursor-move select-none ${selectedTextId === block.id ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent' : ''}`}
        style={{
          left: `${leftPercent}%`,
          right: `${rightPercent}%`,
          top: `${block.y}%`,
          transform: 'translateY(-50%)',
          width: `${widthPercent}%`,
          fontSize: `${block.fontSize}px`,
          fontFamily: `${block.fontFamily}, sans-serif`,
          fontWeight: block.fontWeight,
          color: block.color,
          textAlign: block.textAlign,
          letterSpacing: `${block.letterSpacing}px`,
          lineHeight: block.lineHeight,
          textShadow: block.shadowEnabled 
            ? `${block.shadowOffsetX}px ${block.shadowOffsetY}px ${block.shadowBlur}px ${block.shadowColor}`
            : block.glowEnabled 
              ? `0 0 ${block.glowIntensity}px ${block.glowColor}`
              : 'none',
          WebkitTextStroke: block.borderEnabled ? `${block.borderWidth}px ${block.borderColor}` : 'none',
          backgroundColor: block.bgEnabled ? block.bgColor : 'transparent',
          padding: block.bgEnabled ? `${block.bgPadding}px` : '0',
          touchAction: 'none',
        }}
        onMouseDown={(e) => handleMouseDown(e, block.id)}
        onTouchStart={(e) => handleTouchStart(e, block.id)}
      >
        {block.text}
      </div>
    );
  };

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
      
      {/* Preview */}
      <div
        ref={canvasRef}
        className="relative w-full bg-cover bg-center rounded-lg overflow-hidden select-none"
        style={{
          aspectRatio: "1080/1350",
          backgroundColor,
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Textos */}
        {textBlocks.map(renderTextPreview)}
      </div>
      
      {/* Seletor de textos */}
      <div className="flex gap-2 flex-wrap items-center">
        {textBlocks.map((block, index) => (
          <Button
            key={block.id}
            variant={selectedTextId === block.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTextId(block.id)}
            className={selectedTextId === block.id ? "bg-purple-600" : ""}
          >
            <Type className="w-3 h-3 mr-1" />
            Texto {index + 1}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={addTextBlock}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Controles do texto selecionado */}
      {selectedText && (
        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="cores">Cores</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>
          
          {/* Aba Básico */}
          <TabsContent value="basico" className="space-y-4 mt-4">
            {/* Texto */}
            <div>
              <Label>Texto</Label>
              <textarea
                value={selectedText.text}
                onChange={(e) => updateTextBlock(selectedText.id, { text: e.target.value })}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white min-h-[80px]"
              />
            </div>
            
            {/* Tamanho da fonte */}
            <div>
              <Label>Tamanho: {selectedText.fontSize}px</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
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
                  size="icon"
                  onClick={() => updateTextBlock(selectedText.id, { fontSize: Math.min(72, selectedText.fontSize + 2) })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Posição Y */}
            <div>
              <Label>Posição Vertical: {selectedText.y.toFixed(0)}%</Label>
              <Slider
                value={[selectedText.y]}
                onValueChange={([v]) => updateTextBlock(selectedText.id, { y: v })}
                min={5}
                max={95}
                step={1}
              />
            </div>
            
            {/* Margens */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Margem Esquerda: {selectedText.marginLeft}%</Label>
                <Slider
                  value={[selectedText.marginLeft]}
                  onValueChange={([v]) => updateTextBlock(selectedText.id, { marginLeft: v })}
                  min={0}
                  max={40}
                  step={1}
                />
              </div>
              <div>
                <Label>Margem Direita: {selectedText.marginRight}%</Label>
                <Slider
                  value={[selectedText.marginRight]}
                  onValueChange={([v]) => updateTextBlock(selectedText.id, { marginRight: v })}
                  min={0}
                  max={40}
                  step={1}
                />
              </div>
            </div>
            
            {/* Alinhamento */}
            <div>
              <Label>Alinhamento</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedText.textAlign === "left" ? "default" : "outline"}
                  size="icon"
                  onClick={() => updateTextBlock(selectedText.id, { textAlign: "left" })}
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedText.textAlign === "center" ? "default" : "outline"}
                  size="icon"
                  onClick={() => updateTextBlock(selectedText.id, { textAlign: "center" })}
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedText.textAlign === "right" ? "default" : "outline"}
                  size="icon"
                  onClick={() => updateTextBlock(selectedText.id, { textAlign: "right" })}
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Fonte */}
            <div>
              <Label>Fonte</Label>
              <select
                value={selectedText.fontFamily}
                onChange={(e) => updateTextBlock(selectedText.id, { fontFamily: e.target.value })}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            
            {/* Peso */}
            <div>
              <Label>Peso</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedText.fontWeight === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTextBlock(selectedText.id, { fontWeight: "normal" })}
                >
                  Normal
                </Button>
                <Button
                  variant={selectedText.fontWeight === "bold" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTextBlock(selectedText.id, { fontWeight: "bold" })}
                >
                  Bold
                </Button>
              </div>
            </div>
            
            {/* Espaçamento */}
            <div>
              <Label>Espaçamento entre letras: {selectedText.letterSpacing}px</Label>
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
              <Label>Altura da linha: {selectedText.lineHeight.toFixed(1)}</Label>
              <Slider
                value={[selectedText.lineHeight]}
                onValueChange={([v]) => updateTextBlock(selectedText.id, { lineHeight: v })}
                min={0.8}
                max={2}
                step={0.1}
              />
            </div>
            
            {/* Excluir texto */}
            {textBlocks.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeTextBlock(selectedText.id)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir este texto
              </Button>
            )}
          </TabsContent>
          
          {/* Aba Cores */}
          <TabsContent value="cores" className="space-y-4 mt-4">
            {/* Cor do texto */}
            <div>
              <Label>Cor do texto</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) => updateTextBlock(selectedText.id, { color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={selectedText.color}
                  onChange={(e) => updateTextBlock(selectedText.id, { color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Cor de fundo do slide */}
            <div>
              <Label>Cor de fundo do slide</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Presets */}
            <div>
              <Label>Presets de cores</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Fundo do texto</Label>
                <Switch
                  checked={selectedText.bgEnabled}
                  onCheckedChange={(v) => updateTextBlock(selectedText.id, { bgEnabled: v })}
                />
              </div>
              {selectedText.bgEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-purple-500">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={selectedText.bgColor}
                      onChange={(e) => updateTextBlock(selectedText.id, { bgColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Label>Padding: {selectedText.bgPadding}px</Label>
                    <Slider
                      value={[selectedText.bgPadding]}
                      onValueChange={([v]) => updateTextBlock(selectedText.id, { bgPadding: v })}
                      min={0}
                      max={20}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Aba Avançado */}
          <TabsContent value="avancado" className="space-y-4 mt-4">
            {/* Sombra */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sombra</Label>
                <Switch
                  checked={selectedText.shadowEnabled}
                  onCheckedChange={(v) => updateTextBlock(selectedText.id, { shadowEnabled: v, glowEnabled: v ? false : selectedText.glowEnabled })}
                />
              </div>
              {selectedText.shadowEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-purple-500">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={selectedText.shadowColor}
                      onChange={(e) => updateTextBlock(selectedText.id, { shadowColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <span className="text-sm text-zinc-400">Cor da sombra</span>
                  </div>
                  <div>
                    <Label>Blur: {selectedText.shadowBlur}px</Label>
                    <Slider
                      value={[selectedText.shadowBlur]}
                      onValueChange={([v]) => updateTextBlock(selectedText.id, { shadowBlur: v })}
                      min={0}
                      max={20}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Offset X: {selectedText.shadowOffsetX}px</Label>
                      <Slider
                        value={[selectedText.shadowOffsetX]}
                        onValueChange={([v]) => updateTextBlock(selectedText.id, { shadowOffsetX: v })}
                        min={-10}
                        max={10}
                      />
                    </div>
                    <div>
                      <Label>Offset Y: {selectedText.shadowOffsetY}px</Label>
                      <Slider
                        value={[selectedText.shadowOffsetY]}
                        onValueChange={([v]) => updateTextBlock(selectedText.id, { shadowOffsetY: v })}
                        min={-10}
                        max={10}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Contorno */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Contorno</Label>
                <Switch
                  checked={selectedText.borderEnabled}
                  onCheckedChange={(v) => updateTextBlock(selectedText.id, { borderEnabled: v })}
                />
              </div>
              {selectedText.borderEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-purple-500">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={selectedText.borderColor}
                      onChange={(e) => updateTextBlock(selectedText.id, { borderColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Label>Espessura: {selectedText.borderWidth}px</Label>
                    <Slider
                      value={[selectedText.borderWidth]}
                      onValueChange={([v]) => updateTextBlock(selectedText.id, { borderWidth: v })}
                      min={1}
                      max={5}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Glow */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Efeito Glow</Label>
                <Switch
                  checked={selectedText.glowEnabled}
                  onCheckedChange={(v) => updateTextBlock(selectedText.id, { glowEnabled: v, shadowEnabled: v ? false : selectedText.shadowEnabled })}
                />
              </div>
              {selectedText.glowEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-purple-500">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={selectedText.glowColor}
                      onChange={(e) => updateTextBlock(selectedText.id, { glowColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Label>Intensidade: {selectedText.glowIntensity}px</Label>
                    <Slider
                      value={[selectedText.glowIntensity]}
                      onValueChange={([v]) => updateTextBlock(selectedText.id, { glowIntensity: v })}
                      min={5}
                      max={30}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
