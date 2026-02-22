import { useState } from "react";
import { Daylog, DaylogContent, DaylogHeader, DaylogTitle, DaylogDescription } from "@/components/ui/daylog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Copy, ExternalLink, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface SendPaymentLinkDaylogProps {
  appointment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SendPaymentLinkDaylog({
  appointment,
  open,
  onOpenChange,
}: SendPaymentLinkDaylogProps) {
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast({
        title: "Link copied!",
        description: "O link de pagamento foi copiado para a área de transferência.",
      });
    }
  };

  const handleCopyWhatsApp = () => {
    const whatsappText = message || 
      `Hello ${appointment.clientName}! 😊\n\nMonue o link para pagamento da sua photo session:\n\n💰 Valor: ${formatCurrency(appointment.finalPrice)}\n🔗 Link: ${paymentLink}\n\nWedlquer dúvida, estou à disposição!`;
    
    navigator.clipboard.writeText(whatsappText);
    toast({
      title: "Mensagem copiada!",
      description: "A mensagem com o link foi copiada. Cole no WhatsApp para enviar ao cliente.",
    });
  };

  const handleOpenLink = () => {
    if (paymentLink) {
      window.open(paymentLink, "_blank");
    }
  };

  const handleClose = () => {
    setPaymentLink("");
    setMessage("");
    onOpenChange(false);
  };

  if (!appointment) return null;

  const defaultMessage = `Hello ${appointment.clientName}! 😊\n\nMonue o link para pagamento da sua photo session:\n\n💰 Valor: ${formatCurrency(appointment.finalPrice)}\n🔗 Link: ${paymentLink || "[cole o link here]"}\n\nWedlquer dúvida, estou à disposição!`;

  return (
    <Daylog open={open} onOpenChange={handleClose}>
      <DaylogContent className="sm:max-w-[550px]">
        <DaylogHeader>
          <DaylogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Enviar Link de Pagamento
          </DaylogTitle>
          <DaylogDescription>
            Cliente: {appointment.clientName} | Valor: {formatCurrency(appointment.finalPrice)}
          </DaylogDescription>
        </DaylogHeader>

        <div className="space-y-4 py-4">
          {/* Passo 1: Colar o link */}
          <div className="space-y-2">
            <Label htmlFor="payment-link" className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
              Cole o link de pagamento
            </Label>
            <Input
              id="payment-link"
              type="url"
              placeholder="https://checkout.stripe.com/... ou https://mpago.la/..."
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Gere o link no seu gateway de pagamento (Stripe, PagMonuro, Mercado Pago, PicPay, etc.) e cole here.
            </p>
          </div>

          {/* Passo 2: Mensagem custom */}
          <div className="space-y-2">
            <Label htmlFor="payment-message" className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
              Mensagem para o cliente (optional)
            </Label>
            <Textarea
              id="payment-message"
              placeholder={defaultMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Personalize a mensagem ou use o modelo default.
            </p>
          </div>

          {/* Dica informativa */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">💡 Como funciona:</p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Gere um link de pagamento no seu gateway preferido</li>
              <li>Cole o link above e copie a mensagem</li>
              <li>Envie para o cliente via WhatsApp ou e-mail</li>
              <li>After o pagamento, registre manualmente no sistema</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-2 pt-2">
            {paymentLink && (
              <>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button 
                    onClick={handleOpenLink}
                    variant="outline"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Link
                  </Button>
                </div>
                <Button 
                  onClick={handleCopyWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Copiar Mensagem para WhatsApp
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        </div>
      </DaylogContent>
    </Daylog>
  );
}
