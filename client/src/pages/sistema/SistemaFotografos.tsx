import { trpc } from "@/lib/trpc";
import SistemaLayout from "@/components/SistemaLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { Globe, Mail, Phone, ExternalLink, Trash2 } from "lucide-react";

export default function SistemaFotografos() {
  const { data: photographers, isLoading, refetch } = trpc.system.getAllPhotographers.useQuery();
  const updatePlanMutation = trpc.system.updatePhotographerPlan.useMutation();
  const dhetePhotographerMutation = (trpc.system as any).dhetePhotographer.useMutation();
  const updateStatusMutation = (trpc.system as any).updatePhotographerStatus.useMutation();

  const [changingPlan, setChangingPlan] = useState<number | null>(null);
  const [dhetingId, setDhetingId] = useState<number | null>(null);
  const [showDheteDialog, setShowDheteDialog] = useState(false);

  const handlePlanChange = async (tenantId: number, newPlan: "starter" | "courtesy" | "full") => {
    setChangingPlan(tenantId);
    try {
      await updatePlanMutation.mutateAsync({ tenantId, plan: newPlan });
      toast.success("Current planizado com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar plyear");
    } finally {
      setChangingPlan(null);
    }
  };

  const handleToggleStatus = async (tenantId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' || currentStatus === 'trialing' ? 'paused' : 'active';
    try {
      await updateStatusMutation.mutateAsync({ tenantId, status: newStatus });
      toast.success(newStatus === 'paused' ? 'Photographer suspended!' : 'Photographer reativado!');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao change status');
    }
  };

  const handleDheteClick = (tenantId: number) => {
    setDhetingId(tenantId);
    setShowDheteDialog(true);
  };

  const handleDheteConfirm = async () => {
    if (!dhetingId) return;
    
    try {
      await dhetePhotographerMutation.mutateAsync({ tenantId: dhetingId });
      toast.success("Photographer dheted com sucesso!");
      setShowDheteDialog(false);
      setDhetingId(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir photographer");
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "trial":
        return <Badge className="bg-blue-600">Trial</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-600">Suspended</Badge>;
      case "cancelled":
        return <Badge className="bg-red-600">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-600">Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <SistemaLayout>
        <div className="p-8">
          <div className="text-center text-white">Loading...</div>
        </div>
      </SistemaLayout>
    );
  }

  return (
    <SistemaLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Manage Photographers</h1>
          <p className="text-gray-400">
            {photographers?.length || 0} photographers cadastrados na plataforma
          </p>
        </div>

        {photographers?.length === 0 ? (
          <Card className="p-12 bg-gray-800/50 border-gray-700 text-center">
            <p className="text-gray-400 text-lg">None photographer cadastrado still.</p>
            <p className="text-gray-500 mt-2">Photographers will appear here when they register.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {photographers?.map((photographer) => {
              const extraStorageCount = Math.floor((photographer.extraStorage || 0) / (10 * 1024 * 1024 * 1024));
              const extraGalleriesCount = Math.floor((photographer.extraGalleries || 0) / 10);
              const totalStorage = ((photographer.storageLimit || 0) + (photographer.extraStorage || 0)) / (1024 * 1024 * 1024);
              const totalGalleries = (photographer.galleryLimit || 0) + (photographer.extraGalleries || 0);

              // Cálculo de receita em REAIS (£)
              let monthlyRevenue = 0;
              if (photographer.plan === "starter") monthlyRevenue += 69.90;
              // Courtesy e Lifetime not pagam mensalidade base
              // courtesy = £ 0,00, full = £ 0,00
              monthlyRevenue += extraStorageCount * 29.90; // +10GB por £ 29,90
              monthlyRevenue += extraGalleriesCount * 39.90; // +10 galerias por £ 39,90

              const siteUrl = (photographer as any)?.customDomain 
                ? `https://${(photographer as any)?.customDomain}`
                : `https://${photographer.subdomain}.flowclik.com`;

              return (
                <Card key={photographer.id} className="p-6 bg-gray-800/50 border-gray-700">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Info do Tenant */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            {photographer.name || photographer.subdomain}
                            {getStatusBadge(photographer.status)}
                          </h3>
                          <p className="text-sm text-purple-400 font-mono">
                            {photographer.subdomain}.flowclik.com
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        {photographer.email && (
                          <p className="text-gray-400 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {photographer.email}
                          </p>
                        )}
                        {photographer.phone && (
                          <p className="text-gray-400 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {photographer.phone}
                          </p>
                        )}
                        {(photographer as any)?.customDomain && (
                          <p className="text-green-400 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {(photographer as any)?.customDomain}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        <a 
                          href={siteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver site
                        </a>
                        <p className="text-xs text-gray-500">
                          Cadastrado{" "}
                          {photographer.createdAt &&
                            formatDistanceToNow(new Date(photographer.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(photographer.id!, photographer.subscriptionStatus || 'active')}
                          className={photographer.subscriptionStatus === 'paused' || photographer.subscriptionStatus === 'cancelled' 
                            ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                            : 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20'}
                        >
                          {photographer.subscriptionStatus === 'paused' || photographer.subscriptionStatus === 'cancelled' ? '▶️ Reativar' : '⏸️ Suspender'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDheteClick(photographer.id!)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>

                    {/* Plyear e Recursos */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Plyear Current</p>
                      <Select
                        value={photographer.plan || "starter"}
                        onValueChange={(value) =>
                          handlePlanChange(photographer.id!, value as any)
                        }
                        disabled={changingPlan === photographer.id}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Basic (£69.90/month)</SelectItem>
                          <SelectItem value="courtesy">Courtesy (£ 0,00/month)</SelectItem>
                          <SelectItem value="full">Lifetime (Unlimited Free)</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="mt-3 space-y-1">
                        {photographer.plan === "courtesy" && (
                          <p className="text-xs text-blue-400">
                            🎁 Plyear Courtesy
                          </p>
                        )}
                        {photographer.plan === "full" ? (
                          <>
                            <p className="text-xs text-green-400">
                              ♾️ Storage Unlimited
                            </p>
                            <p className="text-xs text-green-400">
                              ♾️ Gallerys Unlimiteds
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-gray-400">
                              📦 {totalStorage.toFixed(1)}GB storage
                            </p>
                            <p className="text-xs text-gray-400">
                              🖼️ {totalGalleries} galerias
                            </p>
                          </>
                        )}
                        {photographer.trialEndsAt && (
                          <p className="text-xs text-yellow-400">
                            ⏰ Trial until {new Date(photographer.trialEndsAt).toLocaleDateString('en-GB')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Revenue */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Revenue Mensal</p>
                      <p className="text-2xl font-bold text-green-400">
                        £ {monthlyRevenue.toFixed(2).replace('.', ',')}
                      </p>
                      {(extraStorageCount > 0 || extraGalleriesCount > 0) && (
                        <div className="mt-2 space-y-1">
                          {extraStorageCount > 0 && (
                            <p className="text-xs text-gray-400">
                              +{extraStorageCount}x Storage (£ {(extraStorageCount * 29.90).toFixed(2).replace('.', ',')})
                            </p>
                          )}
                          {extraGalleriesCount > 0 && (
                            <p className="text-xs text-gray-400">
                              +{extraGalleriesCount}x Gallerys (£ {(extraGalleriesCount * 39.90).toFixed(2).replace('.', ',')})
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog de Confirmation de Excluare */}
      <AlertDialog open={showDheteDialog} onOpenChange={setShowDheteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the photographer,
              your site, everys as fotos, galerias, agendamentos e dados rshecionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDheteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SistemaLayout>
  );
}
