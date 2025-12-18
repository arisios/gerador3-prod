import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Globe, Instagram, Music2, FileText, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

type SourceType = "site" | "instagram" | "tiktok" | "description";

export default function ProjectCreate() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceDescription, setSourceDescription] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      setProjectId(data.id);
      setStep(3);
      analyzeProject.mutate({ id: data.id });
    },
    onError: (error) => {
      toast.error("Erro ao criar projeto: " + error.message);
    },
  });

  const analyzeProject = trpc.projects.analyze.useMutation({
    onSuccess: () => {
      setStep(4);
    },
    onError: (error) => {
      toast.error("Erro na análise: " + error.message);
      setStep(4); // Continue anyway
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error("Digite um nome para o projeto");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!sourceType) {
        toast.error("Selecione uma fonte");
        return;
      }
      if ((sourceType === "site" || sourceType === "instagram" || sourceType === "tiktok") && !sourceUrl.trim()) {
        toast.error("Digite a URL");
        return;
      }
      if (sourceType === "description" && !sourceDescription.trim()) {
        toast.error("Digite a descrição do negócio");
        return;
      }
      createProject.mutate({
        name,
        sourceType,
        sourceUrl: sourceUrl || undefined,
        sourceDescription: sourceDescription || undefined,
      });
    }
  };

  const handleFinish = () => {
    if (projectId) {
      setLocation(`/project/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-2 font-medium">Novo Projeto</span>
        </div>
      </header>

      {/* Progress */}
      <div className="container px-4 py-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Nome</span>
          <span>Fonte</span>
          <span>Análise</span>
          <span>Pronto</span>
        </div>
      </div>

      <main className="container px-4 py-6">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Como se chama seu projeto?</h2>
              <p className="text-muted-foreground text-sm">
                Dê um nome que identifique seu negócio ou campanha.
              </p>
            </div>
            <Input
              placeholder="Ex: Loja de Roupas, Curso de Marketing..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg h-12"
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Source */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">De onde vem as informações?</h2>
              <p className="text-muted-foreground text-sm">
                Escolha a fonte para analisarmos seu negócio.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SourceCard
                icon={<Globe className="w-6 h-6" />}
                title="Site"
                selected={sourceType === "site"}
                onClick={() => setSourceType("site")}
              />
              <SourceCard
                icon={<Instagram className="w-6 h-6" />}
                title="Instagram"
                selected={sourceType === "instagram"}
                onClick={() => setSourceType("instagram")}
              />
              <SourceCard
                icon={<Music2 className="w-6 h-6" />}
                title="TikTok"
                selected={sourceType === "tiktok"}
                onClick={() => setSourceType("tiktok")}
              />
              <SourceCard
                icon={<FileText className="w-6 h-6" />}
                title="Descrição"
                selected={sourceType === "description"}
                onClick={() => setSourceType("description")}
              />
            </div>

            {(sourceType === "site" || sourceType === "instagram" || sourceType === "tiktok") && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {sourceType === "site" && "URL do site"}
                  {sourceType === "instagram" && "URL do perfil"}
                  {sourceType === "tiktok" && "URL do perfil"}
                </label>
                <Input
                  placeholder={
                    sourceType === "site" ? "https://seusite.com.br" :
                    sourceType === "instagram" ? "https://instagram.com/seuperfil" :
                    "https://tiktok.com/@seuperfil"
                  }
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>
            )}

            {sourceType === "description" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Descreva seu negócio</label>
                <Textarea
                  placeholder="Ex: Sou nutricionista especializada em emagrecimento saudável. Atendo mulheres de 30-50 anos que querem perder peso sem dietas restritivas..."
                  value={sourceDescription}
                  onChange={(e) => setSourceDescription(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Quanto mais detalhes, melhor será a análise. Inclua: o que você vende, 
                  para quem vende, diferenciais e resultados que entrega.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Analyzing */}
        {step === 3 && (
          <div className="text-center py-12 space-y-6">
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
            <div>
              <h2 className="text-xl font-bold mb-2">Analisando seu negócio...</h2>
              <p className="text-muted-foreground text-sm">
                Estamos identificando seu nicho, clientes ideais e dores.
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Analisando fonte de dados</p>
              <p>✓ Identificando nicho de mercado</p>
              <p className="animate-pulse">→ Gerando 10 clientes ideais</p>
              <p className="opacity-50">○ Mapeando dores e objeções</p>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Projeto criado!</h2>
              <p className="text-muted-foreground text-sm">
                Seu projeto "{name}" está pronto para criar conteúdo.
              </p>
            </div>
            <Button size="lg" onClick={handleFinish}>
              Ir para o Projeto
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>

      {/* Footer Actions */}
      {(step === 1 || step === 2) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <div className="container flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button 
              className="flex-1" 
              onClick={handleNext}
              disabled={createProject.isPending}
            >
              {createProject.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SourceCard({ 
  icon, 
  title, 
  selected, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  selected: boolean; 
  onClick: () => void;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        selected ? "border-primary bg-primary/5" : "hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center gap-2">
        <div className={`${selected ? "text-primary" : "text-muted-foreground"}`}>
          {icon}
        </div>
        <span className={`font-medium ${selected ? "text-primary" : ""}`}>{title}</span>
      </CardContent>
    </Card>
  );
}
