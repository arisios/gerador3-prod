import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Clock, Image, Video, Layers, Loader2, ChevronRight } from "lucide-react";

export default function History() {
  const [, setLocation] = useLocation();
  const { data: contents, isLoading } = trpc.stats.recentContents.useQuery({ limit: 100 });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-2 font-medium">Histórico</span>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : contents && contents.length > 0 ? (
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
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum conteúdo ainda</p>
          </div>
        )}
      </main>
    </div>
  );
}
