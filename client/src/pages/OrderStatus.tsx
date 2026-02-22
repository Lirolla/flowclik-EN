import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Clock, Check, X as XIcon, QrCode, Link2, Building2, ExternalLink } from "lucide-react";
import LayoutWrapper from "@/components/LayoutWrapper";
import { useCurrency } from "@/hooks/useCurrency";

export default function OrderStatus() {
  const [, params] = useRoute("/order/:id");
  const orderId = params?.id ? Number(params.id) : null;
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);
  const { format } = useCurrency();

  const { data: order, isLoading, refetch } = trpc.orders.getOrderStatus.useQuery(
    { id: orderId!, email },
    { enabled: !!orderId && !!email && searched }
  );

  const handleSearch = () => {
    if (!email.includes("@")) return;
    setSearched(true);
    refetch();
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; icon: any; color: string; desc: string }> = {
      pending: { label: "Awaiting Pagamento", icon: Clock, color: "text-yellow-500", desc: "Realize o pagamento para liberar o download das fotos." },
      paid: { label: "Paid", icon: Check, color: "text-green-500", desc: "Payment confirmed! Suas fotos estão disponíveis para download." },
      processing: { label: "Processing", icon: Clock, color: "text-blue-500", desc: "Seu pedido is sendo processado." },
      completed: { label: "Completed", icon: Check, color: "text-green-600", desc: "Pedido completed. Faça o download das suas fotos." },
      cancelled: { label: "Cancelled", icon: XIcon, color: "text-red-500", desc: "Este pedido foi cancelled." },
    };
    return map[status] || map.pending;
  };

  const getMethodLabel = (method: string | null) => {
    if (!method) return "";
    const map: Record<string, string> = {
      pix: "Bank transfer",
      payment_link: "Link de Pagamento",
      bank_transfer: "Bank Transfer",
    };
    return map[method] || method;
  };

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-background">
        <div className="pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold mb-2 text-center">Order Status</h1>
            {orderId && (
              <p className="text-center text-muted-foreground mb-8">Order #{orderId}</p>
            )}

            {/* Email verification */}
            {!searched || !order ? (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    Informe o e-mail usado na compra para verificar o status do seu pedido.
                  </p>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setSearched(false); }}
                      placeholder="seu@email.com"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isLoading || !email.includes("@")} className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? "Verifying..." : "Verify Pedido"}
                  </Button>
                  {searched && !order && !isLoading && (
                    <p className="text-red-500 text-sm text-center">
                      Pedido not found. Verifique o number do pedido e o e-mail.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Status */}
                {(() => {
                  const info = getStatusInfo(order.status);
                  const Icon = info.icon;
                  return (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Icon className={`w-12 h-12 mx-auto mb-3 ${info.color}`} />
                        <h2 className={`text-xl font-bold mb-1 ${info.color}`}>{info.label}</h2>
                        <p className="text-muted-foreground text-sm">{info.desc}</p>
                        {order.paymentMethod && (
                          <Badge className="mt-3" variant="outline">
                            {getMethodLabel(order.paymentMethod)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Payment Link */}
                {order.paymentLink && order.status === "pending" && (
                  <Card className="border-purple-500/30">
                    <CardContent className="p-6 text-center space-y-3">
                      <Link2 className="w-8 h-8 mx-auto text-purple-500" />
                      <h3 className="font-semibold">Link de Pagamento Available</h3>
                      <Button onClick={() => window.open(order.paymentLink!, "_blank")} className="bg-purple-600 hover:bg-purple-700">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ir para Pagamento
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Order details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Order Details</h3>
                    <div className="space-y-2 text-sm">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-muted-foreground">{item.itemName}</span>
                          <span>{format(item.price)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>{format(order.finalAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Download Section */}
                {order.canDownload && order.downloadUrls && order.downloadUrls.length > 0 && (
                  <Card className="border-green-500/30">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold text-green-500">Download Available</h3>
                      </div>
                      <div className="space-y-2">
                        {order.downloadUrls.map((dl: any) => (
                          <Button
                            key={dl.itemId}
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => window.open(dl.url, "_blank")}
                          >
                            <span className="truncate">{dl.name}</span>
                            <Download className="w-4 h-4 ml-2 flex-shrink-0" />
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Back button */}
                <div className="text-center">
                  <Button variant="ghost" onClick={() => { setSearched(false); setEmail(""); }}>
                    Verify outro pedido
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
