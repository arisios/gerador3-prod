import { useState, useCallback, useEffect } from "react";
import { designTemplates, colorPalettes } from "../../../shared/designTemplates";
import { SlideRenderer, downloadSlide } from "./SlideRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Type, Palette, Settings2, AlignLeft, AlignCenter, AlignRight, 
  ChevronUp, ChevronDown, Save, RotateCcw, Download, Loader2
} from "lucide-react";
import { toast } from "sonner";

export interface SlideStyle {
  // Básico
  showText: boolean;
  textAlign: "left" | "center" | "right";
  positionY: number; // 0-100
  fontSize: number; // 16-72
  fontFamily: string;
  
  // Cores
  textColor: string;
  backgroundColor: string;
  overlayOpacity: number; // 0-100
  
  // Avançado
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;
  
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
  
  letterSpacing: number;
  lineHeight: number;
  padding: number;
  marginLeft: number;
  marginRight: number;
}

const DEFAULT_STYLE: SlideStyle = {
  showText: true,
  textAlign: "center",
  positionY: 20,
  fontSize: 32,
  fontFamily: "Inter",
  textColor: "#FFFFFF",
  backgroundColor: "#000000",
  overlayOpacity: 50,
  shadowEnabled: true,
  shadowColor: "#000000",
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  borderEnabled: false,
  borderColor: "#FFFFFF",
  borderWidth: 2,
  glowEnabled: false,
  glowColor: "#A855F7",
  glowIntensity: 10,
  letterSpacing: 0,
  lineHeight: 1.3,
  padding: 24,
  marginLeft: 24,
  marginRight: 24,
};

const COLOR_PRESETS = [
  { name: "Branco", text: "#FFFFFF", bg: "#1a1a2e" },
  { name: "Neon Verde", text: "#39FF14", bg: "#0a0a0a" },
  { name: "Neon Rosa", text: "#FF10F0", bg: "#0a0a0a" },
  { name: "Amarelo", text: "#FFFF00", bg: "#0a0a0a" },
  { name: "Laranja", text: "#FF6B00", bg: "#0a0a0a" },
  { name: "Azul", text: "#00D4FF", bg: "#0a0a0a" },
  { name: "Roxo", text: "#A855F7", bg: "#1a1a2e" },
  { name: "Vermelho", text: "#FF0000", bg: "#0a0a0a" },
];

interface SlideComposerProps {
  text: string;
  imageUrl?: string;
  style: SlideStyle;
  templateId?: string;
  paletteId?: string;
  logoUrl?: string;
  slideIndex?: number;
  slideId?: number;
  onStyleChange: (style: SlideStyle) => void;
  onTextChange: (text: string) => void;
  onDownload: (withText: boolean) => void;
  onSave?: (style: SlideStyle) => Promise<void>;
}

