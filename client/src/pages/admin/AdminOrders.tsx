import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Check, X, Link2, QrCode, Building2, Send, ExternalLink, Copy, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { format as dateFormat } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

export default function AdminOrders() {
  const [filter, setFilter] = useState<string>("all");
  const [paymentLinks, setPaymentLinks] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();
  const { format: formatCurrency } = useCurrency();

  const { data: orders, isLoading } = trpc.orders.getAll.useQuery();

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.getAll.invalidate();
      toast.success("Status atualizado!");
    },
    onError: (err) => toast.error(err.message),
  });

  const addPaymentLinkMutation = trpc.orders.addPaymentLink.useMutation({
    onSuccess: (_, vars) => {
      utils.orders.getAll.invalidate();
      setPaymentLinks((prev) => ({ ...prev, [vars.id]: "" }));
      toast.success("Link de pagamento salvo!");
    },
    onError: (err) => toast.error(err.message),
  });

  const confirmPaymentMutation = trpc.orders.confirmPayment.useMutation({
    onSuccess: () => {
      utils.orders.getAll.invalidate();
      toast.success("Payment confirmed!");
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredOrders = orders?.filter((order: any) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500" },
      paid: { label: "Paid", className: "bg-green-500/10 text-green-500" },
      processing: { label: "Processing", className: "bg-blue-500/10 text-blue-500" },
      completed: { label: "Completed", className: "bg-green-600/10 text-green-600" },
      cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-500" },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPaymentMethodBadge = (method: string | null) => {
    if (!method) return null;
    const methods: Record<string, { label: string; icon: any; className: string }> = {
      pix: { label: "Bank transfer", icon: QrCode, className: "bg-green-500/10 text-green-500" },
      payment_link: { label: "Link de Pagamento", icon: Link2, className: "bg-purple-500/10 text-purple-500" },
      bank_transfer: { label: "Bank transfer", icon: Building2, className: "bg-blue-500/10 text-blue-500" },
    };
    const m = methods[method];
    if (!m) return null;
    const Icon = m.icon;
    return (
      <Badge className={m.className}>
        <Icon className="w-3 h-3 mr-1" />
        {m.label}
      </Badge>
    );
  };

  const handleSaveLink = (orderId: number) => {
    const link = paymentLinks[orderId];
    if (!link || !link.trim()) {
      toast.error("Insira o link de pagamento");
      return;
    }
    try {
      new URL(link.trim());
    } catch {
      toast.error("URL invalid");
      return;
    }
    addPaymentLinkMutation.mutate({ id: orderId, paymentLink: link.trim() });
  };

  const pendingCount = orders?.filter((o: any) => o.status === "pending").length || 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <ShoppingCart className="w-8 h-8" />
            Pedidos
            {pendingCount > 0 && (
              <Badge className="bg-yellow-500/10 text-yellow-500 ml-2">
                {pendingCount} pending{pendingCount > 1 ? "s" : ""}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Gerencie pedidos de fotos stock — confirme pagamentos e libere downloads
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pendings" },
            { key: "paid", label: "Pagos" },
            { key: "completed", label: "Completeds" },
            { key: "cancelled", label: "Cancelleds" },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              onClick={() => setFilter(f.key)}
              size="sm"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando pedidos...</p>
          </div>
        ) : filteredOrders && filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => (
              <Card key={order.id} className={order.status === "pending" ? "border-yellow-500/30" : ""}>
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold">Order #{order.id}</h3>
                        {getStatusBadge(order.status)}
                        {getPaymentMethodBadge(order.paymentMethod)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>{order.customerName}</strong> • {order.customerEmail}
                        {order.customerPhone && ` • ${order.customerPhone}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dateFormat(new Date(order.createdAt), "dd/MM/yyyy 'at' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(order.finalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium mb-2">Order Items:</p>
                      <div className="space-y-1">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.itemName}</span>
                            <span>{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Link Section - for payment_link method */}
                  {order.paymentMethod === "payment_link" && order.status === "pending" && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-purple-500" />
                        Link de Pagamento
                      </p>
                      {order.paymentLink ? (
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-background px-3 py-2 rounded text-xs truncate">
                            {order.paymentLink}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(order.paymentLink);
                              toast.success("Link copied!");
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(order.paymentLink, "_blank")}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Cole o link de pagamento here (Stripe, Mercado Pago, etc.)"
                            value={paymentLinks[order.id] || ""}
                            onChange={(e) =>
                              setPaymentLinks((prev) => ({ ...prev, [order.id]: e.target.value }))
                            }
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveLink(order.id)}
                            disabled={addPaymentLinkMutation.isPending}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Salvar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {order.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => confirmPaymentMutation.mutate({ id: order.id })}
                          disabled={confirmPaymentMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Confirmar Pagamento
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updateStatusMutation.mutate({ id: order.id, status: "cancelled" })
                          }
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancsher
                        </Button>
                      </>
                    )}
                    {order.status === "paid" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({ id: order.id, status: "completed" })
                        }
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Marcar as Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">None pedido encontrado</h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "Still not there is pedidos no sistema"
                  : `Not there is pedidos com status "${filter}"`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
