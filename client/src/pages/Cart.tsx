import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Trash2, ArrowLeft, Loader2, X, Copy, Check, QrCode, Link2, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";
import LayoutWrapper from "@/components/LayoutWrapper";
import { SITE_ROUTES } from "@/lib/siteRoutes";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { items, removeItem, clearCart, totalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [step, setStep] = useState<"cart" | "checkout" | "confirmation">("cart");
  const [selectedMethod, setSelectedMethod] = useState<"pix" | "payment_link" | "bank_transfer" | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);

  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { data: paymentConfig } = trpc.orders.getPaymentConfig.useQuery();
  const { format } = useCurrency();

  const checkoutMutation = trpc.orders.checkout.useMutation({
    onSuccess: (data) => {
      setOrderTotal(totalPrice);
      setOrderId(data.orderId);
      setStep("confirmation");
      setIsCheckingOut(false);
      clearCart();
      toast.success("Pedido criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
      setIsCheckingOut(false);
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setStep("checkout");
  };

  const handleConfirmOrder = () => {
    if (!customerName.trim()) {
      toast.error("Informe seu nome");
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      toast.error("Informe um e-mail valid");
      return;
    }
    if (!selectedMethod) {
      toast.error("Select uma forma de pagamento");
      return;
    }

    setIsCheckingOut(true);
    checkoutMutation.mutate({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim() || undefined,
      paymentMethod: selectedMethod,
      items: items.map((item) => ({
        photoId: item.photoId,
        itemType: "digital" as const,
        quantity: 1,
      })),
    });
  };

  const copyPixKey = () => {
    if (paymentConfig?.paymentPixKey) {
      navigator.clipboard.writeText(paymentConfig.paymentPixKey);
      setPixCopied(true);
      toast.success("Key PIX copiada!");
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  // Empty cart
  if (items.length === 0 && step === "cart") {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-background">
          <div className="pt-32 pb-24 px-4">
            <div className="container mx-auto max-w-2xl text-center">
              <Card>
                <CardContent className="p-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">Carrinho Vazio</h2>
                  <p className="text-muted-foreground mb-6">
                    You still not adicionou nonea foto ao carrinho.
                  </p>
                  <Button onClick={() => setLocation(SITE_ROUTES.stockPhotos())}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ver Stock Photos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  // Order confirmation
  if (step === "confirmation") {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-background">
          <div className="pt-32 pb-24 px-4">
            <div className="container mx-auto max-w-2xl">
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Pedido Criado!</h2>
                    <p className="text-muted-foreground">
                      Order #{orderId} • Awaiting pagamento
                    </p>
                  </div>

                  {/* Payment Instructions */}
                  {selectedMethod === "pix" && paymentConfig?.paymentPixKey && (
                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold text-green-500">Pagamento via PIX</h3>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Key PIX:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-background px-3 py-2 rounded text-sm font-mono">
                            {paymentConfig.paymentPixKey}
                          </code>
                          <Button size="sm" variant="outline" onClick={copyPixKey}>
                            {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Valor:</p>
                        <p className="text-2xl font-bold text-green-500">{format(orderTotal)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        After realizar o pagamento, o photographer irá confirmar e liberar o download das fotos.
                      </p>
                    </div>
                  )}

                  {selectedMethod === "bank_transfer" && paymentConfig?.paymentBankTransferDetails && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-blue-500">Bank Transfer</h3>
                      </div>
                      <div className="bg-background rounded p-3 text-sm whitespace-pre-line">
                        {paymentConfig.paymentBankTransferDetails}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Valor:</p>
                        <p className="text-2xl font-bold text-blue-500">{format(orderTotal)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        After realizar a transferência, o photographer irá confirmar e liberar o download das fotos.
                      </p>
                    </div>
                  )}

                  {selectedMethod === "payment_link" && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-purple-500">Link de Pagamento</h3>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Valor:</p>
                        <p className="text-2xl font-bold text-purple-500">{format(orderTotal)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        O photographer irá enviar um link de pagamento para o seu e-mail ({customerEmail}). 
                        After o pagamento, as fotos serão liberadas para download.
                      </p>
                    </div>
                  )}

                  <div className="text-center pt-4">
                    <Button onClick={() => setLocation(SITE_ROUTES.stockPhotos())} variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar at Fotos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  // Checkout step
  if (step === "checkout") {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-background">
          <div className="pt-32 pb-24 px-4">
            <div className="container mx-auto max-w-2xl">
              <Button variant="ghost" onClick={() => setStep("cart")} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Carrinho
              </Button>

              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-2xl font-bold">Finalizar Compra</h2>

                  {/* Order Summary */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Summary do Pedido</h3>
                    <div className="space-y-1 text-sm">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-muted-foreground truncate mr-2">{item.title}</span>
                          <span className="font-medium">{format(item.price)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span>{format(totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Seus Dados</h3>
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone (optional)</Label>
                      <Input
                        id="phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Forma de Pagamento</h3>
                    <div className="grid gap-3">
                      {paymentConfig?.paymentPixEnabled === 1 && (
                        <button
                          onClick={() => setSelectedMethod("pix")}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                            selectedMethod === "pix"
                              ? "border-green-500 bg-green-500/5"
                              : "border-border hover:border-green-500/50"
                          }`}
                        >
                          <QrCode className={`w-6 h-6 ${selectedMethod === "pix" ? "text-green-500" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                          </div>
                        </button>
                      )}

                      {paymentConfig?.paymentBankTransferEnabled === 1 && (
                        <button
                          onClick={() => setSelectedMethod("bank_transfer")}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                            selectedMethod === "bank_transfer"
                              ? "border-blue-500 bg-blue-500/5"
                              : "border-border hover:border-blue-500/50"
                          }`}
                        >
                          <Building2 className={`w-6 h-6 ${selectedMethod === "bank_transfer" ? "text-blue-500" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium">Bank Transfer</p>
                            <p className="text-sm text-muted-foreground">Depósito ou TED</p>
                          </div>
                        </button>
                      )}

                      {paymentConfig?.paymentLinkEnabled === 1 && (
                        <button
                          onClick={() => setSelectedMethod("payment_link")}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                            selectedMethod === "payment_link"
                              ? "border-purple-500 bg-purple-500/5"
                              : "border-border hover:border-purple-500/50"
                          }`}
                        >
                          <Link2 className={`w-6 h-6 ${selectedMethod === "payment_link" ? "text-purple-500" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium">Link de Pagamento</p>
                            <p className="text-sm text-muted-foreground">Cartão, boleto via link</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Confirm */}
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={isCheckingOut || !selectedMethod || !customerName || !customerEmail}
                    className="w-full"
                    size="lg"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Confirmar Pedido
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  // Cart view
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-background">
        <div className="pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Carrinho de Compras</h1>
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? "photo" : "photos"} selecionada{items.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          {item.collectionName && (
                            <p className="text-sm text-muted-foreground">
                              Gallery: {item.collectionName}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.type === "stock" ? "Foto Stock" : "Foto da Gallery"}
                          </p>
                          <p className="text-lg font-bold mt-2">
                            {format(item.price)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Carrinho
                </Button>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold">Summary</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{format(totalPrice)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{format(totalPrice)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Finalizar Compra
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
