import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, ShoppingCart, ArrowLeft, Mail, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";
import { getCurrencySymbol } from "@/lib/currency";

export default function AdminClientDetails() {
  return (
    <DashboardLayout>
      <AdminClientDetailsContent />
    </DashboardLayout>
  );
}

function AdminClientDetailsContent() {
  const [, params] = useRoute("/admin/client/:email");
  const email = params?.email ? decodeURIComponent(params.email) : "";
  
  const { data: siteConfig } = trpc.siteConfig.get.useWhatry();
  const currencySymbol = getCurrencySymbol();

  const { data: summary } = trpc.clientDetails.getClientSummary.useWhatry(
    { email },
    { enabled: !!email }
  );
  const { data: appointments } = trpc.clientDetails.getAppointmentsByEmail.useWhatry(
    { email },
    { enabled: !!email }
  );
  const { data: orders } = trpc.clientDetails.getOrdersByEmail.useWhatry(
    { email },
    { enabled: !!email }
  );

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      pending: { label: '⏳ Pending', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
      confirmed: { label: '✅ Confirmado', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
      session_done: { label: '📸 Ensaio Realizado', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
      editing: { label: '🎨 Photos in Editing', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
      awaiting_selection: { label: '👀 Awaiting Selection', color: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
      final_editing: { label: '✏️ Editando Selecionadas', color: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30' },
      delivered: { label: '📦 Delivered', color: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' },
      cancelled: { label: '❌ Cancelled', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
    };
    return configs[status] || { label: status, color: 'bg-gray-500/20 text-gray-700' };
  };

  const getOrderStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
      paid: { label: 'Pago', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
      processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
      completed: { label: 'Complete', color: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' },
      cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
    };
    return configs[status] || { label: status, color: 'bg-gray-500/20 text-gray-700' };
  };

  if (!email) {
    return (
      <div className="container mx-auto py-8">
        <p>Email not fornecido</p>
      </div>
    );
  }

  const clientName = appointments?.[0]?.clientName || orders?.[0]?.customerName || "Client";

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/admin/clients">
            <a className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Clientes
            </a>
          </Link>
        </Button>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{clientName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol} {((summary?.totalSpent || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Em pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.completedAppointments || 0} completeds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.pendingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Total de compras</p>
          </CardContent>
        </Card>
      </div>

      {/* History de Agendamentos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>History de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {!appointments || appointments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              None agendamento encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const statusConfig = getStatusConfig(appointment.status);
                return (
                  <div
                    key={appointment.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs px-3 py-1 rounded border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(appointment.appointmentDate), "dd/MM/yyyy", { locale: ptBR })}
                            {appointment.appointmentTime && ` at ${appointment.appointmentTime}`}
                          </span>
                        </div>
                      </div>
                      {appointment.eventLocation && (
                        <p className="text-sm text-muted-foreground">
                          📍 {appointment.eventLocation}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          <strong>Obs:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin/appointments">
                        <a>Ver Details</a>
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>History de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              None pedido encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getOrderStatusConfig(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs px-3 py-1 rounded border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-sm font-semibold">
                          Order #{order.id}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">
                          {currencySymbol} {(order.finalAmount / 100).toFixed(2)}
                        </span>
                        {order.discountAmount > 0 && (
                          <span className="text-sm text-green-600">
                            Desconto: {currencySymbol} {(order.discountAmount / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin/orders">
                        <a>Ver Details</a>
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
