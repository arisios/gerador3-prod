import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Upload, Image } from "lucide-react";
import { toast } from "sonner";

export default function InfluencerCreateByPhoto() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [type, setType] = useState<"normal" | "transformation">("normal");
  const [photoUrl, setPhotoUrl] = useState("");

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
    createInfluencer.mutate({ name, niche, type, referenceImageUrl: photoUrl || undefined });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/influencer/new")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-2 font-medium">Criar por Foto</span>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Foto de Referência (URL)</Label>
            <Input placeholder="https://..." value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
            {photoUrl && (
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Nome</Label>
            <Input placeholder="Ex: Ana Silva" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Nicho</Label>
            <Input placeholder="Ex: Fitness, Beleza..." value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="transformation">Transformação</SelectItem>
              </SelectContent>
            </Select>
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
