import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Coins, CreditCard, History, Sparkles, Zap, Crown } from "lucide-react";

// Tipos locais para os dados
interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  priceInCents: number;
  isFeatured?: boolean | null;
}

interface Provider {
  name: string;
  displayName: string;
  creditsPerUse: number;
  quality: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  balance: number;
  description: string | null;
  createdAt: Date;
}

// Dados estáticos dos providers (enquanto a API não está disponível)
const IMAGE_PROVIDERS: Provider[] = [
  { name: "omniinfer", displayName: "OmniInfer (Econômico)", creditsPerUse: 1, quality: "economy" },
  { name: "dezgo", displayName: "Dezgo (Econômico)", creditsPerUse: 1, quality: "economy" },
  { name: "replicate", displayName: "Replicate FLUX (Padrão)", creditsPerUse: 2, quality: "standard" },
  { name: "runware", displayName: "Runware (Padrão)", creditsPerUse: 2, quality: "standard" },
  { name: "manus", displayName: "Manus AI (Premium)", creditsPerUse: 2, quality: "premium" },
];

const VIDEO_PROVIDERS: Provider[] = [
  { name: "kenburns", displayName: "Ken Burns (Local)", creditsPerUse: 3, quality: "economy" },
  { name: "replicate_wan", displayName: "Replicate Wan 480p", creditsPerUse: 15, quality: "standard" },
  { name: "replicate_wan_hd", displayName: "Replicate Wan 720p HD", creditsPerUse: 30, quality: "premium" },
  { name: "runware_luma", displayName: "Runware Luma (Premium)", creditsPerUse: 40, quality: "premium" },
];

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 1, name: "Starter", credits: 30, priceInCents: 3990, isFeatured: false },
  { id: 2, name: "Popular", credits: 100, priceInCents: 9990, isFeatured: true },
  { id: 3, name: "Pro", credits: 300, priceInCents: 24990, isFeatured: false },
];

export default function Credits() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Verificar parâmetros de URL para feedback do Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Pagamento realizado com sucesso! Seus créditos foram adicionados.");
      window.history.replaceState({}, "", "/credits");
    } else if (params.get("canceled") === "true") {
      toast.info("Pagamento cancelado.");
      window.history.replaceState({}, "", "/credits");
    }
  }, []);

  const handleBuyCredits = async (packageId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para comprar créditos");
      return;
    }
    setIsProcessing(true);
    
    // TODO: Implementar checkout quando Stripe estiver configurado
    toast.info("Sistema de pagamento em configuração. Entre em contato para comprar créditos.");
    setIsProcessing(false);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPackageIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "starter":
        return <Zap className="h-6 w-6" />;
      case "popular":
        return <Sparkles className="h-6 w-6" />;
      case "pro":
        return <Crown className="h-6 w-6" />;
      default:
        return <Coins className="h-6 w-6" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-6xl py-8 px-4 md:px-6">
        {/* Header com saldo */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Créditos</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus créditos e histórico de transações
              </p>
            </div>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo atual</p>
                    <p className="text-3xl font-bold">{balance}</p>
                    <p className="text-xs text-muted-foreground">créditos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="packages" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Comprar Créditos
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <Coins className="h-4 w-4" />
              Tabela de Preços
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Pacotes de créditos */}
          <TabsContent value="packages">
            <div className="grid md:grid-cols-3 gap-6">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    pkg.isFeatured ? "border-primary shadow-primary/20" : ""
                  }`}
                >
                  {pkg.isFeatured && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-lg">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`mx-auto p-3 rounded-full mb-2 ${
                      pkg.isFeatured ? "bg-primary/20" : "bg-muted"
                    }`}>
                      {getPackageIcon(pkg.name)}
                    </div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>
                      {pkg.credits} créditos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-4xl font-bold">
                        {formatPrice(pkg.priceInCents)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(Math.round(pkg.priceInCents / pkg.credits))} por crédito
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={pkg.isFeatured ? "default" : "outline"}
                      onClick={() => handleBuyCredits(pkg.name.toLowerCase())}
                      disabled={isProcessing || !user}
                    >
                      {isProcessing ? "Processando..." : "Comprar"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {!user && (
              <Card className="mt-6 bg-muted/50">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Faça login para comprar créditos
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tabela de preços */}
          <TabsContent value="pricing">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Providers de imagem */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Geração de Imagens
                  </CardTitle>
                  <CardDescription>
                    Escolha o provider que melhor atende suas necessidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {IMAGE_PROVIDERS.map((provider) => (
                      <div
                        key={provider.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              provider.quality === "premium"
                                ? "default"
                                : provider.quality === "standard"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {provider.quality === "premium"
                              ? "Premium"
                              : provider.quality === "standard"
                              ? "Padrão"
                              : "Econômico"}
                          </Badge>
                          <span className="font-medium">{provider.displayName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{provider.creditsPerUse}</span>
                          <span className="text-muted-foreground text-sm"> créditos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Providers de vídeo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Geração de Vídeos
                  </CardTitle>
                  <CardDescription>
                    Transforme suas imagens em vídeos animados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {VIDEO_PROVIDERS.map((provider) => (
                      <div
                        key={provider.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              provider.quality === "premium"
                                ? "default"
                                : provider.quality === "standard"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {provider.quality === "premium"
                              ? "Premium"
                              : provider.quality === "standard"
                              ? "Padrão"
                              : "Econômico"}
                          </Badge>
                          <span className="font-medium">{provider.displayName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{provider.creditsPerUse}</span>
                          <span className="text-muted-foreground text-sm"> créditos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>
                  Suas últimas transações de créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{tx.description || "Transação"}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              tx.amount > 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Saldo: {tx.balance}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma transação encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
