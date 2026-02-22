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
          <h1 className="text-4xl font-bold text-white mb-2">Termos de Serviço</h1>
          <p className="text-zinc-400 mb-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4 mb-8">
            <p className="text-purple-300 text-sm">
              <strong className="text-purple-200">Empresa:</strong> TV Londres Ltd<br />
              <strong className="text-purple-200">Nome Fantasia:</strong> FlowClik<br />
              <strong className="text-purple-200">Website:</strong> flowclik.com
            </p>
          </div>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-zinc-300 leading-relaxed">
                Ao acessar e usar a plataforma FlowClik, você concorda em cumprir e estar vinculado aos seguintes 
                Termos de Serviço. Se você não concordar com alguma parte destes termos, não deverá usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Descrição do Serviço</h2>
              <p className="text-zinc-300 leading-relaxed">
                FlowClik é uma plataforma SaaS (Software as a Service) que fornece ferramentas de gestão para fotógrafos 
                profissionais, incluindo gerenciamento de clientes, agendamentos, galerias de fotos, seleção de imagens, 
                álbuns finais e sistema de vendas de fotos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Cadastro e Conta</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para usar nossos serviços, você deve:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Fornecer informações precisas e completas durante o cadastro</li>
                <li>Manter a segurança de sua senha e conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                <li>Ser responsável por todas as atividades que ocorrem em sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Planos e Pagamentos</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                FlowClik oferece diferentes planos de assinatura (Starter, Pro, Enterprise). Os pagamentos são processados 
                através do Paddle, nosso parceiro de pagamentos. Ao assinar um plano, você concorda com:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Pagamentos recorrentes mensais ou anuais conforme o plano escolhido</li>
                <li>Renovação automática até o cancelamento</li>
                <li>Política de reembolso de 14 dias para novos assinantes</li>
                <li>Possíveis ajustes de preço com notificação prévia de 30 dias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Uso Aceitável</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Você concorda em NÃO:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Usar a plataforma para fins ilegais ou não autorizados</li>
                <li>Fazer upload de conteúdo ofensivo, difamatório ou que viole direitos autorais</li>
                <li>Tentar acessar áreas restritas do sistema ou contas de outros usuários</li>
                <li>Sobrecarregar ou interferir com a infraestrutura da plataforma</li>
                <li>Revender ou redistribuir nossos serviços sem autorização</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Propriedade Intelectual</h2>
              <p className="text-zinc-300 leading-relaxed">
                Todo o conteúdo da plataforma FlowClik (código, design, logos, textos) é propriedade da FlowClik e 
                protegido por leis de direitos autorais. As fotos e conteúdos enviados pelos fotógrafos permanecem 
                de propriedade dos respectivos fotógrafos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Armazenamento e Backup</h2>
              <p className="text-zinc-300 leading-relaxed">
                Fornecemos armazenamento em nuvem conforme o plano contratado. Embora façamos backups regulares, 
                recomendamos que você mantenha cópias de segurança de seus arquivos importantes. Não nos responsabilizamos 
                por perda de dados devido a falhas técnicas, exclusão acidental ou cancelamento de conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cancelamento e Encerramento</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Você pode cancelar sua assinatura a qualquer momento através do painel de configurações. Ao cancelar:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Você terá acesso aos serviços até o final do período pago</li>
                <li>Seus dados serão mantidos por 30 dias após o cancelamento</li>
                <li>Após 30 dias, seus dados serão permanentemente excluídos</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos de Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Limitação de Responsabilidade</h2>
              <p className="text-zinc-300 leading-relaxed">
                FlowClik é fornecido "como está" sem garantias de qualquer tipo. Não nos responsabilizamos por danos 
                indiretos, incidentais ou consequenciais resultantes do uso ou impossibilidade de uso da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Modificações dos Termos</h2>
              <p className="text-zinc-300 leading-relaxed">
                Podemos modificar estes Termos de Serviço a qualquer momento. Notificaremos você sobre mudanças 
                significativas por email ou através da plataforma. O uso continuado após as mudanças constitui 
                aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Lei Aplicável</h2>
              <p className="text-zinc-300 leading-relaxed">
                Estes Termos de Serviço são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos 
                tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Contato</h2>
              <p className="text-zinc-300 leading-relaxed">
                Para dúvidas sobre estes Termos de Serviço, entre em contato conosco através de:
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
