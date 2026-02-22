import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { DollarSign, ShoppingCart, Calendar, ImageIcon, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { data: statusStats } = trpc.appointmentStats.getByStatus.useQuery();
  const { data: monthlyStats } = trpc.appointmentStats.getMonthly.useQuery();
  const { data: revenueStats } = trpc.appointmentStats.getRevenue.useQuery();
  const { data: conversionStats } = trpc.appointmentStats.getConversionRate.useQuery();
  const { data: recentOrders } = trpc.dashboard.recentOrders.useQuery();
  const { data: upcomingAppointments } = trpc.dashboard.upcomingAppointments.useQuery();
  const { format } = useCurrency();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmado',
      session_done: 'Ensaio Realizado',
      editing: 'In Editing',
      awaiting_selection: 'Awaiting Selection',
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
      awaiting_selection: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
      final_editing: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
      delivered: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-700 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-700';
  };

  const totalAppointments = statusStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const totalRevenue = revenueStats?.reduce((sum, stat) => sum + (stat.totalRevenue || 0), 0) || 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-white">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: format(stats?.totalRevenue || 0),
      subtitle: '+12% vs month previous',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pedidos',
      value: stats?.totalOrders || 0,
      subtitle: '+8 news pedidos',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Agendamentos Pendings',
      value: stats?.pendingBookings || 0,
      subtitle: '3 awaiting confirmation',
      icon: Calendar,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Fotos na Loja',
      value: stats?.stockPhotos || 0,
      subtitle: 'Gallery Stock',
      icon: ImageIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
        
        {/* Avisos Globais do Admin do SaaS */}
        <AnnouncementBanner />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">{card.title}</h3>
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
                <p className="text-sm text-gray-500">{card.subtitle}</p>
              </Card>
            );
          })}
        </div>

        {/* Statistics de Agendamentos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Statistics de Agendamentos
          </h2>

          {/* Cards de Summary de Agendamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total de Agendamentos</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalAppointments}</div>
                <p className="text-xs text-gray-500">Everys os status</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Revenue Prevista</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{format(totalRevenue)}</div>
                <p className="text-xs text-gray-500">Soma de everys os services</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Taxa de Confirmation</CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {conversionStats?.confirmationRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500">
                  {conversionStats?.confirmed} de {conversionStats?.total} confirmados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Taxa de Entrega</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {conversionStats?.deliveryRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500">
                  {conversionStats?.delivered} de {conversionStats?.confirmed} delivereds
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics por Status */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Agendamentos por Status</CardTitle>
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
                        <span className="text-sm font-medium text-white">{stat.count} agendamentos</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
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
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Revenue por Status</CardTitle>
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
                        <span className="text-sm font-medium text-white">
                          {format(revenue)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
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

        {/* Agendamentos por Month */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Agendamentos por Month (Lasts 12 months)</CardTitle>
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
                      <span className="text-sm font-medium text-white capitalize">{monthName}</span>
                      <span className="text-sm text-gray-400">{stat.count} agendamentos</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <div className="p-6 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Pedidos Recentes</h2>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                Ver Everys
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-900">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">#ID</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Itens</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Total</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {!recentOrders || recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      None pedido still
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-white">#{order.id}</td>
                      <td className="px-6 py-4 text-white">{order.customerName}</td>
                      <td className="px-6 py-4 text-gray-400">{order.customerEmail}</td>
                      <td className="px-6 py-4 text-white">
                        {format(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-xs ${
                          order.status === 'completed' ? 'bg-green-900 text-green-300' :
                          order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-gray-800 text-gray-300'
                        }`}>
                          {order.status === 'completed' ? 'Complete' :
                           order.status === 'pending' ? 'Pending' :
                           order.status === 'cancelled' ? 'Cancelled' : order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="bg-gray-900 border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Upcoming Appointments</h2>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                Ver Everys
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-900">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">#ID</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Service</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Data/Hour</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {!upcomingAppointments || upcomingAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      None agendamento
                    </td>
                  </tr>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-white">#{appointment.id}</td>
                      <td className="px-6 py-4 text-white">{appointment.clientName}</td>
                      <td className="px-6 py-4 text-gray-400">{appointment.serviceName || 'N/A'}</td>
                      <td className="px-6 py-4 text-white">
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-GB')} at {appointment.appointmentTime}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-xs border ${
                          getStatusColor(appointment.status)
                        }`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
