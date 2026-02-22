import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Upload, Heart, ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSessionGallery() {
  return (
    <DashboardLayout>
      <AdminSessionGalleryContent />
    </DashboardLayout>
  );
}

function AdminSessionGalleryContent() {
  const [, params] = useRoute("/admin/gallery/:appointmentId");
  const appointmentId = params?.appointmentId ? parseInt(params.appointmentId) : 0;
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: galleryData } = trpc.sessionGallery.getByAppointment.useQuery(
    { appointmentId },
    { enabled: !!appointmentId }
  );

  const createGalleryMutation = trpc.sessionGallery.createForAppointment.useMutation({
    onSuccess: () => {
      toast({
        title: "Gallery criada!",
        description: "You can now upload the photos.",
      });
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateGallery = () => {
    createGalleryMutation.mutate({ appointmentId });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/client-gallery/${appointmentId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Envie este link para o cliente acessar as fotos.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!galleryData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gallery do Ensaio</h1>
          <p className="text-muted-foreground">
            Manage fotos do ensaio para o cliente
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              No galleries created yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Crie uma galeria privada para fazer upload das fotos do ensaio
            </p>
            <Button onClick={handleCreateGallery}>
              Criar Gallery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientLink = `${window.location.origin}/client-gallery/${appointmentId}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gallery do Ensaio</h1>
        <p className="text-muted-foreground">
          Manage fotos do ensaio #{appointmentId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{galleryData.photosCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Favourites do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              {galleryData.favoritesCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selection Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {galleryData.photosCount > 0
                ? Math.round((galleryData.favoritesCount / galleryData.photosCount) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Link */}
      <Card>
        <CardHeader>
          <CardTitle>Link para o Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              value={clientLink}
              readOnly
              className="flex-1 px-3 py-2 bg-muted rounded border"
            />
            <Button onClick={handleCopyLink} variant="outline">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button asChild>
              <a href={clientLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The client will need to enter their registered email to access the photos
          </p>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Use a page de <strong>Galleries</strong> para fazer upload das fotos do ensaio
            </p>
            <Button asChild>
              <Link href={`/admin/galleries/${galleryData.id}/upload`}>
                <a>Ir para Upload de Gallerys</a>
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Dica: Select a galeria "{galleryData.name}" ao fazer upload
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
