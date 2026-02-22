import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardDrive, FolderOpen, Image, CreditCard, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminUsage() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.usage.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading statistics de uso. Try again mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Determine color based on usage percentage
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <DashboardLayout>
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uso da Conta</h1>
          <p className="text-muted-foreground mt-2">
            Monitore o uso de storage, galerias e fotos da your conta
          </p>
        </div>
        <Button onClick={() => navigate("/admin/subscription")} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Sparkles className="w-4 h-4 mr-2" />
          Fazer Upgrade
        </Button>
      </div>

      {/* Usage Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Storage Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-500" />
                Storage
              </CardTitle>
              <span className={`text-2xl font-bold ${getUsageColor(stats.storage.percentage)}`}>
                {stats.storage.percentage}%
              </span>
            </div>
            <CardDescription>
              {stats.storage.used} {stats.storage.unit} de {stats.storage.limit} {stats.storage.unit}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress 
              value={stats.storage.percentage} 
              className="h-3"
            />
            {stats.storage.percentage >= 80 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {stats.storage.percentage >= 90 
                    ? "Limite quase atingido! Considere fazer upgrade."
                    : "You is usando mais de 80% do your storage."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Galleries Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-purple-500" />
                Gallerys
              </CardTitle>
              <span className={`text-2xl font-bold ${getUsageColor(stats.galleries.percentage)}`}>
                {stats.galleries.percentage}%
              </span>
            </div>
            <CardDescription>
              {stats.galleries.used} de {stats.galleries.limit} galerias criadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress 
              value={stats.galleries.percentage} 
              className="h-3"
            />
            {stats.galleries.percentage >= 80 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {stats.galleries.percentage >= 90 
                    ? "Limite de galerias quase atingido!"
                    : "You is usando mais de 80% das yours galerias."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Photos Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="w-5 h-5 text-green-500" />
                Fotos
              </CardTitle>
              <span className="text-2xl font-bold text-foreground">
                {stats.photos.total}
              </span>
            </div>
            <CardDescription>
              Total de fotos armazenadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fotos brutas:</span>
              <span className="font-medium">{stats.photos.raw}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fotos edited:</span>
              <span className="font-medium">{stats.photos.edited}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Card */}
      <Card className="border-2 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" />
                Plyear Current
              </CardTitle>
              <CardDescription className="mt-2">
                Gerencie your signature e add-ons
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {stats.plan.currency}{stats.plan.price}
              </div>
              <div className="text-sm text-muted-foreground">
                por month
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
            <div>
              <div className="font-medium">Plyear {stats.plan.name}</div>
              <div className="text-sm text-muted-foreground">
                Next charge: {new Date(stats.plan.nextBilling).toLocaleDateString('en-GB')}
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin/subscription")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Manage Plyear
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="w-full" onClick={() => navigate("/admin/subscription")}>
              Buy +10GB
              <span className="ml-auto text-muted-foreground">£3.99/month</span>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/admin/subscription")}>
              Buy +10 Galleries
              <span className="ml-auto text-muted-foreground">£2.99/month</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
