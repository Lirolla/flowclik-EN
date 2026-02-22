import { Link } from "wouter";
import { Camera, Zap, Users, TrendingUp, Check, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const handleStartNow = () => {
    window.location.href = "/register";
  };

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
          <nav className="hidden md:flex items-center gap-6">
            <a href="#beneficios" className="text-zinc-400 hover:text-white transition">
              Benefits
            </a>
            <a href="#as-works" className="text-zinc-400 hover:text-white transition">
              How It Works
            </a>
            <a href="#precos" className="text-zinc-400 hover:text-white transition">
              Pricing
            </a>
            <a href="#faq" className="text-zinc-400 hover:text-white transition">
              FAQ
            </a>
            <Link href="/docs">
              <a className="text-zinc-400 hover:text-white transition">Documentation</a>
            </Link>
          </nav>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleStartNow}
          >
            Cadastre-se
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Feito de photographer para photographer</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Seu site de photography
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              ready em minutes
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Sistema complete que <strong className="text-white">monta seu site sozinho</strong>.
            Fluxo perfeito do agendamento until a betweenga final.
            <strong className="text-white"> Zero hassle</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
              onClick={handleStartNow}
            >
              Get Started - 7 Days Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Ver Documentation
              </Button>
            </Link>
          </div>

          <p className="text-sm text-zinc-500">
            Apenas <strong className="text-purple-400">£ 69,90/month</strong> · Cancele when quiser · Sem taxas ocultas
          </p>

          {/* FlowClik Logo */}
          <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center p-8">
              <img 
                src="/flowclik-logo.png" 
                alt="FlowClik Logo" 
                className="max-h-full max-w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why que photographers <span className="text-purple-400">amam</span> o FlowClik?
            </h2>
            <p className="text-xl text-zinc-400">
              Everything you need to manage your photography business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Sistema Monta Sozinho",
                description: "Your site is ready automatically. Just choose your colours and logo. The rest is automatic.",
              },
              {
                icon: Users,
                title: "Fluxo Perfeito",
                description: "Do agendamento until a betweenga final. Cliente escolhe fotos, you edita, sistema betweenga. Simple assim.",
              },
              {
                icon: TrendingUp,
                title: "Venda Mais",
                description: "Integrated sales system. Individual photos, albums, frames. All with cart and automatic payment.",
              },
              {
                icon: Camera,
                title: "Gallerys Profissionais",
                description: "Share private galleries with password. Client views, picks favourites and leaves comments.",
              },
              {
                icon: Check,
                title: "Complete Management",
                description: "Appointments, clients, contracts, payments. All in one place. No spreadsheets, no confusion.",
              },
              {
                icon: Star,
                title: "Support Real",
                description: "Feito por photographers que entendem suas dores. Documentation complete e suporte when needsr.",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-purple-500/50 transition"
              >
                <benefit.icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-zinc-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="as-works" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Como works?
            </h2>
            <p className="text-xl text-zinc-400">
              3 simple steps to get started
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Crie sua conta",
                description: "Choose your subdomain (e.g.: john.flowclik.com). Your site is ready instantly. 7 free days to test everything.",
              },
              {
                step: "2",
                title: "Personalize seu site",
                description: "Add your logo, choose your brand colours. Set up your services and prices. All in minutes.",
              },
              {
                step: "3",
                title: "Comece a trabalhar",
                description: "Receba agendamentos, crie galerias, compartilhe com clientes. Sistema cuida de tudo automaticamente.",
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold">
                    {step.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-lg text-zinc-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple and fair pricing
            </h2>
            <p className="text-xl text-zinc-400">
              One plan only. No tricks.
            </p>
          </div>

          <div className="p-8 rounded-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Professional Plan</span>
              </div>
              
              <div className="mb-4">
                <span className="text-6xl font-bold">£ 69,90</span>
                <span className="text-2xl text-zinc-400">/month</span>
              </div>
              
              <p className="text-lg text-purple-300 mb-6">
                7 days grátis · Cancele when quiser
              </p>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                onClick={handleStartNow}
              >
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="font-semibold text-lg mb-4">Tudo incluído:</p>
              {[
                "Site profissional ready",
                "10 galerias (compre mais when needsr)",
                "10GB de armazenamento",
                "Sistema de vendas complete",
                "Agendamentos e contratos",
                "Client chat",
                "Support por email",
                "Atualizações automatics",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-700">
              <p className="text-sm text-zinc-400 text-center">
                <strong className="text-white">Precisa de mais?</strong> Compre add-ons inside do sistema:
                <br />
                +10GB storage · +10 galerias extras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Junte-se a centenas de photographers que already automatizaram seu business
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-12 py-6"
            onClick={handleStartNow}
          >
            Get Started - 7 Days Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Perguntas <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Frequentes</span>
            </h2>
            <p className="text-xl text-zinc-400">
              Whatstions comuns de photographers que estão começando
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Preciso saber programar para usar o FlowClik?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Not! O FlowClik foi feito para photographers, not para programadores. You configura tudo pelo painel admin de forma visual: faz upload de fotos, adiciona textos, escolhe cores e ready. O sistema monta seu site automaticamente. É tão easy quanto usar Instagram.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Posso usar meu próprio domain (ex: meunome.com)?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Sim! You can conectar seu domain próprio ou usar o subdomain gratuito que fornecemos (seusite.flowclik.com). A configuration é simple e temos guia passo a passo na documentação. Se you already tem domain, leva menos de 5 minutes para conectar.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Como works o pagamento dos clientes?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                You can receber de 3 formas: dinheiro (registra manualmente), transferência bancária (registra when receber) ou cartão online via Stripe (cliente paga direto no site e you recebe automaticamente). O sistema controla tudo: quanto falta receber, history de pagamentos e envia recibos por email.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>E se eu quiser cancelar? Perco minhas fotos?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                You can cancelar when quiser, sem penalty. Seus dados ficam disponíveis por 30 days after cancellation para you fazer backup. Recomendamos always manter backup local das fotos originais (boa practical para qualquer photographer). You also can exportar todos os dados do sistema before de cancelar.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Tem limite de fotos ou clientes?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                O plyear basic (£ 69,90/month) inclui 10GB de storage e 10 galerias. Cada galeria can ter quantas fotos you quiser. Para a maioria dos photographers, isso é mais que suficiente. Se needsr de mais, you can comprar add-ons: +10GB por £ 39,90/month ou +10 galerias por £ 49,90/month. Clientes are unlimiteds always!
              </p>
            </details>

            {/* FAQ 6 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>O sistema adiciona watermark nas fotos?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Sim! Wedndo you envia fotos para o cliente selecionar favoritas, o sistema adiciona automaticamente marca d'watermark "PREVIEW" para protect your work. Depois que client chooses e you editar, as final photos are delivereds SEM watermark. You also can customise a watermark com seu logo nas settings.
              </p>
            </details>

            {/* FAQ 7 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Consigo vender fotos avulsas de eventos?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Sim! Essa é uma das features mais legal. Depois de betweengar o álbum para o cliente principal, you ativa "Event Sales" e define preço por foto (ex: $25). O sistema gera link public where amigos/família canm comprar fotos avulsas com cartão. You recebe automaticamente via Stripe. Ótimo para graduations, festas e casamentos!
              </p>
            </details>

            {/* FAQ 8 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Preciso contratar hospedagem separada?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Not! Tudo is incluído no plyear: hospedagem do site, armazenamento de fotos, banco de dados, emails automatics, SSL (cadeado de security) e backups diários. You not needs contratar nada extra. É literalmente: assina, configura e is no ar. Zero dor de cabeça com infraestrutura.
              </p>
            </details>

            {/* FAQ 9 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>O site works no celular?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Perfeitamente! Tanto o site public quanto o painel admin are 100% responsivos. Seus clientes canm agendar, ver fotos e aprovar álbuns pelo celular. You can manage agendamentos, respwherer mensagens e until fazer upload de fotos pelo smartphone. Tudo se adapta automaticamente ao tamanho da tela.
              </p>
            </details>

            {/* FAQ 10 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Tem suporte se eu needsr de help?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Sim! Temos documentação complete com guias passo a passo, sistema de tickets para questions technical (respwheremos em until 24h) e comunidade de photographers no Discord. Além disso, o sistema tem chat integrado where you can tirar questions fasts. Estamos here para te helpr a ter sucesso!
              </p>
            </details>
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center">
            <p className="text-zinc-400 mb-6">Ainda tem questions?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/docs">
                <Button variant="outline" size="lg">
                  Ver Documentation Complete
                </Button>
              </Link>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleStartNow}
              >
                Começar 7 Days Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950/50 py-16">     <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-6 h-6 text-purple-500" />
                <span className="text-lg font-bold">FlowClik</span>
              </div>
              <p className="text-sm text-zinc-400">
                Sistema complete de management para photographers profissionais.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#beneficios" className="hover:text-white transition">Benefits</a></li>
                <li><a href="#as-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#precos" className="hover:text-white transition">Pricing</a></li>
                <li><Link href="/docs"><a className="hover:text-white transition">Documentation</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/about-nos"><a className="hover:text-white transition">About Us</a></Link></li>
                <li><a href="#recursos" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white transition">Pricing</a></li>
                <li><Link href="/docs"><a className="hover:text-white transition">Documentation</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/terms-of-service"><a className="hover:text-white transition">Tuemos de Service</a></Link></li>
                <li><Link href="/privacy-policy"><a className="hover:text-white transition">Privacy Policy</a></Link></li>
                <li><Link href="/refund-policy"><a className="hover:text-white transition">Refund Policy</a></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-sm text-zinc-500">
            <a href="https://agencyl1.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">
              Agencyl1.com &copy; {new Date().getFullYear()}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
