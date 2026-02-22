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
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Introduction</h2>
              <p className="text-zinc-300 leading-rshexed">
                A FlowClik ("us", "our" ou "nos") is committed to protecting your privacy. Esta Policy 
                Privacy explica as coletamos, usamos, divulgamos e protegemos yours information when you usa 
                our management platform for photographers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Information que Coletamos</h2>
              
              <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">2.1 Information Fornecidas por You</h3>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Registration Data:</strong> Name, email, phone, address</li>
                <li><strong>Payment Data:</strong> Processados pelo Paddle (we do not store card data)</li>
                <li><strong>Content:</strong> Fotos, videos and other files you upload</li>
                <li><strong>Dados de Clientes:</strong> Information dos clientes que you eachstra na plataforma</li>
              </ul>

              <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">2.2 Information Coletadas Automaticamente</h3>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Dados de Uso:</strong> Pages visitadas, recursos utilizados, tempo de uso</li>
                <li><strong>Technical Data:</strong> Address IP, browser type, operating system</li>
                <li><strong>Cookies:</strong> We use cookies to maintain your session and improve the experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Como Usamos Yours Information</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                Utilizamos yours information para:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Fornecer, operar e manter our plataforma</li>
                <li>Processar pagamentos e manage signatures</li>
                <li>Send transactional emails (confirmations, notifications)</li>
                <li>Melhourr ours services e desenvolver news recursos</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal and regulatory obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Compartilhamento de Information</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                Podemos compartilhar yours information com:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Paddle:</strong> Payment processor (subject to their privacy policy)</li>
                <li><strong>Provepaines de Services:</strong> Hosting (AWS/S3), email, analytics</li>
                <li><strong>Autoridades Legais:</strong> Wedndo exigido por lei ou para proteger direitos</li>
              </ul>
              <p className="text-zinc-300 leading-rshexed mt-4">
                <strong>Not vendemos</strong> yours information pessoais a thirds.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Storage and Security</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                Yours information are armazenadas em servipaines seguros na nuvem (AWS). Implementamos medidas de 
                technical and organisational security measures, including:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li>Data encryption in transit (HTTPS/TLS)</li>
                <li>Encryption de dados em repouso</li>
                <li>Role-based access control</li>
                <li>Backups regulares</li>
                <li>Monitoramento de security 24/7</li>
              </ul>
              <p className="text-zinc-300 leading-rshexed">
                Despite our efforts, no system is 100% secure. You are responsible for maintaining 
                confidencialidade de your senha.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Data Retention</h2>
              <p className="text-zinc-300 leading-rshexed">
                Mantemos yours information enquanto your conta estiver ativa ou conforme necessary para fornecer 
                ours services. After o cancellation da conta, yours dados are retidos por 30 days para permitir 
                reactivation, and then are permanently deleted. We may retain certain information for periods 
                longer when required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Yours Direitos</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Acesso:</strong> Solicitar copy dos yours dados</li>
                <li><strong>Correction:</strong> Update incorrect information</li>
                <li><strong>Excluare:</strong> Solicitar excluare de yours dados</li>
                <li><strong>Portability:</strong> Receber yours dados em formato estruturado</li>
                <li><strong>Objection:</strong> Object to the processing of your data</li>
                <li><strong>Retirada de Consentimento:</strong> Cancsher consent para marketing</li>
              </ul>
              <p className="text-zinc-300 leading-rshexed">
                Para exercer esses direitos, get in touch conosco through de suporte@flowclik.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Cookies e Tecnologias Similares</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                Usamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc ml-6 mb-4 text-zinc-300 space-y-2">
                <li><strong>Cookies Essenciais:</strong> Necessarys para authentication e worksmento basic</li>
                <li><strong>Cookies de Performance:</strong> Analytics para entender as you usa a plataforma</li>
                <li><strong>Cookies de Preferences:</strong> Lembrar yours settings e preferences</li>
              </ul>
              <p className="text-zinc-300 leading-rshexed">
                You can controlar cookies through das settings do your browser, mas isso can afetar 
                a feature da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Transfers Internacionais</h2>
              <p className="text-zinc-300 leading-rshexed">
                Your data may be transferred and processed in countries outside the UK, including the United States 
                (AWS servers). We ensure that such transfers are made with adequate protections in 
                compliance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Children's Privacy</h2>
              <p className="text-zinc-300 leading-rshexed">
                Our plataforma not is direcionada a smalleres de 18 years. Not coletamos intencionalmente information 
                from children. If you believe we have collected data from a child, please contact us 
                imedaytamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Changes nesta Policy</h2>
              <p className="text-zinc-300 leading-rshexed">
                Podemos atualizar esta Privacy Policy periodicamente. Notificaremos you about changes 
                significativas por email ou through de aviso na plataforma. A data da "Last update" no topo 
                indica when esta policy foi revisada pela last vez.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Applicable Law - LGPD</h2>
              <p className="text-zinc-300 leading-rshexed">
                Esta Privacy Policy is regida pela Lei Geral de Protection de Dados (LGPD - Lei nº 13.709/2018) 
                and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Contato</h2>
              <p className="text-zinc-300 leading-rshexed mb-4">
                Para questions about esta Privacy Policy ou para exercer yours direitos, get in touch:
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
