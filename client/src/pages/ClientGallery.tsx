import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, X, MessageSquare, CheckCircle, Lock, Unlock, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ProtectedImage } from "@/components/ProtectedImage";

export default function ClientGallery() {
  const [, params] = useRoute("/galeria-cliente/:appointmentId");
  const appointmentId = params?.appointmentId ? parseInt(params.appointmentId) : 0;
  
  const [clientEmail, setClientEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const { data: galleryData, refetch } = trpc.sessionGallery.getForClient.useQuery(
    { appointmentId, clientEmail },
    { enabled: isAuthenticated && !!clientEmail }
  );

  const { data: comments, refetch: refetchComments } = trpc.photoComments.getForClient.useQuery(
    { appointmentId, clientEmail },
    { enabled: isAuthenticated && !!clientEmail }
  );

  const { data: downloadPermission } = trpc.downloadControl.checkPermission.useQuery(
    { collectionId: galleryData?.gallery?.id || 0 },
    { enabled: !!galleryData?.gallery?.id }
  );

  const toggleFavoriteMutation = trpc.sessionGallery.toggleFavorite.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Favorita atualizada!",
        description: "Sua seleção foi salva.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCommentMutation = trpc.photoComments.add.useMutation({
    onSuccess: () => {
      refetchComments();
      setComment("");
      toast({
        title: "Comentário adicionado!",
        description: "O fotógrafo foi notificado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveSelectionMutation = trpc.appointments.approveSelection.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Seleção aprovada!",
        description: "O fotógrafo foi notificado e iniciará a edição final.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientEmail) {
      setIsAuthenticated(true);
    }
  };

  const handleToggleFavorite = (photoId: number, currentState: boolean) => {
    toggleFavoriteMutation.mutate({
      photoId,
      appointmentId,
      clientEmail,
      isFavorite: !currentState,
    });
  };

  const handleAddComment = () => {
    if (!comment.trim() || !selectedPhoto) return;

    addCommentMutation.mutate({
      photoId: selectedPhoto.id,
      appointmentId,
      clientEmail,
      comment: comment.trim(),
    });
  };

  const handleApproveSelection = () => {
    if (!favoritesCount || favoritesCount === 0) {
      toast({
        title: "Nenhuma foto selecionada",
        description: "Por favor, marque pelo menos uma foto como favorita antes de aprovar.",
        variant: "destructive",
      });
      return;
    }

    approveSelectionMutation.mutate({
      appointmentId,
      clientEmail,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Suas Fotos do Ensaio</h1>
            <p className="text-muted-foreground">
              Digite seu email para acessar a galeria
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <Button type="submit" className="w-full">
              Acessar Galeria
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (!galleryData || !galleryData.gallery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Galeria não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            As fotos do seu ensaio ainda não foram enviadas pelo fotógrafo.
          </p>
          <Button onClick={() => setIsAuthenticated(false)}>
            Tentar outro email
          </Button>
        </Card>
      </div>
    );
  }

  const { gallery, photos, appointment } = galleryData;
  const favoritesCount = photos.filter(p => p.isFavorite).length;
  const photoComments = comments || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{gallery.name}</h1>
              <p className="text-muted-foreground mt-1">
                {appointment.clientName} • {new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  {photos.length} fotos
                </div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  {favoritesCount} favoritas
                </div>
              </div>
              {downloadPermission?.allowed ? (
                <div className="flex items-center gap-2 text-green-500 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded">
                  <Unlock className="h-5 w-5" />
                  <span className="text-sm font-medium">Download Liberado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded">
                  <Lock className="h-5 w-5" />
                  <span className="text-sm font-medium">Download Bloqueado</span>
                </div>
              )}
              {!appointment.selectionApproved && favoritesCount > 0 && (
                <Button
                  onClick={handleApproveSelection}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aprovar Seleção
                </Button>
              )}
              {appointment.selectionApproved && (
                <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded">
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Seleção Aprovada
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(appointment.selectionApprovedAt!).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="container py-6">
        <Card className="p-6 bg-blue-500/10 border-blue-500/30">
          <p className="text-center">
            <strong>Instruções:</strong> Clique no ícone de coração ❤️ para marcar suas fotos favoritas. 
            Clique na foto para ver em tamanho grande e deixar comentários.
            {!appointment.selectionApproved && " Quando terminar, clique em 'Aprovar Seleção' no topo."}
          </p>
        </Card>
      </div>

      {/* Gallery Grid */}
      <div className="container pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const photoCommentsCount = photoComments.filter(c => c.photoId === photo.id).length;
            
            return (
              <div
                key={photo.id}
                className="relative group aspect-square overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                {downloadPermission?.allowed ? (
                  <img
                    src={photo.thumbnailUrl || photo.originalUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <ProtectedImage
                    src={photo.thumbnailUrl || photo.originalUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(photo.id, !!photo.isFavorite);
                  }}
                  className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                    photo.isFavorite
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${photo.isFavorite ? "fill-current" : ""}`}
                  />
                </button>

                {/* Comments Badge */}
                {photoCommentsCount > 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {photoCommentsCount}
                  </div>
                )}

                {/* Favorite Badge */}
                {photo.isFavorite && (
                  <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Favorita
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              Nenhuma foto disponível ainda
            </p>
          </div>
        )}
      </div>

      {/* Lightbox with Comments */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
            <div className="grid md:grid-cols-[1fr,400px] gap-0 max-h-[95vh]">
              {/* Image */}
              <div className="relative bg-black flex items-center justify-center">
                {downloadPermission?.allowed ? (
                  <img
                    src={selectedPhoto.originalUrl}
                    alt={selectedPhoto.title}
                    className="w-full h-auto max-h-[95vh] object-contain"
                  />
                ) : (
                  <ProtectedImage
                    src={selectedPhoto.originalUrl}
                    alt={selectedPhoto.title}
                    className="w-full h-auto max-h-[95vh]"
                  />
                )}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleToggleFavorite(selectedPhoto.id, selectedPhoto.isFavorite)}
                  className={`absolute top-4 left-4 p-3 rounded-full transition-all ${
                    selectedPhoto.isFavorite
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${selectedPhoto.isFavorite ? "fill-current" : ""}`}
                  />
                </button>
              </div>

              {/* Comments Panel */}
              <div className="bg-background p-6 flex flex-col max-h-[95vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comentários
                  </DialogTitle>
                </DialogHeader>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto my-4 space-y-3">
                  {photoComments
                    .filter(c => c.photoId === selectedPhoto.id)
                    .map((c) => (
                      <Card key={c.id} className="p-3">
                        <p className="text-sm">{c.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(c.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </Card>
                    ))}
                  {photoComments.filter(c => c.photoId === selectedPhoto.id).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum comentário ainda
                    </p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="space-y-2">
                  <Label>Deixe um comentário</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ex: Quero essa foto mais clara, adorei essa pose..."
                    rows={3}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || addCommentMutation.isPending}
                    className="w-full"
                  >
                    Adicionar Comentário
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
