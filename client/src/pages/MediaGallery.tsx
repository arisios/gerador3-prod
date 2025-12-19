import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Search, 
  Trash2, 
  Download, 
  Sparkles,
  CloudUpload,
  X,
  Check,
  Loader2,
  Copy,
  Edit3
} from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";

interface MediaItem {
  id: number;
  type: "image" | "video";
  source: "upload" | "generated";
  url: string;
  filename: string | null;
  prompt: string | null;
  provider: string | null;
  createdAt: Date;
}

export default function MediaGallery() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "upload" | "generated">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // @ts-ignore - tipos serão regenerados
  const utils = trpc.useUtils();

  // Query para listar mídia
  // @ts-ignore
  const { data: mediaList = [], isLoading } = trpc.media.list.useQuery({
    type: activeTab === "all" ? undefined : activeTab === "images" ? "image" : "video",
    source: sourceFilter === "all" ? undefined : sourceFilter,
    limit: 100,
  });

  // Query para contagem
  // @ts-ignore
  const { data: imageCount = 0 } = trpc.media.count.useQuery({ type: "image" });
  // @ts-ignore
  const { data: videoCount = 0 } = trpc.media.count.useQuery({ type: "video" });

  // Mutation para upload
  // @ts-ignore
  const uploadMutation = trpc.media.upload.useMutation({
    onSuccess: () => {
      toast.success("Mídia enviada com sucesso!");
      // @ts-ignore
      utils.media.list.invalidate();
      // @ts-ignore
      utils.media.count.invalidate();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    },
  });

  // Mutation para excluir
  // @ts-ignore
  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      toast.success("Mídia excluída!");
      // @ts-ignore
      utils.media.list.invalidate();
      // @ts-ignore
      utils.media.count.invalidate();
      setSelectedMedia(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        const base64 = await fileToBase64(file);
        const type = file.type.startsWith("video/") ? "video" : "image";
        
        await uploadMutation.mutateAsync({
          base64,
          filename: file.name,
          type,
          mimeType: file.type,
        });
      } catch (error) {
        console.error("Erro ao fazer upload:", error);
      }
    }
    
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleDownload = async (media: MediaItem) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = media.filename || `media-${media.id}.${media.type === "image" ? "png" : "mp4"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erro ao baixar mídia");
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  };

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
    // Se for imagem gerada, abre o ImageLightbox com prompt
    if (media.type === "image" && media.source === "generated") {
      setShowImageLightbox(true);
    }
  };

  const handleRegenerateFromGallery = async (newPrompt: string) => {
    // TODO: Implementar regeneração usando o sistema de créditos
    toast.info("Funcionalidade de regeneração em desenvolvimento");
  };

  const filteredMedia = searchQuery
    ? mediaList.filter((m: MediaItem) => 
        m.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mediaList;

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl py-6 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Galeria de Mídia</h1>
            <p className="text-muted-foreground mt-1">
              {imageCount} imagens • {videoCount} vídeos
            </p>
          </div>
          
          {/* Botão de Upload Destacado */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CloudUpload className="h-5 w-5" />
              )}
              Upload Gratuito
            </Button>
          </div>
        </div>

        {/* Indicador de Custo */}
        <Card className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Upload = 0 créditos</p>
                <p className="text-sm text-muted-foreground">
                  Use suas próprias imagens e vídeos sem gastar créditos. Imagens já geradas também podem ser reutilizadas gratuitamente!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={sourceFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSourceFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={sourceFilter === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setSourceFilter("upload")}
              className="gap-1"
            >
              <Upload className="h-4 w-4" />
              Uploads
            </Button>
            <Button
              variant={sourceFilter === "generated" ? "default" : "outline"}
              size="sm"
              onClick={() => setSourceFilter("generated")}
              className="gap-1"
            >
              <Sparkles className="h-4 w-4" />
              Geradas
            </Button>
          </div>
        </div>

        {/* Tabs de Tipo */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="gap-2">
              Todas
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Imagens ({imageCount})
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Vídeos ({videoCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Nenhuma mídia encontrada</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Faça upload de imagens e vídeos para usar em seus conteúdos
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredMedia.map((media: MediaItem) => (
                  <div
                    key={media.id}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => handleMediaClick(media as MediaItem)}
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={media.filename || "Mídia"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                    
                    {/* Badge de fonte */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant={media.source === "generated" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {media.source === "generated" ? (
                          <><Sparkles className="h-3 w-3 mr-1" /> IA</>
                        ) : (
                          <><Upload className="h-3 w-3 mr-1" /> Upload</>
                        )}
                      </Badge>
                    </div>

                    {/* Badge de tipo para vídeos */}
                    {media.type === "video" && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-black/50 text-white border-0">
                          <Video className="h-3 w-3" />
                        </Badge>
                      </div>
                    )}

                    {/* Overlay no hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        {media.source === "generated" ? (
                          <Edit3 className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Detalhes */}
        <Dialog open={!!selectedMedia && !showImageLightbox} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedMedia?.source === "generated" ? (
                  <>
                    <Sparkles className="h-5 w-5 text-primary" />
                    Imagem Gerada por IA
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    {selectedMedia?.filename || "Mídia Enviada"}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedMedia && (
              <div className="space-y-4">
                {/* Preview */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {selectedMedia.type === "image" ? (
                    <img
                      src={selectedMedia.url}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={selectedMedia.url}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>

                {/* Prompt (se for gerada) */}
                {selectedMedia.source === "generated" && selectedMedia.prompt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prompt usado:</label>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {selectedMedia.prompt}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Clique em "Editar Prompt" para regenerar com alterações
                    </p>
                  </div>
                )}

                {/* Informações */}
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {selectedMedia.provider && (
                    <Badge variant="outline">Provider: {selectedMedia.provider}</Badge>
                  )}
                  <Badge variant="outline">
                    {new Date(selectedMedia.createdAt).toLocaleDateString("pt-BR")}
                  </Badge>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                onClick={() => {
                  if (selectedMedia) {
                    navigator.clipboard.writeText(selectedMedia.url);
                    toast.success("URL copiada! Cole no campo de imagem do seu conteúdo.");
                    setSelectedMedia(null);
                  }
                }}
                className="gap-2 bg-primary"
              >
                <Check className="h-4 w-4" />
                Usar esta imagem
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedMedia && handleCopyUrl(selectedMedia.url)}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar URL
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedMedia && handleDownload(selectedMedia)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
              {selectedMedia?.source === "generated" && (
                <Button variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Editar Prompt
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => selectedMedia && deleteMutation.mutate({ id: selectedMedia.id })}
                disabled={deleteMutation.isPending}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ImageLightbox para imagens geradas */}
        {selectedMedia && selectedMedia.type === "image" && selectedMedia.source === "generated" && (
          <ImageLightbox
            isOpen={showImageLightbox}
            onClose={() => {
              setShowImageLightbox(false);
              setSelectedMedia(null);
            }}
            imageUrl={selectedMedia.url}
            prompt={selectedMedia.prompt || ""}
            onRegenerate={handleRegenerateFromGallery}
            onDelete={async () => {
              await deleteMutation.mutateAsync({ id: selectedMedia.id });
              setShowImageLightbox(false);
            }}
            title="Imagem da Galeria"
            showPrompt={true}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
