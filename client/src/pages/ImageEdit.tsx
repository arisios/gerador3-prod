import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Loader2, Image, RefreshCw, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const contentId = parseInt(id || "0");

  const { data: content, isLoading } = trpc.content.get.useQuery({ id: contentId });

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!content) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Conteúdo não encontrado</p></div>;
  }

  const slide = content.slides?.[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/project/${content.projectId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-medium">Imagem Única</span>
          </div>
          <Button size="sm"><Download className="w-4 h-4 mr-2" />Baixar</Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <Card className="aspect-[4/5] relative overflow-hidden">
          <CardContent className="p-0 h-full">
            {slide?.imageUrl ? (
              <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-primary/20 to-background flex items-center justify-center">
                <Image className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white text-lg font-bold leading-tight">{slide?.text || content.title}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-medium">Informações</h3>
          <div className="text-sm text-muted-foreground">
            <p><strong>Título:</strong> {content.title}</p>
            <p><strong>Hook:</strong> {content.hook}</p>
            <p><strong>Template:</strong> {content.template}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
