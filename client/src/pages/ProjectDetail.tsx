import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, Plus, Image, Video, Layers, Loader2, 
  ChevronRight, Trash2, Users, Zap, Target, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const projectId = parseInt(id || "0");

  const [showGenerator, setShowGenerator] = useState(false);
  const [contentType, setContentType] = useState<"carousel" | "image" | "video">("carousel");
  const [template, setTemplate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedPain, setSelectedPain] = useState<number | null>(null);
  const [objective, setObjective] = useState<"sale" | "authority" | "growth">("authority");
  const [person, setPerson] = useState<"first" | "second" | "third">("second");
  const [clickbait, setClickbait] = useState(false);

  const { data: project, isLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: contents } = trpc.content.list.useQuery({ projectId }, { enabled: !!projectId });
  const { data: carouselTemplates } = trpc.templates.getCarouselTemplates.useQuery();
  const { data: imageTemplates } = trpc.templates.getImageTemplates.useQuery();
  const { data: videoTemplates } = trpc.templates.getVideoTemplates.useQuery();

  const utils = trpc.useUtils();

  const generateContent = trpc.content.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.contentIds.length} conteúdo(s) gerado(s)!`);
      utils.content.list.invalidate({ projectId });
      setShowGenerator(false);
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

  const handleGenerate = () => {
    if (!template) {
      toast.error("Selecione um template");
      return;
    }
    const pain = project?.pains?.find(p => p.id === selectedPain);
    generateContent.mutate({
      projectId,
      type: contentType,
      template,
      quantity,
      painId: selectedPain || undefined,
      pain: pain?.pain,
      objective,
      person,
      clickbait,
    });
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

  const templates = contentType === "carousel" ? carouselTemplates :
                    contentType === "image" ? imageTemplates : videoTemplates;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-medium truncate max-w-[200px]">{project.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive"
            onClick={() => {
              if (confirm("Excluir projeto?")) {
                deleteProject.mutate({ id: projectId });
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="h-auto py-4 flex-col gap-2" 
            onClick={() => setShowGenerator(true)}
          >
            <Zap className="w-6 h-6" />
            <span>Gerar Conteúdo</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => setLocation("/influencers")}
          >
            <Users className="w-6 h-6" />
            <span>Influenciadores</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contents">
          <TabsList className="w-full">
            <TabsTrigger value="contents" className="flex-1">Conteúdos</TabsTrigger>
            <TabsTrigger value="pains" className="flex-1">Dores</TabsTrigger>
            <TabsTrigger value="clients" className="flex-1">Clientes</TabsTrigger>
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

          {/* Pains Tab */}
          <TabsContent value="pains" className="space-y-4 mt-4">
            {project.pains && project.pains.length > 0 ? (
              <>
                {["primary", "secondary", "unexplored"].map((level) => {
                  const levelPains = project.pains?.filter(p => p.level === level) || [];
                  if (levelPains.length === 0) return null;
                  return (
                    <div key={level}>
                      <h3 className="text-sm font-medium mb-2 capitalize">
                        {level === "primary" && "Dores Principais"}
                        {level === "secondary" && "Dores Secundárias"}
                        {level === "unexplored" && "Dores Inexploradas"}
                      </h3>
                      <div className="space-y-2">
                        {levelPains.map((pain) => (
                          <Card key={pain.id} className="bg-card/50">
                            <CardContent className="p-3">
                              <div className="font-medium text-sm">{pain.pain}</div>
                              {pain.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {pain.description}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma dor mapeada</p>
              </div>
            )}
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4 mt-4">
            {project.idealClients && project.idealClients.length > 0 ? (
              project.idealClients.map((client) => (
                <Card key={client.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="font-medium">{client.name}</div>
                    {client.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {client.description}
                      </div>
                    )}
                    
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cliente ideal mapeado</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border rounded-t-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Gerar Conteúdo</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowGenerator(false)}>
                Fechar
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {/* Content Type */}
              <div className="space-y-2">
                <Label>Tipo de Conteúdo</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={contentType === "carousel" ? "default" : "outline"}
                    onClick={() => { setContentType("carousel"); setTemplate(""); }}
                    className="flex-col h-auto py-3"
                  >
                    <Layers className="w-5 h-5 mb-1" />
                    <span className="text-xs">Carrossel</span>
                  </Button>
                  <Button
                    variant={contentType === "image" ? "default" : "outline"}
                    onClick={() => { setContentType("image"); setTemplate(""); }}
                    className="flex-col h-auto py-3"
                  >
                    <Image className="w-5 h-5 mb-1" />
                    <span className="text-xs">Imagem</span>
                  </Button>
                  <Button
                    variant={contentType === "video" ? "default" : "outline"}
                    onClick={() => { setContentType("video"); setTemplate(""); }}
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
                <Select value={template} onValueChange={setTemplate}>
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

              {/* Pain */}
              {project.pains && project.pains.length > 0 && (
                <div className="space-y-2">
                  <Label>Dor (opcional)</Label>
                  <Select 
                    value={selectedPain?.toString() || ""} 
                    onValueChange={(v) => setSelectedPain(v ? parseInt(v) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma dor" />
                    </SelectTrigger>
                    <SelectContent>
                      {project.pains.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.pain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map((q) => (
                    <Button
                      key={q}
                      variant={quantity === q ? "default" : "outline"}
                      onClick={() => setQuantity(q)}
                      className="flex-1"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Objective */}
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

              {/* Person */}
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

              {/* Generate Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleGenerate}
                disabled={generateContent.isPending}
              >
                {generateContent.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Gerar {quantity} Conteúdo{quantity > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
