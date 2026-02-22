import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Copy, ExternalLink, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface SendPaymentLinkDialogProps {
  appointment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SendPaymentLinkDialog({
  appointment,
  open,
  onOpenChange,
}: SendPaymentLinkDialogProps) {
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast({
        title: "Link copied!",
        description: "The payment link has been copied to your clipboard.",
      });
    }
  };

  const handleCopyWhatsApp = () => {
    const whatsappText = message || 
      `Hello ${appointment.clientName}!\n\nHere is the payment link for your photo session:\n\n Amount: ${formatCurrency(appointment.finalPrice)}\n Link: ${paymentLink}\n\nIf you have any questions, please don't hesitate to ask!`;
    
    navigator.clipboard.writeText(whatsappText);
    toast({
      title: "Message copied!",
      description: "The message with the link has been copied. Paste it in WhatsApp to send to the client.",
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

  const defaultMessage = `Hello ${appointment.clientName}!\n\nHere is the payment link for your photo session:\n\n Amount: ${formatCurrency(appointment.finalPrice)}\n Link: ${paymentLink || "[paste the link here]"}\n\nIf you have any questions, please don't hesitate to ask!`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Send Payment Link
          </DialogTitle>
          <DialogDescription>
            Client: {appointment.clientName} | Amount: {formatCurrency(appointment.finalPrice)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Paste the link */}
          <div className="space-y-2">
            <Label htmlFor="payment-link" className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
              Paste the payment link
            </Label>
            <Input
              id="payment-link"
              type="url"
              placeholder="https://checkout.stripe.com/..."
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Generate the link in your payment gateway (Stripe, PayPal, etc.) and paste it here.
            </p>
          </div>

          {/* Step 2: Custom message */}
          <div className="space-y-2">
            <Label htmlFor="payment-message" className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
              Message to the client (optional)
            </Label>
            <Textarea
              id="payment-message"
              placeholder={defaultMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Customise the message or use the default template.
            </p>
          </div>

          {/* Info tip */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">How it works:</p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Generate a payment link in your preferred gateway</li>
              <li>Paste the link above and copy the message</li>
              <li>Send it to the client via WhatsApp or email</li>
              <li>After payment, record it manually in the system</li>
            </ul>
          </div>

          {/* Action buttons */}
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
                    Copy Link
                  </Button>
                  <Button 
                    onClick={handleOpenLink}
                    variant="outline"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Link
                  </Button>
                </div>
                <Button 
                  onClick={handleCopyWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Copy Message for WhatsApp
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
