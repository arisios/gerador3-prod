import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, User, ChevronRight, Loader2 } from "lucide-react";

export default function Influencers() {
  const [, setLocation] = useLocation();
  const { data: influencers, isLoading } = trpc.influencers.list.useQuery();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-medium">Influenciadores</span>
          </div>
          <Button size="sm" onClick={() => setLocation("/influencer/new")}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : influencers && influencers.length > 0 ? (
          influencers.map((inf) => (
            <Link key={inf.id} href={`/influencer/${inf.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-muted overflow-hidden">
                    {inf.photoUrl ? (
                      <img src={inf.photoUrl} alt={inf.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{inf.name}</div>
                    <div className="text-sm text-muted-foreground">{inf.niche}</div>
                    <div className="text-xs text-muted-foreground capitalize">{inf.type}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum influenciador ainda</p>
            <Button variant="link" onClick={() => setLocation("/influencer/new")}>
              Criar primeiro influenciador
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
