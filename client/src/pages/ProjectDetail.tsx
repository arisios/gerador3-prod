import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { TemplateSelector, AccentColorSelector } from "@/components/SlidePreview";
import { LogoPositionSelector } from "@/components/LogoPositionSelector";
import { 
  ArrowLeft, Plus, Image, Video, Layers, Loader2, 
  ChevronRight, Trash2, Users, Zap, Target, AlertCircle,
  TrendingUp, Flame, X, Check, UserPlus, Sparkles, Newspaper, Pencil
} from "lucide-react";
import { toast } from "sonner";

type ContentSource = "pains" | "trends" | "virals" | "news";

interface ContentSelection {
  id: string;
  sourceType: ContentSource;
  sourceId: number;
  sourceName: string;
  contentType: "carousel" | "image" | "video";
  template: string;
  templateName: string;
  quantity: number;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const projectId = parseInt(id || "0");

  const [showGenerator, setShowGenerator] = useState(false);
  const [contentSource, setContentSource] = useState<ContentSource>("pains");
  const [selections, setSelections] = useState<ContentSelection[]>([]);
  const [objective, setObjective] = useState<"sale" | "authority" | "growth">("authority");
  const [person, setPerson] = useState<"first" | "second" | "third">("second");
  const [platform, setPlatform] = useState<"instagram" | "tiktok">("instagram");
  const [voiceTone, setVoiceTone] = useState("casual");
  const [clickbait, setClickbait] = useState(false);

  // Seleção atual
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [currentContentType, setCurrentContentType] = useState<"carousel" | "image" | "video">("carousel");
  const [currentTemplate, setCurrentTemplate] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [visualTemplate, setVisualTemplate] = useState("lifestyle-editorial");
  const [accentColor, setAccentColor] = useState("neon-green");
  const [showVisualTemplates, setShowVisualTemplates] = useState(false);
  
