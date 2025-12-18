import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Image, Loader2, ChevronLeft, ChevronRight, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function InfluencerContentEdit() {
  const { id, contentId } = useParams<{ id: string; contentId: string }>();
  const [, setLocation] = useLocation();
  const influencerId = parseInt(id || "0");
  const cId = parseInt(contentId || "0");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingText, setEditingText] = useState(false);
  const [slideText, setSlideText] = useState("");

  const { data: content, isLoading } = trpc.influencers.getContent.useQuery({ id: cId });
  const utils = trpc.useUtils();

  const updateSlide = trpc.slides.update.useMutation({
    onSuccess: () => {
      utils.influencers.getContent.invalidate({ id: cId });
      setEditingText(false);
      toast.success("Atualizado");
    },
  });

  useEffect(() => {
    if (content?.slides?.[currentSlide]) {
      setSlideText(content.slides[currentSlide].text || "");
    }
  }, [content, currentSlide]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!content) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Conteúdo não encontrado</p></div>;
  }

  const slides = content.slides || [];
  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/influencer/${influencerId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-medium truncate">{content.title || "Conteúdo"}</span>
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
              {editingText ? (
                <div className="space-y-2">
                  <Textarea value={slideText} onChange={(e) => setSlideText(e.target.value)} className="bg-black/50 border-white/20 text-white" rows={4} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { if (slide) updateSlide.mutate({ id: slide.id, text: slideText }); }} disabled={updateSlide.isPending}>
                      <Check className="w-4 h-4 mr-1" /> Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingText(false)}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="text-white">
                  <p className="text-lg font-bold leading-tight">{slide?.text || "Sem texto"}</p>
                  <Button size="sm" variant="ghost" className="mt-2 text-white/80" onClick={() => setEditingText(true)}>
                    <Edit2 className="w-4 h-4 mr-1" /> Editar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" disabled={currentSlide === 0} onClick={() => setCurrentSlide(currentSlide - 1)}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm text-muted-foreground">Slide {currentSlide + 1} de {slides.length}</span>
          <Button variant="outline" size="icon" disabled={currentSlide >= slides.length - 1} onClick={() => setCurrentSlide(currentSlide + 1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setCurrentSlide(i)} className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === currentSlide ? "border-primary" : "border-transparent"}`}>
              {s.imageUrl ? <img src={s.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-xs">{i + 1}</div>}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
