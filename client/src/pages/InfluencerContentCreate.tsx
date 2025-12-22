import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Zap, TrendingUp, Flame, Target, Plus, Minus, RefreshCw, Search, Settings } from "lucide-react";
import { toast } from "sonner";
import { ProductDetailModal } from "@/components/ProductDetailModal";

const SOFT_SELL_TEMPLATES = [
  { id: "testemunho", name: "Testemunho Pessoal" },
  { id: "rotina", name: "Rotina do Dia" },
  { id: "antes-depois", name: "Antes e Depois" },
  { id: "dica-rapida", name: "Dica Rápida" },
  { id: "bastidores", name: "Bastidores" },
  { id: "desafio", name: "Desafio" },
  { id: "recomendacao", name: "Recomendação Sutil" },
  { id: "historia", name: "História Pessoal" },
];

const CAROUSEL_TEMPLATES = [
  { id: "antes-depois", name: "Antes e Depois" },
  { id: "storytelling", name: "Storytelling" },
  { id: "lista", name: "Lista/Dicas" },
  { id: "passo-a-passo", name: "Passo a Passo" },
  { id: "mitos-verdades", name: "Mitos e Verdades" },
  { id: "problema-solucao", name: "Problema e Solução" },
];

interface SelectedItem {
  id: string | number;
  name: string;
  template: string;
  quantity: number;
  type?: 'trend' | 'viral' | 'subject';
  data?: any; // Dados completos do item (trend, viral ou notícia)
}

