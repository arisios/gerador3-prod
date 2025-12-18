import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Download, Trash2, RefreshCw, Loader2, Copy, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt?: string;
  onRegenerate?: (newPrompt: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onUpload?: (file: File) => Promise<void>;
  title?: string;
  showPrompt?: boolean;
}

export function ImageLightbox({
  isOpen,
  onClose,
  imageUrl,
  prompt = "",
  onRegenerate,
  onDelete,
  onUpload,
  title = "Imagem",
  showPrompt = true,
}: ImageLightboxProps) {
  const [currentPrompt, setCurrentPrompt] = useState(prompt);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentPrompt(prompt);
  }, [prompt]);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download iniciado!");
    } catch (error) {
      toast.error("Erro ao baixar imagem");
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    if (!currentPrompt.trim()) {
      toast.error("Digite um prompt para gerar a imagem");
      return;
    }
    setIsRegenerating(true);
    try {
      await onRegenerate(currentPrompt);
      toast.success("Imagem regenerada!");
    } catch (error) {
      toast.error("Erro ao regenerar imagem");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
      toast.success("Imagem excluída!");
    } catch (error) {
      toast.error("Erro ao excluir imagem");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt);
    toast.success("Prompt copiado!");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      toast.success("Imagem enviada!");
    } catch (error) {
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Imagem em tela cheia */}
          <div className="relative bg-black/50 rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-auto max-h-[50vh] object-contain mx-auto"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center text-muted-foreground">
                <span>Nenhuma imagem gerada</span>
              </div>
            )}
          </div>

          {/* Prompt - SEMPRE VISÍVEL E EDITÁVEL */}
          {showPrompt && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Prompt (orientação para a imagem)
                </Label>
                {currentPrompt && (
                  <Button variant="ghost" size="sm" onClick={handleCopyPrompt}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                )}
              </div>
              
              <Textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                rows={3}
                placeholder="Descreva a imagem que deseja gerar..."
                className="resize-none"
              />
              
              <p className="text-xs text-muted-foreground">
                💡 Use este prompt como referência para upload de imagem própria ou edite para regenerar
              </p>
            </div>
          )}

          {/* Ações Principais */}
          <div className="grid grid-cols-2 gap-3">
            {/* Gerar com IA */}
            {onRegenerate && (
              <Button
                onClick={handleRegenerate}
                disabled={isRegenerating || !currentPrompt.trim()}
                className="w-full"
              >
                {isRegenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {imageUrl ? "Regenerar" : "Gerar"} com IA
              </Button>
            )}

            {/* Upload */}
            {onUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Fazer Upload
                </Button>
              </>
            )}
          </div>

          {/* Ações Secundárias */}
          {imageUrl && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>

              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive hover:text-destructive"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Excluir
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageLightbox;
