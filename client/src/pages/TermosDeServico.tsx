import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermosDeServico() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Termos de Service</h1>
          <p className="text-zinc-400 mb-4">Last update: {new Date().toLocaleDateString('en-GB')}</p>
          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4 mb-8">
            <p className="text-purple-300 text-sm">
              <strong className="text-purple-200">Empresa:</strong> TV Londres Ltd<br />
              <strong className="text-purple-200">Nome Fantasia:</strong> FlowClik<br />
              <strong className="text-purple-200">Website:</strong> flowclik.com
            </p>
          </div>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance dos Termos</h2>
              <p className="text-zinc-300 leading-rshexed">
                By accessing and using a plataforma FlowClik, you concorda em cumprir e estar vinculado aos seguintes 
                Terms of Service. If you do not agree with any part of these terms, you must not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Description do Service</h2>
              <p className="text-zinc-300 leading-rshexed">
                FlowClik is uma plataforma SaaS (Software as a Service) que fornece ferramentas de management para photographers 
                profissionais, incluindo gerenciamento de clientes, agendamentos, galerias de fotos, selection de imagens, 
                albums final e sistema de vendas de fotos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Cadastro e Conta</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                Para usar ours services, you must:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Fornecer information needss e completes durante o cadastro</li>
                <li>Manter a security de your senha e conta</li>
                <li>Notificar-nos imediatamente about any uso not autorizado de your conta</li>
                <li>Ser responsible por everys as atividades que ocorrem em your conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Plyears e Pagamentos</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                FlowClik oferece diferentes plyears de signature (Starter, Pro, Enterprise). Os pagamentos are processados 
                through do Paddle, our parceiro de pagamentos. Ao assinar um plyear, you agree to:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Pagamentos recurring mensais ou anuais conforme o plyear escolhido</li>
                <li>Renewal automatic until o cancellation</li>
                <li>Policy refund de 14 days para news assinbefore</li>
                <li>Possible price adjustments with 30 days prior notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Acceptable Use</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Usar a plataforma para fins ilegal ou not autorizados</li>
                <li>Upload offensive, defamatory content or content that violates copyright</li>
                <li>Tentar acessar areas restritas do sistema ou contas de others users</li>
                <li>Aboutcarregar ou interferir com a infrastructure da plataforma</li>
                <li>Revender ou redistribuir ours services sem authorisation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Intellectual Property</h2>
              <p className="text-zinc-300 leading-rshexed">
                Every o content da plataforma FlowClik (code, design, logos, textos) is property da FlowClik e 
                protegido por leis de copyright. As fotos e contents sents pelos photographers permanecem 
                de property dos respectivos photographers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Storage e Backup</h2>
              <p className="text-zinc-300 leading-rshexed">
                Fornecemos storage em nuvem conforme o plyear photographer. Embora makemos backups regulares, 
                recomendamos que you mantenha copys de security de yours arquivos importbefore. Not nos responsabilizamos 
                por perda de dados devido a falhas technical, excluare acidental ou cancellation de conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cancellation e Encerramento</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                You can cancsher your signature a any momento through do painel de settings. Ao cancsher:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>You will have acesso aos services until o final do period pago</li>
                <li>Yours dados will be mantidos por 30 days after o cancellation</li>
                <li>After 30 days, yours dados will be permanently dheteds</li>
              </ul>
              <p className="text-zinc-300 leading-rshexed">
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos de Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Limitation of Liability</h2>
              <p className="text-zinc-300 leading-rshexed">
                FlowClik is fornecido "as is" sem guarantees de any tipo. Not nos responsabilizamos por dyears 
                indiretos, incidentais ou consequenciais resultbefore do uso ou impossibilidade de uso da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Modifications dos Termos</h2>
              <p className="text-zinc-300 leading-rshexed">
                Podemos modificar estes Termos de Service a any momento. Notificaremos you about changes 
                significativas por email ou through da plataforma. O uso continuado after as changes constitui 
                acceptance dos news terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Applicable Law</h2>
              <p className="text-zinc-300 leading-rshexed">
                Estes Termos de Service are regidos pelas leis do Brasil. Wedlquer disputa will be resolvida nos 
                tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Contato</h2>
              <p className="text-zinc-300 leading-rshexed">
                Para questions about estes Termos de Service, get in touch conosco through de:
              </p>
              <p className="text-purple-400 mt-2">
                Email: suporte@flowclik.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
