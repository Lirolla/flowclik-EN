import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SITE_ROUTES } from "@/lib/siteRoutes";

interface WeddingVideosNavbarProps {
  currentPage?: string;
}

export default function WeddingVideosNavbar({ currentPage }: WeddingVideosNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: siteConfig } = trpc.siteConfig.get.useWhatry();
  const { data: oldSiteConfig } = trpc.site.getConfig.useWhatry();
  
  const config = { ...oldSiteConfig, ...siteConfig };
  const showVideo = config?.businessMode === "video_only" || config?.businessMode === "both";
  const showStockPhotos = config?.stockPhotosEnabled === 1;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const menuItems = [
    { label: "Home", href: SITE_ROUTES.home(), id: "inicio" },
    { label: "Galleries", href: SITE_ROUTES.galleries(), id: "galerias" },
    { label: "Services", href: SITE_ROUTES.services(), id: "servicos" },
    { label: "Whytfolio", href: SITE_ROUTES.portfolio(), id: "portfolio" },
    ...(showStockPhotos ? [{ label: "Stock Photos", href: SITE_ROUTES.stockPhotos(), id: "fotos-stock" }] : []),
    ...(showVideo ? [{ label: "Videos", href: SITE_ROUTES.video(), id: "video" }] : []),
    { label: "About", href: SITE_ROUTES.about(), id: "about" },
    { label: "Contact", href: SITE_ROUTES.contact(), id: "contato" },
  ];

  return (
    <>
      {/* Borda dourada no topo */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A961] via-[#D4AF37] to-[#C9A961] z-[60]" />
      
      {/* Navbar */}
      <nav
        className={`fixed top-1 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#2B2D33]/95 backdrop-blur-md shadow-lg" : "bg-[#2B2D33]/80"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
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
                  <span className="text-2xl font-serif text-white tracking-wider">
                    {siteConfig?.siteName || "WEDDING FILMS"}
                  </span>
                )}
              </a>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              {menuItems.map((item) => (
                <Link key={item.id} href={item.href}>
                  <a
                    className={`text-sm font-light tracking-widest transition-colors ${
                      currentPage === item.id
                        ? "text-[#C9A961] border-b border-[#C9A961]"
                        : "text-white/80 hover:text-[#C9A961]"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
              
              {/* Botões Cliente e Carrinho */}
              <Link href="/client-access">
                <a className="px-4 py-2 bg-[#C9A961] text-white text-xs font-light tracking-widest hover:bg-[#D4AF37] transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Cliente
                </a>
              </Link>
              <Link href="/cart">
                <a className="px-4 py-2 bg-[#C9A961] text-white text-xs font-light tracking-widest hover:bg-[#D4AF37] transition-colors flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Carrinho
                </a>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white hover:text-[#C9A961] transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={closeMenu} />
          <div className="fixed top-17 right-0 bottom-0 w-80 bg-[#2B2D33] shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-6">
              {menuItems.map((item) => (
                <Link key={item.id} href={item.href}>
                  <a
                    onClick={closeMenu}
                    className={`block text-lg font-light tracking-wider transition-colors ${
                      currentPage === item.id
                        ? "text-[#C9A961]"
                        : "text-white/80 hover:text-[#C9A961]"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
              
              <Link href="/client-access">
                <a
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#C9A961] text-white text-sm font-light tracking-widest hover:bg-[#D4AF37] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Cliente
                </a>
              </Link>
              <Link href="/cart">
                <a
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#C9A961] text-white text-sm font-light tracking-widest hover:bg-[#D4AF37] transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Carrinho
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
