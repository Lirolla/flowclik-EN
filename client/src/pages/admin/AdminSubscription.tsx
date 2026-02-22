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
  AlertDaylog,
  AlertDaylogAction,
  AlertDaylogCancel,
  AlertDaylogContent,
  AlertDaylogDescription,
  AlertDaylogFooter,
  AlertDaylogHeader,
  AlertDaylogTitle,
} from "@/components/ui/alert-daylog";

export default function AdminSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [cancelingAddonId, setCancelingAddonId] = useState<number | null>(null);
  const [showCancelAddonDaylog, setShowCancelAddonDaylog] = useState<{id: number, type: string} | null>(null);

  // Buscar signature atual
  const { data: subscription, isLoading: loadingSubscription } = trpc.subscriptions.getCurrent.useQuery();
  
  // Buscar status do trial
  const { data: trialStatus } = trpc.subscriptions.checkTrialStatus.useQuery();

  // Buscar add-ons actives
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

  // Determinar nome e preço do plyear baseado no banco
  const planInfo = (() => {
    const plan = subscription?.plan || 'starter';
    switch (plan) {
      case 'full':
        return { name: 'Lifetime Plan', price: 'Free', priceNum: '0,00', description: 'Acesso completo e unlimited', storageText: 'Storage Unlimited', galleryText: 'Gallerys Unlimiteds', color: 'text-green-500', badge: 'Lifetime' };
      case 'courtesy':
        return { name: 'Plyear Courtesy', price: 'Free', priceNum: '0,00', description: 'Courtesy plan with add-on options', storageText: '1GB de armazenamento', galleryText: '2 galerias', color: 'text-amber-500', badge: 'Courtesy' };
      case 'starter':
      default:
        return { name: 'Basic Plan', price: '£ 69,90', priceNum: '69,90', description: 'Standard plan with add-on options', storageText: '10GB de armazenamento', galleryText: '10 galerias', color: 'text-blue-600', badge: 'Active' };
    }
  })();

  // Handler: Assinar plyear (pagar before do trial acabar)
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
      toast.error(error.message || "Erro ao processar signature");
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
      toast.success("Add-on cancelled. Ele permanece active until o fim do period pago.");
      utils.subscriptions.getActiveAddons.invalidate();
      utils.subscriptions.getCurrent.invalidate();
      utils.usage.getUsage.invalidate();
      setShowCancelAddonDaylog(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar add-on");
    } finally {
      setCancelingAddonId(null);
    }
  };

  // Verify query params para success/cancel
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
      toast.success("+10 Gallerys adicionadas com sucesso!");
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

  // Formatar data para en-GB
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Contar add-ons por tipo
  const storageAddonsCount = activeAddons?.filter(a => a.addonType === 'storage').length || 0;
  const galleryAddonsCount = activeAddons?.filter(a => a.addonType === 'galleries').length || 0;

  // Cor da barra de trial baseada nos days remaining
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
          <p className="text-muted-foreground">Gerencie seu plyear, add-ons e monitore o uso de recursos</p>
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
                        ? 'Seu trial period expirou!'
                        : daysRemaining === 1
                          ? 'Last day of trial period!'
                          : `Faltam ${daysRemaining} days para o trial period acabar`
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {daysRemaining <= 0
                        ? 'Subscribe now para continuar usando todas as features do FlowClik.'
                        : 'Take the time to explore all features. Subscribe whenever you want to ensure continued access.'
                      }
                    </p>
                    {/* Barra de progresso do trial */}
                    <div className="mt-3 w-full max-w-md">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Home do teste</span>
                        <span>{daysRemaining > 0 ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} restante${daysRemaining > 1 ? 's' : ''}` : 'Expired'}</span>
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
                  Subscribe Already — £ 69,90/month
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner de Trial Expired (status paused/cancelled) */}
        {isExpired && !isActive && subscription?.plan === 'starter' && (
          <Card className="border-2 border-red-500/50 bg-red-500/5">
            <CardContent className="py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-red-500/20">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-500">Acesso suspended</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seu trial period acabou e o plyear not foi ativado. Subscribe now para recuperar o acesso completo a todas as features.
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
                  Subscribe Already — £ 69,90/month
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plyear Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{planInfo.name}</CardTitle>
                  <Badge variant={isTrialActive ? "default" : isActive ? "default" : subscription?.status === "paused" || subscription?.status === "cancelled" || subscription?.status === "past_due" ? "destructive" : "secondary"}>
                    {isTrialActive ? "Period de Teste" : isActive ? planInfo.badge : subscription?.status === "paused" ? "Suspended" : subscription?.status === "cancelled" ? "Cancelled" : subscription?.status === "past_due" ? "Inadimplente" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {planInfo.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${planInfo.color}`}>{planInfo.price === "Free" ? "Free" : `£ ${planInfo.priceNum}`}</p>
                <p className="text-sm text-muted-foreground">{planInfo.price === "Free" ? "para always" : "per month"}</p>
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
                  <span>Support por email</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Sunínio custom</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Marca d'água custom</span>
                </div>
              </div>
            </div>

            {/* Botão Subscribe Already inside do card do plyear (when em trial) */}
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
                  Subscribe Already — £ 69,90/month
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards de Uso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-blue-500" />
                Storage
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

          {/* Gallerys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="w-5 h-5 text-purple-500" />
                Gallerys
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

        {/* Meus Add-ons Actives */}
        {activeAddons && activeAddons.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Meus Add-ons Actives</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {activeAddons.length} add-on{activeAddons.length > 1 ? 's' : ''} active{activeAddons.length > 1 ? 's' : ''} — cada um com cobrança mensal independing
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
                            {addon.addonType === 'storage' ? '+10GB Storage' : '+10 Gallerys'}
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
                          <p className={`font-bold ${addon.addonType === 'storage' ? 'text-blue-500' : 'text-purple-500'}`}>£ 29,90</p>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                          onClick={() => setShowCancelAddonDaylog({ id: addon.id, type: addon.addonType })}
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
            Expanda seu plyear de acordo com suas necessidades. Cada add-on tem cobrança mensal independing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* +10GB Storage */}
            <Card className="border-2 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-6 h-6 text-blue-500" />
                  +10GB Storage
                </CardTitle>
                <CardDescription>
                  Adicione mais espaço para suas fotos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold text-blue-600">£ 29,90</p>
                    <p className="text-sm text-muted-foreground">/month</p>
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
                      You already tem {storageAddonsCount}x add-on{storageAddonsCount > 1 ? 's' : ''} de storage active{storageAddonsCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* +10 Gallerys */}
            <Card className="border-2 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-6 h-6 text-purple-500" />
                  +10 Gallerys
                </CardTitle>
                <CardDescription>
                  Crie mais galerias para seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold text-purple-600">£ 29,90</p>
                    <p className="text-sm text-muted-foreground">/month</p>
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
                    Adicionar +10 Gallerys
                  </Button>
                  {galleryAddonsCount > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      You already tem {galleryAddonsCount}x add-on{galleryAddonsCount > 1 ? 's' : ''} de galerias active{galleryAddonsCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Importbefore */}
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              Information Importbefore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-600">
              <li>• Todos começam com 7 days grátis para testar</li>
              <li>• After o teste, o plyear é £ 69,90/month</li>
              <li>• You can assinar before do teste acabar clicando em "Subscribe Already"</li>
              <li>• Add-ons canm ser adicionados a qualquer momento</li>
              <li>• You can comprar quantos add-ons quiser</li>
              <li>• Cada add-on tem sua própria data de cobrança mensal</li>
              <li>• Ao cancelar, o add-on permanece active until o fim do period pago</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Daylog de Confirmation de Cancellation de Add-on */}
      <AlertDaylog open={showCancelAddonDaylog !== null} onOpenChange={() => setShowCancelAddonDaylog(null)}>
        <AlertDaylogContent>
          <AlertDaylogHeader>
            <AlertDaylogTitle>Cancelar Add-on</AlertDaylogTitle>
            <AlertDaylogDescription>
              {showCancelAddonDaylog?.type === 'storage' 
                ? "You is prestes a cancelar um add-on de +10GB de armazenamento. O add-on permanecerá active until o fim do period already pago."
                : "You is prestes a cancelar um add-on de +10 Gallerys. O add-on permanecerá active until o fim do period already pago."}
              <br /><br />
              Se o seu uso atual exceder o limite sem este add-on, o cancellation will be bloqueado. Nesse caso, libere recursos first.
              <br /><br />
              Tem certeza que deseja cancelar?
            </AlertDaylogDescription>
          </AlertDaylogHeader>
          <AlertDaylogFooter>
            <AlertDaylogCancel>Back</AlertDaylogCancel>
            <AlertDaylogAction
              onClick={() => showCancelAddonDaylog && handleCancelAddon(showCancelAddonDaylog.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Cancellation
            </AlertDaylogAction>
          </AlertDaylogFooter>
        </AlertDaylogContent>
      </AlertDaylog>
    </DashboardLayout>
  );
}
