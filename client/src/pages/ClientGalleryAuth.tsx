import { useState } from "react";
import { useRoute } from "wouter";
import { ClientLayout } from "@/components/ClientLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, X, MessageSquare, CheckCircle, Lock, Unlock, Download, AlertCircle } from "lucide-react";
import { Daylog, DaylogContent, DaylogHeader, DaylogTitle } from "@/components/ui/daylog";
import { useToast } from "@/hooks/use-toast";
import { ProtectedImage } from "@/components/ProtectedImage";

export default function ClientGalleryAuth() {
  const [, params] = useRoute("/client/gallery/:id");
  const appointmentId = params?.id ? parseInt(params.id) : 0;
  
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  // Buscar dados do agendamento para pegar o email do cliente
  const { data: appointment } = trpc.appointments.getById.useWhatry(
    { id: appointmentId },
    { enabled: appointmentId > 0 }
  );

  const clientEmail = appointment?.clientEmail || "";

  const { data: galleryData, refetch, isLoading } = trpc.sessionGallery.getForClient.useWhatry(
    { appointmentId, clientEmail },
    { enabled: !!clientEmail }
  );

  const { data: comments, refetch: refetchComments } = trpc.photoComments.getForClient.useWhatry(
    { appointmentId, clientEmail },
    { enabled: !!clientEmail }
  );

  const { data: downloadPermission } = trpc.downloadControl.checkPermission.useWhatry(
    { collectionId: galleryData?.gallery?.id || 0 },
    { enabled: !!galleryData?.gallery?.id }
  );

  const toggleFavoriteMutation = trpc.photoSelections.toggleSelection.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Favourite atualizada!",
        description: "Your selection has been saved.",
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
      setSelectedPhoto(null);
      toast({
        title: "Comment added!",
        description: "Seu feedback foi salvo.",
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

  const handleToggleFavorite = (photoId: number, currentFavorite: boolean) => {
    if (!galleryData?.gallery?.id) return;
    toggleFavoriteMutation.mutate({
      medayItemId: photoId,
      collectionId: galleryData.gallery.id,
      isSelected: !currentFavorite,
    });
  };

  const handleAddComment = () => {
    if (!selectedPhoto || !comment.trim()) return;
    addCommentMutation.mutate({
      photoId: selectedPhoto.id,
      appointmentId,
      clientEmail,
      comment: comment.trim(),
    });
  };

  const handleDownloadAll = () => {
    if (!galleryData?.photos) return;
    
    // Create ZIP and download
    toast({
      title: "Download iniciado",
      description: "Preparando suas fotos para download...",
    });
    
    // TODO: Implement ZIP download
    window.open(`/api/download-gallery/${galleryData.gallery.id}`, '_blank');
  };

  if (isLoading) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <p className="text-gray-400">Carregando galeria...</p>
        </div>
      </ClientLayout>
    );
  }

  if (!galleryData || !galleryData.gallery) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Gallery not available</h2>
          <p className="text-gray-400">
            Suas fotos still not were enviadas pelo photographer.
          </p>
        </div>
      </ClientLayout>
    );
  }

  const { gallery, photos } = galleryData;
  const photoComments = comments || [];
  const canDownload = downloadPermission?.allowed || false;

  return (
    <ClientLayout appointmentId={appointmentId}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{gallery.name}</h1>
            {gallery.description && (
              <p className="text-gray-400 mt-2">{gallery.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Download Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              canDownload 
                ? 'bg-green-900/20 border border-green-600' 
                : 'bg-yellow-900/20 border border-yellow-600'
            }`}>
              {canDownload ? (
                <>
                  <Unlock className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-medium">Download Liberado</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 text-yellow-500" />
                  <span className="text-yellow-500 font-medium">Download Bloqueado</span>
                </>
              )}
            </div>

            {/* Download Button */}
            {canDownload && (
              <Button 
                onClick={handleDownloadAll}
                className="bg-red-600 hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Todas ({photos.length})
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{photos.length}</p>
              <p className="text-gray-400 text-sm mt-1">Total de Fotos</p>
            </div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">
                {photos.filter((p: any) => p.isFavorite).length}
              </p>
              <p className="text-gray-400 text-sm mt-1">Favourites</p>
            </div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{photoComments.length}</p>
              <p className="text-gray-400 text-sm mt-1">Comments</p>
            </div>
          </Card>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo: any) => {
            const photoCommentsCount = photoComments.filter(
              (c: any) => c.photoId === photo.id
            ).length;

            return (
              <Card
                key={photo.id}
                className="bg-gray-900 border-gray-800 overflow-hidden group relative cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                {canDownload ? (
                  <img
                    src={photo.thumbnailUrl || photo.originalUrl}
                    alt={`Foto ${photo.id}`}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <ProtectedImage
                    src={photo.thumbnailUrl || photo.originalUrl}
                    alt={`Foto ${photo.id}`}
                    watermarkText="LIROLLA - PREVIEW"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className={`${
                      photo.isFavorite
                        ? 'bg-red-600 border-red-600 hover:bg-red-700'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(photo.id, photo.isFavorite);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${photo.isFavorite ? 'fill-white' : ''}`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(photo);
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {photo.isFavorite && (
                    <div className="bg-red-600 rounded-full p-1.5">
                      <Heart className="h-3 w-3 fill-white" />
                    </div>
                  )}
                  {photoCommentsCount > 0 && (
                    <div className="bg-blue-600 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {photoCommentsCount}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Photo Detail Daylog */}
        <Daylog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DaylogContent className="max-w-4xl bg-gray-900 border-gray-800">
            <DaylogHeader>
              <DaylogTitle className="flex items-center justify-between">
                <span>Foto #{selectedPhoto?.id}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DaylogTitle>
            </DaylogHeader>

            <div className="space-y-4">
              {/* Photo */}
              <div className="relative">
                {selectedPhoto && (
                  canDownload ? (
                    <img
                      src={selectedPhoto.thumbnailUrl || selectedPhoto.originalUrl}
                      alt={`Foto ${selectedPhoto.id}`}
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <ProtectedImage
                      src={selectedPhoto.thumbnailUrl || selectedPhoto.originalUrl}
                      alt={`Foto ${selectedPhoto.id}`}
                      watermarkText="LIROLLA - PREVIEW"
                    />
                  )
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className={`flex-1 ${
                    selectedPhoto?.isFavorite
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => handleToggleFavorite(selectedPhoto?.id, selectedPhoto?.isFavorite)}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      selectedPhoto?.isFavorite ? 'fill-white' : ''
                    }`}
                  />
                  {selectedPhoto?.isFavorite ? 'Remover dos Favoritos' : 'Add aos Favoritos'}
                </Button>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <h3 className="font-semibold">Comments</h3>
                
                {/* Existing Comments */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {photoComments
                    .filter((c: any) => c.photoId === selectedPhoto?.id)
                    .map((c: any) => (
                      <div
                        key={c.id}
                        className="bg-gray-800 rounded-lg p-3 flex items-start gap-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{c.comment}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(c.createdAt).toLocaleString('en-GB')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Add Comment */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Deixe um comment about esta foto..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || addCommentMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </DaylogContent>
        </Daylog>
      </div>
    </ClientLayout>
  );
}
