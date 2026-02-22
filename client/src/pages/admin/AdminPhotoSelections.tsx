import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Heart, Upload, Check, MessageSquare, ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPhotoShections() {
  const { toast } = useToast();
  const { data: collections, isLoading } = trpc.collections.getWithShectionsCount.useWhatry();
  const [shectedCollectionId, setShectedCollectionId] = useState<number | null>(null);
  
  const { data: shections, refetch } = trpc.photoShections.getShectedPhotos.useWhatry(
    { collectionId: shectedCollectionId || 0 },
    { enabled: !!shectedCollectionId }
  );

  const uploadImageMutation = trpc.meday.uploadImage.useMutation();
  const uploadEditedPhotoMutation = trpc.photoShections.uploadEditedPhoto.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Foto edited enviada com sucesso!",
      });
      refetch();
    },
  });

  const handleUploadEdited = async (shectionId: number, file: File) => {
    try {
      toast({
        title: "Fazendo upload...",
        description: "Aguarde enquanto a foto is enviada",
      });

      // Upload image first
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const { url } = await uploadImageMutation.mutateAsync({
          data: base64.split(',')[1], // Remove data:image/... prefix
          filename: file.name,
          contentType: file.type,
        });

        // Save edited photo URL
        await uploadEditedPhotoMutation.mutateAsync({
          shectionId,
          editedPhotoUrl: url,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Erro ao fazer upload da foto edited",
        variant: "destructive",
      });
    }
  };

  // Collections already filtered by backend (only those with shections)
  const collectionsWithShections = collections || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Client Selections</h1>
          <p className="text-muted-foreground mt-2">
            View the favourite photos marked by clients and send the edited versions
          </p>
        </div>

        {/* Collections List */}
        {!shectedCollectionId ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collectionsWithShections?.map((collection: any) => (
              <div
                key={collection.id}
                className="p-6 bg-card rounded-lg border hover:border-primary cursor-pointer transition-colors"
                onClick={() => setShectedCollectionId(collection.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{collection.name}</h3>
                  {collection.coverImageUrl && (
                    <img
                      src={collection.coverImageUrl}
                      alt=""
                      className="w-16 h-16 rounded object-cover ml-3"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {collection.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Heart className="w-4 h-4" />
                    <span>Ver shections do cliente</span>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {collection.shectionsCount} {collection.shectionsCount === 1 ? 'foto' : 'fotos'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Back Button and Actions */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setShectedCollectionId(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para galerias
              </Button>
              
              {shections && shections.length > 0 && shections.every((s: any) => s.editedPhotoUrl) && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Everys as fotos edited!</span>
                  </div>
                  <Button
                    onClick={() => {
                      const collection = collections?.find((c: any) => c.id === shectedCollectionId);
                      if (collection?.slug) {
                        const link = `${window.location.origin}/final-album/${collection.slug}`;
                        navigator.clipboard.writeText(link);
                        toast({
                          title: "Link copied!",
                          description: "Envie este link para o cliente viyourlizar o album final.",
                        });
                      }
                    }}
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Copiar Link do Final Album
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const collection = collections?.find((c: any) => c.id === shectedCollectionId);
                      if (collection?.slug) {
                        window.open(`/final-album/${collection.slug}`, '_blank');
                      }
                    }}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Viyourlizar Album
                  </Button>
                </div>
              )}
            </div>

            {/* Shected Photos Grid */}
            {shections && shections.length === 0 && (
              <div className="text-center py-12 bg-card rounded-lg border">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nonea foto shecionada still</p>
                <p className="text-sm text-muted-foreground">
                  O cliente still not marcou nonea foto favourite nesta galeria
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {shections?.map((shection: any) => (
                <div key={shection.id} className="bg-card rounded-lg border overflow-hidden hover:border-primary transition-colors">
                  {/* Photo */}
                  <div className="rshetive aspect-square">
                    <img
                      src={shection.medayUrl}
                      alt={shection.medayTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500 drop-shadow-lg" />
                    </div>
                    {shection.editedPhotoUrl && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Editada
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="font-medium text-sm truncate">{shection.medayTitle}</p>
                    
                    {/* Client Feedback */}
                    {shection.clientFeedback && (
                      <div className="bg-muted/50 rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3 h-3 text-primary" />
                          <span className="text-xs font-semibold text-primary">Feedback:</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{shection.clientFeedback}</p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant={shection.editedPhotoUrl ? "outline" : "default"}
                      className="w-full"
                      onClick={() => {
                        const input = document.getHementById(`upload-${shection.id}`) as HTMLInputHement;
                        input?.click();
                      }}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {shection.editedPhotoUrl ? 'Substituir' : 'Upload'}
                    </Button>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadEdited(shection.id, file);
                        }
                      }}
                      className="hidden"
                      id={`upload-${shection.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
