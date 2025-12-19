import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Termos de Uso</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Termos de Uso do Gerador 3</CardTitle>
            <p className="text-sm text-muted-foreground">Última atualização: 19 de dezembro de 2024</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-6">
            
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar o Gerador 3, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Gerador 3 é uma plataforma de criação de conteúdo que utiliza inteligência artificial para 
                gerar imagens, vídeos e carrosséis para redes sociais. O serviço opera com um sistema de 
                créditos que são consumidos conforme o uso das funcionalidades.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Conta de Usuário</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para utilizar o Gerador 3, você deve criar uma conta fornecendo informações precisas e completas. 
                Você é responsável por manter a confidencialidade de sua conta e senha, e por todas as atividades 
                que ocorram em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Sistema de Créditos</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Gerador 3 utiliza um sistema de créditos para acesso às funcionalidades. Os créditos podem ser 
                adquiridos através dos pacotes disponíveis na plataforma. Os créditos não são reembolsáveis e 
                não podem ser transferidos entre contas. Os créditos adquiridos não expiram.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Uso Aceitável</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Você concorda em não usar o Gerador 3 para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Criar conteúdo ilegal, difamatório, obsceno ou ofensivo</li>
                <li>Violar direitos de propriedade intelectual de terceiros</li>
                <li>Criar conteúdo que promova violência, discriminação ou ódio</li>
                <li>Gerar deepfakes ou conteúdo enganoso com intenção maliciosa</li>
                <li>Sobrecarregar ou interferir no funcionamento do serviço</li>
                <li>Tentar acessar áreas não autorizadas do sistema</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Propriedade do Conteúdo</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo conteúdo gerado através do Gerador 3 é de propriedade do usuário que o criou. 
                Você mantém todos os direitos sobre as imagens, vídeos e outros materiais que criar 
                usando nossa plataforma, incluindo o direito de uso comercial.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Upload de Conteúdo</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao fazer upload de imagens ou vídeos para o Gerador 3, você declara que possui os direitos 
                necessários sobre esse conteúdo. Você é o único responsável pelo conteúdo que faz upload 
                e concorda em não fazer upload de material que viole direitos de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Gerador 3 é fornecido "como está", sem garantias de qualquer tipo. Não nos responsabilizamos 
                por danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso ou impossibilidade 
                de uso do serviço. O uso do conteúdo gerado é de inteira responsabilidade do usuário.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Modificações do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto do Gerador 3 
                a qualquer momento, com ou sem aviso prévio. Também podemos atualizar estes Termos de Uso 
                periodicamente, e o uso continuado do serviço constitui aceitação das alterações.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Cancelamento e Encerramento</h2>
              <p className="text-muted-foreground leading-relaxed">
                Você pode encerrar sua conta a qualquer momento. Reservamo-nos o direito de suspender ou 
                encerrar contas que violem estes Termos de Uso. Em caso de encerramento, os créditos 
                restantes não serão reembolsados.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através 
                dos canais de suporte disponíveis na plataforma.
              </p>
            </section>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
