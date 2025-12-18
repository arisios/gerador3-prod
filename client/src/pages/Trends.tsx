import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, RefreshCw, TrendingUp, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Trends() {
  const [, setLocation] = useLocation();
  const [source, setSource] = useState<"google" | "tiktok">("google");

  const { data: trends, isLoading, refetch } = trpc.trends.list.useQuery({ source, limit: 50 });

  const collectTrends = trpc.trends.collect.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} trends coletadas!`);
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
            <span className="ml-2 font-medium">Trends</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => collectTrends.mutate({ source })} disabled={collectTrends.isPending}>
            {collectTrends.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <Tabs value={source} onValueChange={(v) => setSource(v as typeof source)}>
          <TabsList className="w-full">
            <TabsTrigger value="google" className="flex-1">Google</TabsTrigger>
            <TabsTrigger value="tiktok" className="flex-1">TikTok</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : trends && trends.length > 0 ? (
          <div className="space-y-3">
            {trends.map((trend) => (
              <Card key={trend.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium">{trend.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          trend.classification === "peak" ? "bg-green-500/10 text-green-500" :
                          trend.classification === "rising" ? "bg-blue-500/10 text-blue-500" :
                          trend.classification === "emerging" ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-gray-500/10 text-gray-500"
                        }`}>
                          {trend.classification}
                        </span>
                        <span className="text-xs text-muted-foreground">{trend.category}</span>
                      </div>
                      {trend.viralProbability && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Viral: {trend.viralProbability}%
                        </div>
                      )}
                    </div>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma trend ainda</p>
            <Button variant="link" onClick={() => collectTrends.mutate({ source })}>
              Coletar trends
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
