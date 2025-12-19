import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CloudUpload, Loader2, Check, Images } from "lucide-react";
import { useLocation } from "wouter";

interface UploadButtonProps {
  onUpload?: (file: File, base64: string) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  variant?: "default" | "compact" | "inline";
  showGalleryLink?: boolean;
  className?: string;
}

export function UploadButton({
  onUpload,
  accept = "image/*,video/*",
  multiple = false,
  variant = "default",
  showGalleryLink = true,
  className = "",
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file);
        if (onUpload) {
          await onUpload(file, base64);
        }
      }
      toast.success("Upload concluído!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload");
    }
    
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-1"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CloudUpload className="h-4 w-4" />
          )}
          Upload
        </Button>
        <Badge variant="secondary" className="text-xs">
          <Check className="h-3 w-3 mr-1" />
          0 créditos
        </Badge>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Upload (0 créditos)"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CloudUpload className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Default variant - destacado
  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CloudUpload className="h-5 w-5" />
          )}
          Upload Gratuito
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
            0 créditos
          </Badge>
        </Button>
        
        {showGalleryLink && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation("/media")}
            className="gap-2"
          >
            <Images className="h-5 w-5" />
            Galeria
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Use suas próprias imagens e vídeos sem gastar créditos
      </p>
    </div>
  );
}

// Componente de indicador de custo
interface CostIndicatorProps {
  type: "upload" | "generate";
  credits?: number;
  provider?: string;
}

export function CostIndicator({ type, credits = 0, provider }: CostIndicatorProps) {
  if (type === "upload") {
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
        <Check className="h-3 w-3 mr-1" />
        Upload gratuito
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      {credits} crédito{credits !== 1 ? "s" : ""}
      {provider && <span className="ml-1 opacity-70">({provider})</span>}
    </Badge>
  );
}

export default UploadButton;
