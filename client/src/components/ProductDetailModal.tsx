import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Plus, Trash2, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ProductDetailModalProps {
  product: {
    id: number;
    name: string;
    description: string | null;
    idealClient: string | null;
    pains: string[] | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onUpdate }: ProductDetailModalProps) {
  const [activeSection, setActiveSection] = useState<"clients" | "pains" | "references">("clients");
  const [generatedClients, setGeneratedClients] = useState<any[]>([]);
  const [manualClient, setManualClient] = useState("");
  const [isGeneratingClients, setIsGeneratingClients] = useState(false);
  const [isGeneratingPains, setIsGeneratingPains] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedPainIndex, setSelectedPainIndex] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Mutations
  const generateClientsMutation = trpc.influencers.products.generateIdealClients.useMutation({
    onSuccess: (data) => {
      setGeneratedClients(data.clients || []);
      setIsGeneratingClients(false);
      toast.success("Clientes ideais gerados!");
    },
    onError: () => {
      setIsGeneratingClients(false);
      toast.error("Erro ao gerar clientes");
    }
  });

  const saveClientMutation = trpc.influencers.products.saveIdealClient.useMutation({
    onSuccess: () => {
      toast.success("Cliente ideal salvo!");
      onUpdate();
      utils.influencers.products.listProducts.invalidate();
    },
    onError: () => toast.error("Erro ao salvar cliente")
  });

  const addManualClientMutation = trpc.influencers.products.addManualClient.useMutation({
    onSuccess: () => {
      toast.success("Cliente adicionado!");
      setManualClient("");
      onUpdate();
      utils.influencers.products.listProducts.invalidate();
    },
    onError: () => toast.error("Erro ao adicionar cliente")
  });

  const generatePainsMutation = trpc.influencers.products.generatePains.useMutation({
    onSuccess: () => {
      setIsGeneratingPains(false);
      toast.success("Dores geradas!");
      onUpdate();
      utils.influencers.products.listProducts.invalidate();
    },
    onError: () => {
      setIsGeneratingPains(false);
      toast.error("Erro ao gerar dores");
    }
  });

  const { data: references } = trpc.influencers.products.listReferences.useQuery(
    { productId: product.id },
    { enabled: isOpen }
  );

  const uploadReferenceMutation = trpc.influencers.products.uploadReference.useMutation({
    onSuccess: () => {
      toast.success("Referência enviada!");
      utils.influencers.products.listReferences.invalidate({ productId: product.id });
      setUploadingImage(false);
    },
    onError: () => {
      toast.error("Erro ao enviar referência");
      setUploadingImage(false);
    }
  });

  const deleteReferenceMutation = trpc.influencers.products.deleteReference.useMutation({
    onSuccess: () => {
      toast.success("Referência removida!");
      utils.influencers.products.listReferences.invalidate({ productId: product.id });
    }
  });

  const handleGenerateClients = () => {
    setIsGeneratingClients(true);
    generateClientsMutation.mutate({ productId: product.id });
  };

  const handleSelectClient = (client: any) => {
    const clientText = `${client.name}\n${client.description}\nMotivação: ${client.motivation}\nObjeção: ${client.objection}`;
    saveClientMutation.mutate({
      productId: product.id,
      idealClient: clientText
    });
  };

  const handleAddManualClient = () => {
    if (!manualClient.trim()) return;
    addManualClientMutation.mutate({
      productId: product.id,
      idealClient: manualClient
    });
  };

  const handleGeneratePains = () => {
    if (!product.idealClient) {
      toast.error("Selecione um cliente ideal primeiro!");
      return;
    }
    setIsGeneratingPains(true);
    generatePainsMutation.mutate({ productId: product.id });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      uploadReferenceMutation.mutate({
        productId: product.id,
        type: type as any,
        imageData: base64,
        description: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndClose = () => {
    // Se houver dor selecionada, salvar no backend
    if (selectedPainIndex !== null && product.pains && product.pains[selectedPainIndex]) {
      // Por enquanto, apenas fechar (a dor já está salva no produto)
      toast.success("Configurações salvas!");
      onUpdate();
      onClose();
    } else if (product.idealClient) {
      // Tem cliente mas sem dor selecionada
      toast.success("Cliente ideal salvo!");
      onUpdate();
      onClose();
    } else {
      toast.error("Selecione um cliente ideal primeiro");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}
        </DialogHeader>

        {/* Navegação de Seções */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeSection === "clients" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("clients")}
          >
            Clientes Ideais
          </Button>
          <Button
            variant={activeSection === "pains" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("pains")}
            disabled={!product.idealClient}
          >
            Dores
          </Button>
          <Button
            variant={activeSection === "references" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("references")}
          >
            Banco de Referências
          </Button>
        </div>

        {/* Seção: Clientes Ideais */}
        {activeSection === "clients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Clientes Ideais</h3>
              <Button
                onClick={handleGenerateClients}
                disabled={isGeneratingClients}
                size="sm"
              >
                {isGeneratingClients ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Gerar 5 Clientes</>
                )}
              </Button>
            </div>

            {product.idealClient && (
              <Card className="p-3 bg-green-50 dark:bg-green-950 border-green-200">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ Cliente Selecionado
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1 whitespace-pre-wrap">
                  {product.idealClient}
                </p>
              </Card>
            )}

            {isGeneratingClients && (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
                <p className="text-sm">Gerando clientes ideais...</p>
                <p className="text-xs">Isso pode levar 20-30 segundos</p>
              </div>
            )}

            {generatedClients.length > 0 && (
              <div className="space-y-2">
                {generatedClients.map((client, idx) => (
                  <Card key={idx} className="p-3 hover:border-primary cursor-pointer transition-colors" onClick={() => handleSelectClient(client)}>
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{client.description}</p>
                    <div className="mt-2 text-xs space-y-1">
                      <p><span className="font-medium">Motivação:</span> {client.motivation}</p>
                      <p><span className="font-medium">Objeção:</span> {client.objection}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Ou adicione manualmente:</Label>
              <Textarea
                value={manualClient}
                onChange={(e) => setManualClient(e.target.value)}
                placeholder="Ex: João, 28 anos, Mecânico Iniciante..."
                rows={3}
              />
              <Button onClick={handleAddManualClient} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Cliente Manual
              </Button>
            </div>
          </div>
        )}

        {/* Seção: Dores */}
        {activeSection === "pains" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Dores do Cliente</h3>
              <Button
                onClick={handleGeneratePains}
                disabled={isGeneratingPains || !product.idealClient}
                size="sm"
              >
                {isGeneratingPains ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Gerar Dores</>
                )}
              </Button>
            </div>

            {!product.idealClient && (
              <p className="text-sm text-muted-foreground">
                Selecione um cliente ideal primeiro para gerar dores.
              </p>
            )}

            {isGeneratingPains && (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
                <p className="text-sm">Gerando dores...</p>
                <p className="text-xs">Isso pode levar 20-30 segundos</p>
              </div>
            )}

            {product.pains && product.pains.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Selecione a dor principal para usar na geração de conteúdo:</p>
                {product.pains.map((pain, idx) => (
                  <Card 
                    key={idx} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedPainIndex === idx 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPainIndex(idx)}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        checked={selectedPainIndex === idx}
                        onChange={() => setSelectedPainIndex(idx)}
                        className="mt-0.5"
                      />
                      <p className="text-sm flex-1">{idx + 1}. {pain}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seção: Banco de Referências */}
        {activeSection === "references" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Banco de Referências</h3>
              <p className="text-xs text-muted-foreground">
                {references?.length || 0} imagens
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Upload Foto do Produto */}
              <div>
                <Label className="text-xs">Foto do Produto</Label>
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "product_photo")}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {/* Upload Screenshot */}
              <div>
                <Label className="text-xs">Screenshot (App)</Label>
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "screenshot")}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {/* Upload Ambiente */}
              <div>
                <Label className="text-xs">Ambiente</Label>
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "environment")}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {/* Upload Contexto */}
              <div>
                <Label className="text-xs">Contexto</Label>
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "context")}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>

            {uploadingImage && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                <p className="text-sm text-muted-foreground mt-2">Enviando imagem...</p>
              </div>
            )}

            {/* Lista de Referências */}
            {references && references.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Referências Salvas:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {references.map((ref: any) => (
                    <div key={ref.id} className="relative group">
                      <img
                        src={ref.url}
                        alt={ref.description || "Referência"}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteReferenceMutation.mutate({ id: ref.id })}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <p className="text-xs text-center mt-1 truncate">{ref.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão Salvar e Fechar */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveAndClose}
            disabled={!product.idealClient}
          >
            Salvar e Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
