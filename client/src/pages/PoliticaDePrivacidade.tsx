import { Link } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliticaDePrivacy() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-zinc-400 mb-8">Last update: {new Date().toLocaleDateString('en-GB')}</p>

          <div className="prose prose-invert prose-purple max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Introdução</h2>
              <p className="text-zinc-300 leading-relaxed">
                A FlowClik ("us", "nosso" ou "nos") is comprometida em proteger sua privacidade. Esta Política de 
                Privacy explica as coletamos, usamos, divulgamos e protegemos suas information when you usa 
                nossa plataforma de gestão para photographers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Information que Coletamos</h2>
              
              <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">2.1 Information Fornecidas por You</h3>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Dados de Cadastro:</strong> Nome, email, telefone, endereço</li>
                <li><strong>Dados de Pagamento:</strong> Processados pelo Paddle (not armazenamos dados de cartão)</li>
                <li><strong>Conteúdo:</strong> Fotos, videos e outros arquivos que you faz upload</li>
                <li><strong>Dados de Clientes:</strong> Information dos clientes que you cadastra na plataforma</li>
              </ul>

              <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">2.2 Information Coletadas Automaticamente</h3>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Dados de Uso:</strong> Pages visitadas, recursos utilizados, tempo de uso</li>
                <li><strong>Dados Técnicos:</strong> Address IP, tipo de navegador, sistema operacional</li>
                <li><strong>Cookies:</strong> Usamos cookies para manter sua sesare e melhourr a experiência</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Como Usamos Suas Information</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Utilizamos suas information para:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Fornecer, operar e manter nossa plataforma</li>
                <li>Processar pagamentos e gerenciar signatures</li>
                <li>Enviar emails transacionais (confirmações, notifications)</li>
                <li>Melhourr nossos services e desenvolver novos recursos</li>
                <li>Prevenir fraudes e ensure a segurança da plataforma</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Enviar comunicações de marketing (com seu consentimento)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Compartilhamento de Information</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Podemos compartilhar suas information com:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Paddle:</strong> Processador de pagamentos (sujeito à privacy policy deles)</li>
                <li><strong>Provedores de Services:</strong> Hospedagem (AWS/S3), email, analytics</li>
                <li><strong>Autoridades Legais:</strong> Wedndo exigido por lei ou para proteger direitos</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed mt-4">
                <strong>Not vendemos</strong> suas information pessoais a terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Storage e Monurança</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Suas information are armazenadas em servidores seguros na nuvem (AWS). Implementamos medidas de 
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
                Apesar de nossos esforços, none sistema é 100% seguro. You é responsável por manter a 
                confidencialidade de sua senha.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Retenção de Dados</h2>
              <p className="text-zinc-300 leading-relaxed">
                Mantemos suas information enquanto sua conta estiver ativa ou conforme necessário para fornecer 
                nossos services. After o cancellation da conta, seus dados are retidos por 30 days para permitir 
                reativação, e then are permanentemente excluídos. Podemos reter certas information por periods 
                mais longos when exigido por lei ou para fins legítimos de negócios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Seus Direitos</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                You tem os seguintes direitos em relação aos seus dados pessoais:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Acesso:</strong> Solicitar cópia dos seus dados</li>
                <li><strong>Correção:</strong> Atualizar information incorretas</li>
                <li><strong>Excluare:</strong> Solicitar excluare de seus dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Objeção:</strong> Opor-se ao processamento de seus dados</li>
                <li><strong>Retirada de Consentimento:</strong> Cancelar consentimento para marketing</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                Para exercer esses direitos, get in touch conosco through de suporte@flowclik.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cookies e Tecnologias Similares</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Usamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Cookies Essenciais:</strong> Necessários para autenticação e funcionamento básico</li>
                <li><strong>Cookies de Desempenho:</strong> Analytics para entender as you usa a plataforma</li>
                <li><strong>Cookies de Preferências:</strong> Lembrar suas configurações e preferências</li>
              </ul>
              <p className="text-zinc-300 leading-relaxed">
                You can controlar cookies through das configurações do seu navegador, mas isso can afetar 
                a feature da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Transferências Internacionais</h2>
              <p className="text-zinc-300 leading-relaxed">
                Seus dados canm ser transferidos e processados em países outside do Brasil, incluindo Estados Unidos 
                (servidores AWS). Garantimos que essas transferências sejam feitas com proteções adequadas em 
                conformidade com as leis de proteção de dados aplicáveis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Privacy de Crianças</h2>
              <p className="text-zinc-300 leading-relaxed">
                Nossa plataforma not é direcionada a menores de 18 years. Not coletamos intencionalmente information 
                de crianças. Se you acredita que coletamos dados de uma criança, get in touch conosco 
                imedaytamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Changes nesta Política</h2>
              <p className="text-zinc-300 leading-relaxed">
                Podemos atualizar esta Privacy Policy periodicamente. Notificaremos you about mudanças 
                significativas por email ou through de aviso na plataforma. A data da "Last update" no topo 
                indica when esta política foi revisada pela last vez.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Lei Aplicável - LGPD</h2>
              <p className="text-zinc-300 leading-relaxed">
                Esta Privacy Policy é regida pela Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
                e outras leis de proteção de dados aplicáveis no Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Contato</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Para questions about esta Privacy Policy ou para exercer seus direitos, get in touch:
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
