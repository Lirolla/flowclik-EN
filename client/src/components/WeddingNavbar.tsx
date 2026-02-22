import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { SITE_ROUTES } from "@/lib/siteRoutes";

interface WeddingNavbarProps {
  currentPage?: string;
}

export default function WeddingNavbar({ currentPage }: WeddingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { data: oldSiteConfig } = trpc.site.getConfig.useQuery();
  
  const config = { ...oldSiteConfig, ...siteConfig };
  const showVideo = config?.businessMode === "video_only" || config?.businessMode === "both";
  const showStockPhotos = config?.stockPhotosEnabled === 1;

  const closeMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { label: "Home", path: SITE_ROUTES.home() },
    { label: "Galleries", path: SITE_ROUTES.galleries() },
    { label: "Services", path: SITE_ROUTES.services() },
    { label: "Portfolio", path: SITE_ROUTES.portfolio() },
    ...(showStockPhotos ? [{ label: "Stock Photos", path: SITE_ROUTES.stockPhotos() }] : []),
    ...(showVideo ? [{ label: "Videos", path: SITE_ROUTES.video() }] : []),
    { label: "About", path: SITE_ROUTES.about() },
    { label: "Contact", path: SITE_ROUTES.contact() },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      {/* Desktop Navigation - Minimalista */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={SITE_ROUTES.home()}>
              <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {siteConfig?.logoUrl ? (
                  <img
                    src={siteConfig.logoUrl}
                    alt={siteConfig.siteName || "Site"}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="text-2xl font-serif font-bold text-foreground">
                    {config?.siteName || "Site"}
                  </span>
                )}
              </a>
            </Link>

            {/* Menu horizontal minimalista */}
            <div className="flex items-center gap-8">
              <ul className="flex items-center gap-8">
                {navItems.map((item) => {
                  const isActive = currentPage === item.path;
                  
                  return (
                    <li key={item.path}>
                      <Link href={item.path}>
                        <a
                          className={`text-sm uppercase tracking-wider transition-colors ${
                            isActive
                              ? "text-accent font-semibold"
                              : "text-foreground/80 hover:text-accent"
                          }`}
                        >
                          {item.label}
                        </a>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              
              {/* Botões Cliente e Carrinho */}
              <div className="flex items-center gap-3">
                <Link href="/client-access">
                  <a className="px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Cliente
                  </a>
                </Link>
                <Link href="/cart">
                  <a className="px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Carrinho
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm">
          <Link href="/">
            <a className="flex items-center gap-2" onClick={closeMenu}>
              {siteConfig?.logoUrl ? (
                <img
                  src={siteConfig.logoUrl}
                  alt={siteConfig.siteName || "Site"}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-serif font-bold">
                  {config?.siteName || "Site"}
                </span>
              )}
            </a>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border">
            <ul className="py-4">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      onClick={closeMenu}
                      className="block px-6 py-3 text-foreground hover:bg-muted transition-colors"
                    >
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}
              <li className="px-6 py-3 flex gap-2">
                <Link href="/client-access">
                  <a
                    onClick={closeMenu}
                    className="flex-1 px-3 py-2 text-xs bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    Cliente
                  </a>
                </Link>
                <Link href="/cart">
                  <a
                    onClick={closeMenu}
                    className="flex-1 px-3 py-2 text-xs bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Carrinho
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
