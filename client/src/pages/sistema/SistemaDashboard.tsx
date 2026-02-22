import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import SistemaLayout from "@/components/SistemaLayout";
import { Users, DollarSign, Package, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function SistemaDashboard() {
  const { data: dashboard, isLoading } = trpc.system.getDashboard.useQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <SistemaLayout>
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel do Sistema</h1>
        <p className="text-muted-foreground">Visão geral da plataforma FlowClik SaaS</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Fotógrafos</p>
              <p className="text-3xl font-bold">{dashboard?.totalPhotographers || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Assinaturas Ativas</p>
              <p className="text-3xl font-bold">{dashboard?.activeSubscriptions || 0}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Receita Mensal</p>
              <p className="text-3xl font-bold">R$ {dashboard?.monthlyRevenue ? String(dashboard.monthlyRevenue).replace(".", ",") : "0,00"}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tickets Abertos</p>
              <p className="text-3xl font-bold">{dashboard?.openTickets || 0}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Fotógrafos por Plano */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Fotógrafos por Plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboard?.photographersByPlan?.map((item: any) => (
            <div key={item.plan} className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                {item.plan === "starter" && "Plano Básico (R$ 69,90/mês)"}
                {item.plan === "cortesia" && "🎁 Plano Cortesia (Grátis)"}
                {item.plan === "full" && "⭐ Plano Vitalício (Ilimitado)"}
                {item.plan === "pro" && "Plano Pro"}
                {item.plan === "enterprise" && "Plano Enterprise"}
              </p>
              <p className="text-2xl font-bold">{item.count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Links Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/sistema/fotografos">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">Gerenciar Fotógrafos</h3>
            <p className="text-sm text-muted-foreground">
              Ver todos os fotógrafos, planos e assinaturas
            </p>
          </Card>
        </Link>

        <Link href="/sistema/avisos">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <AlertCircle className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">Avisos Globais</h3>
            <p className="text-sm text-muted-foreground">
              Enviar mensagens para todos os fotógrafos
            </p>
          </Card>
        </Link>

        <Link href="/sistema/tickets">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Package className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">Tickets de Suporte</h3>
            <p className="text-sm text-muted-foreground">
              Ver e responder tickets dos fotógrafos
            </p>
          </Card>
        </Link>
      </div>
    </div>
    </SistemaLayout>
  );
}
