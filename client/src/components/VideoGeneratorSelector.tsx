import { useState } from "react";
import { KenBurnsPreview } from "./KenBurnsPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Video, Sparkles, Zap, Crown, Loader2, Play, Info } from "lucide-react";

interface VideoOption {
  id: string;
  name: string;
  description: string;
  credits: number;
  quality: "basic" | "standard" | "premium";
  duration: string;
  icon: React.ReactNode;
  provider: string;
  features: string[];
}

const videoOptions: VideoOption[] = [
  {
    id: "kenburns",
    name: "Ken Burns",
    description: "Animação suave de zoom e pan na imagem",
    credits: 3,
    quality: "basic",
    duration: "5-10s",
    icon: <Play className="h-5 w-5" />,
    provider: "Local",
    features: ["Processamento instantâneo", "Sem custo de API", "Efeito cinematográfico"],
  },
  {
    id: "wan-480p",
    name: "Vídeo IA Básico",
    description: "Vídeo gerado por IA em 480p",
    credits: 10,
    quality: "standard",
    duration: "5s",
    icon: <Zap className="h-5 w-5" />,
    provider: "Replicate Wan",
    features: ["Movimento realista", "Resolução 480p", "Ideal para redes sociais"],
  },
  {
    id: "wan-720p",
    name: "Vídeo IA HD",
    description: "Vídeo gerado por IA em 720p",
    credits: 15,
    quality: "standard",
    duration: "5s",
    icon: <Sparkles className="h-5 w-5" />,
    provider: "Replicate Wan",
    features: ["Movimento realista", "Resolução 720p", "Alta qualidade"],
  },
  {
    id: "luma",
    name: "Vídeo Premium",
    description: "Vídeo de alta qualidade com Luma AI",
    credits: 25,
    quality: "premium",
    duration: "5s",
    icon: <Crown className="h-5 w-5" />,
    provider: "Runware Luma",
    features: ["Qualidade cinematográfica", "Movimentos complexos", "Melhor resultado"],
  },
];

interface VideoGeneratorSelectorProps {
  imageUrl: string;
  prompt?: string;
  onGenerate: (videoType: string, provider: string) => Promise<string | null>;
  onVideoGenerated?: (videoUrl: string, videoType: string) => void;
  disabled?: boolean;
  userCredits?: number;
}

export function VideoGeneratorSelector({
  imageUrl,
  prompt = "",
  onGenerate,
  onVideoGenerated,
  disabled = false,
  userCredits = 0,
}: VideoGeneratorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("kenburns");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKenBurnsPreview, setShowKenBurnsPreview] = useState(false);

  const selectedVideoOption = videoOptions.find((o) => o.id === selectedOption);

  const handleGenerate = async () => {
    if (!selectedVideoOption) return;

    if (userCredits < selectedVideoOption.credits) {
      toast.error(`Créditos insuficientes. Você precisa de ${selectedVideoOption.credits} créditos.`);
      return;
    }

    // Se for Ken Burns, abrir o preview
    if (selectedVideoOption.id === "kenburns") {
      setShowKenBurnsPreview(true);
      return;
    }

    setIsGenerating(true);
    try {
      const videoUrl = await onGenerate(selectedVideoOption.id, selectedVideoOption.provider);
      if (videoUrl) {
        toast.success("Vídeo gerado com sucesso!");
        onVideoGenerated?.(videoUrl, selectedVideoOption.id);
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("Erro ao gerar vídeo. Tente novamente.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "basic":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "standard":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "premium":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "";
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          disabled={disabled || !imageUrl}
        >
          <Video className="h-4 w-4" />
          Gerar Vídeo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Gerar Vídeo a partir da Imagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview da imagem */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Imagem para vídeo"
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary">Imagem base</Badge>
            </div>
          </div>

          {/* Seleção de tipo de vídeo */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Escolha o tipo de vídeo:</Label>
            
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="grid gap-3"
            >
              {videoOptions.map((option) => {
                const canAfford = userCredits >= option.credits;
                return (
                  <div key={option.id} className="relative">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="peer sr-only"
                      disabled={!canAfford}
                    />
                    <Label
                      htmlFor={option.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${!canAfford ? "opacity-50 cursor-not-allowed" : ""}
                        peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                        hover:bg-muted/50`}
                    >
                      <div className={`p-2 rounded-lg ${getQualityColor(option.quality)}`}>
                        {option.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {option.credits} créditos
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {option.features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>Duração: {option.duration}</span>
                          <span>•</span>
                          <span>Provider: {option.provider}</span>
                        </div>
                      </div>
                    </Label>
                    {!canAfford && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                        <Badge variant="destructive">Créditos insuficientes</Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Info sobre Ken Burns */}
          {selectedOption === "kenburns" && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg text-sm">
              <Info className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-500">Melhor custo-benefício!</p>
                <p className="text-muted-foreground">
                  Ken Burns é processado localmente e cria um efeito cinematográfico de zoom e movimento
                  suave na imagem. Ideal para carrosséis e stories.
                </p>
              </div>
            </div>
          )}

          {/* Créditos do usuário */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">Seus créditos:</span>
            <Badge variant={userCredits >= (selectedVideoOption?.credits || 0) ? "default" : "destructive"}>
              {userCredits} créditos
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedVideoOption || userCredits < (selectedVideoOption?.credits || 0)}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Video className="h-4 w-4" />
                Gerar por {selectedVideoOption?.credits || 0} créditos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Ken Burns Preview */}
    <KenBurnsPreview
      imageUrl={imageUrl}
      isOpen={showKenBurnsPreview}
      onOpenChange={setShowKenBurnsPreview}
      onExport={(blob) => {
        toast.success("Vídeo Ken Burns exportado!");
        onVideoGenerated?.(URL.createObjectURL(blob), "kenburns");
        setIsOpen(false);
      }}
      onCancel={() => setShowKenBurnsPreview(false)}
    />
    </>
  );
}

export default VideoGeneratorSelector;
