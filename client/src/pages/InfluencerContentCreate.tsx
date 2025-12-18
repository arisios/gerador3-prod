import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
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

export default function InfluencerContentCreate() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const influencerId = parseInt(id || "0");

  const [template, setTemplate] = useState("");
  const [product, setProduct] = useState("");

  const { data: influencer } = trpc.influencers.get.useQuery({ id: influencerId });

  const generateContent = trpc.influencers.generateContent.useMutation({
    onSuccess: (data) => {
      toast.success("Conteúdo gerado!");
      setLocation(`/influencer/${influencerId}/content/${data.contentId}`);
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const handleGenerate = () => {
    if (!template) {
      toast.error("Selecione um template");
      return;
    }
    generateContent.mutate({
      influencerId,
      template,
      product: product || undefined,
    });
  };

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
        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um template" />
            </SelectTrigger>
            <SelectContent>
              {SOFT_SELL_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Produto/Serviço (opcional)</Label>
          <Input 
            placeholder="Ex: Curso de Marketing, Suplemento XYZ..." 
            value={product} 
            onChange={(e) => setProduct(e.target.value)} 
          />
          <p className="text-xs text-muted-foreground">Se vazio, será um conteúdo de autoridade sem venda direta</p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button className="w-full" size="lg" onClick={handleGenerate} disabled={generateContent.isPending}>
          {generateContent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
          Gerar Conteúdo
        </Button>
      </div>
    </div>
  );
}
