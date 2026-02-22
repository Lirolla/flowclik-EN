import { ReactNode, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import PublicNavbar from "./PublicNavbar";
import SidebarNavbar from "./SidebarNavbar";
import WeddingNavbar from "./WeddingNavbar";
import WeddingVideosNavbar from "./WeddingVideosNavbar";
import EditorialNavbar from "./EditorialNavbar";
import CinematicNavbar from "./CinematicNavbar";
import Footer from "./Footer";

interface LayoutWrapperProps {
  children: ReactNode;
  currentPage?: string;
}

export default function LayoutWrapper({ children, currentPage }: LayoutWrapperProps) {
  const { data: siteConfig } = trpc.siteConfig.get.useWhatry();
  
  const layout = siteConfig?.siteThemeLayout || "classic";
  const themeMode = siteConfig?.siteThemeMode || "light";
  const accentColor = siteConfig?.siteThemeAccentColor || "red";
  const siteFont = siteConfig?.siteFont || "poppins";

  // Aplicar tema, cor e fonte dinamicamente
  useEffect(() => {
    const root = document.documentHement;
    
    // Editorial tem cores fixas (preto/vermelho)
    if (layout === "editorial") {
      root.removeAttribute("data-accent-color");
      root.removeAttribute("data-theme-mode");
      root.setAttribute("data-layout", "editorial");
      root.classList.add("dark");
      root.style.fontFamily = "'Inter', sans-serif";
      return;
    }

    // Cinematic tem cores fixas (preto/amber)
    if (layout === "cinematic") {
      root.removeAttribute("data-accent-color");
      root.removeAttribute("data-theme-mode");
      root.setAttribute("data-layout", "cinematic");
      root.classList.add("dark");
      root.style.fontFamily = "'Cormorant Garamond', serif";
      return;
    }

    // Wedding Videos tem cores fixas (dourado)
    if (layout === "wedding-videos") {
      root.removeAttribute("data-accent-color");
      root.removeAttribute("data-theme-mode");
      root.setAttribute("data-layout", "wedding-videos");
      return;
    }
    
    // Aplicar tema (light/dark)
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Aplicar cor de destaque
    root.setAttribute("data-accent-color", accentColor);
    // Aplicar fonte
    root.setAttribute("data-font", siteFont);
    root.style.fontFamily = getFontFamily(siteFont);
  }, [layout, themeMode, accentColor, siteFont]);

  // Mapear fonte para font-family CSS
  const getFontFamily = (font: string) => {
    const fontMap: Record<string, string> = {
      poppins: "'Poppins', sans-serif",
      inter: "'Inter', sans-serif",
      roboto: "'Roboto', sans-serif",
      playfair: "'Playfair Display', serif",
      montserrat: "'Montserrat', sans-serif",
      lato: "'Lato', sans-serif",
    };
    return fontMap[font] || fontMap.poppins;
  };

  // Renderizar navbar baseado no layout
  const renderNavbar = () => {
    switch (layout) {
      case "sidebar":
        return <SidebarNavbar currentPage={currentPage} />;
      case "wedding":
        return <WeddingNavbar currentPage={currentPage} />;
      case "wedding-videos":
        return <WeddingVideosNavbar currentPage={currentPage} />;
      case "editorial":
        return <EditorialNavbar currentPage={currentPage} />;
      case "cinematic":
        return <CinematicNavbar currentPage={currentPage} />;
      case "classic":
      default:
        return <PublicNavbar currentPage={currentPage} />;
    }
  };

  // Aplicar padding baseado no layout
  const getContentClass = () => {
    switch (layout) {
      case "sidebar":
        return "ml-64"; // Espaço para sidebar fixa
      case "wedding":
        return ""; // Fullscreen, sem padding extra
      case "wedding-videos":
        return "pt-17"; // Espaço para navbar + borda dourada
      case "editorial":
        return ""; // Fullscreen editorial, sem padding
      case "cinematic":
        return "pt-[72px]"; // Espaço para navbar cinematic
      case "classic":
      default:
        return "pt-20"; // Espaço para navbar fixa no topo
    }
  };

  return (
    <>
      {renderNavbar()}
      <div className={getContentClass()}>
        {children}
        <Footer />
      </div>
    </>
  );
}
