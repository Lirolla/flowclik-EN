import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliticaDeRefund() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Refund Policy</h1>
          <p className="text-zinc-400 mb-8">Last update: {new Date().toLocaleDateString('en-GB')}</p>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Satisfaction Guarantee</h2>
              <p className="text-zinc-300 leading-relaxed">
                TV Londres Ltd, operator of the FlowClik platform, is committed to the satisfaction of our 
                clients. We offer a fair and transparent refund policy for subscriptions to our 
                SaaS management platform for photographers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Period de Teste Gratuito</h2>
              <p className="text-zinc-300 leading-relaxed">
                All new subscribers are entitled to <strong>7 days free trial</strong>. During this 
                period, you can cancelar a qualquer momento sem none custo. Not will be cobrado nada se you 
                cancelar before do end do trial period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Refund Policy - 14 Days</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Oferecemos refund integral para novos assinbefore que solicitarem o cancellation inside de 
                <strong> 14 days corridos</strong> after o first pagamento (after o end do trial period 
                gratuito).
              </p>
              <p className="text-zinc-300 leading-relaxed">
                <strong>Conditions for refund:</strong>
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Request made within 14 days after the first payment</li>
                <li>Applicable only to the first subscription (new clients)</li>
                <li>Refund processado em until 10 business days</li>
                <li>Amount refunded via the same payment method used</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Renewals and Recurring Subscriptions</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                <strong>Importante:</strong> The 14-day refund policy applies ONLY to the first 
                payment from new subscribers. Subsequent monthly or annual renewals <strong>are not 
                eligible for refund</strong>.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                You can cancel your subscription at any time through the settings panel, and will have 
                access to services until the end of the already paid period. There will be no future charges after cancellation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Add-ons e Services Adicionais</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Add-ons adquiridos (as armazenamento extra ou galerias adicionais) seguem a mesma policy:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Refund available inside de 14 days after a first compra do add-on</li>
                <li>Renewals mensais de add-ons are not reembolsáveis</li>
                <li>Cancellation de add-ons can ser feito a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Como Solicitar Refund</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para solicitar um refund eligible, siga os steps below:
              </p>
              <ol className="list-decimal ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Envie um email para <strong className="text-purple-400">suporte@flowclik.com</strong></li>
                <li>Inclua no assunto: "Request de Refund - [Seu Email de Cadastro]"</li>
                <li>No corpo do email, informe:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Seu nome complete e email de cadastro</li>
                    <li>Data da signature</li>
                    <li>Motivo do cancellation (optional, mas nos help a melhourr)</li>
                  </ul>
                </li>
                <li>Aguarde confirmation em until 2 business days</li>
                <li>Refund processado em until 10 business days after aprovação</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Exceções e Casos Especiais</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                A policy de refund <strong>NÃO se aplica</strong> nos seguintes casos:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Contas suspendeds por violação dos Tuemos de Service</li>
                <li>Uso abusivo ou fraudulento da plataforma</li>
                <li>Solicitações feitas after o period de 14 days</li>
                <li>Renewals automatics (segunda charge em daynte)</li>
                <li>Downgrade de plyear (mudança para plyear inferior)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cancellation de Assinatura</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                You can cancelar sua signature a qualquer momento through de:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Painel de Settings → Assinatura → Cancelar Assinatura</li>
                <li>Email para suporte@flowclik.com solicitando cancellation</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                After o cancellation, you continuará tendo acesso à plataforma until o final do period already pago. 
                Seus dados serão mantidos por 30 days caso deseje reativar a conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Processamento de Refunds</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Refunds approveds are processados da seguinte forma:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Cartão de Crédito:</strong> 5-10 business days (depende do banco emissor)</li>
                <li><strong>PayPal:</strong> 3-5 business days</li>
                <li><strong>Outros methods:</strong> Até 10 business days</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                O valor will be refunded pelo mesmo method de pagamento utilizado na compra original.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Disputas e Chargebacks</h2>
              <p className="text-zinc-300 leading-relaxed">
                Antes de abrir uma disputa ou chargeback junto ao seu banco ou operadora de cartão, between em 
                contato conosco. Estamos comprometidos em resolver qualquer problema de forma amigável. Disputas 
                not comunicadas canm resultar na suspenare da conta e impossibilidade de uso futuro da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Changes nesta Policy</h2>
              <p className="text-zinc-300 leading-relaxed">
                Reservamo-nos o direito de modificar esta Refund Policy a qualquer momento. Mudanças 
                significativas serão comunicadas por email com pelo menos 30 days de notice. Assinaturas 
                ativas no momento da mudança continuarão regidas pela policy vigente no momento da booking.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Contact Information</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para questions about esta Refund Policy ou para solicitar refund:
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
