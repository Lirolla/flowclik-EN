import { ReactNode, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
interface ThemeWrapperProps {
  children: ReactNode;
}
export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const [location] = useLocation();
  
  // Aplica tema custom em rotas do site do photographer
  // Exclui: /admin, /system, /register, /login, /docs, /termos, /politica, /about-nos, /cliente
  const isAdminRoute = location.startsWith('/admin') || location.startsWith('/system');
  const isFlowClikRoute = location === '/register' || location === '/login' || location === '/docs' || 
                          location.startsWith('/termos') || location.startsWith('/politica') || location === '/about-nos';
  const isClientRoute = location.startsWith('/cliente');
  
  const shouldApplyTheme = !isAdminRoute && !isFlowClikRoute && !isClientRoute;
  useEffect(() => {
    if (!siteConfig || !shouldApplyTheme) {
      // Resetar para tema default se not for rota pública
      const root = document.documentElement;
      root.removeAttribute("data-theme-mode");
      root.removeAttribute("data-accent-color");
      root.removeAttribute("data-layout");
      return;
    }
    const root = document.documentElement;
    
    // Apply layout first
    const layout = siteConfig.siteThemeLayout || "classic";
    root.setAttribute("data-layout", layout);
    
    // Wedding Videos tem cores fixas - not aplicar accent-color nem theme-mode
    if (layout === "wedding-videos") {
      root.removeAttribute("data-accent-color");
      root.removeAttribute("data-theme-mode");
      return;
    }
    
    // Apply theme mode (light/dark)
    const mode = siteConfig.siteThemeMode || "light";
    root.setAttribute("data-theme-mode", mode);
    
    // Apply accent color
    const accentColor = siteConfig.siteThemeAccentColor || "red";
    root.setAttribute("data-accent-color", accentColor);
  }, [siteConfig, shouldApplyTheme]);
  return <>{children}</>;
}
