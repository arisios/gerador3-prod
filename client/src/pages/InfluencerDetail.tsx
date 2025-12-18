import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ImageLightbox } from "@/components/ImageLightbox";
import { 
  ArrowLeft, Trash2, Loader2, User, ChevronRight, Zap, 
  Camera, Image, Download, RefreshCw, Maximize2
} from "lucide-react";
import { toast } from "sonner";

interface InfluencerContent {
  id: number;
  title: string | null;
  template: string;
}

interface ProfilePhoto {
  type: string;
  url: string;
  prompt: string;
}

export default function InfluencerDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const influencerId = parseInt(id || "0");
  const [profilePhotos, setProfilePhotos] = useState<ProfilePhoto[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ProfilePhoto | null>(null);

  const { data: influencer, isLoading } = trpc.influencers.get.useQuery({ id: influencerId });

  const generateProfilePhotos = trpc.influencers.generateProfilePhotos.useMutation({
    onSuccess: (data) => {
      setProfilePhotos(data.photos);
      toast.success(`${data.photos.length} fotos de perfil geradas!`);
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const deleteInfluencer = trpc.influencers.delete.useMutation({
    onSuccess: () => {
      toast.success("Influenciador excluído");
      setLocation("/influencers");
    },
  });

  const handleOpenLightbox = (photo: ProfilePhoto) => {
    setLightboxPhoto(photo);
    setLightboxOpen(true);
  };

  const handleDownloadPhoto = async (url: string, type: string) => {
    try {
      const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${influencer?.name || "influencer"}_${type}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download iniciado!");
    } catch (e) {
      toast.error("Erro ao baixar imagem");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Influenciador não encontrado</p>
      </div>
    );
  }

  const contents = (influencer.contents || []) as InfluencerContent[];

  const getPhotoTypeLabel = (type: string) => {
    switch (type) {
      case "profile": return "Foto de Perfil";
      case "lifestyle": return "Lifestyle";
      case "action": return "Ação";
      case "before": return "Antes";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/influencers")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-medium truncate">{influencer.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => {
              if (confirm("Excluir influenciador?")) {
                deleteInfluencer.mutate({ id: influencerId });
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Profile */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted overflow-hidden">
            {influencer.referenceImageUrl ? (
              <img src={influencer.referenceImageUrl} alt={influencer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{influencer.name}</h1>
            <p className="text-muted-foreground">{influencer.niche}</p>
            <p className="text-sm text-muted-foreground capitalize">{influencer.type}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contents">
          <TabsList className="w-full">
            <TabsTrigger value="contents" className="flex-1">Conteúdos</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1">Fotos de Perfil</TabsTrigger>
          </TabsList>

          {/* Contents Tab */}
          <TabsContent value="contents" className="space-y-4 mt-4">
            {/* Actions */}
            <Button className="w-full" onClick={() => setLocation(`/influencer/${influencerId}/content/new`)}>
              <Zap className="w-4 h-4 mr-2" />
              Gerar Conteúdo
            </Button>

            {contents.length > 0 ? (
              contents.map((content: InfluencerContent) => (
                <Link key={content.id} href={`/influencer/${influencerId}/content/${content.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{content.title || "Sem título"}</div>
                        <div className="text-xs text-muted-foreground">{content.template}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum conteúdo ainda</p>
              </div>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4 mt-4">
            {/* Generate Button */}
            <Button 
              className="w-full" 
              onClick={() => generateProfilePhotos.mutate({ influencerId })}
              disabled={generateProfilePhotos.isPending || !influencer.referenceImageUrl}
            >
              {generateProfilePhotos.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              {profilePhotos.length > 0 ? "Regenerar Fotos de Perfil" : "Gerar Fotos de Perfil"}
            </Button>

            {!influencer.referenceImageUrl && (
              <p className="text-sm text-muted-foreground text-center">
                O influenciador precisa ter uma foto de referência para gerar fotos de perfil.
              </p>
            )}

            {/* Photo Grid */}
            {profilePhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {profilePhotos.map((photo, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div 
                      className="aspect-square relative cursor-pointer group"
                      onClick={() => handleOpenLightbox(photo)}
                    >
                      <img 
                        src={photo.url} 
                        alt={getPhotoTypeLabel(photo.type)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{getPhotoTypeLabel(photo.type)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPhoto(photo.url, photo.type);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma foto de perfil gerada</p>
                <p className="text-sm">Clique no botão acima para gerar</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Lightbox */}
      {lightboxPhoto && (
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageUrl={lightboxPhoto.url}
          prompt={lightboxPhoto.prompt}
          onRegenerate={async () => {
            setLightboxOpen(false);
            generateProfilePhotos.mutate({ influencerId });
          }}
          showPrompt={true}
        />
      )}
    </div>
  );
}
