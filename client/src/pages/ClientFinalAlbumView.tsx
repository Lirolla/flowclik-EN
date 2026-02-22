import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Download, Share2, X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ClientFinalAlbumView() {
  const [, params] = useRoute("/client/final-album/:id");
  const appointmentId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [, setLocation] = useLocation();

  // Protection anti-copy: desabilitar clique direito e arrastar
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventDragStart = (e: DragEvent) => e.preventDefault();
    
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('dragstart', preventDragStart);
    
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('dragstart', preventDragStart);
    };
  }, []);

  const { data: appointment } = trpc.appointments.getById.useQuery(
    { id: appointmentId },
    { enabled: appointmentId > 0 }
  );

  const { data: finalPhotos } = trpc.finalAlbums.getByAppointment.useQuery(
    { appointmentId },
    { enabled: appointmentId > 0 }
  );

  const handleShare = () => {
    if (!appointment?.slug) {
      toast({
        title: "Error",
        description: "Not foi possible gerar link de compartilhamento.",
        variant: "destructive",
      });
      return;
    }

    const url = `${window.location.origin}/shared-album/${appointment.slug}`;
    setShareUrl(url);
    setShowShareDialog(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Link de compartilhamento copiado para a area de transfer.",
    });
  };

  // Mutation to generate ZIP download
  const generateZipMutation = trpc.finalAlbums.generateZipDownload.useMutation({
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank');
      toast({
        title: "Download iniciado!",
        description: `${finalPhotos?.length || 0} fotos sendo baixadas.`,
      });
    },
    onError: (error) => {
      console.error("Erro ao gerar ZIP:", error);
      toast({
        title: "Erro no download",
        description: "Not foi possible preparar o download. Try again.",
        variant: "destructive",
      });
    },
  });

  // Download all photos as ZIP
  const handleDownloadAll = () => {
    if (!finalPhotos || finalPhotos.length === 0) {
      return;
    }

    toast({
      title: "Preparando download...",
      description: "Criando arquivo ZIP com everys as fotos. Isso can levar some seconds.",
    });

    generateZipMutation.mutate({ appointmentId });
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => {
    if (lightboxIndex !== null && finalPhotos && lightboxIndex < finalPhotos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };
  const prevPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/client/dashboard/${appointmentId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Final Album</h1>
              <p className="text-muted-foreground mt-1">
                {appointment?.serviceType} - {finalPhotos?.length || 0} fotos edited
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={`/api/download-album/${appointmentId}`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                style={{ pointerEvents: (!finalPhotos || finalPhotos.length === 0) ? 'none' : 'auto', opacity: (!finalPhotos || finalPhotos.length === 0) ? 0.5 : 1 }}
              >
                <Download className="w-4 h-4" />
                Baixar Everys
              </a>
              <Button
                onClick={handleShare}
                className="gap-2"
                disabled={!finalPhotos || finalPhotos.length === 0}
              >
                <Share2 className="w-4 h-4" />
                Compartilhar Album
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="container mx-auto py-8">
        {!finalPhotos || finalPhotos.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border">
            <p className="text-muted-foreground text-lg">
              Your album final still not is available.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Aguarde enquanto o photographer finaliza a editing das yours fotos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {finalPhotos.map((photo: any, index: number) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-muted hover:ring-2 hover:ring-primary transition-all"
                onClick={() => openLightbox(index)}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.fileName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 pointer-events-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                {/* Overlay invisible para bloquear cliques na imagem */}
                <div className="absolute inset-0 bg-transparent" style={{ pointerEvents: 'auto' }} onClick={() => openLightbox(index)} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                {/* Watermark CSS contra print screen */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255,255,255,0.02) 100px, rgba(255,255,255,0.02) 101px)',
                }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 text-6xl font-bold rotate-[-45deg] whitespace-nowrap select-none">
                    LIROLLA.COM
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && finalPhotos && finalPhotos[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={prevPhoto}
            disabled={lightboxIndex === 0}
            className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 z-10"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={nextPhoto}
            disabled={lightboxIndex === finalPhotos.length - 1}
            className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 z-10"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          <div className="relative" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <img
              src={finalPhotos[lightboxIndex].photoUrl}
              alt={finalPhotos[lightboxIndex].fileName}
              className="max-w-[90vw] max-h-[90vh] object-contain pointer-events-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
            {/* Watermark no lightbox */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="text-white/10 text-8xl font-bold rotate-[-45deg] select-none">
                LIROLLA.COM
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            {lightboxIndex + 1} / {finalPhotos.length}
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Album</DialogTitle>
            <DialogDescription>
              Compartilhe your album com amigos e family!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono break-all">{shareUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyShareLink} className="flex-1">
                Copiar Link
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, "_blank")}
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
