import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InfluencerExpressCreate() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();


  const influencerId = parseInt(id!);

  // Buscar influenciador
  const { data: influencer, isLoading: loadingInfluencer } = trpc.influencers.get.useQuery({ id: influencerId });

  // Estados do formulário
  const [mainSubject, setMainSubject] = useState('');
  const [carouselCount, setCarouselCount] = useState(3);
  const [videoCount, setVideoCount] = useState(0);
  const [imageCount, setImageCount] = useState(0);

  // Mutation
  const generateMutation = trpc.influencerContent.generateBulkContentExpress.useMutation({
    onSuccess: (data) => {
      toast({
        title: '🎉 Conteúdos gerados com sucesso!',
        description: `${data.total} conteúdos criados automaticamente.`,
      });
      navigate(`/influencer/${influencerId}`);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao gerar conteúdos',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGenerate = () => {
    if (!mainSubject.trim()) {
      toast({
        title: 'Assunto obrigatório',
        description: 'Digite sobre qual assunto você quer criar conteúdo.',
        variant: 'destructive',
      });
      return;
    }

    const total = carouselCount + videoCount + imageCount;
    if (total === 0) {
      toast({
        title: 'Quantidade obrigatória',
        description: 'Selecione pelo menos 1 conteúdo para gerar.',
        variant: 'destructive',
      });
      return;
    }

    generateMutation.mutate({
      influencerId,
      mainSubject,
      carouselCount,
      videoCount,
      imageCount,
    });
  };

  if (loadingInfluencer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Influenciador não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalContents = carouselCount + videoCount + imageCount;

  return (
    <div className="container max-w-3xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/influencer/${influencerId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Modo Express</h1>
            <p className="text-muted-foreground">Geração automática em massa para {influencer.name}</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração Rápida</CardTitle>
          <CardDescription>
            A IA vai escolher automaticamente templates e criar abordagens diferentes sobre o assunto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Assunto Principal */}
          <div className="space-y-2">
            <Label htmlFor="mainSubject" className="text-base font-semibold">
              Sobre qual assunto você quer criar conteúdo?
            </Label>
            <Input
              id="mainSubject"
              placeholder="Ex: treino em casa, receitas saudáveis, dicas de programação..."
              value={mainSubject}
              onChange={(e) => setMainSubject(e.target.value)}
              className="text-base h-12"
              disabled={generateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              A IA vai criar diferentes abordagens e ângulos sobre este assunto
            </p>
          </div>

          {/* Quantidades */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Quantos conteúdos você quer gerar?</Label>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Carrosséis */}
              <div className="space-y-2">
                <Label htmlFor="carouselCount" className="text-sm text-muted-foreground">
                  Carrosséis
                </Label>
                <Input
                  id="carouselCount"
                  type="number"
                  min="0"
                  max="10"
                  value={carouselCount}
                  onChange={(e) => setCarouselCount(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-semibold h-14"
                  disabled={generateMutation.isPending}
                />
              </div>

              {/* Vídeos */}
              <div className="space-y-2">
                <Label htmlFor="videoCount" className="text-sm text-muted-foreground">
                  Vídeos
                </Label>
                <Input
                  id="videoCount"
                  type="number"
                  min="0"
                  max="10"
                  value={videoCount}
                  onChange={(e) => setVideoCount(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-semibold h-14"
                  disabled={generateMutation.isPending}
                />
              </div>

              {/* Imagens */}
              <div className="space-y-2">
                <Label htmlFor="imageCount" className="text-sm text-muted-foreground">
                  Imagens
                </Label>
                <Input
                  id="imageCount"
                  type="number"
                  min="0"
                  max="10"
                  value={imageCount}
                  onChange={(e) => setImageCount(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-semibold h-14"
                  disabled={generateMutation.isPending}
                />
              </div>
            </div>

            {totalContents > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium">
                  Total: {totalContents} conteúdo{totalContents > 1 ? 's' : ''} será{totalContents > 1 ? 'm' : ''} gerado{totalContents > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Botão Gerar */}
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !mainSubject.trim() || totalContents === 0}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando {totalContents} conteúdo{totalContents > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Gerar Automaticamente
              </>
            )}
          </Button>

          {/* Informação adicional */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Como funciona:</strong> A IA vai escolher automaticamente templates variados (Passo a Passo, Mitos e Verdades, Tutorial, etc.) e criar diferentes ângulos sobre o assunto. Cada conteúdo será único e complementar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
