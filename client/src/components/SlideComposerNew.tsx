import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Plus, 
  Minus, 
  Trash2, 
  Type, 
  Image as ImageIcon,
  Save,
  RotateCcw,
  PlusCircle
} from "lucide-react";
import { toast } from "sonner";

// Tipos
interface TextBlock {
  id: string;
  text: string;
  x: number; // % do canvas (0-100)
  y: number; // % do canvas (0-100)
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
}

interface ImageSettings {
  x: number; // % do canvas (0-100)
  y: number; // % do canvas (0-100)
  width: number; // % do canvas (0-100)
  height: number; // % do canvas (0-100)
}

interface SlideComposerNewProps {
  imageUrl?: string;
  initialText?: string;
  backgroundColor?: string;
  onSave?: (data: SaveData) => Promise<void>;
  slideIndex?: number;
}

interface SaveData {
  textBlocks: TextBlock[];
  imageSettings: ImageSettings;
  backgroundColor: string;
}

// Valores padrão
const DEFAULT_TEXT_BLOCK: Omit<TextBlock, "id"> = {
  text: "Seu texto aqui",
  x: 50,
  y: 80,
  fontSize: 28,
  color: "#FFFFFF",
  fontFamily: "Inter",
  fontWeight: "bold",
  textAlign: "center",
  shadowEnabled: true,
  shadowColor: "#000000",
  shadowBlur: 4,
};

const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  x: 0,
  y: 0,
  width: 100,
  height: 60,
};

