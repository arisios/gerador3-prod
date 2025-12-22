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
import { ArrowLeft, Loader2, Zap, TrendingUp, Flame, Target, Plus, Minus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

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
  const [newProductApproaches, setNewProductApproaches] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  
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

    createProductMutation.mutate({
      influencerId,
      name: newProductName,
      description: newProductDescription || undefined,
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

  const handleGenerate = () => {
    if (mode === "soft-sell") {
      if (!template) {
        toast.error("Selecione um template");
        return;
      }
      generateContent.mutate({
        influencerId,
        template,
        product: product || undefined,
      });
    } else {
      if (selectedItems.length === 0) {
        toast.error("Selecione pelo menos um item");
        return;
      }
      // Gerar conteúdos em sequência
      setIsGenerating(true);
      generateMultipleContents();
    }
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
        {/* Mode Selection */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="produtos" className="text-xs">Produtos</TabsTrigger>
            <TabsTrigger value="dores" className="text-xs">Dores</TabsTrigger>
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
                  <Card key={product.id} className="p-4 hover:bg-accent/50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={`product-${product.id}`}
                        className="mt-1"
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProductIds([...selectedProductIds, product.id]);
                          } else {
                            setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor={`product-${product.id}`} className="cursor-pointer">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                        </label>
                      </div>
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

          {/* Dores Tab */}
          <TabsContent value="dores" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <Target className="w-4 h-4 inline mr-1" />
                Selecione dores do nicho para gerar conteúdo
              </p>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Nova Dor
              </Button>
            </div>

            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma dor cadastrada para este nicho</p>
              <p className="text-sm mt-2">Clique em "Nova Dor" para adicionar</p>
            </div>
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
                    className={`cursor-pointer transition-all ${isItemSelected(trend.id) ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => toggleItemWithType(trend.id, trend.name, 'trend', trend)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isItemSelected(trend.id)} />
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
                    className={`cursor-pointer transition-all ${isItemSelected(viral.id) ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => toggleItemWithType(viral.id, viral.title, 'viral', viral)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isItemSelected(viral.id)} />
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
                      className={`cursor-pointer transition-all ${isItemSelected(`news-${index}`) ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => toggleItemWithType(`news-${index}`, news.title, 'subject', news)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isItemSelected(`news-${index}`)} />
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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleGenerate} 
          disabled={generateContent.isPending || isGenerating}
        >
          {(generateContent.isPending || isGenerating) ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          {mode === "produtos" || mode === "dores"
            ? "Gerar Conteúdo" 
            : `Gerar ${selectedItems.reduce((acc, item) => acc + item.quantity, 0)} Conteúdo(s)`
          }
        </Button>
      </div>
    </div>
  );
}
