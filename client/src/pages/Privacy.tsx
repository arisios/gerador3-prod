import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Política de Privacidade</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Política de Privacidade do Creative Loop</CardTitle>
            <p className="text-sm text-muted-foreground">Última atualização: 19 de dezembro de 2024</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-6">
            
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                Esta Política de Privacidade descreve como o Creative Loop coleta, usa, armazena e protege 
                suas informações pessoais. Ao usar nosso serviço, você concorda com a coleta e uso de 
                informações de acordo com esta política.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Informações que Coletamos</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Coletamos os seguintes tipos de informações:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Informações de conta:</strong> nome, e-mail e dados de autenticação</li>
                <li><strong>Dados de uso:</strong> histórico de projetos, conteúdos criados e créditos utilizados</li>
                <li><strong>Conteúdo enviado:</strong> imagens e vídeos que você faz upload</li>
                <li><strong>Informações de pagamento:</strong> processadas de forma segura pelo Stripe</li>
                <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador e dispositivo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Como Usamos suas Informações</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Fornecer e manter nosso serviço</li>
                <li>Processar transações e gerenciar sua conta</li>
                <li>Personalizar sua experiência na plataforma</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Melhorar e desenvolver novos recursos</li>
                <li>Prevenir fraudes e garantir a segurança</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Armazenamento de Conteúdo</h2>
              <p className="text-muted-foreground leading-relaxed">
                As imagens e vídeos que você cria ou faz upload são armazenados de forma segura em nossos 
                servidores. Você pode excluir seu conteúdo a qualquer momento através da Galeria de Mídia. 
                Conteúdo excluído é removido permanentemente de nossos sistemas em até 30 dias.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Compartilhamento de Informações</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Não vendemos suas informações pessoais. Podemos compartilhar dados apenas:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Com provedores de serviço que nos ajudam a operar a plataforma (ex: Stripe para pagamentos)</li>
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger nossos direitos, privacidade, segurança ou propriedade</li>
                <li>Em caso de fusão, aquisição ou venda de ativos (com aviso prévio)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Segurança dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, 
                incluindo criptografia de dados em trânsito e em repouso, controles de acesso rigorosos e 
                monitoramento contínuo de segurança. No entanto, nenhum método de transmissão pela Internet 
                é 100% seguro.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Confirmar a existência de tratamento de seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar anonimização, bloqueio ou eliminação de dados</li>
                <li>Solicitar portabilidade dos dados</li>
                <li>Revogar consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para manter sua sessão ativa, lembrar suas 
                preferências e melhorar sua experiência. Você pode configurar seu navegador para recusar 
                cookies, mas isso pode afetar algumas funcionalidades do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos suas informações pessoais enquanto sua conta estiver ativa ou conforme necessário 
                para fornecer nossos serviços. Após o encerramento da conta, podemos reter certos dados 
                por períodos adicionais conforme exigido por lei ou para fins legítimos de negócio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Menores de Idade</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Creative Loop não é destinado a menores de 18 anos. Não coletamos intencionalmente informações 
                de menores. Se tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas 
                para excluir essas informações.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças 
                significativas através de aviso na plataforma ou por e-mail. O uso continuado do serviço 
                após as alterações constitui aceitação da nova política.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, 
                entre em contato conosco através dos canais de suporte disponíveis na plataforma.
              </p>
            </section>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