export default function InfluencerContentCreate() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const influencerId = parseInt(id || "0");

  // Detectar tipo da URL (?type=trend, ?type=viral, ?type=subject)
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const typeParam = urlParams.get('type');
  const initialMode = 
    typeParam === 'trend' ? 'trends' :
    typeParam === 'viral' ? 'virals' :
    typeParam === 'subject' ? 'assuntos' :
    'produtos';

  const [mode, setMode] = useState<"produtos" | "dores" | "trends" | "virais" | "assuntos">(initialMode);
  const [template, setTemplate] = useState("");
  const [product, setProduct] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estados do modal de novo produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductIdealClient, setNewProductIdealClient] = useState("");
  const [newProductPains, setNewProductPains] = useState("");
  const [newProductApproaches, setNewProductApproaches] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedProductForModal, setSelectedProductForModal] = useState<any>(null);
  const [selectedContextId, setSelectedContextId] = useState<number | null>(null);
  const [selectedContextType, setSelectedContextType] = useState<'trend' | 'viral' | 'subject' | null>(null);
  const [influencerContentType, setInfluencerContentType] = useState<'carousel' | 'image' | 'video' | null>(null);
  const [influencerCopyTemplate, setInfluencerCopyTemplate] = useState<string | null>(null);
  
  // Estados da aba Assuntos
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Atualizar mode quando URL mudar
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const typeParam = urlParams.get('type');
    const newMode = 
      typeParam === 'trend' ? 'trends' :
      typeParam === 'viral' ? 'virais' :
      typeParam === 'subject' ? 'assuntos' :
      'produtos';
    setMode(newMode as typeof mode);
  }, [location]);

  const utils = trpc.useUtils();
  const { data: influencer } = trpc.influencers.get.useQuery({ id: influencerId });
  const { data: products } = trpc.influencers.products.listProducts.useQuery({ influencerId });
  const { data: trends } = trpc.trends.list.useQuery();
  const { data: virals } = trpc.virals.list.useQuery();

  const createProductMutation = trpc.influencers.products.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      utils.influencers.products.listProducts.invalidate({ influencerId });
      setIsProductModalOpen(false);
      setNewProductName("");
      setNewProductDescription("");
      setNewProductIdealClient("");
      setNewProductPains("");
      setNewProductApproaches("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar produto");
    },
  });

  const collectViralsMutation = trpc.virals.collect.useMutation({
    onSuccess: () => {
      toast.success("Virais coletados com sucesso!");
      utils.virals.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao coletar virais");
    },
  });

  const searchSubjectsMutation = trpc.subjects.search.useMutation({
    onSuccess: (data) => {
      setSearchResults(data.news || []);
      if (data.count === 0) {
        toast.info("Nenhuma notícia encontrada");
      } else {
        toast.success(`${data.count} notícias encontradas!`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao buscar notícias");
    },
  });

  const handleCreateProduct = () => {
    if (!newProductName.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    
    const approaches = newProductApproaches
      .split('\n')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const pains = newProductPains
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    createProductMutation.mutate({
      influencerId,
      name: newProductName,
      description: newProductDescription || undefined,
      idealClient: newProductIdealClient || undefined,
      pains: pains.length > 0 ? pains : undefined,
      suggestedApproaches: approaches.length > 0 ? approaches : undefined,
    });
  };

  const generateContent = trpc.influencers.generateContent.useMutation({
    onSuccess: (data) => {
      toast.success("Conteúdo gerado!");
      setLocation(`/influencer/${influencerId}/content/${data.contentId}`);
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const generateContentWithProductMutation = trpc.influencers.products.generateContentWithProduct.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      toast.success("Conteúdo gerado com sucesso!");
      setLocation(`/influencer/${influencerId}/content/${data.contentId}`);
    },
    onError: (e) => {
      setIsGenerating(false);
      toast.error("Erro ao gerar conteúdo: " + e.message);
    },
  });

  const handleGenerate = () => {
    console.log("[DEBUG] handleGenerate called", { selectedProductIds, selectedContextId, selectedContextType });
    // Validação A+B: 1 produto + 1 contexto (trend/viral/assunto)
    if (selectedProductIds.length === 0) {
      toast.error("Selecione pelo menos 1 produto (Grupo A)");
      return;
    }
    if (selectedProductIds.length > 1) {
      toast.error("Selecione apenas 1 produto por vez");
      return;
    }
    if (!selectedContextId || !selectedContextType) {
      toast.error("Selecione 1 trend/viral/assunto (Grupo B)");
      return;
    }

    // Buscar produto selecionado
    const selectedProduct = products?.find(p => p.id === selectedProductIds[0]);
    if (!selectedProduct) {
      toast.error("Produto não encontrado");
      return;
    }

    // Preparar payload
    const payload: any = {
      productId: selectedProduct.id,
      influencerId,
      contextType: selectedContextType === 'subject' ? 'none' : selectedContextType,
    };

    if (selectedContextType === 'trend') {
      payload.trendId = selectedContextId;
    } else if (selectedContextType === 'viral') {
      payload.viralId = selectedContextId;
    } else if (selectedContextType === 'subject') {
      // Para assuntos, passar como freeSubject
      const subject = searchResults.find(s => s.id === selectedContextId);
      if (subject) {
        payload.contextType = 'subject';
        payload.freeSubject = `${subject.title} - ${subject.description}`;
      }
    }

    setIsGenerating(true);
    generateContentWithProductMutation.mutate(payload);
  };

  const generateMultipleContents = async () => {
    console.log("[DEBUG] generateMultipleContents started");
    for (const item of selectedItems) {
      console.log("[DEBUG] Processing item:", item);
      for (let i = 0; i < item.quantity; i++) {
        try {
          const payload: any = {
            influencerId,
            template: item.template,
          };

          // Se tem tipo (trend/viral/subject), adicionar ao payload
          if (item.type) {
            payload.type = item.type;
            
            // Para assuntos, passar dados da notícia como product
            if (item.type === 'subject' && item.data) {
              payload.product = `NOTÍCIA: ${item.data.title}\n\nDESCRIÇÃO: ${item.data.description}\n\nFONTE: ${item.data.source}\n\nCATEGORIA: ${item.data.category}`;
            } else {
              payload.product = item.name;
            }
          } else {
            // Produtos e dores tradicionais
            payload.product = item.name;
          }

          console.log("[DEBUG] Calling mutateAsync with:", payload);
          const result = await generateContent.mutateAsync(payload);
          console.log("[DEBUG] mutateAsync result:", result);
        } catch (e) {
          console.error("[DEBUG] Erro ao gerar conteúdo", e);
        }
      }
    }
    console.log("[DEBUG] All contents generated");
    setIsGenerating(false);
    toast.success(`${selectedItems.reduce((acc, item) => acc + item.quantity, 0)} conteúdos gerados!`);
    setLocation(`/influencer/${influencerId}`);
  };

  const toggleItem = (id: string | number, name: string) => {
    const exists = selectedItems.find(item => item.id === id);
    if (exists) {
      setSelectedItems(selectedItems.filter(item => item.id !== id));
    } else {
      setSelectedItems([...selectedItems, { id, name, template: "storytelling", quantity: 1 }]);
    }
  };

  const toggleItemWithType = (id: string | number, name: string, type: 'trend' | 'viral' | 'subject', data: any) => {
    const exists = selectedItems.find(item => item.id === id);
    if (exists) {
      setSelectedItems(selectedItems.filter(item => item.id !== id));
    } else {
      setSelectedItems([...selectedItems, { id, name, template: "storytelling", quantity: 1, type, data }]);
    }
  };

  const updateItemTemplate = (id: number, template: string) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, template } : item
    ));
  };

  const updateItemQuantity = (id: number, delta: number) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const isItemSelected = (id: number) => selectedItems.some(item => item.id === id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation(`/influencer/${influencerId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-2 font-medium">Gerar Conteúdo - {influencer?.name}</span>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Botão Gerar Conteúdo - Sempre visível no topo */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleGenerate} 
          disabled={generateContentWithProductMutation.isPending || isGenerating}
        >
          {(generateContentWithProductMutation.isPending || isGenerating) ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          {selectedProductIds.length === 0 && selectedContextId === null
            ? "Selecione Produto OU Trend/Viral/Assunto"
            : influencerContentType === null
            ? "Escolha o Tipo de Conteúdo"
            : influencerCopyTemplate === null
            ? "Escolha o Template"
            : "Gerar Conteúdo"
          }
        </Button>

        {/* Seleção de Tipo de Conteúdo */}
        {(selectedProductIds.length > 0 || selectedContextId !== null) && (
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo de Conteúdo</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={influencerContentType === 'carousel' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => {
                    setInfluencerContentType('carousel');
                    setInfluencerCopyTemplate(null);
                  }}
                >
                  <span className="text-2xl">📱</span>
                  <span className="text-xs">Carrossel</span>
                </Button>
                <Button
                  variant={influencerContentType === 'image' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => {
                    setInfluencerContentType('image');
                    setInfluencerCopyTemplate(null);
                  }}
                >
                  <span className="text-2xl">🖼️</span>
                  <span className="text-xs">Imagem Única</span>
                </Button>
                <Button
                  variant={influencerContentType === 'video' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => {
                    setInfluencerContentType('video');
                    setInfluencerCopyTemplate(null);
                  }}
                >
                  <span className="text-2xl">🎬</span>
                  <span className="text-xs">Vídeo</span>
                </Button>
              </div>
            </div>

            {/* Seleção de Template */}
            {influencerContentType && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Template</Label>
                <div className="grid grid-cols-2 gap-2">
                  {influencerContentType === 'carousel' && CAROUSEL_TEMPLATES.map(t => (
                    <Button
                      key={t.id}
                      variant={influencerCopyTemplate === t.id ? 'default' : 'outline'}
                      className="text-xs h-auto py-2"
                      onClick={() => setInfluencerCopyTemplate(t.id)}
                    >
                      {t.name}
                    </Button>
                  ))}
                  {influencerContentType === 'image' && SOFT_SELL_TEMPLATES.map(t => (
                    <Button
                      key={t.id}
                      variant={influencerCopyTemplate === t.id ? 'default' : 'outline'}
                      className="text-xs h-auto py-2"
                      onClick={() => setInfluencerCopyTemplate(t.id)}
                    >
                      {t.name}
                    </Button>
                  ))}
                  {influencerContentType === 'video' && (
                    <div className="col-span-2 text-center text-sm text-muted-foreground py-4">
                      Templates de vídeo em breve
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode Selection */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="produtos" className="text-xs">Produtos</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
            <TabsTrigger value="virais" className="text-xs">Virais</TabsTrigger>
            <TabsTrigger value="assuntos" className="text-xs">Assuntos</TabsTrigger>
          </TabsList>

          {/* Produtos Tab */}
          <TabsContent value="produtos" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Selecione produtos para gerar conteúdo
              </p>
              <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Produto</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Nome do Produto *</Label>
                      <Input
                        id="product-name"
                        placeholder="Ex: Curso de Marketing Digital"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-description">Descrição</Label>
                      <Textarea
                        id="product-description"
                        placeholder="Descreva o produto..."
                        value={newProductDescription}
                        onChange={(e) => setNewProductDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-ideal-client">Cliente Ideal</Label>
                      <Input
                        id="product-ideal-client"
                        placeholder="Ex: Empreendedores que querem escalar negócios"
                        value={newProductIdealClient}
                        onChange={(e) => setNewProductIdealClient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-pains">Dores do Cliente (uma por linha)</Label>
                      <Textarea
                        id="product-pains"
                        placeholder="Ex:\nNão consegue atrair clientes\nFalta de tempo para marketing\nDificuldade em converter vendas"
                        value={newProductPains}
                        onChange={(e) => setNewProductPains(e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">Cada linha será uma dor diferente</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-approaches">Abordagens (uma por linha)</Label>
                      <Textarea
                        id="product-approaches"
                        placeholder="Ex:\nTransforme sua carreira\nAprenda do zero\nResultados em 30 dias"
                        value={newProductApproaches}
                        onChange={(e) => setNewProductApproaches(e.target.value)}
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">Cada linha será uma abordagem diferente</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateProduct}
                        disabled={createProductMutation.isPending}
                      >
                        {createProductMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</>
                        ) : (
                          "Criar Produto"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {products && products.length > 0 ? (
              <div className="space-y-2">
                {products.map((product) => (
                  <Card 
                    key={product.id} 
                    className={`p-4 cursor-pointer transition-all ${
                      selectedProductIds.includes(product.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => {
                      if (selectedProductIds.includes(product.id)) {
                        setSelectedProductIds([]);
                      } else {
                        setSelectedProductIds([product.id]);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{product.name}</h4>
                          {product.idealClient && (
                            <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                              ✓ Configurado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                        {product.idealClient && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente: {product.idealClient.substring(0, 50)}...
                          </p>
                        )}
                        {product.pains && product.pains.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {product.pains.length} dor(es) mapeada(s)
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductForModal(product);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum produto cadastrado para este influenciador</p>
                <p className="text-sm mt-2">Clique em "Novo Produto" para adicionar</p>
              </div>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Selecione tendências para criar conteúdo baseado em trends
            </p>
            
            {trends && trends.length > 0 ? (
              <div className="space-y-3">
                {trends.slice(0, 10).map((trend: any) => (
                  <Card 
                    key={trend.id} 
                    className={`cursor-pointer transition-all ${
                      selectedContextId === trend.id && selectedContextType === 'trend'
                        ? 'border-primary bg-primary/5' 
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedContextId(trend.id);
                      setSelectedContextType('trend');
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          checked={selectedContextId === trend.id && selectedContextType === 'trend'}
                          onChange={() => {
                            setSelectedContextId(trend.id);
                            setSelectedContextType('trend');
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{trend.name}</div>
                          <div className="text-xs text-muted-foreground">{trend.source} • {trend.category}</div>
                        </div>
                      </div>
                      
                      {isItemSelected(trend.id) && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Template:</Label>
                            <Select 
                              value={selectedItems.find(i => i.id === trend.id)?.template || "storytelling"} 
                              onValueChange={(v) => updateItemTemplate(trend.id, v)}
                            >
                              <SelectTrigger className="h-8 text-xs flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CAROUSEL_TEMPLATES.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Quantidade:</Label>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => updateItemQuantity(trend.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">
                                {selectedItems.find(i => i.id === trend.id)?.quantity || 1}
                              </span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => updateItemQuantity(trend.id, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma trend coletada</p>
                <Button variant="link" onClick={() => setLocation("/trends")}>
                  Ir para Trends
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Virals Tab */}
          <TabsContent value="virais" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <Flame className="w-4 h-4 inline mr-1" />
                Selecione conteúdos virais para criar adaptações
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={collectViralsMutation.isPending}
                onClick={() => {
                  collectViralsMutation.mutate({ source: "viralhog" });
                }}
              >
                {collectViralsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Coletar Virais
              </Button>
            </div>
            
            {virals && virals.length > 0 ? (
              <div className="space-y-3">
                {virals.slice(0, 10).map((viral: any) => (
                  <Card 
                    key={viral.id} 
                    className={`cursor-pointer transition-all ${
                      selectedContextId === viral.id && selectedContextType === 'viral'
                        ? 'border-primary bg-primary/5' 
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedContextId(viral.id);
                      setSelectedContextType('viral');
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          checked={selectedContextId === viral.id && selectedContextType === 'viral'}
                          onChange={() => {
                            setSelectedContextId(viral.id);
                            setSelectedContextType('viral');
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{viral.title}</div>
                          <div className="text-xs text-muted-foreground">{viral.source} • {viral.category}</div>
                        </div>
                      </div>
                      
                      {isItemSelected(viral.id) && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Template:</Label>
                            <Select 
                              value={selectedItems.find(i => i.id === viral.id)?.template || "storytelling"} 
                              onValueChange={(v) => updateItemTemplate(viral.id, v)}
                            >
                              <SelectTrigger className="h-8 text-xs flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CAROUSEL_TEMPLATES.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Quantidade:</Label>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => updateItemQuantity(viral.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">
                                {selectedItems.find(i => i.id === viral.id)?.quantity || 1}
                              </span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => updateItemQuantity(viral.id, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum viral coletado</p>
                <Button variant="link" onClick={() => setLocation("/virals")}>
                  Ir para Virais
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Assuntos Tab */}
          <TabsContent value="assuntos" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Buscar Notícias por Assunto</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: Inteligência Artificial, Carros Elétricos, Nutrição..." 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        searchSubjectsMutation.mutate({ query: searchQuery });
                      }
                    }}
                  />
                  <Button
                    disabled={searchSubjectsMutation.isPending || !searchQuery.trim()}
                    onClick={() => searchSubjectsMutation.mutate({ query: searchQuery })}
                  >
                    {searchSubjectsMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Buscar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Digite um assunto para buscar notícias recentes e gerar conteúdo baseado nelas
                </p>
              </div>

              {/* Resultados */}
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((news: any, index: number) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all ${
                        selectedContextId === index && selectedContextType === 'subject'
                          ? 'border-primary bg-primary/5' 
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedContextId(index);
                        setSelectedContextType('subject');
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <input 
                            type="radio" 
                            checked={selectedContextId === index && selectedContextType === 'subject'}
                            onChange={() => {
                              setSelectedContextId(index);
                              setSelectedContextType('subject');
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{news.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{news.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">{news.source} • {news.category}</div>
                          </div>
                        </div>
                        
                        {isItemSelected(`news-${index}`) && (
                          <div className="mt-3 pt-3 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Template:</Label>
                              <Select 
                                value={selectedItems.find(i => i.id === `news-${index}`)?.template || "storytelling"} 
                                onValueChange={(v) => updateItemTemplate(`news-${index}`, v)}
                              >
                                <SelectTrigger className="h-8 text-xs flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CAROUSEL_TEMPLATES.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Quantidade:</Label>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={() => updateItemQuantity(`news-${index}`, -1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center text-sm">
                                  {selectedItems.find(i => i.id === `news-${index}`)?.quantity || 1}
                                </span>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={() => updateItemQuantity(`news-${index}`, 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Digite um assunto e clique em Buscar para encontrar notícias</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Items Summary */}
        {selectedItems.length > 0 && mode !== "produtos" && mode !== "dores" && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="font-medium mb-2">
                {selectedItems.length} item(s) selecionado(s)
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {selectedItems.reduce((acc, item) => acc + item.quantity, 0)} conteúdo(s) a gerar
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modal de Detalhes do Produto */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          isOpen={!!selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onUpdate={() => {
            utils.influencers.products.listProducts.invalidate({ influencerId });
          }}
        />
      )}
    </div>
  );
}
