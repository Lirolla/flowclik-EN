import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Heart, Upload, Check, MessageSquare, ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPhotoSelections() {
  const { toast } = useToast();
  const { data: collections, isLoading } = trpc.collections.getWithSelectionsCount.useQuery();
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  
  const { data: selections, refetch } = trpc.photoSelections.getSelectedPhotos.useQuery(
    { collectionId: selectedCollectionId || 0 },
    { enabled: !!selectedCollectionId }
  );

  const uploadImageMutation = trpc.meday.uploadImage.useMutation();
  const uploadEditedPhotoMutation = trpc.photoSelections.uploadEditedPhoto.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Foto editada enviada com sucesso!",
      });
      refetch();
    },
  });

  const handleUploadEdited = async (selectionId: number, file: File) => {
    try {
      toast({
        title: "Fazendo upload...",
        description: "Aguarde enquanto a foto é enviada",
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
          selectionId,
          editedPhotoUrl: url,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Erro ao fazer upload da foto editada",
        variant: "destructive",
      });
    }
  };

  // Collections already filtered by backend (only those with selections)
  const collectionsWithSelections = collections || [];

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
          <h1 className="text-3xl font-bold">Seleções de Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Veja as fotos favoritas marcadas pelos clientes e envie as versões editadas
          </p>
        </div>

        {/* Collections List */}
        {!selectedCollectionId ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collectionsWithSelections?.map((collection: any) => (
              <div
                key={collection.id}
                className="p-6 bg-card rounded-lg border hover:border-primary cursor-pointer transition-colors"
                onClick={() => setSelectedCollectionId(collection.id)}
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
                    <span>Ver seleções do cliente</span>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {collection.selectionsCount} {collection.selectionsCount === 1 ? 'foto' : 'fotos'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Back Button and Actions */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setSelectedCollectionId(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para galerias
              </Button>
              
              {selections && selections.length > 0 && selections.every((s: any) => s.editedPhotoUrl) && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Todas as fotos editadas!</span>
                  </div>
                  <Button
                    onClick={() => {
                      const collection = collections?.find((c: any) => c.id === selectedCollectionId);
                      if (collection?.slug) {
                        const link = `${window.location.origin}/final-album/${collection.slug}`;
                        navigator.clipboard.writeText(link);
                        toast({
                          title: "Link copied!",
                          description: "Envie este link para o cliente visualizar o álbum final.",
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
                      const collection = collections?.find((c: any) => c.id === selectedCollectionId);
                      if (collection?.slug) {
                        window.open(`/final-album/${collection.slug}`, '_blank');
                      }
                    }}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visualizar Album
                  </Button>
                </div>
              )}
            </div>

            {/* Selected Photos Grid */}
            {selections && selections.length === 0 && (
              <div className="text-center py-12 bg-card rounded-lg border">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nonea foto selecionada still</p>
                <p className="text-sm text-muted-foreground">
                  O cliente still not marcou nonea foto favorita nesta galeria
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {selections?.map((selection: any) => (
                <div key={selection.id} className="bg-card rounded-lg border overflow-hidden hover:border-primary transition-colors">
                  {/* Photo */}
                  <div className="relative aspect-square">
                    <img
                      src={selection.medayUrl}
                      alt={selection.medayTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500 drop-shadow-lg" />
                    </div>
                    {selection.editedPhotoUrl && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Editada
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="font-medium text-sm truncate">{selection.medayTitle}</p>
                    
                    {/* Client Feedback */}
                    {selection.clientFeedback && (
                      <div className="bg-muted/50 rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3 h-3 text-primary" />
                          <span className="text-xs font-semibold text-primary">Feedback:</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{selection.clientFeedback}</p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant={selection.editedPhotoUrl ? "outline" : "default"}
                      className="w-full"
                      onClick={() => {
                        const input = document.getElementById(`upload-${selection.id}`) as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {selection.editedPhotoUrl ? 'Substituir' : 'Upload'}
                    </Button>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadEdited(selection.id, file);
                        }
                      }}
                      className="hidden"
                      id={`upload-${selection.id}`}
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