  // Estados para configuração da logo
  const [logoPosition, setLogoPosition] = useState<"top-left" | "top-right" | "bottom-left" | "bottom-right">("bottom-right");
  const [logoSize, setLogoSize] = useState(10);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Estados para gerenciamento de clientes ideais
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientDescription, setNewClientDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);

  // Estados para gerenciamento de assuntos/notícias
  const [topicQuery, setTopicQuery] = useState("");
  const [isSearchingNews, setIsSearchingNews] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([]);
  const [dateFilter, setDateFilter] = useState<"last_week" | "last_month" | "last_3_months" | "all">("last_week");
  const [sourceFilter, setSourceFilter] = useState("");
  const [showManualNewsDialog, setShowManualNewsDialog] = useState(false);
  const [manualNewsForm, setManualNewsForm] = useState({
    title: "",
    description: "",
    source: "",
    url: "",
    publishedAt: "",
  });
  const [selectedNewsForContent, setSelectedNewsForContent] = useState<any>(null);
  const [newsContentModalOpen, setNewsContentModalOpen] = useState(false);
  const [newsContentType, setNewsContentType] = useState<"carousel" | "image" | "video">("carousel");
  const [newsContentTemplate, setNewsContentTemplate] = useState("");
  const [newsContentQuantity, setNewsContentQuantity] = useState(1);
  const [newsContentObjective, setNewsContentObjective] = useState<"sale" | "authority" | "growth">("authority");
  const [newsContentPerson, setNewsContentPerson] = useState<"first" | "second" | "third">("second");
  const [newsContentPlatform, setNewsContentPlatform] = useState<"instagram" | "tiktok">("instagram");
  const [newsContentVoiceTone, setNewsContentVoiceTone] = useState("casual");

  const { data: project, isLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: contents } = trpc.content.list.useQuery({ projectId }, { enabled: !!projectId });
  const { data: trends } = trpc.trends.list.useQuery({ source: "google" });
  const { data: virals } = trpc.virals.list.useQuery({});
  const { data: carouselTemplates } = trpc.templates.getCarouselTemplates.useQuery();
  const { data: imageTemplates } = trpc.templates.getImageTemplates.useQuery();
  const { data: videoTemplates } = trpc.templates.getVideoTemplates.useQuery();
  
  // Queries para assuntos/notícias
  const { data: topics } = (trpc as any).topics.list.useQuery({ projectId }, { enabled: !!projectId });
  const { data: currentTopicNews } = (trpc as any).topics.getNews.useQuery(
    { topicId: currentTopicId! },
    { enabled: !!currentTopicId }
  );
  const { data: selectedNews } = (trpc as any).topics.getSelectedNews.useQuery(
    { projectId },
    { enabled: !!projectId && contentSource === "news" }
  );

  const utils = trpc.useUtils();

  const generateContent = trpc.content.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.contentIds.length} conteúdo(s) gerado(s)!`);
      utils.content.list.invalidate({ projectId });
      setShowGenerator(false);
      setSelections([]);
      if (data.contentIds[0]) {
        setLocation(`/content/${data.contentIds[0]}`);
      }
    },
    onError: (error) => {
      toast.error("Erro ao gerar: " + error.message);
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Projeto excluído");
      setLocation("/dashboard");
    },
  });

  const updateBrandKit = trpc.projects.updateBrandKit.useMutation({
    onSuccess: () => {
      toast.success("Configurações da logo salvas!");
      utils.projects.get.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  // Mutations para clientes ideais
  const addIdealClient = (trpc.projects as any).addIdealClient.useMutation({
    onSuccess: () => {
      toast.success("Cliente ideal adicionado!");
      utils.projects.get.invalidate({ id: projectId });
      setShowAddClientModal(false);
      setNewClientName("");
      setNewClientDescription("");
    },
    onError: (error: { message: string }) => {
      toast.error("Erro ao adicionar: " + error.message);
    },
  });

  const deleteIdealClient = (trpc.projects as any).deleteIdealClient.useMutation({
    onSuccess: () => {
      toast.success("Cliente ideal removido");
      utils.projects.get.invalidate({ id: projectId });
    },
    onError: (error: { message: string }) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  const generatePainsForClient = (trpc.projects as any).generatePainsForClient.useMutation({
    onSuccess: (data: { painsCount: number }) => {
      toast.success(`${data.painsCount} dores geradas para este cliente!`);
      utils.projects.get.invalidate({ id: projectId });
    },
    onError: (error: { message: string }) => {
      toast.error("Erro ao gerar dores: " + error.message);
    },
  });

  const updateIdealClientSelection = trpc.projects.updateIdealClientSelection.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ id: projectId });
    },
  });

  const saveLogoSettings = () => {
    updateBrandKit.mutate({
      id: projectId,
      logoUrl: project?.logoUrl || undefined,
      logoPosition,
      logoSize,
    } as any);
  };

  const uploadLogo = trpc.upload.image.useMutation();

  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      const result = await uploadLogo.mutateAsync({
        base64,
        filename: `logo-${projectId}-${Date.now()}.${file.name.split(".").pop()}`,
        contentType: file.type,
      });

      await updateBrandKit.mutateAsync({
        id: projectId,
        logoUrl: result.url,
        logoPosition,
        logoSize,
      } as any);

      toast.success("Logo enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar logo");
      console.error(error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    try {
      await updateBrandKit.mutateAsync({
        id: projectId,
        logoUrl: "",
      });
      toast.success("Logo removida");
    } catch (error) {
      toast.error("Erro ao remover logo");
    }
  };

  const handleAddClient = () => {
    if (!newClientName.trim()) {
      toast.error("Digite o nome do cliente ideal");
      return;
    }
    addIdealClient.mutate({
      projectId,
      name: newClientName.trim(),
      description: newClientDescription.trim() || undefined,
    });
  };

  const handleGeneratePainsForClient = (clientId: number) => {
    generatePainsForClient.mutate({
      projectId,
      clientId,
    });
  };

  const handleToggleClientSelection = (clientId: number, isSelected: boolean) => {
    updateIdealClientSelection.mutate({
      clientId,
      isSelected: !isSelected,
    });
  };

  // Mutations para assuntos/notícias
  const searchNewsMutation = (trpc as any).topics.search.useMutation({
    onSuccess: (data: { topicId: number; count: number }) => {
      toast.success(`${data.count} notícias encontradas!`);
      setCurrentTopicId(data.topicId);
      setIsSearchingNews(false);
      (utils as any).topics.list.invalidate({ projectId });
    },
    onError: (error: { message: string }) => {
      toast.error("Erro ao buscar notícias: " + error.message);
      setIsSearchingNews(false);
    },
  });

  const toggleNewsSelection = (trpc as any).topics.toggleNewsSelection.useMutation({
    onSuccess: () => {
      (utils as any).topics.getNews.invalidate({ topicId: currentTopicId });
      (utils as any).topics.getSelectedNews.invalidate({ projectId });
    },
  });

  const deleteTopic = (trpc as any).topics.delete.useMutation({
    onSuccess: () => {
      toast.success("Assunto removido");
      setCurrentTopicId(null);
      (utils as any).topics.list.invalidate({ projectId });
    },
  });

  const addManualNews = (trpc as any).topics.addManualNews.useMutation({
    onSuccess: () => {
      toast.success("Notícia adicionada com sucesso");
      setShowManualNewsDialog(false);
      setManualNewsForm({ title: "", description: "", source: "", url: "", publishedAt: "" });
      if (currentTopicId) {
        (utils as any).topics.getNews.invalidate({ topicId: currentTopicId });
      }
      (utils as any).topics.getSelectedNews.invalidate({ projectId });
    },
    onError: () => {
      toast.error("Erro ao adicionar notícia");
    },
  });

  const generateContentFromNews = (trpc as any).topics.generateContentFromNews.useMutation({
    onSuccess: (data: { contentIds: number[] }) => {
      toast.success(`${data.contentIds.length} conteúdo(s) gerado(s) com sucesso!`);
      setNewsContentModalOpen(false);
      setSelectedNewsForContent(null);
      utils.content.list.invalidate({ projectId });
    },
    onError: (error: { message: string }) => {
      toast.error("Erro ao gerar conteúdo: " + error.message);
    },
  });

  const handleSearchNews = () => {
    if (!topicQuery.trim()) {
      toast.error("Digite um assunto para buscar");
      return;
    }
    setIsSearchingNews(true);
    searchNewsMutation.mutate({
      projectId,
      query: topicQuery.trim(),
      limit: 5,
      dateFilter,
      sourceFilter: sourceFilter.trim() || undefined,
    });
  };

  const handleToggleNews = (newsId: number, isSelected: boolean) => {
    toggleNewsSelection.mutate({
      newsId,
      isSelected,
    });
  };

  const handleAddManualNews = () => {
    if (!currentTopicId) {
      toast.error("Selecione um assunto primeiro");
      return;
    }
    if (!manualNewsForm.title.trim() || !manualNewsForm.description.trim() || !manualNewsForm.source.trim()) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    addManualNews.mutate({
      topicId: currentTopicId,
      ...manualNewsForm,
    });
  };

  const templates = currentContentType === "carousel" ? carouselTemplates :
                    currentContentType === "image" ? imageTemplates : videoTemplates;

  // Obter lista de fontes baseado no tipo selecionado
  // Agora filtra dores pelo cliente selecionado
  const getSources = () => {
    if (contentSource === "pains") {
      // Se tem cliente selecionado, mostrar apenas dores desse cliente
      if (selectedClientId) {
        return project?.pains?.filter(p => p.idealClientId === selectedClientId)
          .map(p => ({ id: p.id, name: p.pain, level: p.level })) || [];
      }
      // Senão, mostrar todas as dores
      return project?.pains?.map(p => ({ id: p.id, name: p.pain, level: p.level })) || [];
    } else if (contentSource === "trends") {
      return trends?.map(t => ({ id: t.id, name: t.name, level: t.classification })) || [];
    } else if (contentSource === "virals") {
      return virals?.map(v => ({ id: v.id, name: v.title, level: v.category })) || [];
    } else {
      // news: retornar notícias selecionadas de todos os tópicos do projeto
      if (selectedNews && selectedNews.length > 0) {
        return selectedNews.map((n: any) => ({
          id: n.id,
          name: n.title,
          level: n.source
        }));
      }
      return [];
    }
  };

  const sources = getSources();

  // Adicionar seleção
  const handleAddSelection = () => {
    if (selectedSourceIds.length === 0) {
      toast.error("Selecione pelo menos uma opção");
      return;
    }
    if (!currentTemplate) {
      toast.error("Selecione um template");
      return;
    }

    const templateObj = templates?.find(t => t.id === currentTemplate);
    const newSelections: ContentSelection[] = selectedSourceIds.map(sourceId => {
      const source = sources.find((s: { id: number; name: string; level?: string }) => s.id === sourceId);
      return {
        id: `${contentSource}-${sourceId}-${currentContentType}-${currentTemplate}-${Date.now()}`,
        sourceType: contentSource,
        sourceId,
        sourceName: source?.name || "",
        contentType: currentContentType,
        template: currentTemplate,
        templateName: templateObj?.name || "",
        quantity: currentQuantity,
      };
    });

    setSelections([...selections, ...newSelections]);
    setSelectedSourceIds([]);
    setCurrentTemplate("");
    setCurrentQuantity(1);
    toast.success(`${newSelections.length} item(s) adicionado(s)`);
  };

  // Remover seleção
  const handleRemoveSelection = (selectionId: string) => {
    setSelections(selections.filter(s => s.id !== selectionId));
  };

  // Gerar todos os conteúdos
  const handleGenerateAll = async () => {
    if (selections.length === 0) {
      toast.error("Adicione pelo menos uma seleção");
      return;
    }

    for (const selection of selections) {
      let painText: string | undefined;
      
      if (selection.sourceType === "pains") {
        const pain = project?.pains?.find(p => p.id === selection.sourceId);
        painText = pain?.pain;
      } else if (selection.sourceType === "trends") {
        const trend = trends?.find(t => t.id === selection.sourceId);
        painText = `Trend: ${trend?.name}`;
      } else if (selection.sourceType === "virals") {
        const viral = virals?.find(v => v.id === selection.sourceId);
        painText = `Viral: ${viral?.title}`;
      } else if (selection.sourceType === "news") {
        // Buscar notícia selecionada
        const foundNews = selectedNews?.find((n: any) => n.id === selection.sourceId);
        if (foundNews) {
          painText = `Notícia: ${foundNews.title}. ${foundNews.description}`;
        }
      }

      await generateContent.mutateAsync({
        projectId,
        type: selection.contentType,
        template: selection.template,
        quantity: selection.quantity,
        painId: selection.sourceType === "pains" ? selection.sourceId : undefined,
        pain: painText,
        objective,
        person,
        platform,
        voiceTone,
        clickbait,
      } as any);
    }
  };

  // Toggle seleção de fonte
  const toggleSourceSelection = (sourceId: number) => {
    if (selectedSourceIds.includes(sourceId)) {
      setSelectedSourceIds(selectedSourceIds.filter(id => id !== sourceId));
    } else {
      setSelectedSourceIds([...selectedSourceIds, sourceId]);
    }
  };

  // Obter dores de um cliente específico
  const getClientPains = (clientId: number) => {
    return project?.pains?.filter(p => p.idealClientId === clientId) || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p>Projeto não encontrado</p>
          <Button variant="link" onClick={() => setLocation("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const totalContents = selections.reduce((acc, s) => acc + s.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/projects")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold truncate max-w-[200px]">{project.name}</h1>
              <p className="text-xs text-muted-foreground">{project.sourceType}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => deleteProject.mutate({ id: projectId })}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4 space-y-4">
        {/* Generate Button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={() => setShowGenerator(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Gerar Conteúdo
        </Button>

        {/* Tabs */}
        <Tabs defaultValue="contents">
          <TabsList className="w-full">
            <TabsTrigger value="contents" className="flex-1">Conteúdos</TabsTrigger>
            <TabsTrigger value="clients" className="flex-1">Clientes</TabsTrigger>
            <TabsTrigger value="pains" className="flex-1">Dores</TabsTrigger>
            <TabsTrigger value="topics" className="flex-1">Assuntos</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Config</TabsTrigger>
          </TabsList>

          {/* Contents Tab */}
          <TabsContent value="contents" className="space-y-4 mt-4">
            {contents && contents.length > 0 ? (
              contents.map((content) => (
                <Link key={content.id} href={`/content/${content.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {content.type === "carousel" && <Layers className="w-5 h-5 text-primary" />}
                        {content.type === "image" && <Image className="w-5 h-5 text-primary" />}
                        {content.type === "video" && <Video className="w-5 h-5 text-primary" />}
                        <div>
                          <div className="font-medium">{content.title || "Sem título"}</div>
                          <div className="text-xs text-muted-foreground">{content.template}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum conteúdo ainda</p>
                <Button variant="link" onClick={() => setShowGenerator(true)}>
                  Gerar primeiro conteúdo
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Clients Tab - NOVO FLUXO COPPE */}
          <TabsContent value="clients" className="space-y-4 mt-4">
            {/* Botão Adicionar Cliente */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowAddClientModal(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Cliente Ideal
            </Button>

            {project.idealClients && project.idealClients.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{project.idealClients.filter(c => c.isSelected).length} selecionado(s)</span>
                  <span>{project.idealClients.length} total</span>
                </div>
                
                {project.idealClients.map((client) => {
                  const clientPains = getClientPains(client.id);
                  const isExpanded = expandedClientId === client.id;
                  
                  return (
                    <Card 
                      key={client.id} 
                      className={`transition-all ${
                        client.isSelected 
                          ? "bg-primary/5 border-primary/30" 
                          : "bg-card/50 opacity-60"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={client.isSelected ?? false}
                                onCheckedChange={() => handleToggleClientSelection(client.id, client.isSelected ?? false)}
                              />
                              <span className="font-medium">{client.name}</span>
                              {client.isSelected && (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  Ativo
                                </Badge>
                              )}
                            </div>
                            {client.description && (
                              <div className="text-sm text-muted-foreground mt-1 ml-6">
                                {client.description}
                              </div>
                            )}
                            
                            {/* Contador de dores */}
                            <div className="flex items-center gap-2 mt-2 ml-6">
                              <Badge variant="outline" className="text-xs">
                                {clientPains.length} dores
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                              >
                                {isExpanded ? "Ocultar" : "Ver dores"}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGeneratePainsForClient(client.id)}
                              disabled={generatePainsForClient.isPending}
                              title="Gerar dores para este cliente"
                            >
                              {generatePainsForClient.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteIdealClient.mutate({ clientId: client.id })}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Lista de dores expandida */}
                        {isExpanded && (
                          <div className="mt-4 ml-6 space-y-2 border-l-2 border-primary/20 pl-4">
                            {clientPains.length > 0 ? (
                              clientPains.map((pain) => (
                                <div key={pain.id} className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        pain.level === "primary" ? "border-red-500/50 text-red-500" :
                                        pain.level === "secondary" ? "border-orange-500/50 text-orange-500" :
                                        "border-green-500/50 text-green-500"
                                      }`}
                                    >
                                      {pain.level === "primary" ? "Principal" :
                                       pain.level === "secondary" ? "Secundária" : "Inexplorada"}
                                    </Badge>
                                    <span>{pain.pain}</span>
                                  </div>
                                  {pain.description && (
                                    <p className="text-xs text-muted-foreground mt-1 ml-16">
                                      {pain.description}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Nenhuma dor gerada. Clique em <Sparkles className="w-4 h-4 inline" /> para gerar.
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Nenhum cliente ideal mapeado</p>
                <p className="text-sm mb-4">
                  Adicione clientes ideais para gerar dores específicas para cada perfil
                </p>
                <Button variant="outline" onClick={() => setShowAddClientModal(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Cliente Ideal
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Pains Tab - Agora mostra todas as dores agrupadas */}
          <TabsContent value="pains" className="space-y-4 mt-4">
            {project.pains && project.pains.length > 0 ? (
              <>
                {/* Filtro por cliente */}
                <div className="space-y-2">
                  <Label>Filtrar por Cliente Ideal</Label>
                  <Select 
                    value={selectedClientId?.toString() || "all"} 
                    onValueChange={(v) => setSelectedClientId(v === "all" ? null : parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {project.idealClients?.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {["primary", "secondary", "unexplored"].map((level) => {
                  const levelPains = project.pains?.filter(p => {
                    const matchLevel = p.level === level;
                    const matchClient = !selectedClientId || p.idealClientId === selectedClientId;
                    return matchLevel && matchClient;
                  }) || [];
                  
                  if (levelPains.length === 0) return null;
                  
                  const levelConfig = {
                    primary: { 
                      title: "Dores Principais", 
                      description: "Problemas óbvios e urgentes que o cliente já sabe que tem",
                      color: "bg-red-500/10 border-red-500/30 text-red-500",
                      icon: "🔥"
                    },
                    secondary: { 
                      title: "Dores Secundárias", 
                      description: "Problemas relacionados mas menos urgentes",
                      color: "bg-orange-500/10 border-orange-500/30 text-orange-500",
                      icon: "⚠️"
                    },
                    unexplored: { 
                      title: "Dores Inexploradas", 
                      description: "Oportunidades! Pouco conteúdo sobre isso nas redes",
                      color: "bg-green-500/10 border-green-500/30 text-green-500",
                      icon: "💡"
                    }
                  }[level];
                  
                  return (
                    <div key={level} className="space-y-3">
                      <div className={`p-3 rounded-lg border ${levelConfig?.color}`}>
                        <div className="flex items-center gap-2">
                          <span>{levelConfig?.icon}</span>
                          <div>
                            <h3 className="font-medium">{levelConfig?.title}</h3>
                            <p className="text-xs opacity-80">{levelConfig?.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 pl-2">
                        {levelPains.map((pain) => {
                          const client = project.idealClients?.find(c => c.id === pain.idealClientId);
                          return (
                            <Card key={pain.id} className="bg-card/50 hover:bg-card transition-colors">
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{pain.pain}</div>
                                {pain.description && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {pain.description}
                                  </div>
                                )}
                                {client && (
                                  <Badge variant="outline" className="text-xs mt-2">
                                    <Users className="w-3 h-3 mr-1" />
                                    {client.name}
                                  </Badge>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Nenhuma dor mapeada</p>
                <p className="text-sm">
                  Adicione clientes ideais e gere dores específicas para cada um
                </p>
              </div>
            )}
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-4 mt-4">
            {/* Campo de busca */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Label>Buscar Notícias sobre um Assunto</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Inteligência Artificial, Sustentabilidade, Marketing Digital..."
                    value={topicQuery}
                    onChange={(e) => setTopicQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchNews()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearchNews}
                    disabled={isSearchingNews || !topicQuery.trim()}
                  >
                    {isSearchingNews ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Buscar"
                    )}
                  </Button>
                </div>
                
                {/* Filtros */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Período</Label>
                    <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_week">Últimos 7 dias</SelectItem>
                        <SelectItem value="last_month">Último mês</SelectItem>
                        <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                        <SelectItem value="all">Qualquer período</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Fonte (opcional)</Label>
                    <Input
                      placeholder="Ex: Folha, G1, Exame..."
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  A IA buscará 5 notícias recentes sobre o assunto para você escolher
                </p>
              </CardContent>
            </Card>

            {/* Resultados da busca */}
            {currentTopicNews && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Assunto: {currentTopicNews.topic.query}</h3>
                      <p className="text-xs text-muted-foreground">
                        {currentTopicNews.news.length} notícias encontradas
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowManualNewsDialog(true)}
                      >
                        Adicionar Notícia Manual
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentTopicId(null);
                          setTopicQuery("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentTopicNews.news.map((newsItem: any) => (
                      <Card 
                        key={newsItem.id} 
                        className={newsItem.isManual ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" : "bg-card/50"}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={newsItem.isSelected}
                              onCheckedChange={(checked) => 
                                handleToggleNews(newsItem.id, !!checked)
                              }
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{newsItem.title}</h4>
                                {newsItem.isManual && (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                    Manual
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {newsItem.description}
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{newsItem.source}</span>
                                  <span>•</span>
                                  <span>
                                    {new Date(newsItem.publishedAt).toLocaleDateString("pt-BR")}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setSelectedNewsForContent(newsItem);
                                    setNewsContentModalOpen(true);
                                  }}
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Gerar Conteúdo
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de assuntos salvos */}
            {topics && topics.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">Assuntos Salvos</h3>
                  <div className="space-y-2">
                    {topics.map((topic: any) => (
                      <Card key={topic.id} className="bg-card/50">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{topic.query}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(topic.createdAt).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentTopicId(topic.id)}
                            >
                              Ver notícias
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTopic.mutate({ topicId: topic.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estado vazio */}
            {!currentTopicNews && (!topics || topics.length === 0) && !isSearchingNews && (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Nenhum assunto pesquisado</p>
                <p className="text-sm">
                  Busque notícias sobre qualquer assunto e gere conteúdo baseado nelas
                </p>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Configurações da Logo</h3>
                <LogoPositionSelector
                  logoUrl={project.logoUrl || undefined}
                  position={(project.logoPosition as "top-left" | "top-right" | "bottom-left" | "bottom-right") || "bottom-right"}
                  size={project.logoSize || 10}
                  onLogoUpload={handleLogoUpload}
                  onLogoRemove={handleLogoRemove}
                  onPositionChange={(pos) => setLogoPosition(pos)}
                  onSizeChange={(size) => setLogoSize(size)}
                  onSave={() => saveLogoSettings()}
                  isSaving={updateBrandKit.isPending}
                  isUploading={isUploadingLogo}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal Adicionar Cliente Ideal */}
      <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cliente Ideal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Cliente Ideal *</Label>
              <Input
                placeholder="Ex: Mãe empreendedora, Estudante de medicina..."
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Descreva características, comportamentos, desejos..."
                value={newClientDescription}
                onChange={(e) => setNewClientDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClientModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddClient}
              disabled={addIdealClient.isPending || !newClientName.trim()}
            >
              {addIdealClient.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border rounded-t-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-lg">Gerar Conteúdo</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowGenerator(false)}>
                Fechar
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {/* Fonte do Conteúdo */}
              <div className="space-y-2">
                <Label>Fonte do Conteúdo</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={contentSource === "pains" ? "default" : "outline"}
                    onClick={() => { setContentSource("pains"); setSelectedSourceIds([]); }}
                    className="flex-col h-auto py-3"
                  >
                    <Target className="w-5 h-5 mb-1" />
                    <span className="text-xs">Dores</span>
                  </Button>
                  <Button
                    variant={contentSource === "trends" ? "default" : "outline"}
                    onClick={() => { setContentSource("trends"); setSelectedSourceIds([]); }}
                    className="flex-col h-auto py-3"
                  >
                    <TrendingUp className="w-5 h-5 mb-1" />
                    <span className="text-xs">Trends</span>
                  </Button>
                  <Button
                    variant={contentSource === "virals" ? "default" : "outline"}
                    onClick={() => { setContentSource("virals"); setSelectedSourceIds([]); }}
                    className="flex-col h-auto py-3"
                  >
                    <Flame className="w-5 h-5 mb-1" />
                    <span className="text-xs">Virais</span>
                  </Button>
                  <Button
                    variant={contentSource === "news" ? "default" : "outline"}
                    onClick={() => { setContentSource("news"); setSelectedSourceIds([]); }}
                    className="flex-col h-auto py-3"
                  >
                    <Newspaper className="w-5 h-5 mb-1" />
                    <span className="text-xs">Notícias</span>
                  </Button>
                </div>
              </div>

              {/* Filtro por Cliente (apenas para Dores) */}
              {contentSource === "pains" && project.idealClients && project.idealClients.length > 0 && (
                <div className="space-y-2">
                  <Label>Filtrar Dores por Cliente Ideal</Label>
                  <Select 
                    value={selectedClientId?.toString() || "all"} 
                    onValueChange={(v) => {
                      setSelectedClientId(v === "all" ? null : parseInt(v));
                      setSelectedSourceIds([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {project.idealClients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name} ({getClientPains(client.id).length} dores)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Lista de Fontes com Checkbox */}
              <div className="space-y-2">
                <Label>
                  Selecione {contentSource === "pains" ? "as Dores" : contentSource === "trends" ? "as Trends" : contentSource === "virals" ? "os Virais" : "as Notícias"}
                </Label>
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {sources.length > 0 ? (
                    sources.map((source: { id: number; name: string; level?: string }) => (
                      <div
                        key={source.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedSourceIds.includes(source.id) ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                        onClick={() => toggleSourceSelection(source.id)}
                      >
                        <Checkbox 
                          checked={selectedSourceIds.includes(source.id)}
                          onCheckedChange={() => toggleSourceSelection(source.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{source.name}</div>
                          {source.level && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {source.level}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      {contentSource === "pains" && (
                        selectedClientId 
                          ? "Nenhuma dor para este cliente. Gere dores na aba Clientes."
                          : "Nenhuma dor mapeada. Adicione clientes e gere dores."
                      )}
                      {contentSource === "trends" && "Nenhuma trend coletada. Vá em Trends para coletar."}
                      {contentSource === "virals" && "Nenhum viral coletado. Vá em Virais para coletar."}
                      {contentSource === "news" && "Nenhuma notícia selecionada. Vá em Assuntos para buscar e selecionar notícias."}
                    </div>
                  )}
                </div>
                {selectedSourceIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedSourceIds.length} selecionado(s)
                  </p>
                )}
              </div>

              {/* Tipo de Conteúdo */}
              <div className="space-y-2">
                <Label>Tipo de Conteúdo</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={currentContentType === "carousel" ? "default" : "outline"}
                    onClick={() => { setCurrentContentType("carousel"); setCurrentTemplate(""); }}
                    className="flex-col h-auto py-3"
                  >
                    <Layers className="w-5 h-5 mb-1" />
                    <span className="text-xs">Carrossel</span>
                  </Button>
                  <Button
                    variant={currentContentType === "image" ? "default" : "outline"}
                    onClick={() => { setCurrentContentType("image"); setCurrentTemplate(""); }}
                    className="flex-col h-auto py-3"
                  >
                    <Image className="w-5 h-5 mb-1" />
                    <span className="text-xs">Imagem</span>
                  </Button>
                  <Button
                    variant={currentContentType === "video" ? "default" : "outline"}
                    onClick={() => { setCurrentContentType("video"); setCurrentTemplate(""); }}
                    className="flex-col h-auto py-3"
                  >
                    <Video className="w-5 h-5 mb-1" />
                    <span className="text-xs">Vídeo</span>
                  </Button>
                </div>
              </div>

              {/* Template */}
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={currentTemplate} onValueChange={setCurrentTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantidade */}
              <div className="space-y-2">
                <Label>Quantidade por seleção</Label>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map((q) => (
                    <Button
                      key={q}
                      variant={currentQuantity === q ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuantity(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Botão Adicionar à Lista */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleAddSelection}
                disabled={selectedSourceIds.length === 0 || !currentTemplate}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar à Lista
              </Button>

              {/* Lista de Seleções */}
              {selections.length > 0 && (
                <div className="space-y-2">
                  <Label>Lista de Geração ({totalContents} conteúdos)</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selections.map((selection) => (
                      <div 
                        key={selection.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{selection.sourceName}</div>
                          <div className="text-xs text-muted-foreground">
                            {selection.templateName} × {selection.quantity}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSelection(selection.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opções Avançadas */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-muted-foreground">Opções Avançadas</Label>
                
                {/* Plataforma */}
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">
                        <div className="flex flex-col">
                          <span>Instagram</span>
                          <span className="text-xs text-muted-foreground">Textos elaborados, até 120 caracteres</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tiktok">
                        <div className="flex flex-col">
                          <span>TikTok</span>
                          <span className="text-xs text-muted-foreground">Textos curtos, até 60 caracteres</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tom de Voz */}
                <div className="space-y-2">
                  <Label>Tom de Voz</Label>
                  <Select value={voiceTone} onValueChange={setVoiceTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Conversa entre Amigos</SelectItem>
                      <SelectItem value="professional">Profissional/Corporativo</SelectItem>
                      <SelectItem value="inspirational">Inspiracional/Motivacional</SelectItem>
                      <SelectItem value="provocative">Provocativo/Polêmico</SelectItem>
                      <SelectItem value="educational">Educativo/Didático</SelectItem>
                      <SelectItem value="storytelling">Storytelling/Narrativo</SelectItem>
                      <SelectItem value="humorous">Humorístico</SelectItem>
                      <SelectItem value="urgent">Urgente/Escassez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Objetivo */}
                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Select value={objective} onValueChange={(v) => setObjective(v as typeof objective)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="authority">Autoridade</SelectItem>
                      <SelectItem value="growth">Crescimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pessoa */}
                <div className="space-y-2">
                  <Label>Pessoa Gramatical</Label>
                  <Select value={person} onValueChange={(v) => setPerson(v as typeof person)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">1ª Pessoa (Eu)</SelectItem>
                      <SelectItem value="second">2ª Pessoa (Você)</SelectItem>
                      <SelectItem value="third">3ª Pessoa (Ele/Ela)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clickbait */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Clickbait</Label>
                    <p className="text-xs text-muted-foreground">Títulos mais chamativos</p>
                  </div>
                  <Switch checked={clickbait} onCheckedChange={setClickbait} />
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleGenerateAll}
                disabled={generateContent.isPending || selections.length === 0}
              >
                {generateContent.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Gerar {totalContents} Conteúdo{totalContents > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notícia Manual */}
      <Dialog open={showManualNewsDialog} onOpenChange={setShowManualNewsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Notícia Manualmente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                placeholder="Título da notícia"
                value={manualNewsForm.title}
                onChange={(e) => setManualNewsForm({ ...manualNewsForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição *</Label>
              <Textarea
                placeholder="Descrição detalhada da notícia"
                value={manualNewsForm.description}
                onChange={(e) => setManualNewsForm({ ...manualNewsForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Fonte *</Label>
              <Input
                placeholder="Ex: Folha de S.Paulo, G1, Exame"
                value={manualNewsForm.source}
                onChange={(e) => setManualNewsForm({ ...manualNewsForm, source: e.target.value })}
              />
            </div>
            <div>
              <Label>Link/URL (opcional)</Label>
              <Input
                placeholder="https://..."
                value={manualNewsForm.url}
                onChange={(e) => setManualNewsForm({ ...manualNewsForm, url: e.target.value })}
              />
            </div>
            <div>
              <Label>Data de Publicação (opcional)</Label>
              <Input
                type="date"
                value={manualNewsForm.publishedAt}
                onChange={(e) => setManualNewsForm({ ...manualNewsForm, publishedAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se não informada, usará a data de hoje
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowManualNewsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddManualNews} disabled={addManualNews.isPending}>
              {addManualNews.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerar Conteúdo a partir de Notícia */}
      <Dialog open={newsContentModalOpen} onOpenChange={setNewsContentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Conteúdo a partir de Notícia</DialogTitle>
          </DialogHeader>
          
          {selectedNewsForContent && (
            <div className="space-y-4">
              {/* Preview da notícia */}
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-semibold text-sm">{selectedNewsForContent.title}</h4>
                  <p className="text-xs text-muted-foreground">{selectedNewsForContent.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{selectedNewsForContent.source}</span>
                    <span>•</span>
                    <span>{new Date(selectedNewsForContent.publishedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações */}
              <div className="space-y-4">
                {/* Tipo de conteúdo */}
                <div>
                  <Label>Tipo de Conteúdo</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button
                      variant={newsContentType === "carousel" ? "default" : "outline"}
                      onClick={() => {
                        setNewsContentType("carousel");
                        setNewsContentTemplate("");
                      }}
                      className="w-full"
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Carrossel
                    </Button>
                    <Button
                      variant={newsContentType === "image" ? "default" : "outline"}
                      onClick={() => {
                        setNewsContentType("image");
                        setNewsContentTemplate("");
                      }}
                      className="w-full"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Imagem
                    </Button>
                    <Button
                      variant={newsContentType === "video" ? "default" : "outline"}
                      onClick={() => {
                        setNewsContentType("video");
                        setNewsContentTemplate("");
                      }}
                      className="w-full"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Vídeo
                    </Button>
                  </div>
                </div>

                {/* Template */}
                <div>
                  <Label>Template</Label>
                  <Select value={newsContentTemplate} onValueChange={setNewsContentTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {newsContentType === "carousel" && carouselTemplates?.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                      {newsContentType === "image" && imageTemplates?.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                      {newsContentType === "video" && videoTemplates?.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantidade */}
                <div>
                  <Label>Quantidade</Label>
                  <Select value={newsContentQuantity.toString()} onValueChange={(v) => setNewsContentQuantity(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 10].map(q => (
                        <SelectItem key={q} value={q.toString()}>{q} conteúdo(s)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Objetivo */}
                <div>
                  <Label>Objetivo</Label>
                  <Select value={newsContentObjective} onValueChange={(v: any) => setNewsContentObjective(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="authority">Autoridade</SelectItem>
                      <SelectItem value="growth">Crescimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pessoa */}
                <div>
                  <Label>Pessoa Gramatical</Label>
                  <Select value={newsContentPerson} onValueChange={(v: any) => setNewsContentPerson(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">1ª pessoa (eu/nós)</SelectItem>
                      <SelectItem value="second">2ª pessoa (você)</SelectItem>
                      <SelectItem value="third">3ª pessoa (ele/ela)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plataforma */}
                <div>
                  <Label>Plataforma</Label>
                  <Select value={newsContentPlatform} onValueChange={(v: any) => setNewsContentPlatform(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tom de voz */}
                <div>
                  <Label>Tom de Voz</Label>
                  <Select value={newsContentVoiceTone} onValueChange={setNewsContentVoiceTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="friendly">Amigável</SelectItem>
                      <SelectItem value="authoritative">Autoritário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewsContentModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!newsContentTemplate) {
                  toast.error("Selecione um template");
                  return;
                }
                generateContentFromNews.mutate({
                  newsId: selectedNewsForContent.id,
                  projectId,
                  type: newsContentType,
                  template: newsContentTemplate,
                  quantity: newsContentQuantity,
                  objective: newsContentObjective,
                  person: newsContentPerson,
                  platform: newsContentPlatform,
                  voiceTone: newsContentVoiceTone,
                });
              }}
              disabled={generateContentFromNews.isPending || !newsContentTemplate}
            >
              {generateContentFromNews.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Gerar Conteúdo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
