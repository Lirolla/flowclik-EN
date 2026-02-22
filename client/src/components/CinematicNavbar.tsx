import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { SITE_ROUTES } from "@/lib/siteRoutes";
import { Menu, X, ShoppingCart, User } from "lucide-react";

interface CinematicNavbarProps {
  currentPage?: string;
}

export default function CinematicNavbar({ currentPage }: CinematicNavbarProps) {
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { data: oldSiteConfig } = trpc.site.getConfig.useQuery();
  const config = { ...oldSiteConfig, ...siteConfig };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const showVideo = config?.businessMode === "video_only" || config?.businessMode === "both";
  const showStock = config?.stockPhotosEnabled === 1;

  const menuItems = [
    { label: "Início", href: SITE_ROUTES.home(), id: "/" },
    { label: "Galerias", href: SITE_ROUTES.galerias(), id: "galerias" },
    { label: "Serviços", href: SITE_ROUTES.servicos(), id: "servicos" },
    { label: "Portfólio", href: SITE_ROUTES.portfolio(), id: "portfolio" },
    ...(showStock ? [{ label: "Fotos Stock", href: SITE_ROUTES.fotosStock(), id: "fotos-stock" }] : []),
    ...(showVideo ? [{ label: "Vídeos", href: SITE_ROUTES.video(), id: "video" }] : []),
    { label: "Sobre", href: SITE_ROUTES.sobre(), id: "sobre" },
    { label: "Contato", href: SITE_ROUTES.contato(), id: "contato" },
  ];

  return (
    <>
      {/* Cinematic top bar - thin amber line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A574] to-transparent z-[60]" />
      
      {/* Navbar */}
      <nav
        className={`fixed top-[2px] left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? "bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-2xl shadow-black/50"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo - elegant cinematic */}
            <Link href={SITE_ROUTES.home()}>
              <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {siteConfig?.logoUrl ? (
                  <img
                    src={siteConfig.logoUrl}
                    alt={siteConfig.siteName || "Site"}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-light tracking-[0.4em] text-[#D4A574] uppercase">
                      {siteConfig?.siteName || "CINEMA"}
                    </span>
                    <span className="text-[9px] tracking-[0.6em] text-white/40 uppercase -mt-1">
                      photography & film
                    </span>
                  </div>
                )}
              </a>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-10">
              {menuItems.map((item) => (
                <Link key={item.id} href={item.href}>
                  <a
                    className={`relative text-[11px] font-light tracking-[0.25em] uppercase transition-all duration-300 ${
                      currentPage === item.id
                        ? "text-[#D4A574]"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {currentPage === item.id && (
                      <span className="absolute -bottom-2 left-0 right-0 h-[1px] bg-[#D4A574]" />
                    )}
                  </a>
                </Link>
              ))}
              
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                <Link href="/cliente-acesso">
                  <a className="text-white/50 hover:text-[#D4A574] transition-colors">
                    <User className="w-4 h-4" />
                  </a>
                </Link>
                <Link href="/carrinho">
                  <a className="text-white/50 hover:text-[#D4A574] transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </a>
                </Link>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex lg:hidden items-center gap-4">
              <Link href="/carrinho">
                <a className="text-white/50 hover:text-[#D4A574]">
                  <ShoppingCart className="w-4 h-4" />
                </a>
              </Link>
              <button
                onClick={toggleMenu}
                className="text-white/70 hover:text-[#D4A574] transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cinematic bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent z-[60] pointer-events-none" />

      {/* Mobile Menu - Cinematic slide */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" onClick={closeMenu} />
          <div className="fixed top-[72px] right-0 bottom-0 w-full max-w-sm bg-[#0A0A0A]/98 border-l border-[#D4A574]/10 overflow-y-auto">
            {/* Cinematic letterbox effect */}
            <div className="h-8 bg-gradient-to-b from-[#D4A574]/5 to-transparent" />
            
            <div className="p-8 space-y-1">
              {menuItems.map((item, index) => (
                <Link key={item.id} href={item.href}>
                  <a
                    onClick={closeMenu}
                    className={`block py-4 border-b border-white/5 transition-all duration-300 ${
                      currentPage === item.id
                        ? "text-[#D4A574]"
                        : "text-white/50 hover:text-white hover:pl-2"
                    }`}
                  >
                    <span className="text-[10px] text-white/20 tracking-[0.3em] mr-4">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-light tracking-[0.2em] uppercase">
                      {item.label}
                    </span>
                  </a>
                </Link>
              ))}
              
              <div className="pt-6 flex gap-4">
                <Link href="/cliente-acesso">
                  <a
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-6 py-3 border border-[#D4A574]/30 text-[#D4A574] text-xs tracking-[0.2em] uppercase hover:bg-[#D4A574]/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Cliente
                  </a>
                </Link>
                <Link href="/carrinho">
                  <a
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-6 py-3 border border-[#D4A574]/30 text-[#D4A574] text-xs tracking-[0.2em] uppercase hover:bg-[#D4A574]/10 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Carrinho
                  </a>
                </Link>
              </div>
            </div>

            {/* Cinematic letterbox bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#D4A574]/5 to-transparent" />
          </div>
        </div>
      )}
    </>
  );
}
