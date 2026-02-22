import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { SITE_ROUTES } from "@/lib/siteRoutes";
import { X, ShoppingCart, User } from "lucide-react";

interface EditorialNavbarProps {
  currentPage?: string;
}

export default function EditorialNavbar({ currentPage }: EditorialNavbarProps) {
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { data: oldSiteConfig } = trpc.site.getConfig.useQuery();
  const config = { ...oldSiteConfig, ...siteConfig };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const showVideo = config?.businessMode === "video_only" || config?.businessMode === "both";
  const showStock = config?.stockPhotosEnabled === 1;

  const menuItems = [
    { label: "Home", href: SITE_ROUTES.home(), id: "/" },
    { label: "Galleries", href: SITE_ROUTES.galleries(), id: "galerias" },
    { label: "Services", href: SITE_ROUTES.services(), id: "servicos" },
    { label: "Portfolio", href: SITE_ROUTES.portfolio(), id: "portfolio" },
    ...(showStock ? [{ label: "Stock Photos", href: SITE_ROUTES.stockPhotos(), id: "fotos-stock" }] : []),
    ...(showVideo ? [{ label: "Videos", href: SITE_ROUTES.video(), id: "video" }] : []),
    { label: "About", href: SITE_ROUTES.about(), id: "sobre" },
    { label: "Contact", href: SITE_ROUTES.contact(), id: "contato" },
  ];

  return (
    <>
      {/* Navbar minimalista */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/95 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={SITE_ROUTES.home()}>
              <a className="relative group">
                {siteConfig?.logoUrl ? (
                  <img
                    src={siteConfig.logoUrl}
                    alt={siteConfig.siteName || "Site"}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="text-2xl font-semibold tracking-wide text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {siteConfig?.siteName || "Studio"}
                  </span>
                )}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white/40 group-hover:w-full transition-all duration-300" />
              </a>
            </Link>

            {/* Desktop - Icons + Hamburger */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/client-access">
                <a className="text-white/70 hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                </a>
              </Link>
              <Link href="/cart">
                <a className="text-white/70 hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </a>
              </Link>
              <button
                onClick={toggleMenu}
                className="relative w-10 h-10 flex flex-col items-center justify-center gap-[6px] group"
                aria-label="Toggle menu"
              >
                <span className={`block w-7 h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-[8px]" : ""}`} />
                <span className={`block w-5 h-[2px] bg-white/50 transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-7 h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`} />
              </button>
            </div>

            {/* Mobile */}
            <div className="flex lg:hidden items-center gap-4">
              <Link href="/cart">
                <a className="text-white/70 hover:text-white">
                  <ShoppingCart className="w-5 h-5" />
                </a>
              </Link>
              <button
                onClick={toggleMenu}
                className="relative w-10 h-10 flex flex-col items-center justify-center gap-[6px]"
                aria-label="Toggle menu"
              >
                <span className={`block w-7 h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-[8px]" : ""}`} />
                <span className={`block w-5 h-[2px] bg-white/50 transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-7 h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen Menu Overlay - EDITORIAL STYLE */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-700 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/98" onClick={closeMenu} />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <button
            onClick={closeMenu}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <nav className="flex flex-col items-center gap-4">
            {menuItems.map((item, index) => (
              <Link key={item.id} href={item.href}>
                <a
                  onClick={closeMenu}
                  className={`group relative block text-center transition-all duration-300 ${
                    currentPage === item.id
                      ? "text-white"
                      : "text-white/30 hover:text-white/80"
                  }`}
                  style={{ transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms" }}
                >
                  <span
                    className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.12em] uppercase leading-relaxed"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {item.label}
                  </span>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white/50 group-hover:w-full transition-all duration-500" />
                </a>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 text-white/20 text-[10px] tracking-[0.3em] uppercase">
            <span>{siteConfig?.siteName || "Studio"}</span>
            <span>Photography</span>
          </div>
        </div>
      </div>
    </>
  );
}
