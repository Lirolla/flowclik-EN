import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminFinalAlbum() {
  const [, params] = useRoute("/admin/galleries/:id/final-album");
  const collectionId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: collection } = trpc.collections.getById.useQuery(
    { id: collectionId },
    { enabled: collectionId > 0 }
  );

  const { data: finalPhotos, refetch } = trpc.finalAlbums.getByAppointment.useQuery(
    { appointmentId: collection?.appointmentId || 0 },
    { enabled: !!collection?.appointmentId }
  );

  const uploadMutation = trpc.finalAlbums.uploadPhotos.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Fotos do álbum final enviadas com sucesso.",
      });
      refetch();
      setUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const deleteMutation = trpc.finalAlbums.deletePhoto.useMutation({
    onSuccess: () => {
      toast({
        title: "Foto removida",
        description: "Foto do álbum final removida com sucesso.",
      });
      refetch();
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !collection) return;

    setUploading(true);
    toast({
      title: "Enviando...",
      description: `Fazendo upload de ${files.length} foto(s)...`,
    });

    try {
      const uploadedPhotos = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        // Upload to S3 via API
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Falha no upload");

        const { url } = await response.json();
        
        uploadedPhotos.push({
          photoUrl: url,
          thumbnailUrl: url,
          fileName: file.name,
          fileSize: file.size,
        });
      }

      // Save to database
      await uploadMutation.mutateAsync({
        appointmentId: collection.appointmentId!,
        photos: uploadedPhotos,
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro",
        description: "Falha ao fazer upload das fotos.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!confirm("Tem certeza que deseja remover esta foto?")) return;
    await deleteMutation.mutateAsync({ photoId });
  };

  return (
    <div className="p-8">
      <Link href="/admin/appointments">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Agendamentos
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Álbum Final</h1>
        <p className="text-muted-foreground">
          {collection?.name} - Fotos editadas finais do projeto
        </p>
      </div>

      {/* Upload Area */}
      <div className="mb-8 p-8 border-2 border-dashed rounded-lg bg-card">
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Enviar Fotos Finais Editadas
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Arraste fotos aqui ou clique para selecionar
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={uploading}>
              <span>
                {uploading ? "Enviando..." : "Selecionar Arquivos"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Fotos no Álbum ({finalPhotos?.length || 0})
        </h2>
      </div>

      {finalPhotos && finalPhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {finalPhotos.map((photo: any) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-lg group bg-muted"
            >
              <img
                src={photo.photoUrl}
                alt={photo.fileName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(photo.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded">
                {photo.fileName}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground">
            Nenhuma foto no álbum final ainda. Faça upload das fotos editadas acima.
          </p>
        </div>
      )}
    </div>
  );
}
