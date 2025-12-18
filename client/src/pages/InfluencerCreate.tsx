import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Camera, FileText } from "lucide-react";
import { toast } from "sonner";

export default function InfluencerCreate() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"description" | "photo" | null>(null);
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"normal" | "transformation">("normal");

  const createInfluencer = trpc.influencers.create.useMutation({
    onSuccess: (data) => {
      toast.success("Influenciador criado!");
      setLocation(`/influencer/${data.id}`);
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Digite um nome");
      return;
    }
    if (!niche.trim()) {
      toast.error("Digite o nicho");
      return;
    }
    createInfluencer.mutate({ name, niche, description, type });
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container flex items-center h-14 px-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/influencers")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-medium">Novo Influenciador</span>
          </div>
        </header>

        <main className="container px-4 py-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Como criar?</h2>
            <p className="text-muted-foreground text-sm">Escolha como deseja criar o influenciador.</p>
          </div>

          <div className="grid gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => setMode("description")}>
              <FileText className="w-8 h-8" />
              <span className="font-medium">Por Descrição</span>
              <span className="text-xs text-muted-foreground">Descreva as características</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => setMode("photo")}>
              <Camera className="w-8 h-8" />
              <span className="font-medium">Por Foto</span>
              <span className="text-xs text-muted-foreground">Envie uma foto de referência</span>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => setMode(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-2 font-medium">
            {mode === "description" ? "Criar por Descrição" : "Criar por Foto"}
          </span>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input placeholder="Ex: Ana Silva" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Nicho</Label>
            <Input placeholder="Ex: Fitness, Beleza, Finanças..." value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="transformation">Transformação (Antes/Depois)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descreva a aparência, estilo, personalidade..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button className="w-full" size="lg" onClick={handleCreate} disabled={createInfluencer.isPending}>
          {createInfluencer.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Criar Influenciador
        </Button>
      </div>
    </div>
  );
}
