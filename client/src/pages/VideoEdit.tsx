import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Video, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function VideoEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const contentId = parseInt(id || "0");
  const [copied, setCopied] = useState(false);

  const { data: content, isLoading } = trpc.content.get.useQuery({ id: contentId });

  const copyScript = () => {
    if (content?.description) {
      navigator.clipboard.writeText(content.description);
      setCopied(true);
      toast.success("Script copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!content) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Conteúdo não encontrado</p></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/project/${content.projectId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-medium">Script de Vídeo</span>
          </div>
          <Button size="sm" onClick={copyScript}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Copiar
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-bold">{content.title}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Hook</h3>
                <p className="text-lg font-medium">{content.hook}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Script</h3>
                <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap">{content.description}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
