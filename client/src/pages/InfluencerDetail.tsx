import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ImageLightbox } from "@/components/ImageLightbox";
import { 
  ArrowLeft, Trash2, Loader2, User, ChevronRight, 
  Camera, Image, Download, RefreshCw, Maximize2, Pencil
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Package, Sparkles, Zap } from "lucide-react";

interface InfluencerContent {
  id: number;
  title: string | null;
  template: string;
  source: "produto" | "softsell" | "trend" | "viral" | "assunto" | null;
}

interface ProfilePhoto {
  type: string;
  url: string;
  prompt: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  suggestedApproaches: string[];
  selectedApproaches: string[];
}

function ProductsTab({ influencerId, influencerNiche }: { influencerId: number; influencerNiche: string }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [contextType, setContextType] = useState<'trend' | 'viral' | 'subject' | null>(null);
  const [selectedTrendId, setSelectedTrendId] = useState<number | null>(null);
  const [selectedViralId, setSelectedViralId] = useState<number | null>(null);
  const [freeSubject, setFreeSubject] = useState('');
  const [productForm, setProductForm] = useState({ name: "", description: "" });
  const [analyzingProduct, setAnalyzingProduct] = useState(false);
  const [suggestedApproaches, setSuggestedApproaches] = useState<string[]>([]);

  const { data: products = [], isLoading, error } = (trpc.influencers as any).products.listProducts.useQuery({
    influencerId,
  });

  // Garantir que products é sempre um array
  const safeProducts = Array.isArray(products) ? products : [];

  const { data: trends = [] } = trpc.trends.list.useQuery();
  const { data: virals = [] } = trpc.virals.list.useQuery();

  const utils = trpc.useUtils();

  const analyzeProduct = (trpc.influencers.products as any).analyzeProduct.useMutation({
    onSuccess: (data: { approaches: string[] }) => {
      setSuggestedApproaches(data.approaches);
      setAnalyzingProduct(false);
      toast.success(`${data.approaches.length} abordagens sugeridas!`);
    },
    onError: (e: any) => {
      toast.error("Erro ao analisar produto: " + e.message);
      setAnalyzingProduct(false);
    },
  });

  const createProduct = (trpc.influencers.products as any).createProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto adicionado!");
      (utils.influencers.products as any).listProducts.invalidate({ influencerId });
      setShowAddModal(false);
      setProductForm({ name: "", description: "" });
      setSuggestedApproaches([]);
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const updateProduct = (trpc.influencers.products as any).updateProduct.useMutation({
    onSuccess: () => {
      (utils.influencers.products as any).listProducts.invalidate({ influencerId });
    },
  });

  const deleteProduct = (trpc.influencers.products as any).deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto excluído com sucesso!");
      (utils.influencers as any).products.listProducts.invalidate({ influencerId });
    },
  });

  const generateContent = (trpc.influencers.products as any).generateContentWithProduct.useMutation({
    onSuccess: (data: any) => {
      console.log("Conteúdo gerado:", data);
      toast.success("Conteúdo gerado com sucesso!");
      setShowGenerateModal(false);
      // TODO: Navegar para página de edição do conteúdo
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar conteúdo: ${error.message}`);
    },
  });

  const handleGenerateContent = () => {
    if (!selectedProduct) return;

    generateContent.mutate({
      productId: selectedProduct.id,
      influencerId,
      contextType: contextType || 'none',
      trendId: selectedTrendId || undefined,
      viralId: selectedViralId || undefined,
      freeSubject: freeSubject || undefined,
    });
  };

  const handleAnalyze = () => {
    if (!productForm.name.trim() || !productForm.description.trim()) {
      toast.error("Preencha nome e descrição do produto");
      return;
    }
    setAnalyzingProduct(true);
    analyzeProduct.mutate({
      influencerId,
      name: productForm.name,
      description: productForm.description,
    });
  };

  const handleSaveProduct = () => {
    console.log('handleSaveProduct called', { productForm, suggestedApproaches });
    if (!productForm.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    console.log('About to call createProduct.mutate');
    createProduct.mutate({
      influencerId,
      name: productForm.name,
      description: productForm.description || undefined,
      suggestedApproaches,
      selectedApproaches: [], // Começam desmarcadas, usuário escolhe quais quer
    });
  };

  const toggleApproach = (productId: number, approach: string, product: Product) => {
    const isSelected = product.selectedApproaches.includes(approach);
    const newSelected = isSelected
      ? product.selectedApproaches.filter((a) => a !== approach)
      : [...product.selectedApproaches, approach];
    
    updateProduct.mutate({
      id: productId,
      selectedApproaches: newSelected,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Button className="w-full" onClick={() => setShowAddModal(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Produto
      </Button>

      {safeProducts.length > 0 ? (
        <div className="space-y-4">
          {safeProducts.map((product: Product) => (
            <Card key={product.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <h3 className="font-medium">{product.name}</h3>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => {
                      if (confirm("Excluir produto?")) {
                        deleteProduct.mutate({ id: product.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {product.suggestedApproaches && product.suggestedApproaches.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Abordagens de Venda:</div>
                    {product.suggestedApproaches.map((approach, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Checkbox
                          checked={product.selectedApproaches?.includes(approach) || false}
                          onCheckedChange={() => toggleApproach(product.id, approach, product)}
                          className="mt-1"
                        />
                        <span className="text-sm flex-1">{approach}</span>
                      </div>
                    ))}
                  </div>
                )}

                {product.selectedApproaches && product.selectedApproaches.length > 0 && (
                  <Button
                    className="w-full mt-2"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowGenerateModal(true);
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Conteúdo ({product.selectedApproaches.length} abordagens)
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum produto cadastrado</p>
          <p className="text-sm">Adicione produtos para gerar conteúdo de divulgação</p>
        </div>
      )}

      {/* Modal Adicionar Produto */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Nome do Produto *</Label>
              <Input
                id="product-name"
                placeholder="Ex: Whey Protein Premium"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="product-desc">Descrição do Produto *</Label>
              <Textarea
                id="product-desc"
                placeholder="Descreva o produto, benefícios, diferenciais..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={4}
              />
            </div>

            {suggestedApproaches.length === 0 ? (
              <Button
                className="w-full"
                onClick={handleAnalyze}
                disabled={analyzingProduct}
              >
                {analyzingProduct ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {analyzingProduct ? "Analisando..." : "Analisar e Sugerir Abordagens"}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-medium text-green-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {suggestedApproaches.length} abordagens sugeridas pela IA:
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {suggestedApproaches.map((approach, idx) => (
                    <div key={idx} className="text-sm p-2 bg-muted rounded">
                      {idx + 1}. {approach}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setProductForm({ name: "", description: "" });
                setSuggestedApproaches([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={createProduct.isPending || suggestedApproaches.length === 0}
            >
              {createProduct.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Salvar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Gerar Conteúdo */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerar Conteúdo com Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="font-medium">{selectedProduct.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                <div className="mt-3">
                  <span className="text-sm font-medium">Abordagens selecionadas:</span>
                  <ul className="mt-1 space-y-1">
                    {selectedProduct.selectedApproaches.map((approach, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{approach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Conectar com: (opcional)</Label>
                <p className="text-sm text-muted-foreground">Escolha uma opção para combinar a abordagem de venda com um contexto</p>
                
                <Tabs value={contextType || 'none'} onValueChange={(v) => setContextType(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="none">Nenhum</TabsTrigger>
                    <TabsTrigger value="trend">🔥 Trend</TabsTrigger>
                    <TabsTrigger value="viral">🎬 Viral</TabsTrigger>
                    <TabsTrigger value="subject">💬 Assunto</TabsTrigger>
                  </TabsList>
                  <TabsContent value="none" className="mt-4">
                    <p className="text-sm text-muted-foreground text-center py-4">Gerar conteúdo apenas com as abordagens do produto</p>
                  </TabsContent>
                  <TabsContent value="trend" className="mt-4">
                    {trends.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {trends.map((trend: any) => (
                          <div
                            key={trend.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                              selectedTrendId === trend.id ? 'border-primary bg-muted' : ''
                            }`}
                            onClick={() => setSelectedTrendId(trend.id)}
                          >
                            <div className="font-medium text-sm">{trend.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{trend.source}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma trend disponível</p>
                    )}
                  </TabsContent>
                  <TabsContent value="viral" className="mt-4">
                    {virals.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {virals.map((viral: any) => (
                          <div
                            key={viral.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                              selectedViralId === viral.id ? 'border-primary bg-muted' : ''
                            }`}
                            onClick={() => setSelectedViralId(viral.id)}
                          >
                            <div className="font-medium text-sm">{viral.title}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{viral.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum viral disponível</p>
                    )}
                  </TabsContent>
                  <TabsContent value="subject" className="mt-4">
                    <Textarea
                      placeholder="Digite um assunto ou tema para conectar com o produto...\nEx: Viagem de férias, economia de combustível, segurança no trânsito"
                      value={freeSubject}
                      onChange={(e) => setFreeSubject(e.target.value)}
                      rows={4}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateContent} disabled={generateContent.isPending}>
              {generateContent.isPending ? "Gerando..." : "Gerar Conteúdo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function InfluencerDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const influencerId = parseInt(id || "0");
  const [profilePhotos, setProfilePhotos] = useState<ProfilePhoto[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ProfilePhoto | null>(null);
  const [showEditNicheModal, setShowEditNicheModal] = useState(false);
  const [editNicheForm, setEditNicheForm] = useState({ niche: "" });

  const { data: influencer, isLoading } = trpc.influencers.get.useQuery({ id: influencerId });

  const utils = trpc.useUtils();

  useEffect(() => {
    if (showEditNicheModal && influencer) {
      setEditNicheForm({ niche: influencer.niche || "" });
    }
  }, [showEditNicheModal, influencer]);

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

  const updateInfluencer = (trpc.influencers as any).update.useMutation({
    onSuccess: () => {
      toast.success("Influenciador atualizado!");
      utils.influencers.get.invalidate({ id: influencerId });
      setShowEditNicheModal(false);
    },
  });

  const deleteContentMutation = trpc.influencers.deleteContent.useMutation({
    onSuccess: () => {
      toast.success("Conteúdo excluído com sucesso!");
      utils.influencers.get.invalidate({ id: influencerId });
    },
    onError: (e) => {
      toast.error("Erro ao excluir conteúdo: " + e.message);
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{influencer.name}</h1>
              {influencer.niche && (
                <Badge variant="secondary" className="text-xs">
                  {influencer.niche}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setShowEditNicheModal(true)}
              >
                <Pencil className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground capitalize">{influencer.type}</p>
          </div>
        </div>

        {/* Header de Conteúdos */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conteúdos</h2>
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setLocation(`/influencer/${influencerId}/express`)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Modo Express
            </Button>
            <Button 
              size="sm"
              onClick={() => setLocation(`/influencer/${influencerId}/content/new`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Gerar Novo Conteúdo
            </Button>
          </div>
        </div>

        {/* Lista de Conteúdos */}
        <div className="space-y-2">
            {contents.length > 0 ? (
              contents.map((content: InfluencerContent & { preview?: string }) => (
                <Card key={content.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/influencer/${influencerId}/content/${content.id}`} className="flex-1 cursor-pointer min-w-0">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="text-sm font-medium line-clamp-1">{content.title || "Sem título"}</div>
                            {content.source && (
                              <Badge 
                                variant="secondary" 
                                className={`text-[10px] px-1.5 py-0 h-4 ${
                                  content.source === 'produto' ? 'bg-purple-100 text-purple-700' :
                                  content.source === 'softsell' ? 'bg-blue-100 text-blue-700' :
                                  content.source === 'trend' ? 'bg-green-100 text-green-700' :
                                  content.source === 'viral' ? 'bg-orange-100 text-orange-700' :
                                  content.source === 'assunto' ? 'bg-cyan-100 text-cyan-700' :
                                  ''
                                }`}
                              >
                                {content.source === 'produto' ? 'Produto' :
                                 content.source === 'softsell' ? 'Soft Sell' :
                                 content.source === 'trend' ? 'Trend' :
                                 content.source === 'viral' ? 'Viral' :
                                 content.source === 'assunto' ? 'Assunto' :
                                 content.source}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{content.template}</div>
                          {content.preview && (
                            <div className="text-[10px] text-muted-foreground/70 italic line-clamp-1">
                              "{content.preview}..."
                            </div>
                          )}
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Tem certeza que deseja excluir este conteúdo?')) {
                            deleteContentMutation.mutate({ id: content.id });
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum conteúdo ainda</p>
              </div>
            )}

        </div>
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

      {/* Modal de Edição de Nicho */}
      <Dialog open={showEditNicheModal} onOpenChange={setShowEditNicheModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nicho do Influenciador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="niche">Nicho</Label>
              <Input
                id="niche"
                placeholder="Ex: Fitness, Culinária, Tecnologia..."
                value={editNicheForm.niche}
                onChange={(e) => setEditNicheForm({ niche: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditNicheModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                updateInfluencer.mutate({
                  id: influencerId,
                  niche: editNicheForm.niche || undefined,
                });
              }}
              disabled={updateInfluencer.isPending}
            >
              {updateInfluencer.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
