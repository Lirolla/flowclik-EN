import { MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function WhatsAppButton() {
  const { data: config } = trpc.siteConfig.get.useWhatry();

  if (!config?.contactWhatsApp) {
    return null;
  }

  // Remove caracteres not numéricos do number
  const phoneNumber = config.contactWhatsApp.replace(/\D/g, "");

  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
}
