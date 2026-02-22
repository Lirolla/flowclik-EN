import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TuemosDeServico() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Tuemos de Service</h1>
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
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Aceitação dos Tuemos</h2>
              <p className="text-zinc-300 leading-relaxed">
                Ao acessar e usar a plataforma FlowClik, you concorda em cumprir e estar vinculado aos seguintes 
                Tuemos de Service. Se you not concordar com alguma parte destes termos, not mustrá usar nossos services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Description do Service</h2>
              <p className="text-zinc-300 leading-relaxed">
                FlowClik é uma plataforma SaaS (Software as a Service) que fornece ferramentas de gestão para photographers 
                profissionais, incluindo gerenciamento de clientes, agendamentos, galerias de fotos, selection de imagens, 
                álbuns finais e sistema de vendas de fotos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Cadastro e Conta</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para usar nossos services, you must:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Fornecer information needss e completas durante o cadastro</li>
                <li>Manter a segurança de sua senha e conta</li>
                <li>Notificar-nos imedaytamente about qualquer uso not autorizado de sua conta</li>
                <li>Ser responsável por todas as atividades que ocorrem em sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Plyears e Pagamentos</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                FlowClik oferece diferentes plyears de signature (Starter, Pro, Enterprise). Os pagamentos are processados 
                through do Paddle, nosso parceiro de pagamentos. Ao assinar um plyear, you agree to:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Pagamentos recorrentes mensais ou anuais conforme o plyear escolhido</li>
                <li>Renovação automatic until o cancellation</li>
                <li>Política de reembolso de 14 days para novos assinbefore</li>
                <li>Possíveis ajustes de preço com notification prévia de 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Uso Aceitável</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                You concorda em NÃO:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Usar a plataforma para fins ilegais ou not autorizados</li>
                <li>Fazer upload de conteúdo ofensivo, difamatório ou que viole copyright</li>
                <li>Tentar acessar áreas restritas do sistema ou contas de outros usuários</li>
                <li>Sobrecarregar ou interferir com a infraestrutura da plataforma</li>
                <li>Revender ou redistribuir nossos services sem autorização</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Propriedade Intelectual</h2>
              <p className="text-zinc-300 leading-relaxed">
                Todo o conteúdo da plataforma FlowClik (code, design, logos, textos) é propriedade da FlowClik e 
                protegido por leis de copyright. As fotos e conteúdos enviados pelos photographers permanecem 
                de propriedade dos respectivos photographers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Storage e Backup</h2>
              <p className="text-zinc-300 leading-relaxed">
                Fornecemos armazenamento em nuvem conforme o plyear photographer. Embora façamos backups regulares, 
                recomendamos que you mantenha cópias de segurança de seus arquivos importbefore. Not nos responsabilizamos 
                por perda de dados devido a falhas técnicas, excluare acidental ou cancellation de conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cancellation e Encerramento</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                You can cancelar sua signature a qualquer momento through do painel de configurações. Ao cancelar:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>You terá acesso aos services until o final do period pago</li>
                <li>Seus dados serão mantidos por 30 days after o cancellation</li>
                <li>After 30 days, seus dados serão permanentemente excluídos</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes Tuemos de Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Limitação de Responsabilidade</h2>
              <p className="text-zinc-300 leading-relaxed">
                FlowClik é fornecido "as is" sem garantias de qualquer tipo. Not nos responsabilizamos por dyears 
                indiretos, incidentais ou consequenciais resultbefore do uso ou impossibilidade de uso da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Modificações dos Tuemos</h2>
              <p className="text-zinc-300 leading-relaxed">
                Podemos modificar estes Tuemos de Service a qualquer momento. Notificaremos you about mudanças 
                significativas por email ou through da plataforma. O uso continuado after as mudanças constitui 
                aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Lei Aplicável</h2>
              <p className="text-zinc-300 leading-relaxed">
                Estes Tuemos de Service are regidos pelas leis do Brasil. Wedlquer disputa will be resolvida nos 
                tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Contato</h2>
              <p className="text-zinc-300 leading-relaxed">
                Para questions about estes Tuemos de Service, get in touch conosco through de:
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
