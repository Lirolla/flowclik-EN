import { Link } from "wouter";
import { Camera, Zap, Users, TrendingUp, Check, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const handleStartNow = () => {
    window.location.href = "/cadastro";
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
              Benefícios
            </a>
            <a href="#como-funciona" className="text-zinc-400 hover:text-white transition">
              Como Funciona
            </a>
            <a href="#precos" className="text-zinc-400 hover:text-white transition">
              Preços
            </a>
            <a href="#faq" className="text-zinc-400 hover:text-white transition">
              FAQ
            </a>
            <Link href="/docs">
              <a className="text-zinc-400 hover:text-white transition">Documentação</a>
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
            <span className="text-sm text-purple-300">Feito de fotógrafo para fotógrafo</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Seu site de fotografia
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              pronto em minutos
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Sistema completo que <strong className="text-white">monta seu site sozinho</strong>.
            Fluxo perfeito do agendamento até a entrega final.
            <strong className="text-white"> Zero complicação</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
              onClick={handleStartNow}
            >
              Começar Agora - 7 Dias Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Ver Documentação
              </Button>
            </Link>
          </div>

          <p className="text-sm text-zinc-500">
            Apenas <strong className="text-purple-400">R$ 69,90/mês</strong> · Cancele quando quiser · Sem taxas ocultas
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

      {/* Benefícios */}
      <section id="beneficios" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Por que fotógrafos <span className="text-purple-400">amam</span> o FlowClik?
            </h2>
            <p className="text-xl text-zinc-400">
              Tudo que você precisa para gerenciar seu negócio de fotografia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Sistema Monta Sozinho",
                description: "Seu site fica pronto automaticamente. Você só escolhe as cores e logo. O resto é automático.",
              },
              {
                icon: Users,
                title: "Fluxo Perfeito",
                description: "Do agendamento até a entrega final. Cliente escolhe fotos, você edita, sistema entrega. Simples assim.",
              },
              {
                icon: TrendingUp,
                title: "Venda Mais",
                description: "Sistema de vendas integrado. Fotos avulsas, álbuns, molduras. Tudo com carrinho e pagamento automático.",
              },
              {
                icon: Camera,
                title: "Galerias Profissionais",
                description: "Compartilhe galerias privadas com senha. Cliente vê, escolhe favoritas e deixa comentários.",
              },
              {
                icon: Check,
                title: "Gestão Completa",
                description: "Agendamentos, clientes, contratos, pagamentos. Tudo em um só lugar. Sem planilhas, sem confusão.",
              },
              {
                icon: Star,
                title: "Suporte Real",
                description: "Feito por fotógrafos que entendem suas dores. Documentação completa e suporte quando precisar.",
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

      {/* Como Funciona */}
      <section id="como-funciona" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Como funciona?
            </h2>
            <p className="text-xl text-zinc-400">
              3 passos simples para começar
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Crie sua conta",
                description: "Escolha seu subdomínio (ex: joao.flowclik.com). Seu site fica pronto na hora. 7 dias grátis para testar tudo.",
              },
              {
                step: "2",
                title: "Personalize seu site",
                description: "Adicione seu logo, escolha as cores da sua marca. Configure seus serviços e preços. Tudo em minutos.",
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

      {/* Preços */}
      <section id="precos" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Preço simples e justo
            </h2>
            <p className="text-xl text-zinc-400">
              Um plano só. Sem pegadinhas.
            </p>
          </div>

          <div className="p-8 rounded-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Plano Profissional</span>
              </div>
              
              <div className="mb-4">
                <span className="text-6xl font-bold">R$ 69,90</span>
                <span className="text-2xl text-zinc-400">/mês</span>
              </div>
              
              <p className="text-lg text-purple-300 mb-6">
                7 dias grátis · Cancele quando quiser
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
                "Site profissional pronto",
                "10 galerias (compre mais quando precisar)",
                "10GB de armazenamento",
                "Sistema de vendas completo",
                "Agendamentos e contratos",
                "Chat com clientes",
                "Suporte por email",
                "Atualizações automáticas",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-700">
              <p className="text-sm text-zinc-400 text-center">
                <strong className="text-white">Precisa de mais?</strong> Compre add-ons dentro do sistema:
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
            Pronto para começar?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Junte-se a centenas de fotógrafos que já automatizaram seu negócio
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-12 py-6"
            onClick={handleStartNow}
          >
            Começar Agora - 7 Dias Grátis
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
              Dúvidas comuns de fotógrafos que estão começando
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
                Não! O FlowClik foi feito para fotógrafos, não para programadores. Você configura tudo pelo painel admin de forma visual: faz upload de fotos, adiciona textos, escolhe cores e pronto. O sistema monta seu site automaticamente. É tão fácil quanto usar Instagram.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Posso usar meu próprio domínio (ex: meunome.com)?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Sim! Você pode conectar seu domínio próprio ou usar o subdomínio gratuito que fornecemos (seusite.flowclik.com). A configuração é simples e temos guia passo a passo na documentação. Se você já tem domínio, leva menos de 5 minutos para conectar.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Como funciona o pagamento dos clientes?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Você pode receber de 3 formas: dinheiro (registra manualmente), transferência bancária (registra quando receber) ou cartão online via Stripe (cliente paga direto no site e você recebe automaticamente). O sistema controla tudo: quanto falta receber, histórico de pagamentos e envia recibos por email.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>E se eu quiser cancelar? Perco minhas fotos?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Você pode cancelar quando quiser, sem multa. Seus dados ficam disponíveis por 30 dias após cancelamento para você fazer backup. Recomendamos sempre manter backup local das fotos originais (boa prática para qualquer fotógrafo). Você também pode exportar todos os dados do sistema antes de cancelar.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Tem limite de fotos ou clientes?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                O plano básico (R$ 69,90/mês) inclui 10GB de storage e 10 galerias. Cada galeria pode ter quantas fotos você quiser. Para a maioria dos fotógrafos, isso é mais que suficiente. Se precisar de mais, você pode comprar add-ons: +10GB por R$ 39,90/mês ou +10 galerias por R$ 49,90/mês. Clientes são ilimitados sempre!
              </p>
            </details>

            {/* FAQ 6 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>O sistema adiciona marca d'água nas fotos?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Sim! Quando você envia fotos para o cliente selecionar favoritas, o sistema adiciona automaticamente marca d'água "PREVIEW" para proteger seu trabalho. Depois que cliente escolher e você editar, as fotos finais são entregues SEM marca d'água. Você também pode personalizar a marca d'água com seu logo nas configurações.
              </p>
            </details>

            {/* FAQ 7 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Consigo vender fotos avulsas de eventos?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Sim! Essa é uma das funcionalidades mais legais. Depois de entregar o álbum para o cliente principal, você ativa "Vendas de Eventos" e define preço por foto (ex: $25). O sistema gera link público onde amigos/família podem comprar fotos avulsas com cartão. Você recebe automaticamente via Stripe. Ótimo para formaturas, festas e casamentos!
              </p>
            </details>

            {/* FAQ 8 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Preciso contratar hospedagem separada?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Não! Tudo está incluído no plano: hospedagem do site, armazenamento de fotos, banco de dados, emails automáticos, SSL (cadeado de segurança) e backups diários. Você não precisa contratar nada extra. É literalmente: assina, configura e está no ar. Zero dor de cabeça com infraestrutura.
              </p>
            </details>

            {/* FAQ 9 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>O site funciona no celular?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Perfeitamente! Tanto o site público quanto o painel admin são 100% responsivos. Seus clientes podem agendar, ver fotos e aprovar álbuns pelo celular. Você pode gerenciar agendamentos, responder mensagens e até fazer upload de fotos pelo smartphone. Tudo se adapta automaticamente ao tamanho da tela.
              </p>
            </details>

            {/* FAQ 10 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Tem suporte se eu precisar de ajuda?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Sim! Temos documentação completa com guias passo a passo, sistema de tickets para dúvidas técnicas (respondemos em até 24h) e comunidade de fotógrafos no Discord. Além disso, o sistema tem chat integrado onde você pode tirar dúvidas rápidas. Estamos aqui para te ajudar a ter sucesso!
              </p>
            </details>
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center">
            <p className="text-zinc-400 mb-6">Ainda tem dúvidas?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/docs">
                <Button variant="outline" size="lg">
                  Ver Documentação Completa
                </Button>
              </Link>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleStartNow}
              >
                Começar 7 Dias Grátis
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
                Sistema completo de gestão para fotógrafos profissionais.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#beneficios" className="hover:text-white transition">Benefícios</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition">Como Funciona</a></li>
                <li><a href="#precos" className="hover:text-white transition">Preços</a></li>
                <li><Link href="/docs"><a className="hover:text-white transition">Documentação</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/sobre-nos"><a className="hover:text-white transition">Sobre Nós</a></Link></li>
                <li><a href="#recursos" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white transition">Preços</a></li>
                <li><Link href="/docs"><a className="hover:text-white transition">Documentação</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/termos-de-servico"><a className="hover:text-white transition">Termos de Serviço</a></Link></li>
                <li><Link href="/politica-de-privacidade"><a className="hover:text-white transition">Política de Privacidade</a></Link></li>
                <li><Link href="/politica-de-reembolso"><a className="hover:text-white transition">Política de Reembolso</a></Link></li>
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
