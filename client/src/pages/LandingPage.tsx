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
            <a href="#benefits" className="text-zinc-400 hover:text-white transition">
              Benefits
            </a>
            <a href="#how-it-works" className="text-zinc-400 hover:text-white transition">
              How It Works
            </a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition">
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
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Made by photographers, for photographers</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your photography website
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              ready in minutes
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            A complete system that <strong className="text-white">builds your website for you</strong>.
            Seamless workflow from booking to final delivery.
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
                View Documentation
              </Button>
            </Link>
          </div>

          <p className="text-sm text-zinc-500">
            Only <strong className="text-purple-400">£8.99/month</strong> · Cancel anytime · No hidden fees
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
      <section id="benefits" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why photographers <span className="text-purple-400">love</span> FlowClik
            </h2>
            <p className="text-xl text-zinc-400">
              Everything you need to manage your photography business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Auto-Build System",
                description: "Your website is ready automatically. Just choose your colours and logo. The rest is taken care of.",
              },
              {
                icon: Users,
                title: "Seamless Workflow",
                description: "From booking to final delivery. Client picks photos, you edit, the system delivers. Simple as that.",
              },
              {
                icon: TrendingUp,
                title: "Sell More",
                description: "Integrated sales system. Individual photos, albums, frames. All with cart and automatic payment.",
              },
              {
                icon: Camera,
                title: "Professional Galleries",
                description: "Share private galleries with password protection. Clients view, pick favourites and leave comments.",
              },
              {
                icon: Check,
                title: "Complete Management",
                description: "Appointments, clients, contracts, payments. All in one place. No spreadsheets, no confusion.",
              },
              {
                icon: Star,
                title: "Real Support",
                description: "Built by photographers who understand your challenges. Full documentation and support when you need it.",
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
      <section id="how-it-works" className="container mx-auto px-4 py-20 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How does it work?
            </h2>
            <p className="text-xl text-zinc-400">
              3 simple steps to get started
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Create your account",
                description: "Choose your subdomain (e.g.: john.flowclik.com). Your site is ready instantly. 7 free days to test everything.",
              },
              {
                step: "2",
                title: "Customise your site",
                description: "Add your logo, choose your brand colours. Set up your services and prices. All in minutes.",
              },
              {
                step: "3",
                title: "Start working",
                description: "Receive bookings, create galleries, share with clients. The system takes care of everything automatically.",
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
      <section id="pricing" className="container mx-auto px-4 py-20 border-t border-zinc-800">
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
                <span className="text-6xl font-bold">£8.99</span>
                <span className="text-2xl text-zinc-400">/month</span>
              </div>
              
              <p className="text-lg text-purple-300 mb-6">
                7 free days · Cancel anytime
              </p>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                onClick={handleStartNow}
              >
                Start Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="font-semibold text-lg mb-4">Everything included:</p>
              {[
                "Professional website ready to go",
                "10 galleries (buy more when you need)",
                "10GB storage",
                "Complete sales system",
                "Bookings and contracts",
                "Client chat",
                "Email support",
                "Automatic updates",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-700">
              <p className="text-sm text-zinc-400 text-center">
                <strong className="text-white">Need more?</strong> Purchase add-ons from within the system:
                <br />
                +10GB storage · +10 extra galleries
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
            Join hundreds of photographers who have already automated their business
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
              Frequently Asked <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-xl text-zinc-400">
              Common questions from photographers who are getting started
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Do I need to know how to code to use FlowClik?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Not at all! FlowClik was made for photographers, not programmers. You configure everything through the admin panel visually: upload photos, add text, choose colours and you're done. The system builds your site automatically. It's as easy as using Instagram.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Can I use my own domain (e.g. myname.com)?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Yes! You can connect your own domain or use the free subdomain we provide (yourname.flowclik.com). The setup is straightforward and we have a step-by-step guide in the documentation. If you already have a domain, it takes less than 5 minutes to connect.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>How do client payments work?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                You can receive payments in 3 ways: cash (record manually), bank transfer (record when received) or online card payment via Stripe (client pays directly on your site and you receive it automatically). The system tracks everything: outstanding balances, payment history and sends receipts by email.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>What if I want to cancel? Will I lose my photos?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                You can cancel anytime, no penalties. Your data remains available for 30 days after cancellation so you can back everything up. We recommend always keeping a local backup of your original photos (good practice for any photographer). You can also export all your data from the system before cancelling.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Is there a limit on photos or clients?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                The basic plan (£8.99/month) includes 10GB of storage and 10 galleries. Each gallery can hold as many photos as you like. For most photographers, this is more than enough. If you need more, you can purchase add-ons: +10GB for £3.99/month or +10 extra galleries for £4.99/month. Clients are always unlimited!
              </p>
            </details>

            {/* FAQ 6 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Does the system add watermarks to photos?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Yes! When you send photos for the client to select their favourites, the system automatically adds a "PREVIEW" watermark to protect your work. After the client chooses and you edit, the final photos are delivered WITHOUT watermarks. You can also customise the watermark with your logo in the settings.
              </p>
            </details>

            {/* FAQ 7 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Can I sell individual photos from events?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Yes! This is one of the coolest features. After delivering the album to the main client, you activate "Event Sales" and set a price per photo (e.g. £25). The system generates a public link where friends and family can buy individual photos by card. You receive payment automatically via Stripe. Great for graduations, parties and weddings!
              </p>
            </details>

            {/* FAQ 8 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Do I need to hire separate hosting?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                No! Everything is included in the plan: site hosting, photo storage, database, automatic emails, SSL (security padlock) and daily backups. You don't need to hire anything extra. It's literally: subscribe, configure and you're live. Zero headaches with infrastructure.
              </p>
            </details>

            {/* FAQ 9 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Does the site work on mobile?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Perfectly! Both the public site and the admin panel are 100% responsive. Your clients can book, view photos and approve albums on their phone. You can manage bookings, reply to messages and even upload photos from your smartphone. Everything adapts automatically to the screen size.
              </p>
            </details>

            {/* FAQ 10 */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-lg text-white">
                <span>Is there support if I need help?</span>
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Yes! We have full documentation with step-by-step guides, a ticket system for technical questions (we respond within 24 hours) and a community of photographers on Discord. The system also has an integrated chat where you can get quick answers. We're here to help you succeed!
              </p>
            </details>
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center">
            <p className="text-zinc-400 mb-6">Still have questions?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/docs">
                <Button variant="outline" size="lg">
                  View Full Documentation
                </Button>
              </Link>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleStartNow}
              >
                Start 7 Days Free
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
                Complete management system for professional photographers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link href="/docs"><a className="hover:text-white transition">Documentation</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/about-us"><a className="hover:text-white transition">About Us</a></Link></li>
                <li><a href="#benefits" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link href="/docs"><a className="hover:text-white transition">Documentation</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/terms-of-service"><a className="hover:text-white transition">Terms of Service</a></Link></li>
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
