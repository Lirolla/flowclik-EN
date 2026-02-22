import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Check, Download, X, ChevronLeft, ChevronRight, CheckCircle2, Package, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Daylog, DaylogContent, DaylogDescription, DaylogHeader, DaylogTitle } from "@/components/ui/daylog";
import { Input } from "@/components/ui/input";

export default function ClientFinalAlbum() {
  const [, params] = useRoute("/final-album/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();

  const { data: collection, isLoading: collectionLoading } = trpc.collections.getBySlug.useQuery({ slug });
  const { data: editedPhotos, isLoading: photosLoading, refetch } = trpc.photoSelections.getEditedPhotos.useQuery(
    { collectionId: collection?.id || 0 },
    { enabled: !!collection?.id }
  );

  const { data: downloadUrls } = trpc.photoSelections.getDownloadUrls.useQuery(
    { collectionId: collection?.id || 0 },
    { enabled: !!collection?.id }
  );

  const approveAlbumMutation = trpc.photoSelections.approveAlbum.useMutation({
    onSuccess: () => {
      toast({
        title: "Album aprovado!",
        description: "Suas fotos editadas foram aprovadas com sucesso.",
      });
      refetch();
    },
  });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareDaylog, setShowShareDaylog] = useState(false);
  const [shareLink, setShareLink] = useState("");
  
  useEffect(() => {
    if (collection?.slug) {
      const link = `${window.location.origin}/shared-album/${collection.slug}`;
      setShareLink(link);
    }
  }, [collection]);

  const handleDownloadAll = async () => {
    if (!downloadUrls || downloadUrls.length === 0) {
      toast({
        title: "Error",
        description: "Nonea foto editada available para download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Preparando download...",
      description: `Baixando ${downloadUrls.length} fotos. Please wait...`,
    });

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Download each photo and add to ZIP
      for (let i = 0; i < downloadUrls.length; i++) {
        const photo = downloadUrls[i];
        try {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          const extension = photo.url.split('.').pop()?.split('?')[0] || 'jpg';
          const filename = `${i + 1}-${photo.filename.replace(/[^a-z0-9]/gi, '-')}.${extension}`;
          zip.file(filename, blob);
        } catch (error) {
          console.error(`Erro ao baixar foto ${photo.filename}:`, error);
        }
      }

      // Generate ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${collection?.name || 'album'}-fotos-editadas.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download concluído!",
        description: `${downloadUrls.length} fotos baixadas com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao criar ZIP:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao preparar o arquivo. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (collectionLoading || photosLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Carregando álbum...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl font-bold mb-4">Album not found</h1>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para início
          </Button>
        </Link>
      </div>
    );
  }

  // Password protection
  if (collection.password && !isAuthenticated) {
    const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === collection.password) {
        setIsAuthenticated(true);
        setPasswordError("");
      } else {
        setPasswordError("Incorrect password. Try again.");
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-card rounded-lg border">
          <h1 className="text-2xl font-bold mb-2">Final Album</h1>
          <p className="text-muted-foreground mb-6">Este álbum é protegido por senha</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Digite a senha
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border rounded-md bg-background"
                placeholder="Password"
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-2">{passwordError}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Acessar Album
            </Button>
          </form>
          
          <Link href="/" className="block mt-4">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const photos = editedPhotos || [];
  const allPhotosEdited = photos.length > 0 && photos.every((p: any) => p.editedPhotoUrl);
  const completedCount = photos.filter((p: any) => p.editedPhotoUrl).length;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const handleApproveAlbum = async () => {
    if (!allPhotosEdited) {
      toast({
        title: "Aguarde",
        description: "Algumas fotos ainda estão sendo editadas.",
        variant: "destructive",
      });
      return;
    }

    if (confirm("You confirma que aprova todas as fotos editadas? Esta ação não pode ser desfeita.")) {
      await approveAlbumMutation.mutateAsync({ collectionId: collection.id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar currentPage="galerias" />

      <div className="container py-8 pt-32">
        {/* Header */}
        <div className="mb-8">
          <Link href="/galleries">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para galerias
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
          <p className="text-muted-foreground">{collection.description}</p>
        </div>

        {/* Progress Banner */}
        <div className="mb-8 p-6 bg-card rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Final Album - Fotos Editadas</h2>
              <p className="text-sm text-muted-foreground">
                {completedCount} de {photos.length} fotos editadas
              </p>
            </div>
              <div className="flex items-center gap-3">
                {allPhotosEdited && (
                  <>
                    <Button
                      onClick={handleDownloadAll}
                      disabled={isDownloading}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                    >
                      {isDownloading ? (
                        <>
                          <Package className="w-5 h-5 animate-pulse" />
                          Preparando...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Baixar Todas as Fotos
                        </>
                      )}
                    </Button>
                    <Button onClick={handleApproveAlbum} size="lg" className="gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Aprovar Album Completo
                    </Button>
                    <Button 
                      onClick={() => setShowShareDaylog(true)} 
                      size="lg" 
                      variant="secondary"
                      className="gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Compartilhar Album
                    </Button>
                  </>
                )}
              </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / photos.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground">Nonea foto selecionada para edição ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo: any, index: number) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-muted"
                onClick={() => openLightbox(index)}
              >
                {photo.editedPhotoUrl ? (
                  <>
                    <img
                      src={photo.editedPhotoUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 p-2 bg-green-500 rounded-full">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">In editing...</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightboxIndex !== null && photos[lightboxIndex] && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            {lightboxIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            {lightboxIndex < photos.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Image */}
            <div className="max-w-7xl w-full px-4">
              <div className="flex flex-col items-center">
                {photos[lightboxIndex].editedPhotoUrl ? (
                  <>
                    <img
                      src={photos[lightboxIndex].editedPhotoUrl}
                      alt={photos[lightboxIndex].title || "Photo"}
                      className="max-h-[85vh] w-auto object-contain mb-4"
                    />
                    <div className="w-full max-w-4xl mx-auto text-center">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {photos[lightboxIndex].title || "No title"}
                      </h3>
                      {photos[lightboxIndex].clientFeedback && (
                        <div className="bg-white/10 rounded-lg p-4 mb-4">
                          <p className="text-sm text-white/80 mb-1">Seu palpite:</p>
                          <p className="text-white">{photos[lightboxIndex].clientFeedback}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <Check className="w-5 h-5" />
                        <span>Foto editada</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-white">
                    <p className="text-lg mb-2">Esta foto ainda está sendo editada</p>
                    <p className="text-sm text-white/60">Aguarde o photographer finalizar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </div>
        )}
      </div>

      <Footer />
      
      {/* Share Daylog */}
      <Daylog open={showShareDaylog} onOpenChange={setShowShareDaylog}>
        <DaylogContent className="max-w-lg">
          <DaylogHeader>
            <DaylogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartilhar Album
            </DaylogTitle>
            <DaylogDescription>
              Compartilhe este álbum com amigos e familiares! Eles precisarão informar o email para visualizar.
            </DaylogDescription>
          </DaylogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Link do álbum</label>
              <div className="flex gap-2">
                <Input 
                  value={shareLink} 
                  readOnly 
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast({
                      title: "Link copied!",
                      description: "O link foi copiado para a área de transferência.",
                    });
                  }}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📧 <strong>Captura de leads:</strong> Todos que acessarem este link precisarão informar o email. 
                You poderá ver a lista de visitantes no painel admin!
              </p>
            </div>
          </div>
        </DaylogContent>
      </Daylog>
    </div>
  );
}