export default function SlideComposer({
  text,
  imageUrl,
  style,
  templateId,
  paletteId,
  logoUrl,
  slideIndex = 0,
  slideId,
  onStyleChange,
  onTextChange,
  onSave,
}: SlideComposerProps) {
  // Obter template e paleta
  const template = templateId ? designTemplates.find(t => t.id === templateId) : designTemplates[0];
  const palette = paletteId ? colorPalettes.find(p => p.id === paletteId) : null;
  
  // Inicializar localStyle com valores salvos ou do template/paleta
  const getInitialStyle = useCallback((): SlideStyle => {
    // Se já existe um estilo salvo no banco, usar ele
    if (style && Object.keys(style).length > 0 && style.textColor) {
      return { ...DEFAULT_STYLE, ...style };
    }
    
    // Caso contrário, usar cores do template/paleta
    const colors = {
      background: palette?.colors.background || template?.colors.background || "#1a1a2e",
      text: palette?.colors.text || template?.colors.text || "#FFFFFF",
    };
    
    return {
      ...DEFAULT_STYLE,
      backgroundColor: colors.background,
      textColor: colors.text,
    };
  }, [template, palette, style]);
  
  const [localStyle, setLocalStyle] = useState<SlideStyle>(getInitialStyle);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basico");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Reinicializar quando mudar de slide
  useEffect(() => {
    setLocalStyle(getInitialStyle());
    setHasUnsavedChanges(false);
  }, [slideId]);

  const updateStyle = useCallback((updates: Partial<SlideStyle>) => {
    const newStyle = { ...localStyle, ...updates };
    setLocalStyle(newStyle);
    setHasUnsavedChanges(true);
    onStyleChange(newStyle);
  }, [localStyle, onStyleChange]);

  const saveAsDefault = () => {
    localStorage.setItem("gerador3_default_style", JSON.stringify(localStyle));
    toast.success("Estilo salvo como padrão!");
  };

  const loadDefault = () => {
    const saved = localStorage.getItem("gerador3_default_style");
    if (saved) {
      const parsed = JSON.parse(saved);
      setLocalStyle(parsed);
      onStyleChange(parsed);
      toast.success("Estilo padrão carregado!");
    } else {
      toast.info("Nenhum estilo padrão salvo.");
    }
  };

  const resetStyle = () => {
    const initial = getInitialStyle();
    setLocalStyle(initial);
    onStyleChange(initial);
    setHasUnsavedChanges(true);
    toast.success("Estilo resetado!");
  };

  // Salvar edição no banco de dados
  const handleSave = async () => {
    if (!onSave) {
      toast.error("Função de salvamento não disponível");
      return;
    }
    
    setSaving(true);
    try {
      await onSave(localStyle);
      setHasUnsavedChanges(false);
      toast.success("Edição salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar edição");
    } finally {
      setSaving(false);
    }
  };

  // Download usando a função unificada do SlideRenderer
  const handleDownload = async (withText: boolean) => {
    setDownloading(true);
    
    try {
      await downloadSlide({
        text: text,
        imageUrl: imageUrl,
        templateId: templateId || designTemplates[0].id,
        paletteId: paletteId,
        customColors: {
          background: localStyle.backgroundColor,
          text: localStyle.textColor,
        },
        logoUrl: logoUrl,
        width: 1080,
        height: 1350,
        showText: withText && localStyle.showText,
        filename: `slide_${slideIndex + 1}${withText ? '_com_texto' : '_sem_texto'}.png`
      });
      
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao baixar slide");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview usando SlideRenderer - garante que seja idêntico ao download */}
      <div className="sticky top-0 z-10 bg-background pb-2 border-b border-border mb-2">
        <div className="mx-auto" style={{ width: "100%", maxWidth: "200px" }}>
          <SlideRenderer
            text={text}
            imageUrl={imageUrl}
            templateId={templateId || designTemplates[0].id}
            paletteId={paletteId}
            customColors={{
              background: localStyle.backgroundColor,
              text: localStyle.textColor,
            }}
            logoUrl={logoUrl}
            width={1080}
            height={1350}
            showText={localStyle.showText}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>

      {/* Área de Controles com Scroll */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1">

      {/* Info do template */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Template: {template?.name || 'Padrão'}</span>
        <span>Paleta: {palette?.name || 'Padrão'}</span>
      </div>

      {/* Tabs de Edição */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basico" className="text-xs">
            <Type className="w-3 h-3 mr-1" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="cores" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="avancado" className="text-xs">
            <Settings2 className="w-3 h-3 mr-1" />
            Avançado
          </TabsTrigger>
        </TabsList>

        {/* Aba Básico */}
        <TabsContent value="basico" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Texto</Label>
            <Input 
              value={text} 
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Digite o texto do slide"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Mostrar Texto</Label>
            <Switch 
              checked={localStyle.showText} 
              onCheckedChange={(v) => updateStyle({ showText: v })}
            />
          </div>

          <div className="space-y-2">
            <Label>Alinhamento</Label>
            <div className="flex gap-2">
              {[
                { value: "left", icon: AlignLeft },
                { value: "center", icon: AlignCenter },
                { value: "right", icon: AlignRight },
              ].map(({ value, icon: Icon }) => (
                <Button
                  key={value}
                  variant={localStyle.textAlign === value ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateStyle({ textAlign: value as SlideStyle["textAlign"] })}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Posição Vertical</Label>
              <span className="text-xs text-muted-foreground">{localStyle.positionY}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateStyle({ positionY: Math.max(0, localStyle.positionY - 5) })}>
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Slider 
                value={[localStyle.positionY]} 
                onValueChange={([v]) => updateStyle({ positionY: v })}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateStyle({ positionY: Math.min(100, localStyle.positionY + 5) })}>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tamanho da Fonte</Label>
              <span className="text-xs text-muted-foreground">{localStyle.fontSize}px</span>
            </div>
            <Slider 
              value={[localStyle.fontSize]} 
              onValueChange={([v]) => updateStyle({ fontSize: v })}
              min={16}
              max={72}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Margem Esquerda</Label>
              <span className="text-xs text-muted-foreground">{localStyle.marginLeft}px</span>
            </div>
            <Slider 
              value={[localStyle.marginLeft]} 
              onValueChange={([v]) => updateStyle({ marginLeft: v })}
              min={0}
              max={200}
              step={4}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Margem Direita</Label>
              <span className="text-xs text-muted-foreground">{localStyle.marginRight}px</span>
            </div>
            <Slider 
              value={[localStyle.marginRight]} 
              onValueChange={([v]) => updateStyle({ marginRight: v })}
              min={0}
              max={200}
              step={4}
            />
          </div>
        </TabsContent>

        {/* Aba Cores */}
        <TabsContent value="cores" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Presets de Cores</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateStyle({ textColor: preset.text, backgroundColor: preset.bg })}
                  className="p-2 rounded-lg border hover:border-primary transition-colors"
                  style={{ background: preset.bg }}
                >
                  <span style={{ color: preset.text }} className="text-xs font-bold">
                    Aa
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor do Texto</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localStyle.textColor}
                onChange={(e) => updateStyle({ textColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={localStyle.textColor}
                onChange={(e) => updateStyle({ textColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor de Fundo</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localStyle.backgroundColor}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={localStyle.backgroundColor}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Opacidade do Overlay</Label>
              <span className="text-xs text-muted-foreground">{localStyle.overlayOpacity}%</span>
            </div>
            <Slider 
              value={[localStyle.overlayOpacity]} 
              onValueChange={([v]) => updateStyle({ overlayOpacity: v })}
              min={0}
              max={100}
            />
          </div>
        </TabsContent>

        {/* Aba Avançado */}
        <TabsContent value="avancado" className="space-y-4 mt-4">
          {/* Sombra */}
          <div className="space-y-3 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <Label>Sombra</Label>
              <Switch 
                checked={localStyle.shadowEnabled} 
                onCheckedChange={(v) => updateStyle({ shadowEnabled: v })}
              />
            </div>
            {localStyle.shadowEnabled && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localStyle.shadowColor}
                    onChange={(e) => updateStyle({ shadowColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">Blur</span>
                      <span className="text-xs text-muted-foreground">{localStyle.shadowBlur}px</span>
                    </div>
                    <Slider 
                      value={[localStyle.shadowBlur]} 
                      onValueChange={([v]) => updateStyle({ shadowBlur: v })}
                      min={0}
                      max={20}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Glow */}
          <div className="space-y-3 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <Label>Glow (Brilho)</Label>
              <Switch 
                checked={localStyle.glowEnabled} 
                onCheckedChange={(v) => updateStyle({ glowEnabled: v })}
              />
            </div>
            {localStyle.glowEnabled && (
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localStyle.glowColor}
                  onChange={(e) => updateStyle({ glowColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs">Intensidade</span>
                    <span className="text-xs text-muted-foreground">{localStyle.glowIntensity}px</span>
                  </div>
                  <Slider 
                    value={[localStyle.glowIntensity]} 
                    onValueChange={([v]) => updateStyle({ glowIntensity: v })}
                    min={0}
                    max={30}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Borda do Texto */}
          <div className="space-y-3 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <Label>Contorno do Texto</Label>
              <Switch 
                checked={localStyle.borderEnabled} 
                onCheckedChange={(v) => updateStyle({ borderEnabled: v })}
              />
            </div>
            {localStyle.borderEnabled && (
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localStyle.borderColor}
                  onChange={(e) => updateStyle({ borderColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs">Espessura</span>
                    <span className="text-xs text-muted-foreground">{localStyle.borderWidth}px</span>
                  </div>
                  <Slider 
                    value={[localStyle.borderWidth]} 
                    onValueChange={([v]) => updateStyle({ borderWidth: v })}
                    min={1}
                    max={5}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Espaçamento */}
          <div className="space-y-3 p-3 rounded-lg bg-muted/50">
            <Label>Espaçamento</Label>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-sm">Entre Letras</Label>
                  <span className="text-xs text-muted-foreground">{localStyle.letterSpacing}px</span>
                </div>
                <Slider 
                  value={[localStyle.letterSpacing]} 
                  onValueChange={([v]) => updateStyle({ letterSpacing: v })}
                  min={-5}
                  max={20}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-sm">Entre Linhas</Label>
                  <span className="text-xs text-muted-foreground">{localStyle.lineHeight.toFixed(1)}</span>
                </div>
                <Slider 
                  value={[localStyle.lineHeight * 10]} 
                  onValueChange={([v]) => updateStyle({ lineHeight: v / 10 })}
                  min={8}
                  max={25}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-sm">Padding</Label>
                  <span className="text-xs text-muted-foreground">{localStyle.padding}px</span>
                </div>
                <Slider 
                  value={[localStyle.padding]} 
                  onValueChange={([v]) => updateStyle({ padding: v })}
                  min={0}
                  max={60}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      </div>

      {/* Ações - Fixas na parte inferior */}
      <div className="sticky bottom-0 bg-background pt-2 border-t border-border space-y-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={saveAsDefault} className="flex-1">
          <Save className="w-3 h-3 mr-1" />
          Salvar Padrão
        </Button>
        <Button variant="outline" size="sm" onClick={loadDefault} className="flex-1">
          <RotateCcw className="w-3 h-3 mr-1" />
          Carregar Padrão
        </Button>
      </div>

      {/* Botão Salvar Edição - destaque quando há mudanças não salvas */}
      {onSave && (
        <Button 
          onClick={handleSave} 
          className={`w-full ${hasUnsavedChanges ? 'bg-primary hover:bg-primary/90' : ''}`}
          variant={hasUnsavedChanges ? 'default' : 'outline'}
          disabled={saving || !hasUnsavedChanges}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {hasUnsavedChanges ? 'Salvar Edição *' : 'Edição Salva'}
        </Button>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={() => handleDownload(true)} 
          className="flex-1"
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Com Texto
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleDownload(false)} 
          className="flex-1"
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Sem Texto
        </Button>
      </div>
      </div>
    </div>
  );
}
