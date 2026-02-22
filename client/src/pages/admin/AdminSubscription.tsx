import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Database, Image, ShoppingCart, CheckCircle2, AlertCircle, Calendar, CreditCard, XCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [cancelingAddonId, setCancelingAddonId] = useState<number | null>(null);
  const [showCancelAddonDialog, setShowCancelAddonDialog] = useState<{id: number, type: string} | null>(null);

  // Buscar assinatura atual
  const { data: subscription, isLoading: loadingSubscription } = trpc.subscriptions.getCurrent.useQuery();
  
  // Buscar status do trial
  const { data: trialStatus } = trpc.subscriptions.checkTrialStatus.useQuery();

  // Buscar add-ons ativos
  const { data: activeAddons } = trpc.subscriptions.getActiveAddons.useQuery();

  // Buscar estatísticas de uso
  const { data: usage } = trpc.usage.getUsage.useQuery();

  // Mutations
  const buyStorageAddon = trpc.subscriptions.buyStorageAddon.useMutation();
  const buyGalleriesAddon = trpc.subscriptions.buyGalleriesAddon.useMutation();
  const cancelAddon = trpc.subscriptions.cancelAddon.useMutation();
  const createCheckout = trpc.subscriptions.createCheckoutSession.useMutation();
  
  const utils = trpc.useUtils();

  // Calcular limites e uso
  const storageGB = subscription ? Number(subscription.storageLimit) / 1073741824 : 10;
  const extraStorageGB = subscription ? Number(subscription.extraStorage) / 1073741824 : 0;
  const totalStorageGB = storageGB + extraStorageGB;
  const usedStorageGB = usage ? Number(usage.storageUsed) / 1073741824 : 0;
  const storagePercentage = totalStorageGB > 0 ? (usedStorageGB / totalStorageGB) * 100 : 0;

  const totalGalleries = (subscription?.galleryLimit || 10) + (subscription?.extraGalleries || 0);
  const usedGalleries = usage?.galleriesUsed || 0;
  const galleriesPercentage = totalGalleries > 0 ? (usedGalleries / totalGalleries) * 100 : 0;

  const totalPhotos = usage?.totalPhotos || 0;
  const rawPhotos = usage?.totalPhotos || 0;
  const editedPhotos = 0 || 0;

  // Determinar nome e preço do plano baseado no banco
  const planInfo = (() => {
    const plan = subscription?.plan || 'starter';
    switch (plan) {
      case 'full':
        return { name: 'Plano Vitalício', price: 'Grátis', priceNum: '0,00', description: 'Acesso completo e ilimitado', storageText: 'Storage Ilimitado', galleryText: 'Galerias Ilimitadas', color: 'text-green-500', badge: 'Vitalício' };
      case 'cortesia':
        return { name: 'Plano Cortesia', price: 'Grátis', priceNum: '0,00', description: 'Plano cortesia com opções de add-ons', storageText: '1GB de armazenamento', galleryText: '2 galerias', color: 'text-amber-500', badge: 'Cortesia' };
      case 'starter':
      default:
        return { name: 'Plano Básico', price: 'R$ 69,90', priceNum: '69,90', description: 'Plano padrão com opções de add-ons', storageText: '10GB de armazenamento', galleryText: '10 galerias', color: 'text-blue-600', badge: 'Ativo' };
    }
  })();

  // Handler: Assinar plano (pagar antes do trial acabar)
  const handleSubscribeNow = async () => {
    setIsSubscribing(true);
    try {
      const result = await createCheckout.mutateAsync({
        successUrl: `${window.location.origin}/admin/subscription?success=plan`,
        cancelUrl: `${window.location.origin}/admin/subscription?canceled=true`,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar assinatura");
      setIsSubscribing(false);
    }
  };

  // Handler: Comprar add-on de armazenamento
  const handleBuyStorage = async () => {
    setIsLoading(true);
    try {
      const result = await buyStorageAddon.mutateAsync({
        successUrl: `${window.location.origin}/admin/subscription?success=storage`,
        cancelUrl: `${window.location.origin}/admin/subscription?canceled=true`,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar compra");
      setIsLoading(false);
    }
  };

  // Handler: Comprar add-on de galerias
  const handleBuyGalleries = async () => {
    setIsLoading(true);
    try {
      const result = await buyGalleriesAddon.mutateAsync({
        successUrl: `${window.location.origin}/admin/subscription?success=galleries`,
        cancelUrl: `${window.location.origin}/admin/subscription?canceled=true`,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar compra");
      setIsLoading(false);
    }
  };

  // Handler: Cancelar add-on individual
  const handleCancelAddon = async (addonId: number) => {
    setCancelingAddonId(addonId);
    try {
      await cancelAddon.mutateAsync({ addonId });
      toast.success("Add-on cancelado. Ele permanece ativo até o fim do período pago.");
      utils.subscriptions.getActiveAddons.invalidate();
      utils.subscriptions.getCurrent.invalidate();
      utils.usage.getUsage.invalidate();
      setShowCancelAddonDialog(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar add-on");
    } finally {
      setCancelingAddonId(null);
    }
  };

  // Verificar query params para success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'plan') {
      toast.success("Assinatura ativada com sucesso! Bem-vindo ao FlowClik!");
      utils.subscriptions.getCurrent.invalidate();
      utils.subscriptions.checkTrialStatus.invalidate();
      window.history.replaceState({}, '', '/admin/subscription');
    } else if (params.get('success') === 'storage') {
      toast.success("+10GB adicionados com sucesso!");
      utils.subscriptions.getActiveAddons.invalidate();
      utils.subscriptions.getCurrent.invalidate();
      window.history.replaceState({}, '', '/admin/subscription');
    } else if (params.get('success') === 'galleries') {
      toast.success("+10 Galerias adicionadas com sucesso!");
      utils.subscriptions.getActiveAddons.invalidate();
      utils.subscriptions.getCurrent.invalidate();
      window.history.replaceState({}, '', '/admin/subscription');
    } else if (params.get('canceled') === 'true') {
      toast.error("Compra cancelada");
      window.history.replaceState({}, '', '/admin/subscription');
    }
  }, []);

  if (loadingSubscription) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const isTrialActive = trialStatus?.isTrialing === true;
  const isActive = subscription?.status === 'active';
  const daysRemaining = trialStatus?.daysRemaining ?? null;
  const isExpired = trialStatus?.isExpired === true;

  // Formatar data para pt-BR
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Contar add-ons por tipo
  const storageAddonsCount = activeAddons?.filter(a => a.addonType === 'storage').length || 0;
  const galleryAddonsCount = activeAddons?.filter(a => a.addonType === 'galleries').length || 0;

  // Cor da barra de trial baseada nos dias restantes
  const trialBarColor = daysRemaining !== null
    ? daysRemaining <= 2 ? 'bg-red-500' : daysRemaining <= 4 ? 'bg-yellow-500' : 'bg-green-500'
    : 'bg-green-500';

  const trialProgressPercent = daysRemaining !== null ? Math.max(0, ((7 - daysRemaining) / 7) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Assinatura & Uso</h1>
          <p className="text-muted-foreground">Gerencie seu plano, add-ons e monitore o uso de recursos</p>
        </div>

        {/* Banner de Trial */}
        {isTrialActive && daysRemaining !== null && (
          <Card className={`border-2 ${daysRemaining <= 2 ? 'border-red-500/50 bg-red-500/5' : daysRemaining <= 4 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-blue-500/50 bg-blue-500/5'}`}>
            <CardContent className="py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${daysRemaining <= 2 ? 'bg-red-500/20' : daysRemaining <= 4 ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                    <Clock className={`w-6 h-6 ${daysRemaining <= 2 ? 'text-red-500' : daysRemaining <= 4 ? 'text-yellow-500' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {daysRemaining <= 0
                        ? 'Seu período de teste expirou!'
                        : daysRemaining === 1
                          ? 'Último dia do período de teste!'
                          : `Faltam ${daysRemaining} dias para o período de teste acabar`
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {daysRemaining <= 0
                        ? 'Assine agora para continuar usando todas as funcionalidades do FlowClik.'
                        : 'Aproveite para conhecer todas as funcionalidades. Assine quando quiser para garantir o acesso contínuo.'
                      }
                    </p>
                    {/* Barra de progresso do trial */}
                    <div className="mt-3 w-full max-w-md">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Início do teste</span>
                        <span>{daysRemaining > 0 ? `${daysRemaining} dia${daysRemaining > 1 ? 's' : ''} restante${daysRemaining > 1 ? 's' : ''}` : 'Expirado'}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all ${trialBarColor}`} style={{ width: `${trialProgressPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSubscribeNow}
                  disabled={isSubscribing}
                  size="lg"
                  className={`shrink-0 ${daysRemaining <= 2 ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold px-8`}
                >
                  {isSubscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  Assine Já — R$ 69,90/mês
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner de Trial Expirado (status paused/cancelled) */}
        {isExpired && !isActive && subscription?.plan === 'starter' && (
          <Card className="border-2 border-red-500/50 bg-red-500/5">
            <CardContent className="py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-red-500/20">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-500">Acesso suspenso</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seu período de teste acabou e o plano não foi ativado. Assine agora para recuperar o acesso completo a todas as funcionalidades.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSubscribeNow}
                  disabled={isSubscribing}
                  size="lg"
                  className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold px-8"
                >
                  {isSubscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  Assine Já — R$ 69,90/mês
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plano Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{planInfo.name}</CardTitle>
                  <Badge variant={isTrialActive ? "default" : isActive ? "default" : subscription?.status === "paused" || subscription?.status === "cancelled" || subscription?.status === "past_due" ? "destructive" : "secondary"}>
                    {isTrialActive ? "Período de Teste" : isActive ? planInfo.badge : subscription?.status === "paused" ? "Suspenso" : subscription?.status === "cancelled" ? "Cancelled" : subscription?.status === "past_due" ? "Inadimplente" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {planInfo.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${planInfo.color}`}>{planInfo.price === "Grátis" ? "Grátis" : `R$ ${planInfo.priceNum}`}</p>
                <p className="text-sm text-muted-foreground">{planInfo.price === "Grátis" ? "para sempre" : "per month"}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recursos */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{planInfo.storageText}</p>
                    <p className="text-sm text-muted-foreground">Base: 10GB {storageAddonsCount > 0 && `+ ${storageAddonsCount}x 10GB (add-ons)`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">{planInfo.galleryText}</p>
                    <p className="text-sm text-muted-foreground">Base: 10 {galleryAddonsCount > 0 && `+ ${galleryAddonsCount}x 10 (add-ons)`}</p>
                  </div>
                </div>
              </div>
              
              {/* Benefícios Inclusos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Suporte por email</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Domínio personalizado</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Marca d'água personalizada</span>
                </div>
              </div>
            </div>

            {/* Botão Assine Já dentro do card do plano (quando em trial) */}
            {isTrialActive && (
              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  onClick={handleSubscribeNow}
                  disabled={isSubscribing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                  size="lg"
                >
                  {isSubscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  Assine Já — R$ 69,90/mês
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards de Uso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Armazenamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-blue-500" />
                Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{usedStorageGB.toFixed(2)}GB</p>
                  <p className="text-sm text-muted-foreground">/ {totalStorageGB}GB</p>
                </div>
                <Progress value={storagePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {storagePercentage.toFixed(1)}% utilizado
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Galerias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="w-5 h-5 text-purple-500" />
                Galerias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{usedGalleries}</p>
                  <p className="text-sm text-muted-foreground">/ {totalGalleries}</p>
                </div>
                <Progress value={galleriesPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {galleriesPercentage.toFixed(1)}% utilizado
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="w-5 h-5 text-green-500" />
                Fotos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{totalPhotos}</p>
                  <p className="text-sm text-muted-foreground">Total armazenadas</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Brutas: {rawPhotos}</p>
                  <p className="text-muted-foreground">Editadas: {editedPhotos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meus Add-ons Ativos */}
        {activeAddons && activeAddons.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Meus Add-ons Ativos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {activeAddons.length} add-on{activeAddons.length > 1 ? 's' : ''} ativo{activeAddons.length > 1 ? 's' : ''} — cada um com cobrança mensal independente
            </p>

            <div className="space-y-3">
              {activeAddons.map((addon) => (
                <Card key={addon.id} className={`border ${addon.addonType === 'storage' ? 'border-blue-500/30' : 'border-purple-500/30'}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${addon.addonType === 'storage' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                          {addon.addonType === 'storage' ? (
                            <Database className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Image className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {addon.addonType === 'storage' ? '+10GB Armazenamento' : '+10 Galerias'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Desde {formatDate(addon.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              Próx. cobrança: {formatDate(addon.currentPeriodEnd)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-bold ${addon.addonType === 'storage' ? 'text-blue-500' : 'text-purple-500'}`}>R$ 29,90</p>
                          <p className="text-xs text-muted-foreground">/mês</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                          onClick={() => setShowCancelAddonDialog({ id: addon.id, type: addon.addonType })}
                          disabled={cancelingAddonId === addon.id}
                        >
                          {cancelingAddonId === addon.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons Disponíveis */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Adicionar Add-ons</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Expanda seu plano de acordo com suas necessidades. Cada add-on tem cobrança mensal independente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* +10GB Armazenamento */}
            <Card className="border-2 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-6 h-6 text-blue-500" />
                  +10GB Armazenamento
                </CardTitle>
                <CardDescription>
                  Adicione mais espaço para suas fotos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold text-blue-600">R$ 29,90</p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>
                  <Button
                    onClick={handleBuyStorage}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    Adicionar +10GB
                  </Button>
                  {storageAddonsCount > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Você já tem {storageAddonsCount}x add-on{storageAddonsCount > 1 ? 's' : ''} de storage ativo{storageAddonsCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* +10 Galerias */}
            <Card className="border-2 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-6 h-6 text-purple-500" />
                  +10 Galerias
                </CardTitle>
                <CardDescription>
                  Crie mais galerias para seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold text-purple-600">R$ 29,90</p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>
                  <Button
                    onClick={handleBuyGalleries}
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    Adicionar +10 Galerias
                  </Button>
                  {galleryAddonsCount > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Você já tem {galleryAddonsCount}x add-on{galleryAddonsCount > 1 ? 's' : ''} de galerias ativo{galleryAddonsCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Informações Importantes */}
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-600">
              <li>• Todos começam com 7 dias grátis para testar</li>
              <li>• Após o teste, o plano é R$ 69,90/mês</li>
              <li>• Você pode assinar antes do teste acabar clicando em "Assine Já"</li>
              <li>• Add-ons podem ser adicionados a qualquer momento</li>
              <li>• Você pode comprar quantos add-ons quiser</li>
              <li>• Cada add-on tem sua própria data de cobrança mensal</li>
              <li>• Ao cancelar, o add-on permanece ativo até o fim do período pago</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmação de Cancelamento de Add-on */}
      <AlertDialog open={showCancelAddonDialog !== null} onOpenChange={() => setShowCancelAddonDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Add-on</AlertDialogTitle>
            <AlertDialogDescription>
              {showCancelAddonDialog?.type === 'storage' 
                ? "Você está prestes a cancelar um add-on de +10GB de armazenamento. O add-on permanecerá ativo até o fim do período já pago."
                : "Você está prestes a cancelar um add-on de +10 Galerias. O add-on permanecerá ativo até o fim do período já pago."}
              <br /><br />
              Se o seu uso atual exceder o limite sem este add-on, o cancelamento será bloqueado. Nesse caso, libere recursos primeiro.
              <br /><br />
              Tem certeza que deseja cancelar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showCancelAddonDialog && handleCancelAddon(showCancelAddonDialog.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
