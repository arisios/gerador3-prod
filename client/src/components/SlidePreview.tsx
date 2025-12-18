import { useMemo, useState } from "react";
import { visualTemplates, accentColors, templateCategories } from "@shared/visualTemplates";
import { Wand2, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SlidePreviewProps {
  text: string;
  imageUrl?: string;
  templateId?: string;
  accentColorId?: string;
  className?: string;
  showOverlay?: boolean;
}

export default function SlidePreview({
  text,
  imageUrl,
  templateId = "lifestyle-editorial",
  accentColorId = "neon-green",
  className = "",
  showOverlay = true,
}: SlidePreviewProps) {
  const template = useMemo(() => 
    visualTemplates.find(t => t.id === templateId) || visualTemplates[0],
    [templateId]
  );

  const accentColor = useMemo(() =>
    accentColors.find(c => c.id === accentColorId) || accentColors[0],
    [accentColorId]
  );

  const overlayStyle = useMemo(() => {
    if (!showOverlay) return {};
    
    const opacity = template.style.overlayOpacity;
    
    switch (template.style.overlayType) {
      case "gradient-bottom":
        return {
          background: `linear-gradient(to top, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity * 0.5}) 50%, transparent 100%)`,
        };
      case "gradient-top":
        return {
          background: `linear-gradient(to bottom, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity * 0.5}) 50%, transparent 100%)`,
        };
      case "gradient-radial":
        return {
          background: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,${opacity}) 100%)`,
        };
      case "gradient-diagonal":
        return {
          background: `linear-gradient(to bottom right, rgba(0,0,0,${opacity}) 0%, transparent 100%)`,
        };
      case "solid":
        return {
          background: `rgba(0,0,0,${opacity})`,
        };
      default:
        return {};
    }
  }, [template, showOverlay]);

  const textPositionStyle = useMemo(() => {
    switch (template.style.textPosition) {
      case "top":
        return "items-start pt-8";
      case "center":
        return "items-center";
      case "bottom":
        return "items-end pb-8";
      case "top-bottom":
        return "justify-between py-8";
      default:
        return "items-end pb-8";
    }
  }, [template]);

  const textAlignStyle = useMemo(() => {
    switch (template.style.textAlign) {
      case "left":
        return "text-left";
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  }, [template]);

  // Processar texto para destacar palavras-chave com cor de destaque
  const processedText = useMemo(() => {
    if (!text) return null;
    
    // Encontrar palavras entre ** ** para destacar
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const word = part.slice(2, -2);
        return (
          <span 
            key={index} 
            style={{ 
              color: accentColor.hex,
              textShadow: `0 0 20px ${accentColor.hex}, 0 0 40px ${accentColor.hex}`,
            }}
          >
            {word}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [text, accentColor]);

  const getFontWeight = () => {
    switch (template.style.fontWeight) {
      case "900": return "font-black";
      case "800": return "font-extrabold";
      case "700": return "font-bold";
      case "600": return "font-semibold";
      case "500": return "font-medium";
      default: return "font-bold";
    }
  };

  // Background específico por template
  const getBackgroundStyle = () => {
    if (imageUrl) return {};
    
    switch (template.id) {
      case "neon-gradient":
        return { background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%)" };
      case "dark-luxury":
        return { background: "#000" };
      case "minimal":
        return { background: "linear-gradient(135deg, #581c87 0%, #000 100%)" };
      case "breaking-news":
        return { background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)" };
      default:
        return { background: "linear-gradient(135deg, #1a1a1a 0%, #000 100%)" };
    }
  };

  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-lg ${className}`}>
      {/* Background Image */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={getBackgroundStyle()} />
      )}

      {/* Overlay */}
      <div className="absolute inset-0" style={overlayStyle} />

      {/* Breaking News Bar */}
      {template.id === "breaking-news" && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 py-1 px-3">
          <p className="text-white text-[10px] font-bold uppercase tracking-wider">Breaking News</p>
        </div>
      )}

      {/* Quote Decorations */}
      {template.id === "quote-inspiration" && (
        <div 
          className="absolute top-8 left-6 text-6xl opacity-30"
          style={{ color: accentColor.hex }}
        >
          "
        </div>
      )}

      {/* Decorations (linhas, formas) */}
      {template.style.hasDecorations && (
        <>
          {/* Linha superior */}
          <div 
            className="absolute top-4 left-4 right-4 h-0.5 opacity-30"
            style={{ backgroundColor: accentColor.hex }}
          />
          {/* Linha inferior */}
          <div 
            className="absolute bottom-4 left-4 right-4 h-0.5 opacity-30"
            style={{ backgroundColor: accentColor.hex }}
          />
          {/* Decoração lateral para dark-luxury */}
          {template.id === "dark-luxury" && (
            <>
              <div 
                className="absolute top-8 bottom-8 left-4 w-0.5 opacity-50"
                style={{ backgroundColor: accentColor.hex }}
              />
              <div 
                className="absolute top-8 bottom-8 right-4 w-0.5 opacity-50"
                style={{ backgroundColor: accentColor.hex }}
              />
            </>
          )}
        </>
      )}

      {/* Text Container */}
      <div className={`absolute inset-0 flex flex-col ${textPositionStyle} px-6`}>
        {/* Meme style - text on top */}
        {template.id === "meme-humor" && (
          <div className="text-center">
            <p 
              className="text-white font-black uppercase"
              style={{
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
                textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
              }}
            >
              QUANDO VOCÊ
            </p>
          </div>
        )}

        {/* Main Text */}
        <div className={`${textAlignStyle} ${getFontWeight()}`}>
          <p 
            className="text-white leading-tight"
            style={{
              fontSize: "clamp(1.25rem, 5vw, 2rem)",
              textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.9)",
              letterSpacing: "-0.02em",
            }}
          >
            {processedText || "Seu texto aqui"}
          </p>
        </div>

        {/* Meme style - text on bottom */}
        {template.id === "meme-humor" && (
          <div className="text-center">
            <p 
              className="text-white font-black uppercase"
              style={{
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
                textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
              }}
            >
              E ACONTECE ISSO
            </p>
          </div>
        )}

        {/* Subtitle (se habilitado) */}
        {template.style.hasSubtitle && template.id !== "meme-humor" && (
          <p 
            className={`text-white/70 text-sm mt-2 ${textAlignStyle}`}
            style={{
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            Subtítulo opcional
          </p>
        )}

        {/* CTA (se habilitado) */}
        {template.style.hasCTA && (
          <div className={`mt-4 ${textAlignStyle}`}>
            <span 
              className="inline-block px-4 py-2 text-xs font-bold uppercase tracking-wider rounded"
              style={{
                backgroundColor: accentColor.hex,
                color: "#000",
              }}
            >
              Saiba mais
            </span>
          </div>
        )}
      </div>

      {/* Template Badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white/60">
        {template.name}
      </div>
    </div>
  );
}

// Componente para seleção de template com filtro por categoria e opção automática
export function TemplateSelector({
  selectedId,
  onSelect,
  text,
  onAutoSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  text?: string;
  onAutoSelect?: (templateId: string, colorId: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);
  
  const autoSelectMutation = trpc.templates.selectAutoTemplate.useMutation({
    onSuccess: (data) => {
      onSelect(data.templateId);
      if (onAutoSelect) {
        onAutoSelect(data.templateId, data.accentColorId);
      }
      toast.success(`Template selecionado: ${visualTemplates.find(t => t.id === data.templateId)?.name}`, {
        description: data.reason,
      });
    },
    onError: () => {
      toast.error("Erro ao selecionar template automaticamente");
    },
  });

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return visualTemplates;
    return visualTemplates.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const displayedTemplates = isExpanded ? filteredTemplates : filteredTemplates.slice(0, 6);

  const handleAutoSelect = () => {
    if (!text) {
      toast.error("Digite algum texto primeiro para a IA analisar");
      return;
    }
    autoSelectMutation.mutate({ text });
  };

  return (
    <div className="space-y-3">
      {/* Botão Automático */}
      <Button
        variant="outline"
        className="w-full justify-center gap-2 border-primary/50 hover:bg-primary/10"
        onClick={handleAutoSelect}
        disabled={autoSelectMutation.isPending || !text}
      >
        {autoSelectMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        <span>Automático (IA escolhe)</span>
      </Button>

      {/* Filtro por Categoria */}
      <div className="flex flex-wrap gap-1">
        {templateCategories.slice(0, 8).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2 py-1 text-[10px] rounded-full transition-all ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-3 gap-2">
        {displayedTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`p-2 rounded-lg border-2 transition-all text-left ${
              selectedId === template.id
                ? "border-primary bg-primary/10"
                : "border-transparent bg-muted/50 hover:bg-muted"
            }`}
          >
            <div 
              className="w-full aspect-[4/5] rounded mb-1 flex items-end p-1 relative overflow-hidden"
              style={{
                background: template.id === "neon-gradient" 
                  ? "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%)"
                  : template.id === "dark-luxury"
                  ? "#000"
                  : `linear-gradient(135deg, ${template.style.accentColor}20, #000)`,
              }}
            >
              {selectedId === template.id && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div 
                className="w-full h-1 rounded"
                style={{ backgroundColor: template.style.accentColor }}
              />
            </div>
            <p className="text-[10px] font-medium truncate">{template.name}</p>
            <p className="text-[8px] text-muted-foreground truncate">{template.category}</p>
          </button>
        ))}
      </div>

      {/* Botão Ver Mais/Menos */}
      {filteredTemplates.length > 6 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Ver mais ({filteredTemplates.length - 6} templates)
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Componente para seleção de cor de destaque
export function AccentColorSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {accentColors.map((color) => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          className={`w-8 h-8 rounded-full border-2 transition-all relative ${
            selectedId === color.id
              ? "border-white scale-110"
              : "border-transparent hover:scale-105"
          }`}
          style={{ backgroundColor: color.hex }}
          title={color.name}
        >
          {selectedId === color.id && (
            <Check className="w-4 h-4 absolute inset-0 m-auto text-black" />
          )}
        </button>
      ))}
    </div>
  );
}
