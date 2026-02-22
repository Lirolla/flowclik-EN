import { Link } from "wouter";
import { Lock, Camera, Video, Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Footer() {
  const { data: siteConfig } = trpc.site.getConfig.useQuery();
  
  const siteName = siteConfig?.siteName || "FlowClik.com";
  const siteTagline = siteConfig?.siteTagline || "A photography always foi meu modo de eternizar o que importa. Com mais de 20 years de estrada, registrei storys em diversos contextos — each imagem carregando alma, tempo e verdade.";
  
  return (
    <footer className="bg-background border-t border-border/50 mt-auto">
      {/* Section Superior */}
      <div className="border-b border-border/30">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-4xl font-bold mb-4">{siteName}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
            {siteTagline}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <span>Photography</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <span>Video</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Inferior - 3 Colunas */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna 1: Brand + Redes Sociais */}
          <div>
            <h3 className="text-xl font-bold mb-3">{siteName}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Capturando moments uniques e transformando-os em arte timtheys
            </p>
            {/* Redes Sociais */}
            <div className="flex gap-4">
              {siteConfig?.socialInstagram && (
                <a
                  href={siteConfig.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-card border border-border hover:border-accent hover:bg-accent/5 rounded-lg flex items-center justify-center transition-all group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              )}
              {siteConfig?.socialFacebook && (
                <a
                  href={siteConfig.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-card border border-border hover:border-accent hover:bg-accent/5 rounded-lg flex items-center justify-center transition-all group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              )}
              {siteConfig?.socialYouTube && (
                <a
                  href={siteConfig.socialYouTube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-card border border-border hover:border-accent hover:bg-accent/5 rounded-lg flex items-center justify-center transition-all group"
                  aria-label="YouTube"
                >
                  <Youtube className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              )}
              {siteConfig?.contactWhatsApp && (
                <a
                  href={`https://wa.me/${siteConfig.contactWhatsApp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-card border border-border hover:border-accent hover:bg-accent/5 rounded-lg flex items-center justify-center transition-all group"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Coluna 2: Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/galleries">
                  <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Gallerys
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Services
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/portfolio">
                  <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Portfolio
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    About
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contato
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Acesso Restrito */}
          <div>
            <h4 className="font-semibold mb-4">Acesso Restrito</h4>
            <Link href="/admin">
              <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Lock className="w-4 h-4" />
                Area do Photographer
              </a>
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/30 mt-8 pt-6 text-center text-sm text-muted-foreground">
          <a
            href="https://agencyl1.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Agencyl1.com
          </a>
          {" "}&copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
