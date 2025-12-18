import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, RefreshCw, Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Virals() {
  const [, setLocation] = useLocation();
  const [source, setSource] = useState<"viralhog" | "reddit">("viralhog");

  const { data: virals, isLoading, refetch } = trpc.virals.list.useQuery({ source, limit: 50 });

  const collectVirals = trpc.virals.collect.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} virais coletados!`);
      refetch();
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-medium">Virais</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => collectVirals.mutate({ source })} disabled={collectVirals.isPending}>
            {collectVirals.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <Tabs value={source} onValueChange={(v) => setSource(v as typeof source)}>
          <TabsList className="w-full">
            <TabsTrigger value="viralhog" className="flex-1">ViralHog</TabsTrigger>
            <TabsTrigger value="reddit" className="flex-1">Reddit</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : virals && virals.length > 0 ? (
          <div className="space-y-3">
            {virals.map((viral) => (
              <Card key={viral.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium">{viral.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                          {viral.category}
                        </span>
                        {viral.viralProbability && (
                          <span className="text-xs text-muted-foreground">
                            Viral: {viral.viralProbability}%
                          </span>
                        )}
                      </div>
                      {(() => {
                        const niches = viral.suggestedNiches;
                        if (!niches || !Array.isArray(niches)) return null;
                        return (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {niches.slice(0, 3).map((niche: string, i: number) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted">{String(niche)}</span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum viral ainda</p>
            <Button variant="link" onClick={() => collectVirals.mutate({ source })}>
              Coletar virais
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
