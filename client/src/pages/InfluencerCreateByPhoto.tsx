import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Upload, Image, X, Camera } from "lucide-react";
import { toast } from "sonner";

export default function InfluencerCreateByPhoto() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [type, setType] = useState<"normal" | "transformation">("normal");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = trpc.upload.image.useMutation();

  const createInfluencer = trpc.influencers.create.useMutation({
    onSuccess: (data) => {
      toast.success("Influenciador criado!");
      setLocation(`/influencer/${data.id}`);
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Digite um nome");
      return;
    }

    if (!photoPreview) {
      toast.error("Faça upload de uma foto de referência");
      return;
    }

    setIsUploading(true);
    try {
      // Upload the image first
      const { url } = await uploadImage.mutateAsync({
        base64: photoPreview,
        filename: `${name.replace(/\s+/g, '-').toLowerCase()}-reference.png`,
        contentType: "image/png",
      });

      // Create influencer with uploaded image URL
      createInfluencer.mutate({ 
        name, 
        niche, 
        type, 
        referenceImageUrl: url 
      });
    } catch (error) {
      toast.error("Erro ao fazer upload da imagem");
      setIsUploading(false);
    }
  };

  const isPending = isUploading || createInfluencer.isPending;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/influencer/new")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-2 font-medium">Criar por Foto</span>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Upload de Foto */}
        <Card className="border-dashed border-2">
          <CardContent className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {photoPreview ? (
              <div className="relative">
                <div className="aspect-square max-w-xs mx-auto rounded-xl overflow-hidden bg-muted">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Esta foto será usada como referência visual para gerar o influenciador
                </p>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center py-12 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Faça upload de uma foto</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Esta foto será usada como referência visual para a IA gerar imagens do influenciador
                </p>
                <Button variant="outline" className="mt-4">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Foto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do Influenciador */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Influenciador</Label>
            <Input 
              placeholder="Ex: Ana Silva" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Nicho</Label>
            <Input 
              placeholder="Ex: Fitness, Beleza, Finanças..." 
              value={niche} 
              onChange={(e) => setNiche(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Conteúdo</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="transformation">Transformação (Antes/Depois)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {type === "transformation" 
                ? "Ideal para nichos de emagrecimento, estética, etc."
                : "Conteúdo padrão de lifestyle e dicas"}
            </p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleCreate} 
          disabled={isPending || !photoPreview || !name.trim()}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {isUploading ? "Enviando foto..." : "Criando..."}
            </>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Criar Influenciador
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
