import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface LogoPositionSelectorProps {
  logoUrl?: string | null;
  position: LogoPosition;
  size: number;
  onPositionChange: (position: LogoPosition) => void;
  onSizeChange: (size: number) => void;
  onSave: () => void;
  isSaving?: boolean;
}

const POSITION_LABELS: Record<LogoPosition, string> = {
  "top-left": "Topo Esquerda",
  "top-right": "Topo Direita",
  "bottom-left": "Rodapé Esquerda",
  "bottom-right": "Rodapé Direita",
};

export function LogoPositionSelector({
  logoUrl,
  position,
  size,
  onPositionChange,
  onSizeChange,
  onSave,
  isSaving = false,
}: LogoPositionSelectorProps) {
  const [open, setOpen] = useState(false);

  if (!logoUrl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          Posição da Logo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Logo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="relative w-full aspect-[4/5] bg-muted rounded-lg overflow-hidden border">
            {/* Grid de posições */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-4">
              {(["top-left", "top-right", "bottom-left", "bottom-right"] as LogoPosition[]).map((pos) => (
                <button
                  key={pos}
                  onClick={() => onPositionChange(pos)}
                  className={`flex items-${pos.includes("top") ? "start" : "end"} justify-${pos.includes("left") ? "start" : "end"} p-2 transition-colors rounded ${
                    position === pos ? "bg-primary/20" : "hover:bg-muted-foreground/10"
                  }`}
                >
                  <div
                    className={`rounded border-2 transition-all ${
                      position === pos ? "border-primary bg-primary/10" : "border-muted-foreground/30"
                    }`}
                    style={{
                      width: `${size * 2}%`,
                      minWidth: "30px",
                      aspectRatio: "1",
                    }}
                  >
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Posição selecionada */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">Posição: </span>
            <span className="font-medium">{POSITION_LABELS[position]}</span>
          </div>

          {/* Tamanho */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tamanho da Logo</Label>
              <span className="text-sm text-muted-foreground">{size}%</span>
            </div>
            <Slider
              value={[size]}
              onValueChange={(values) => onSizeChange(values[0])}
              min={5}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pequena</span>
              <span>Grande</span>
            </div>
          </div>

          {/* Botão Salvar */}
          <Button 
            onClick={() => {
              onSave();
              setOpen(false);
            }} 
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LogoPositionSelector;
