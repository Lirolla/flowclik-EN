import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliticaDeReembolso() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                FlowClik
              </span>
            </a>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao site
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8">
          <h1 className="text-4xl font-bold text-white mb-2">Política de Reembolso</h1>
          <p className="text-zinc-400 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Garantia de Satisfação</h2>
              <p className="text-zinc-300 leading-relaxed">
                A TV Londres Ltd, operadora da plataforma FlowClik, está comprometida com a satisfação de nossos 
                clientes. Oferecemos uma política de reembolso justa e transparente para assinaturas de nossa 
                plataforma SaaS de gestão para fotógrafos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Período de Teste Gratuito</h2>
              <p className="text-zinc-300 leading-relaxed">
                Todos os novos assinantes têm direito a <strong>7 dias de teste gratuito</strong>. Durante este 
                período, você pode cancelar a qualquer momento sem nenhum custo. Não será cobrado nada se você 
                cancelar antes do término do período de teste.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Política de Reembolso - 14 Dias</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Oferecemos reembolso integral para novos assinantes que solicitarem o cancelamento dentro de 
                <strong> 14 dias corridos</strong> após o primeiro pagamento (após o término do período de teste 
                gratuito).
              </p>
              <p className="text-zinc-300 leading-relaxed">
                <strong>Condições para reembolso:</strong>
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Solicitação feita dentro de 14 dias após o primeiro pagamento</li>
                <li>Aplicável apenas para a primeira assinatura (novos clientes)</li>
                <li>Reembolso processado em até 10 dias úteis</li>
                <li>Valor devolvido pelo mesmo método de pagamento utilizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Renovações e Assinaturas Recorrentes</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                <strong>Importante:</strong> A política de reembolso de 14 dias aplica-se APENAS ao primeiro 
                pagamento de novos assinantes. Renovações mensais ou anuais subsequentes <strong>não são 
                elegíveis para reembolso</strong>.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                Você pode cancelar sua assinatura a qualquer momento através do painel de configurações, e terá 
                acesso aos serviços até o final do período já pago. Não haverá cobrança futura após o cancelamento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Add-ons e Serviços Adicionais</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Add-ons adquiridos (como armazenamento extra ou galerias adicionais) seguem a mesma política:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Reembolso disponível dentro de 14 dias após a primeira compra do add-on</li>
                <li>Renovações mensais de add-ons não são reembolsáveis</li>
                <li>Cancelamento de add-ons pode ser feito a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Como Solicitar Reembolso</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para solicitar um reembolso elegível, siga os passos abaixo:
              </p>
              <ol className="list-decimal ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Envie um email para <strong className="text-purple-400">suporte@flowclik.com</strong></li>
                <li>Inclua no assunto: "Solicitação de Reembolso - [Seu Email de Cadastro]"</li>
                <li>No corpo do email, informe:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Seu nome completo e email de cadastro</li>
                    <li>Data da assinatura</li>
                    <li>Motivo do cancelamento (opcional, mas nos ajuda a melhorar)</li>
                  </ul>
                </li>
                <li>Aguarde confirmação em até 2 dias úteis</li>
                <li>Reembolso processado em até 10 dias úteis após aprovação</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Exceções e Casos Especiais</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                A política de reembolso <strong>NÃO se aplica</strong> nos seguintes casos:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Contas suspensas por violação dos Termos de Serviço</li>
                <li>Uso abusivo ou fraudulento da plataforma</li>
                <li>Solicitações feitas após o período de 14 dias</li>
                <li>Renovações automáticas (segunda cobrança em diante)</li>
                <li>Downgrade de plano (mudança para plano inferior)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cancelamento de Assinatura</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Você pode cancelar sua assinatura a qualquer momento através de:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Painel de Configurações → Assinatura → Cancelar Assinatura</li>
                <li>Email para suporte@flowclik.com solicitando cancelamento</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                Após o cancelamento, você continuará tendo acesso à plataforma até o final do período já pago. 
                Seus dados serão mantidos por 30 dias caso deseje reativar a conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Processamento de Reembolsos</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Reembolsos aprovados são processados da seguinte forma:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Cartão de Crédito:</strong> 5-10 dias úteis (depende do banco emissor)</li>
                <li><strong>PayPal:</strong> 3-5 dias úteis</li>
                <li><strong>Outros métodos:</strong> Até 10 dias úteis</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                O valor será devolvido pelo mesmo método de pagamento utilizado na compra original.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Disputas e Chargebacks</h2>
              <p className="text-zinc-300 leading-relaxed">
                Antes de abrir uma disputa ou chargeback junto ao seu banco ou operadora de cartão, entre em 
                contato conosco. Estamos comprometidos em resolver qualquer problema de forma amigável. Disputas 
                não comunicadas podem resultar na suspensão da conta e impossibilidade de uso futuro da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Alterações nesta Política</h2>
              <p className="text-zinc-300 leading-relaxed">
                Reservamo-nos o direito de modificar esta Política de Reembolso a qualquer momento. Mudanças 
                significativas serão comunicadas por email com pelo menos 30 dias de antecedência. Assinaturas 
                ativas no momento da mudança continuarão regidas pela política vigente no momento da contratação.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Informações de Contato</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para dúvidas sobre esta Política de Reembolso ou para solicitar reembolso:
              </p>
              <p className="text-purple-400">
                <strong>TV Londres Ltd</strong><br />
                Email: suporte@flowclik.com<br />
                Website: flowclik.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
