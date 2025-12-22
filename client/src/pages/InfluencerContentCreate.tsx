import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Zap, TrendingUp, Flame, Target, Plus, Minus } from "lucide-react";
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
  id: number;
  name: string;
  template: string;
  quantity: number;
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

  const { data: influencer } = trpc.influencers.get.useQuery({ id: influencerId });
  const { data: trends } = trpc.trends.list.useQuery();
  const { data: virals } = trpc.virals.list.useQuery();

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
          console.log("[DEBUG] Calling mutateAsync with:", {
            influencerId,
            template: item.template,
            product: item.name,
          });
          const result = await generateContent.mutateAsync({
            influencerId,
            template: item.template,
            product: item.name,
          });
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

  const toggleItem = (id: number, name: string) => {
    const exists = selectedItems.find(item => item.id === id);
    if (exists) {
      setSelectedItems(selectedItems.filter(item => item.id !== id));
    } else {
      setSelectedItems([...selectedItems, { id, name, template: "storytelling", quantity: 1 }]);
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
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Novo Produto
              </Button>
            </div>

            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum produto cadastrado para este influenciador</p>
              <p className="text-sm mt-2">Clique em "Novo Produto" para adicionar</p>
            </div>
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
                    onClick={() => toggleItem(trend.id, trend.name)}
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
          <TabsContent value="virals" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              <Flame className="w-4 h-4 inline mr-1" />
              Selecione conteúdos virais para criar adaptações
            </p>
            
            {virals && virals.length > 0 ? (
              <div className="space-y-3">
                {virals.slice(0, 10).map((viral: any) => (
                  <Card 
                    key={viral.id} 
                    className={`cursor-pointer transition-all ${isItemSelected(viral.id) ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => toggleItem(viral.id, viral.title)}
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
                  />
                  <Button>
                    Buscar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Digite um assunto para buscar notícias recentes e gerar conteúdo baseado nelas
                </p>
              </div>

              {/* Resultados aparecerão aqui */}
              <div className="text-center py-12 text-muted-foreground">
                <p>Digite um assunto e clique em Buscar para encontrar notícias</p>
              </div>
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
