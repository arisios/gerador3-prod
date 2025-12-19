import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";


type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface LogoPositionSelectorProps {
  logoUrl?: string | null;
  position: LogoPosition;
  size: number;
  onLogoUpload: (file: File) => Promise<void>;
  onLogoRemove: () => void;
  onPositionChange: (position: LogoPosition) => void;
  onSizeChange: (size: number) => void;
  onSave: () => void;
  isSaving?: boolean;
  isUploading?: boolean;
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
  onLogoUpload,
  onLogoRemove,
  onPositionChange,
  onSizeChange,
  onSave,
  isSaving = false,
  isUploading = false,
}: LogoPositionSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      alert("Arquivo inválido. Por favor, selecione uma imagem (PNG, JPG, SVG, etc.)");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande. A imagem deve ter no máximo 5MB.");
      return;
    }

    await onLogoUpload(file);
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Logo do Projeto
        </CardTitle>
        <CardDescription>
          Adicione uma logo para aparecer nos slides (opcional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload / Preview da Logo */}
        {!logoUrl ? (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Nenhuma logo configurada
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Enviando..." : "Fazer Upload da Logo"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview da logo atual */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">Logo configurada</p>
                <p className="text-sm text-muted-foreground">
                  Aparecerá nos slides ao fazer download
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "..." : "Trocar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogoRemove}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Seletor de Posição */}
            <div className="space-y-3">
              <Label>Posição da Logo no Slide</Label>
              <div className="relative w-full aspect-[4/5] bg-muted rounded-lg overflow-hidden border max-w-xs mx-auto">
                {/* Grid de posições */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-3">
                  {(["top-left", "top-right", "bottom-left", "bottom-right"] as LogoPosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => onPositionChange(pos)}
                      className={`flex p-2 transition-colors rounded ${
                        pos.includes("top") ? "items-start" : "items-end"
                      } ${
                        pos.includes("left") ? "justify-start" : "justify-end"
                      } ${
                        position === pos ? "bg-primary/20" : "hover:bg-muted-foreground/10"
                      }`}
                    >
                      <div
                        className={`rounded border-2 transition-all overflow-hidden ${
                          position === pos ? "border-primary bg-white" : "border-muted-foreground/30 bg-white/50"
                        }`}
                        style={{
                          width: `${size * 2.5}px`,
                          minWidth: "24px",
                          aspectRatio: "1",
                        }}
                      >
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Clique para selecionar: <span className="font-medium">{POSITION_LABELS[position]}</span>
              </p>
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
              onClick={onSave} 
              className="w-full"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LogoPositionSelector;
