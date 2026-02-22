import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Database, FolderOpen, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export default function SistemaTenants() {
  const { data: tenants, isLoading } = trpc.sistema.getAllTenants.useQuery();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      starter: "bg-blue-100 text-blue-800",
      pro: "bg-purple-100 text-purple-800",
      enterprise: "bg-green-100 text-green-800",
    };

    return (
      <Badge className={colors[plan] || colors.starter}>
        {plan === "starter" && "Starter"}
        {plan === "pro" && "Pro"}
        {plan === "enterprise" && "Enterprise"}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trialing: "secondary",
      past_due: "destructive",
      cancelled: "outline",
      paused: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status === "active" && "Active"}
        {status === "trialing" && "Trial"}
        {status === "past_due" && "Vencido"}
        {status === "cancelled" && "Cancelled"}
        {status === "paused" && "Pausado"}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-40 mb-2" />
              <div className="h-3 bg-muted rounded w-60" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Fotógrafos Cadastrados</h1>
        <p className="text-muted-foreground">
          Gerenciar todos os fotógrafos da plataforma
        </p>
      </div>

      {/* Lista de Tenants */}
      <div className="grid gap-4">
        {!tenants || tenants.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum fotógrafo cadastrado</h3>
          </Card>
        ) : (
          tenants.map((tenant) => (
            <Card key={tenant.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{tenant.name}</h3>
                    {tenant.plan && getPlanBadge(tenant.plan)}
                    {tenant.subscriptionStatus && getStatusBadge(tenant.subscriptionStatus)}
                    {tenant.status === "suspended" && (
                      <Badge variant="destructive">Suspenso</Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Subdomínio</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{tenant.subdomain}.lirolla.com</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(`https://${tenant.subdomain}.lirolla.com`, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="text-sm">{tenant.email}</p>
                    </div>

                    {tenant.storageLimit && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <Database className="h-3 w-3 inline mr-1" />
                          Limite de Storage
                        </p>
                        <p className="text-sm font-semibold">{formatBytes(tenant.storageLimit)}</p>
                      </div>
                    )}

                    {tenant.galleryLimit && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <FolderOpen className="h-3 w-3 inline mr-1" />
                          Limite de Galerias
                        </p>
                        <p className="text-sm font-semibold">{tenant.galleryLimit} galerias</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Cadastrado {formatDistanceToNow(new Date(tenant.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