// Gerar ID único
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function SlideComposerNew({
  imageUrl,
  initialText = "",
  backgroundColor: initialBgColor = "#1a1a2e",
  onSave,
  slideIndex = 0,
}: SlideComposerNewProps) {
  // Estados
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([
    { ...DEFAULT_TEXT_BLOCK, id: generateId(), text: initialText || "Seu texto aqui" }
  ]);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(DEFAULT_IMAGE_SETTINGS);
  const [backgroundColor, setBackgroundColor] = useState(initialBgColor);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [downloading, setDownloading] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Atualizar texto inicial quando mudar
  useEffect(() => {
    if (initialText && textBlocks.length > 0) {
      setTextBlocks(prev => [{
        ...prev[0],
        text: initialText
      }, ...prev.slice(1)]);
    }
  }, [initialText]);

  // Funções de manipulação de texto
  const addTextBlock = () => {
    const newBlock: TextBlock = {
      ...DEFAULT_TEXT_BLOCK,
      id: generateId(),
      y: 20 + (textBlocks.length * 15) % 60, // Posiciona em lugares diferentes
    };
    setTextBlocks(prev => [...prev, newBlock]);
    setSelectedElement(newBlock.id);
    toast.success("Novo texto adicionado!");
  };

  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteTextBlock = (id: string) => {
    if (textBlocks.length <= 1) {
      toast.error("Precisa ter pelo menos um texto!");
      return;
    }
    setTextBlocks(prev => prev.filter(block => block.id !== id));
    setSelectedElement(null);
    toast.success("Texto removido!");
  };

  // Funções de drag and drop
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    // Calcular offset do clique em relação ao elemento
    const relX = ((clientX - rect.left) / rect.width) * 100;
    const relY = ((clientY - rect.top) / rect.height) * 100;
    
    if (elementId === "image") {
      setDragOffset({ x: relX - imageSettings.x, y: relY - imageSettings.y });
    } else {
      const block = textBlocks.find(b => b.id === elementId);
      if (block) {
        setDragOffset({ x: relX - block.x, y: relY - block.y });
      }
    }
    
    setSelectedElement(elementId);
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    // Calcular nova posição em %
    let newX = ((clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newY = ((clientY - rect.top) / rect.height) * 100 - dragOffset.y;
    
    // Limitar dentro do canvas
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    
    if (selectedElement === "image") {
      setImageSettings(prev => ({ ...prev, x: newX, y: newY }));
    } else {
      updateTextBlock(selectedElement, { x: newX, y: newY });
    }
  }, [isDragging, selectedElement, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners para drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Ajustar tamanho com botões +/-
  const adjustImageSize = (delta: number) => {
    setImageSettings(prev => ({
      ...prev,
      height: Math.max(20, Math.min(100, prev.height + delta))
    }));
  };

  const adjustFontSize = (id: string, delta: number) => {
    const block = textBlocks.find(b => b.id === id);
    if (block) {
      updateTextBlock(id, { 
        fontSize: Math.max(12, Math.min(72, block.fontSize + delta)) 
      });
    }
  };

  // Download usando Canvas API
  const handleDownload = async (withText: boolean) => {
    setDownloading(true);
    
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Canvas não suportado");
      }
      
      // 1. Preencher fundo
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 2. Desenhar imagem (se existir)
      if (imageUrl) {
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Falha ao carregar imagem"));
          img.src = proxyUrl;
        });
        
        // Calcular posição e tamanho da imagem
        const imgX = (imageSettings.x / 100) * canvas.width;
        const imgY = (imageSettings.y / 100) * canvas.height;
        const imgWidth = (imageSettings.width / 100) * canvas.width;
        const imgHeight = (imageSettings.height / 100) * canvas.height;
        
        // Desenhar imagem com cover (manter proporção)
        const imgRatio = img.width / img.height;
        const frameRatio = imgWidth / imgHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgRatio > frameRatio) {
          drawHeight = imgHeight;
          drawWidth = imgHeight * imgRatio;
          drawX = imgX + (imgWidth - drawWidth) / 2;
          drawY = imgY;
        } else {
          drawWidth = imgWidth;
          drawHeight = imgWidth / imgRatio;
          drawX = imgX;
          drawY = imgY + (imgHeight - drawHeight) / 2;
        }
        
        // Clip para a área da imagem
        ctx.save();
        ctx.beginPath();
        ctx.rect(imgX, imgY, imgWidth, imgHeight);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      }
      
      // 3. Desenhar textos (se withText)
      if (withText) {
        for (const block of textBlocks) {
          if (!block.text.trim()) continue;
          
          const scale = canvas.width / 360; // Escala do preview para o canvas
          const fontSize = block.fontSize * scale;
          
          ctx.font = `${block.fontWeight} ${fontSize}px ${block.fontFamily}, sans-serif`;
          ctx.fillStyle = block.color;
          ctx.textAlign = block.textAlign;
          ctx.textBaseline = "middle";
          
          // Sombra
          if (block.shadowEnabled) {
            ctx.shadowColor = block.shadowColor;
            ctx.shadowBlur = block.shadowBlur * scale;
            ctx.shadowOffsetX = 2 * scale;
            ctx.shadowOffsetY = 2 * scale;
          }
          
          // Posição do texto
          const textX = block.textAlign === "center" 
            ? canvas.width / 2 
            : block.textAlign === "right"
              ? canvas.width - 40
              : 40;
          const textY = (block.y / 100) * canvas.height;
          
          // Quebrar texto em linhas
          const maxWidth = canvas.width * 0.9;
          const words = block.text.split(" ");
          const lines: string[] = [];
          let currentLine = words[0] || "";
          
          for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + " " + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth) {
              lines.push(currentLine);
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          // Desenhar linhas
          const lineHeight = fontSize * 1.3;
          const totalHeight = lines.length * lineHeight;
          const startY = textY - totalHeight / 2 + lineHeight / 2;
          
          lines.forEach((line, index) => {
            ctx.fillText(line, textX, startY + index * lineHeight);
          });
          
          // Resetar sombra
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
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

  // Texto selecionado
  const selectedTextBlock = textBlocks.find(b => b.id === selectedElement);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Preview Interativo - Lado Esquerdo */}
        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-xl p-4">
          <div 
            ref={canvasRef}
            className="relative aspect-[4/5] rounded-lg overflow-hidden cursor-crosshair select-none border-2 border-border shadow-lg"
            style={{ 
              backgroundColor,
              width: "100%",
              maxWidth: "400px",
              touchAction: "none"
            }}
            onClick={() => setSelectedElement(null)}
          >
        {/* Imagem */}
        {imageUrl && (
          <div
            className={`absolute cursor-move ${selectedElement === "image" ? "ring-2 ring-blue-500" : ""}`}
            style={{
              left: `${imageSettings.x}%`,
              top: `${imageSettings.y}%`,
              width: `${imageSettings.width}%`,
              height: `${imageSettings.height}%`,
              overflow: "hidden",
            }}
            onMouseDown={(e) => handleMouseDown(e, "image")}
            onTouchStart={(e) => handleMouseDown(e, "image")}
          >
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>
        )}
        
        {/* Textos */}
        {textBlocks.map((block) => (
          <div
            key={block.id}
            className={`absolute cursor-move px-2 ${selectedElement === block.id ? "ring-2 ring-purple-500" : ""}`}
            style={{
              left: block.textAlign === "center" ? "50%" : block.textAlign === "right" ? "auto" : "5%",
              right: block.textAlign === "right" ? "5%" : "auto",
              top: `${block.y}%`,
              transform: block.textAlign === "center" ? "translate(-50%, -50%)" : "translateY(-50%)",
              color: block.color,
              fontSize: `${block.fontSize}px`,
              fontFamily: block.fontFamily,
              fontWeight: block.fontWeight,
              textAlign: block.textAlign,
              textShadow: block.shadowEnabled 
                ? `2px 2px ${block.shadowBlur}px ${block.shadowColor}` 
                : "none",
              maxWidth: "90%",
              wordWrap: "break-word",
            }}
            onMouseDown={(e) => handleMouseDown(e, block.id)}
            onTouchStart={(e) => handleMouseDown(e, block.id)}
          >
            {block.text}
          </div>
        ))}
          </div>
        </div>

        {/* Controles - Lado Direito */}
        <div className="lg:w-80 space-y-4">
        {/* Controles da Imagem */}
        {selectedElement === "image" && imageUrl && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Tamanho da Imagem
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => adjustImageSize(-5)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{imageSettings.height}%</span>
                <Button size="sm" variant="outline" onClick={() => adjustImageSize(5)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Controles do Texto Selecionado */}
        {selectedTextBlock && (
          <div className="p-3 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Texto Selecionado
              </span>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => deleteTextBlock(selectedTextBlock.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Input de texto */}
            <Input
              value={selectedTextBlock.text}
              onChange={(e) => updateTextBlock(selectedTextBlock.id, { text: e.target.value })}
              placeholder="Digite o texto..."
            />
            
            {/* Tamanho da fonte */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Tamanho</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => adjustFontSize(selectedTextBlock.id, -2)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{selectedTextBlock.fontSize}px</span>
                <Button size="sm" variant="outline" onClick={() => adjustFontSize(selectedTextBlock.id, 2)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Cor do texto */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Cor</span>
              <input
                type="color"
                value={selectedTextBlock.color}
                onChange={(e) => updateTextBlock(selectedTextBlock.id, { color: e.target.value })}
                className="w-10 h-8 rounded cursor-pointer"
              />
            </div>
            
            {/* Alinhamento */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Alinhamento</span>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <Button
                    key={align}
                    size="sm"
                    variant={selectedTextBlock.textAlign === align ? "default" : "outline"}
                    onClick={() => updateTextBlock(selectedTextBlock.id, { textAlign: align })}
                  >
                    {align === "left" ? "⬅" : align === "center" ? "⬌" : "➡"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botão Adicionar Texto */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={addTextBlock}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Texto
        </Button>

        {/* Cor de Fundo */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">Cor de Fundo</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
          />
        </div>

        {/* Botões de Download */}
        <div className="flex gap-2">
          <Button 
            className="flex-1"
            onClick={() => handleDownload(true)}
            disabled={downloading}
          >
            <Download className="h-4 w-4 mr-2" />
            Com Texto
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => handleDownload(false)}
            disabled={downloading}
          >
            <Download className="h-4 w-4 mr-2" />
            Sem Texto
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
