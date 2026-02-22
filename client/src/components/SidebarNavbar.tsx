import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Home, Image, Briefcase, Camera, Info, Mail, ShoppingCart, User } from "lucide-react";
import { SITE_ROUTES } from "@/lib/siteRoutes";

interface SidebarNavbarProps {
  currentPage?: string;
}

export default function SidebarNavbar({ currentPage }: SidebarNavbarProps) {
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { data: oldSiteConfig } = trpc.site.getConfig.useQuery();
  
  const config = { ...oldSiteConfig, ...siteConfig };
  const showVideo = config?.businessMode === "video_only" || config?.businessMode === "both";
  const showStockPhotos = config?.stockPhotosEnabled === 1;

  const navItems = [
    { icon: Home, label: "Início", path: SITE_ROUTES.home() },
    { icon: Image, label: "Galerias", path: SITE_ROUTES.galleries() },
    { icon: Briefcase, label: "Serviços", path: SITE_ROUTES.services() },
    { icon: Camera, label: "Portfólio", path: SITE_ROUTES.portfolio() },
    ...(showStockPhotos ? [{ icon: ShoppingCart, label: "Fotos Stock", path: SITE_ROUTES.stockPhotos() }] : []),
    ...(showVideo ? [{ icon: Camera, label: "Vídeos", path: SITE_ROUTES.video() }] : []),
    { icon: Info, label: "Sobre", path: SITE_ROUTES.about() },
    { icon: Mail, label: "Contato", path: SITE_ROUTES.contact() },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border flex justify-center">
        <Link href={SITE_ROUTES.home()}>
          <a className="flex flex-col items-center gap-2">
            {siteConfig?.logoUrl ? (
              <img
                src={siteConfig.logoUrl}
                alt={siteConfig.siteName || "Site"}
                className="h-20 w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-2xl">
                    {(config?.siteName || "S")[0]}
                  </span>
                </div>
                <span className="text-xl font-serif font-bold text-foreground text-center">
                  {config?.siteName || "Site"}
                </span>
              </div>
            )}
          </a>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <a
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/client-access">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-accent/10 hover:text-accent">
            <User className="w-5 h-5" />
            <span className="font-medium">Cliente</span>
          </a>
        </Link>
        <Link href="/cart">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-accent/10 hover:text-accent">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Carrinho</span>
          </a>
        </Link>
      </div>
    </aside>
  );
}
