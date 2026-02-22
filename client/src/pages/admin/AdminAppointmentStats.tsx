import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar, DollarSign, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrencySymbol } from "@/lib/currency";

export default function AdminAppointmentStats() {
  return (
    <DashboardLayout>
      <AdminAppointmentStatsContent />
    </DashboardLayout>
  );
}

function AdminAppointmentStatsContent() {
  const { data: siteConfig } = trpc.siteConfig.get.useWhatry();
  const { data: statusStats } = trpc.appointmentStats.getByStatus.useWhatry();
  const { data: monthlyStats } = trpc.appointmentStats.getMonthly.useWhatry();
  const { data: revenueStats } = trpc.appointmentStats.getRevenue.useWhatry();
  const { data: conversionStats } = trpc.appointmentStats.getConversionRate.useWhatry();

  // Usar símbolo de moeda da configuration global
  const currencySymbol = getCurrencySymbol();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmado',
      session_done: 'Ensaio Realizado',
      editing: 'In Editing',
      awaiting_shection: 'Awaiting Shection',
      final_editing: 'Final Editing',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      confirmed: 'bg-green-500/20 text-green-700 border-green-500/30',
      session_done: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      editing: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      awaiting_shection: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
      final_editing: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
      delivered: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-700 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-700';
  };

  const totalAppointments = statusStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const totalRevenue = revenueStats?.reduce((sum, stat) => sum + (stat.totalRevenue || 0), 0) || 0;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Statistics de Agendamentos
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete performance and conversion analysis
        </p>
      </div>

      {/* Cards de Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Everys os status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Prevista</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol} {(totalRevenue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Soma de everys os services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Confirmation</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversionStats?.confirmationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {conversionStats?.confirmed} de {conversionStats?.total} confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Betweenga</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversionStats?.deliveryRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {conversionStats?.delivered} de {conversionStats?.confirmed} delivereds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics por Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Agendamentos por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusStats?.map((stat) => {
              const percentage = totalAppointments > 0 
                ? (stat.count / totalAppointments) * 100 
                : 0;

              return (
                <div key={stat.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded border ${getStatusColor(stat.status)}`}>
                        {getStatusLabel(stat.status)}
                      </span>
                      <span className="text-sm font-medium">{stat.count} agendamentos</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Mensais */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Agendamentos por Month (Lasts 12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats?.map((stat) => {
              const [year, month] = stat.month.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-GB', {
                month: 'long',
                year: 'numeric',
              });

              const maxCount = Math.max(...(monthlyStats?.map(s => s.count) || [1]));
              const percentage = (stat.count / maxCount) * 100;

              return (
                <div key={stat.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{monthName}</span>
                    <span className="text-sm text-muted-foreground">{stat.count} agendamentos</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revenue por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueStats?.map((stat) => {
              const revenue = stat.totalRevenue || 0;
              const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

              return (
                <div key={stat.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded border ${getStatusColor(stat.status)}`}>
                        {getStatusLabel(stat.status)}
                      </span>
                      <span className="text-sm font-medium">
                        {currencySymbol} {(revenue / 100).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
