import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { SITE_ROUTES } from "@/lib/siteRoutes";

interface PublicNavbarProps {
  currentPage?: string;
}

export default function PublicNavbar({ currentPage }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { data: oldSiteConfig } = trpc.site.getConfig.useQuery();
  
  // Merge configs (siteConfig has businessMode, oldSiteConfig has other fields)
  const config = { ...oldSiteConfig, ...siteConfig };

  const showVideo = config?.businessMode === "video_only" || config?.businessMode === "both";
  const showStockPhotos = config?.stockPhotosEnabled === 1;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container">
        <div className="flex items-center justify-between py-4 md:flex-col md:items-center md:relative">
          {/* Logo */}
          <Link href={SITE_ROUTES.home()}>
            <a className="flex items-center gap-3" onClick={closeMenu}>
              {config?.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={config.siteName || "FlowClik"}
                  className="h-12 md:h-16 object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-accent-foreground font-bold text-xl">
                      {(config?.siteName || "L")[0]}
                    </span>
                  </div>
                  <span className="text-2xl font-serif font-bold">
                    {config?.siteName || "FlowClik"}
                  </span>
                </div>
              )}
            </a>
          </Link>

          {/* Botão Hambúrguer (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Menu Horizontal (Desktop) */}
          <div className="hidden md:flex items-center justify-center gap-6 mt-3 w-full">
            <div className="flex items-center gap-6">
              <Link href={SITE_ROUTES.home()}>
                <a className={`text-sm font-medium transition-colors ${
                  currentPage === "home" ? "text-accent font-semibold" : "hover:text-accent"
                }`}>
                  Início
                </a>
              </Link>
            <Link href={SITE_ROUTES.galleries()}>
              <a className={`text-sm font-medium transition-colors ${
                currentPage === "galerias" ? "text-accent font-semibold" : "hover:text-accent"
              }`}>
                Galerias
              </a>
            </Link>
            {showVideo && (
              <Link href={SITE_ROUTES.video()}>
                <a className={`text-sm font-medium transition-colors ${
                  currentPage === "video" ? "text-accent font-semibold" : "hover:text-accent"
                }`}>
                  Vídeo
                </a>
              </Link>
            )}
            {showStockPhotos && (
              <Link href={SITE_ROUTES.stockPhotos()}>
                <a className={`text-sm font-medium transition-colors ${
                  currentPage === "fotos-stock" ? "text-accent font-semibold" : "hover:text-accent"
                }`}>
                  Fotos Stock
                </a>
              </Link>
            )}
            <Link href={SITE_ROUTES.services()}>
              <a className={`text-sm font-medium transition-colors ${
                currentPage === "servicos" ? "text-accent font-semibold" : "hover:text-accent"
              }`}>
                Serviços
              </a>
            </Link>
            <Link href={SITE_ROUTES.portfolio()}>
              <a className={`text-sm font-medium transition-colors ${
                currentPage === "portfolio" ? "text-accent font-semibold" : "hover:text-accent"
              }`}>
                Portfólio
              </a>
            </Link>
            <Link href={SITE_ROUTES.about()}>
              <a className={`text-sm font-medium transition-colors ${
                currentPage === "sobre" ? "text-accent font-semibold" : "hover:text-accent"
              }`}>
                Sobre
              </a>
            </Link>
            <Link href={SITE_ROUTES.contact()}>
              <a className={`text-sm font-medium transition-colors ${
                currentPage === "contato" ? "text-accent font-semibold" : "hover:text-accent"
              }`}>
                Contato
              </a>
            </Link>
            </div>
            
            {/* Botões de Ação (posicionados à direita) */}
            <div className="absolute right-0 flex items-center gap-2">
              <Link href="/cart">
                <a className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Carrinho
                </a>
              </Link>
              <Link href="/client-access">
                <a className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors">
                  <User className="w-3.5 h-3.5" />
                  Cliente
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Mobile (Sidebar) */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMenu}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-background border-l z-50 md:hidden animate-in slide-in-from-right duration-300">
            <div className="flex flex-col p-6 gap-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Menu</span>
                <button
                  onClick={closeMenu}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Link href={SITE_ROUTES.home()}>
                <a 
                  onClick={closeMenu}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "home" 
                      ? "bg-accent/10 text-accent font-semibold" 
                      : "hover:bg-muted"
                  }`}
                >
                  Início
                </a>
              </Link>

              <Link href={SITE_ROUTES.galleries()}>
                <a 
                  onClick={closeMenu}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "galerias" 
                      ? "bg-accent/10 text-accent font-semibold" 
                      : "hover:bg-muted"
                  }`}
                >
                  Galerias
                </a>
              </Link>

              {showVideo && (
                <Link href={SITE_ROUTES.video()}>
                  <a 
                    onClick={closeMenu}
                    className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                      currentPage === "video" 
                        ? "bg-accent/10 text-accent font-semibold" 
                        : "hover:bg-muted"
                    }`}
                  >
                    Vídeo
                  </a>
                </Link>
              )}

              {showStockPhotos && (
                <Link href={SITE_ROUTES.stockPhotos()}>
                  <a 
                    onClick={closeMenu}
                    className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                      currentPage === "fotos-stock" 
                        ? "bg-accent/10 text-accent font-semibold" 
                        : "hover:bg-muted"
                    }`}
                  >
                    Fotos Stock
                  </a>
                </Link>
              )}

              <Link href={SITE_ROUTES.services()}>
                <a 
                  onClick={closeMenu}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "servicos" 
                      ? "bg-accent/10 text-accent font-semibold" 
                      : "hover:bg-muted"
                  }`}
                >
                  Serviços
                </a>
              </Link>

              <Link href={SITE_ROUTES.portfolio()}>
                <a 
                  onClick={closeMenu}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "portfolio" 
                      ? "bg-accent/10 text-accent font-semibold" 
                      : "hover:bg-muted"
                  }`}
                >
                  Portfólio
                </a>
              </Link>

              <Link href={SITE_ROUTES.about()}>
                <a 
                  onClick={closeMenu}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "sobre" 
                      ? "bg-accent/10 text-accent font-semibold" 
                      : "hover:bg-muted"
                  }`}
                >
                  Sobre
                </a>
              </Link>

              <Link href={SITE_ROUTES.contact()}>
                <a 
                  onClick={closeMenu}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "contato" 
                      ? "bg-accent/10 text-accent font-semibold" 
                      : "hover:bg-muted"
                  }`}
                >
                  Contato
                </a>
              </Link>

              <div className="mt-6 space-y-3">
                <Link href="/cart">
                  <a 
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Carrinho
                  </a>
                </Link>
                <Link href="/client-access">
                  <a 
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Cliente
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
