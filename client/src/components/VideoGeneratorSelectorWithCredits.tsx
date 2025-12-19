import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VideoGeneratorSelector } from "./VideoGeneratorSelector";

interface VideoGeneratorSelectorWithCreditsProps {
  imageUrl: string;
  prompt?: string;
  onVideoGenerated?: (videoUrl: string, videoType: string) => void;
}

// Mapeamento de tipo de vídeo para créditos
const videoCreditsMap: Record<string, number> = {
  kenburns: 3,
  "wan-480p": 10,
  "wan-720p": 15,
  luma: 25,
};

export function VideoGeneratorSelectorWithCredits({
  imageUrl,
  prompt = "",
  onVideoGenerated,
}: VideoGeneratorSelectorWithCreditsProps) {
  // Por enquanto, usar créditos fixos para teste
  // TODO: Integrar com sistema de créditos real quando tipos estiverem corretos
  const [userCredits] = useState(100);

  const handleGenerate = async (videoType: string, provider: string): Promise<string | null> => {
    const creditsNeeded = videoCreditsMap[videoType] || 10;
    
    if (userCredits < creditsNeeded) {
      toast.error(`Créditos insuficientes. Você precisa de ${creditsNeeded} créditos.`);
      return null;
    }
    
    // Ken Burns é processado localmente, não precisa de API
    if (videoType === "kenburns") {
      // O componente KenBurnsPreview já cuida da geração
      toast.success("Ken Burns será processado localmente!");
      return null;
    }
    
    // Para outros tipos, mostrar aviso
    toast.info("Gerando vídeo com IA... Isso pode levar alguns minutos.");
    
    // TODO: Implementar chamada real para APIs de vídeo (Replicate, Runware)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.warning("APIs de vídeo IA ainda não configuradas. Use Ken Burns por enquanto!");
    return null;
  };

  const handleVideoGenerated = (videoUrl: string, videoType: string) => {
    toast.success("Vídeo gerado com sucesso!");
    onVideoGenerated?.(videoUrl, videoType);
  };

  return (
    <VideoGeneratorSelector
      imageUrl={imageUrl}
      prompt={prompt}
      userCredits={userCredits}
      onGenerate={handleGenerate}
      onVideoGenerated={handleVideoGenerated}
    />
  );
}

export default VideoGeneratorSelectorWithCredits;
