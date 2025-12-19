import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Play, Pause, Download, RefreshCw, Loader2, Settings2 } from "lucide-react";
import { KenBurnsVideo, exportKenBurnsAsVideo } from "./KenBurnsVideo";

type KenBurnsDirection = "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down";

interface KenBurnsPreviewProps {
  imageUrl: string;
  onExport?: (videoBlob: Blob) => void;
  onCancel?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const directionOptions: { value: KenBurnsDirection; label: string; description: string }[] = [
  { value: "zoom-in", label: "Zoom In", description: "Aproxima gradualmente" },
  { value: "zoom-out", label: "Zoom Out", description: "Afasta gradualmente" },
  { value: "pan-left", label: "Pan Esquerda", description: "Move para a esquerda" },
  { value: "pan-right", label: "Pan Direita", description: "Move para a direita" },
  { value: "pan-up", label: "Pan Cima", description: "Move para cima" },
  { value: "pan-down", label: "Pan Baixo", description: "Move para baixo" },
];

export function KenBurnsPreview({
  imageUrl,
  onExport,
  onCancel,
  isOpen,
  onOpenChange,
}: KenBurnsPreviewProps) {
  const [direction, setDirection] = useState<KenBurnsDirection>("zoom-in");
  const [duration, setDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [key, setKey] = useState(0); // Para forçar re-render do preview

  const handleDirectionChange = (newDirection: KenBurnsDirection) => {
    setDirection(newDirection);
    setKey((k) => k + 1); // Reinicia a animação
  };

  const handleDurationChange = (newDuration: number[]) => {
    setDuration(newDuration[0]);
    setKey((k) => k + 1); // Reinicia a animação
  };

  const handleReplay = () => {
    setKey((k) => k + 1);
    setIsPlaying(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportKenBurnsAsVideo(imageUrl, duration, direction);
      
      // Download automático
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ken-burns-${direction}-${duration}s.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Vídeo exportado com sucesso!");
      onExport?.(blob);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar vídeo");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configurar Ken Burns
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-black">
                <KenBurnsVideo
                  key={key}
                  imageUrl={imageUrl}
                  duration={duration}
                  direction={direction}
                  autoPlay={isPlaying}
                  loop={true}
                  className="w-full max-h-[400px]"
                />
                
                {/* Controles de reprodução */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="gap-1"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Play
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleReplay}
                    className="gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reiniciar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <div className="space-y-4">
            {/* Direção */}
            <div className="space-y-2">
              <Label>Tipo de movimento</Label>
              <Select value={direction} onValueChange={(v) => handleDirectionChange(v as KenBurnsDirection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {directionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duração */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Duração</Label>
                <Badge variant="outline">{duration}s</Badge>
              </div>
              <Slider
                value={[duration]}
                onValueChange={handleDurationChange}
                min={3}
                max={15}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Arraste para ajustar a duração do vídeo (3-15 segundos)
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-green-500/10 rounded-lg text-sm">
            <p className="font-medium text-green-600">Ken Burns - Custo: 3 créditos</p>
            <p className="text-muted-foreground text-xs mt-1">
              Efeito cinematográfico de zoom e movimento suave. Processado localmente, sem custo de API externa.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Vídeo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default KenBurnsPreview;
