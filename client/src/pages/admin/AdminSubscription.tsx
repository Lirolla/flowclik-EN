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

  // Fetch current subscription
  const { data: subscription, isLoading: loadingSubscription } = trpc.subscriptions.getCurrent.useQuery();
  
  // Fetch trial status
  const { data: trialStatus } = trpc.subscriptions.checkTrialStatus.useQuery();

  // Fetch active add-ons
  const { data: activeAddons } = trpc.subscriptions.getActiveAddons.useQuery();

  // Fetch usage statistics
  const { data: usage } = trpc.usage.getUsage.useQuery();

  // Mutations
  const buyStorageAddon = trpc.subscriptions.buyStorageAddon.useMutation();
  const buyGalleriesAddon = trpc.subscriptions.buyGalleriesAddon.useMutation();
  const cancelAddon = trpc.subscriptions.cancelAddon.useMutation();
  const createCheckout = trpc.subscriptions.createCheckoutSession.useMutation();
  
  const utils = trpc.useUtils();

  // Calculate limits and usage
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

  // Determine plan name and price based on database
  const planInfo = (() => {
    const plan = subscription?.plan || 'starter';
    switch (plan) {
      case 'full':
        return { name: 'Lifetime Plan', price: 'Free', priceNum: '0.00', description: 'Complete and unlimited access', storageText: 'Storage Unlimited', galleryText: 'Unlimited Galleries', color: 'text-green-500', badge: 'Lifetime' };
      case 'courtesy':
        return { name: 'Courtesy Plan', price: 'Free', priceNum: '0.00', description: 'Courtesy plan with add-on options', storageText: '1GB Storage', galleryText: '2 Galleries', color: 'text-amber-500', badge: 'Courtesy' };
      case 'starter':
      default:
        return { name: 'Basic Plan', price: '£ 8.99', priceNum: '8.99', description: 'Standard plan with add-on options', storageText: '10GB Storage', galleryText: '10 Galleries', color: 'text-blue-600', badge: 'Active' };
    }
  })();

  // Handler: Subscribe to plan
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
      toast.error(error.message || "Error processing subscription");
      setIsSubscribing(false);
    }
  };

  // Handler: Buy storage add-on
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
      toast.error(error.message || "Error processing purchase");
      setIsLoading(false);
    }
  };

  // Handler: Buy galleries add-on
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
      toast.error(error.message || "Error processing purchase");
      setIsLoading(false);
    }
  };

  // Handler: Cancel add-on individual
  const handleCancelAddon = async (addonId: number) => {
    setCancelingAddonId(addonId);
    try {
      await cancelAddon.mutateAsync({ addonId });
      toast.success("Add-on cancelled. It will remain active until the end of the current billing period.");
      utils.subscriptions.getActiveAddons.invalidate();
      utils.subscriptions.getCurrent.invalidate();
      utils.usage.getUsage.invalidate();
      setShowCancelAddonDialog(null);
    } catch (error: any) {
      toast.error(error.message || "Error cancelling add-on");
    } finally {
      setCancelingAddonId(null);
    }
  };

  // Check query params for success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'plan') {
      toast.success("Subscription activated successfully! Welcome to FlowClik!");
      utils.subscriptions.getCurrent.invalidate();
      utils.subscriptions.checkTrialStatus.invalidate();
      window.history.replaceState({}, '', '/admin/subscription');
    } else if (params.get('success') === 'storage') {
      toast.success("+10GB added successfully!");
      utils.subscriptions.getActiveAddons.invalidate();
      utils.subscriptions.getCurrent.invalidate();
      window.history.replaceState({}, '', '/admin/subscription');
    } else if (params.get('success') === 'galleries') {
      toast.success("+10 Galleries added successfully!");
      utils.subscriptions.getActiveAddons.invalidate();
      utils.subscriptions.getCurrent.invalidate();
      window.history.replaceState({}, '', '/admin/subscription');
    } else if (params.get('canceled') === 'true') {
      toast.error("Purchase cancelled");
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

  // Format date for en-GB
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Count add-ons by type
  const storageAddonsCount = activeAddons?.filter(a => a.addonType === 'storage').length || 0;
  const galleryAddonsCount = activeAddons?.filter(a => a.addonType === 'galleries').length || 0;

  // Trial bar colour based on days remaining
  const trialBarColor = daysRemaining !== null
    ? daysRemaining <= 2 ? 'bg-red-500' : daysRemaining <= 4 ? 'bg-yellow-500' : 'bg-green-500'
    : 'bg-green-500';

  const trialProgressPercent = daysRemaining !== null ? Math.max(0, ((7 - daysRemaining) / 7) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Subscription & Usage</h1>
          <p className="text-muted-foreground">Manage your plan, add-ons and monitor resource usage</p>
        </div>

        {/* Trial Banner */}
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
                        ? 'Your trial period has expired!'
                        : daysRemaining === 1
                          ? 'Last day of your trial period!'
                          : `${daysRemaining} days remaining in your trial period`
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {daysRemaining <= 0
                        ? 'Subscribe now to continue using all FlowClik features.'
                        : 'Take the time to explore all features. Subscribe whenever you want to ensure continued access.'
                      }
                    </p>
                    {/* Trial progress bar */}
                    <div className="mt-3 w-full max-w-md">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Trial start</span>
                        <span>{daysRemaining > 0 ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining` : 'Expired'}</span>
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
                  Subscribe Now — £ 8.99/month
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trial Expired Banner (status paused/cancelled) */}
        {isExpired && !isActive && subscription?.plan === 'starter' && (
          <Card className="border-2 border-red-500/50 bg-red-500/5">
            <CardContent className="py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-red-500/20">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-500">Access suspended</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your trial period has ended and the plan was not activated. Subscribe now to regain full access to all features.
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
                  Subscribe Now — £ 8.99/month
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{planInfo.name}</CardTitle>
                  <Badge variant={isTrialActive ? "default" : isActive ? "default" : subscription?.status === "paused" || subscription?.status === "cancelled" || subscription?.status === "past_due" ? "destructive" : "secondary"}>
                    {isTrialActive ? "Trial Period" : isActive ? planInfo.badge : subscription?.status === "paused" ? "Suspended" : subscription?.status === "cancelled" ? "Cancelled" : subscription?.status === "past_due" ? "Past Due" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {planInfo.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${planInfo.color}`}>{planInfo.price === "Free" ? "Free" : `£ ${planInfo.priceNum}`}</p>
                <p className="text-sm text-muted-foreground">{planInfo.price === "Free" ? "forever" : "per month"}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resources */}
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
              
              {/* Included Benefits */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Email support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Custom domain</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Custom watermark</span>
                </div>
              </div>
            </div>

            {/* Subscribe button inside plan card (when in trial) */}
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
                  Subscribe Now — £ 8.99/month
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Cards */}
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
                  {storagePercentage.toFixed(1)}% used
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Galleries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="w-5 h-5 text-purple-500" />
                Galleries
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
                  {galleriesPercentage.toFixed(1)}% used
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="w-5 h-5 text-green-500" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{totalPhotos}</p>
                  <p className="text-sm text-muted-foreground">Total stored</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Raw: {rawPhotos}</p>
                  <p className="text-muted-foreground">Edited: {editedPhotos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Active Add-ons */}
        {activeAddons && activeAddons.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">My Active Add-ons</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {activeAddons.length} active add-on{activeAddons.length > 1 ? 's' : ''} — each with independent monthly billing
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
                            {addon.addonType === 'storage' ? '+10GB Storage' : '+10 Galleries'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Since {formatDate(addon.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              Next charge: {formatDate(addon.currentPeriodEnd)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-bold ${addon.addonType === 'storage' ? 'text-blue-500' : 'text-purple-500'}`}>{addon.addonType === 'storage' ? '£ 3.99' : '£ 2.99'}</p>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">Active</Badge>
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
                              Cancel
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

        {/* Add-ons Available */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Add Add-ons</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Expand your plan according to your needs. Each add-on has independent monthly billing.
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
                  Add more space for your photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold text-blue-600">£ 3.99</p>
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
                    Add +10GB
                  </Button>
                  {storageAddonsCount > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      You already have {storageAddonsCount} active storage add-on{storageAddonsCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* +10 Galleries */}
            <Card className="border-2 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-6 h-6 text-purple-500" />
                  +10 Galleries
                </CardTitle>
                <CardDescription>
                  Create more galleries for your clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold text-purple-600">£ 2.99</p>
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
                    Add +10 Galleries
                  </Button>
                  {galleryAddonsCount > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      You already have {galleryAddonsCount} active gallery add-on{galleryAddonsCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Information */}
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-600">
              <li>• Everyone starts with 7 free days to test all features</li>
              <li>• After the trial, the plan is £ 8.99/month</li>
              <li>• You can subscribe before the trial ends by clicking "Subscribe Now"</li>
              <li>• Add-ons can be added at any time</li>
              <li>• You can purchase as many add-ons as you need</li>
              <li>• Each add-on has its own monthly billing date</li>
              <li>• When cancelled, the add-on remains active until the end of the paid period</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add-on Cancellation Confirmation Dialog */}
      <AlertDialog open={showCancelAddonDialog !== null} onOpenChange={() => setShowCancelAddonDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Add-on</AlertDialogTitle>
            <AlertDialogDescription>
              {showCancelAddonDialog?.type === 'storage' 
                ? "You are about to cancel a +10GB Storage add-on. The add-on will remain active until the end of the current paid period."
                : "You are about to cancel a +10 Galleries add-on. The add-on will remain active until the end of the already paid period."}
              <br /><br />
              If your current usage exceeds the limit without this add-on, the cancellation will be blocked. In that case, please free up resources first.
              <br /><br />
              Are you sure you want to cancel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showCancelAddonDialog && handleCancelAddon(showCancelAddonDialog.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
