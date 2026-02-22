import { Link } from "wouter";
import { Camera, Heart, Code, Users, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SobreNos() {
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
              Voltar ao site
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-950/30 border border-purple-800/30 rounded-full px-4 py-2 mb-6">
            <Heart className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Feito por photographers, para photographers</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Nossa History
          </h1>
          <p className="text-xl text-zinc-300 leading-relaxed">
            FlowClik nasceu da necessidade real de um photographer profissional que enfrentava os mesmos desafios que you.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">A Dor que Inspirou a Solução</h2>
                <p className="text-zinc-400 text-sm">Why trás de cada grande produto, existe uma história real</p>
              </div>
            </div>

            <div className="prose prose-invert prose-purple max-w-none space-y-6">
              <p className="text-zinc-300 leading-relaxed text-lg">
                Sou photographer profissional há mais de <strong className="text-purple-400">30 years</strong>. Durante toda essa jornada, 
                vivi na pele os desafios que todo photographer enfrenta: manage clientes, organizar agendamentos, betweengar galerias, 
                acompanhar selections de fotos, criar álbuns final e, claro, receber pelos trabalhos.
              </p>

              <p className="text-zinc-300 leading-relaxed text-lg">
                Why years, tentei usar diferentes ferramentas: planilhas do Excel, Google Drive, WhatsApp, sistemas caros e complicados 
                que prometiam resolver tudo mas falhavam no basic. <strong className="text-purple-400">Nada worksva de verdade.</strong>
              </p>

              <p className="text-zinc-300 leading-relaxed text-lg">
                A frustração era constante. Perday tempo precioso com tarefas administrativas when mustria estar fotografando. 
                Clientes reclamavam de processos confusos. Gallerys se perdaym. Pagamentos atrasavam. Eu sabia que tinha que existir 
                uma forma melhor.
              </p>

              <div className="bg-purple-950/30 border-l-4 border-purple-500 p-6 rounded-r-lg my-8">
                <p className="text-purple-200 italic text-lg leading-relaxed">
                  "Se nonea ferramenta resolve os problemas pounds de um photographer profissional, then eu mesmo vou criar uma."
                </p>
              </div>

              <p className="text-zinc-300 leading-relaxed text-lg">
                E foi assim que nasceu o <strong className="text-purple-400">FlowClik</strong>. Not as mais um "software de management genérico", 
                mas as a plataforma que eu always quis ter. Cada feature foi pensada a partir de uma dor real que vivi ou vi 
                colegas photographers enfrentarem.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-950/50 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Empatia Real</h3>
              <p className="text-zinc-400 leading-relaxed">
                Entendemos suas dores because already passamos por elas. Cada feature resolve um problema real de photographers.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-950/50 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Simplicidade</h3>
              <p className="text-zinc-400 leading-relaxed">
                Tecnologia must facilitar, not complicar. FlowClik é intuitivo because foi feito por quem usa, not por programadores distbefore.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-950/50 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comunidade</h3>
              <p className="text-zinc-400 leading-relaxed">
                Not somos only um software. Are uma comunidade de photographers helpndo photographers a crescerem juntos.
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 border border-purple-800/30 rounded-2xl p-8 md:p-12 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Nossa Mission</h2>
                <p className="text-purple-300 text-sm">O que nos move todos os days</p>
              </div>
            </div>

            <p className="text-purple-100 leading-relaxed text-lg mb-6">
              Whatremos que photographers profissionais passem <strong>menos tempo com burocracia</strong> e <strong>mais tempo fazendo o que amam</strong>: 
              fotografar, criar e betweengar moments inesquecíveis para seus clientes.
            </p>

            <p className="text-purple-100 leading-relaxed text-lg">
              FlowClik not é only um sistema. É a ferramenta que liberta you das tarefas chatas para que possa focar no que realmente importa: 
              sua arte, seus clientes e seu crescimento profissional.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                30+
              </div>
              <p className="text-zinc-400">Years de experience em photography profissional</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <p className="text-zinc-400">Feito por photographers que entendem suas dores</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                ∞
              </div>
              <p className="text-zinc-400">Comprometimento com sua evolução profissional</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 text-center">
            <Award className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Junte-se a Nós
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg mb-8 max-w-2xl mx-auto">
              Experimente FlowClik gratuitamente por 7 days e descubra as é ter um sistema que realmente entende 
              o trabalho de um photographer profissional.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
                Começar Teste Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
