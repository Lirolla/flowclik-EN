import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliticaDePrivacidade() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Política de Privacidade</h1>
          <p className="text-zinc-400 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Introdução</h2>
              <p className="text-zinc-300 leading-relaxed">
                A FlowClik ("nós", "nosso" ou "nos") está comprometida em proteger sua privacidade. Esta Política de 
                Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa 
                nossa plataforma de gestão para fotógrafos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Informações que Coletamos</h2>
              
              <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">2.1 Informações Fornecidas por Você</h3>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Dados de Cadastro:</strong> Nome, email, telefone, endereço</li>
                <li><strong>Dados de Pagamento:</strong> Processados pelo Paddle (não armazenamos dados de cartão)</li>
                <li><strong>Conteúdo:</strong> Fotos, vídeos e outros arquivos que você faz upload</li>
                <li><strong>Dados de Clientes:</strong> Informações dos clientes que você cadastra na plataforma</li>
              </ul>

              <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">2.2 Informações Coletadas Automaticamente</h3>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Dados de Uso:</strong> Páginas visitadas, recursos utilizados, tempo de uso</li>
                <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional</li>
                <li><strong>Cookies:</strong> Usamos cookies para manter sua sessão e melhorar a experiência</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Como Usamos Suas Informações</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Fornecer, operar e manter nossa plataforma</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar emails transacionais (confirmações, notificações)</li>
                <li>Melhorar nossos serviços e desenvolver novos recursos</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Enviar comunicações de marketing (com seu consentimento)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Compartilhamento de Informações</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Podemos compartilhar suas informações com:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Paddle:</strong> Processador de pagamentos (sujeito à política de privacidade deles)</li>
                <li><strong>Provedores de Serviços:</strong> Hospedagem (AWS/S3), email, analytics</li>
                <li><strong>Autoridades Legais:</strong> Quando exigido por lei ou para proteger direitos</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed mt-4">
                <strong>Não vendemos</strong> suas informações pessoais a terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Armazenamento e Segurança</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Suas informações são armazenadas em servidores seguros na nuvem (AWS). Implementamos medidas de 
                segurança técnicas e organizacionais, incluindo:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>Criptografia de dados em repouso</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Backups regulares</li>
                <li>Monitoramento de segurança 24/7</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                Apesar de nossos esforços, nenhum sistema é 100% seguro. Você é responsável por manter a 
                confidencialidade de sua senha.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Retenção de Dados</h2>
              <p className="text-zinc-300 leading-relaxed">
                Mantemos suas informações enquanto sua conta estiver ativa ou conforme necessário para fornecer 
                nossos serviços. Após o cancelamento da conta, seus dados são retidos por 30 dias para permitir 
                reativação, e então são permanentemente excluídos. Podemos reter certas informações por períodos 
                mais longos quando exigido por lei ou para fins legítimos de negócios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Seus Direitos</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Você tem os seguintes direitos em relação aos seus dados pessoais:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Acesso:</strong> Solicitar cópia dos seus dados</li>
                <li><strong>Correção:</strong> Atualizar informações incorretas</li>
                <li><strong>Exclusão:</strong> Solicitar exclusão de seus dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Objeção:</strong> Opor-se ao processamento de seus dados</li>
                <li><strong>Retirada de Consentimento:</strong> Cancelar consentimento para marketing</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                Para exercer esses direitos, entre em contato conosco através de suporte@flowclik.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cookies e Tecnologias Similares</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Usamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Cookies Essenciais:</strong> Necessários para autenticação e funcionamento básico</li>
                <li><strong>Cookies de Desempenho:</strong> Analytics para entender como você usa a plataforma</li>
                <li><strong>Cookies de Preferências:</strong> Lembrar suas configurações e preferências</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                Você pode controlar cookies através das configurações do seu navegador, mas isso pode afetar 
                a funcionalidade da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Transferências Internacionais</h2>
              <p className="text-zinc-300 leading-relaxed">
                Seus dados podem ser transferidos e processados em países fora do Brasil, incluindo Estados Unidos 
                (servidores AWS). Garantimos que essas transferências sejam feitas com proteções adequadas em 
                conformidade com as leis de proteção de dados aplicáveis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Privacidade de Crianças</h2>
              <p className="text-zinc-300 leading-relaxed">
                Nossa plataforma não é direcionada a menores de 18 anos. Não coletamos intencionalmente informações 
                de crianças. Se você acredita que coletamos dados de uma criança, entre em contato conosco 
                imediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Alterações nesta Política</h2>
              <p className="text-zinc-300 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças 
                significativas por email ou através de aviso na plataforma. A data da "Última atualização" no topo 
                indica quando esta política foi revisada pela última vez.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Lei Aplicável - LGPD</h2>
              <p className="text-zinc-300 leading-relaxed">
                Esta Política de Privacidade é regida pela Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
                e outras leis de proteção de dados aplicáveis no Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Contato</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para dúvidas sobre esta Política de Privacidade ou para exercer seus direitos, entre em contato:
              </p>
              <p className="text-purple-400">
                Email: suporte@flowclik.com<br />
                Encarregado de Dados (DPO): dpo@flowclik.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
