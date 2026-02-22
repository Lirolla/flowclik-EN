import { useEffect } from "react";

const FONT_MAP: Record<string, string> = {
  poppins: "Poppins:wght@300;400;500;600;700",
  inter: "Inter:wght@300;400;500;600;700",
  roboto: "Roboto:wght@300;400;500;700",
  playfair: "Playfair+Display:wght@400;500;600;700",
  montserrat: "Montserrat:wght@300;400;500;600;700",
  lato: "Lato:wght@300;400;700",
};

interface FontLoaderProps {
  font: string;
}

export function FontLoader({ font }: FontLoaderProps) {
  useEffect(() => {
    const fontFamily = font.toLowerCase();
    const googleFont = FONT_MAP[fontFamily];

    if (!googleFont) {
      console.warn(`Fonte "${font}" not found, usando Inter as default`);
      return;
    }

    // Remove fonte anterior se existir
    const existingLink = document.getElementById("google-font");
    if (existingLink) {
      existingLink.remove();
    }

    // Adiciona nova fonte
    const link = document.createElement("link");
    link.id = "google-font";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${googleFont}&display=swap`;
    document.head.appendChild(link);

    // Aplica fonte no body
    document.body.style.fontFamily = `'${fontFamily.charAt(0).toUpperCase() + fontFamily.slice(1)}', sans-serif`;
  }, [font]);

  return null;
}
