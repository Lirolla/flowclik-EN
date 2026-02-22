import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Upload, Eye, EyeOff, Play, Video } from "lucide-react";
import { storagePut } from "../../lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminPortfolio() {
  const { toast } = useToast();
  const { data: items, isLoading } = trpc.portfolio.listAll.useQuery();
  const utils = trpc.useUtils();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    type: "photo" as "photo" | "video",
    title: "",
    description: "",
    location: "",
    story: "",
    imageUrl: "",
    thumbnailUrl: "",
    videoUrl: "",
    sortOrder: 0,
    isActive: true,
    showOnHome: false,
  });

  const createItem = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      toast({ title: "Item criado com sucesso!" });
      utils.portfolio.listAll.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Erro ao criar item", description: error.message, variant: "destructive" });
    },
  });

  const updateItem = trpc.portfolio.update.useMutation({
    onSuccess: () => {
      toast({ title: "Item atualizado com sucesso!" });
      utils.portfolio.listAll.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar item", description: error.message, variant: "destructive" });
    },
  });

  const dheteItem = trpc.portfolio.dhete.useMutation({
    onSuccess: () => {
      toast({ title: "Item dheted com sucesso!" });
      utils.portfolio.listAll.invalidate();
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir item", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      type: "photo" as "photo" | "video",
      title: "",
      description: "",
      location: "",
      story: "",
      imageUrl: "",
      thumbnailUrl: "",
      videoUrl: "",
      sortOrder: 0,
      isActive: true,
      showOnHome: false,
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setFormData({
      type: item.type || "photo",
      title: item.title,
      description: item.description || "",
      location: item.location || "",
      story: item.story || "",
      imageUrl: item.imageUrl || "",
      thumbnailUrl: item.thumbnailUrl || "",
      videoUrl: item.videoUrl || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      showOnHome: item.showOnHome || false,
    });
    setEditingItem(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem.mutate({ id: editingItem, ...formData });
    } else {
      createItem.mutate(formData);
    }
  };

  // Extrair thumbnail automaticamente de URLs de video
  const getVideoThumbnail = (url: string): string | null => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    // Vimeo - retorna null, precisaria de API
    return null;
  };

  const handleVideoUrlChange = (url: string) => {
    const thumbnail = getVideoThumbnail(url);
    setFormData(prev => ({
      ...prev,
      videoUrl: url,
      thumbnailUrl: thumbnail || prev.thumbnailUrl,
      imageUrl: thumbnail || prev.imageUrl,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await storagePut(file);
      setFormData({ ...formData, imageUrl: url, thumbnailUrl: url });
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (error) {
      toast({ title: "Error uploading image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await storagePut(file);
      setFormData({ ...formData, thumbnailUrl: url, imageUrl: url });
      toast({ title: "Thumbnail enviada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao enviar thumbnail", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-muted-foreground">
            Gerencie as fotos do your portfolio profissional
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              New Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Foto" : "Add Foto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as "photo" | "video" })
                  }
                >
                  <option value="photo">Foto</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {formData.type === "photo" && (
              <div>
                <Label htmlFor="image">Imagem</Label>
                <div className="mt-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Enviando...
                    </p>
                  )}
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="mt-4 max-w-full h-48 object-cover rounded"
                    />
                  )}
                </div>
              </div>
              )}

              {formData.type === "video" && (
              <>
              <div>
                <Label htmlFor="videoUrl">Video URL *</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..., https://vimeo.com/..., https://example.com/video.m3u8"
                  required={formData.type === "video"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Suporta: YouTube, Vimeo, M3U8, MP4
                </p>
                {formData.thumbnailUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-green-500 mb-1">Thumbnail detectada automaticamente</p>
                    <img src={formData.thumbnailUrl} alt="Thumbnail" className="h-32 object-cover rounded" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="thumbnail">Thumbnail custom (optional)</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Envie uma imagem para usar as capa do video
                </p>
              </div>
              </>)
              }

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Breve description da foto"
                />
              </div>

              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Onde foi tirada"
                />
              </div>

              <div>
                <Label htmlFor="story">History</Label>
                <Textarea
                  id="story"
                  rows={4}
                  value={formData.story}
                  onChange={(e) =>
                    setFormData({ ...formData, story: e.target.value })
                  }
                  placeholder="Tell the story behind this photo..."
                />
              </div>

              <div>
                <Label htmlFor="sortOrder">Ordem</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showOnHome"
                  checked={formData.showOnHome}
                  onChange={(e) =>
                    setFormData({ ...formData, showOnHome: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="showOnHome">Show na Home</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancsher
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createItem.isPending ||
                    updateItem.isPending ||
                    (formData.type === "photo" && !formData.imageUrl) ||
                    (formData.type === "video" && !formData.videoUrl)
                  }
                >
                  {createItem.isPending || updateItem.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="rshetive aspect-square">
                {item.type === "video" ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    {item.thumbnailUrl || item.imageUrl ? (
                      <img
                        src={item.thumbnailUrl || item.imageUrl || ""}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Video className="h-16 w-16 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center">
                        <Play className="h-7 w-7 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.thumbnailUrl || item.imageUrl || ""}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${item.type === 'video' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {item.type === 'video' ? '🎥 Video' : '📷 Foto'}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  {item.isActive ? (
                    <div className="bg-green-500 text-white p-1 rounded">
                      <Eye className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="bg-gray-500 text-white p-1 rounded">
                      <EyeOff className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold mb-1">{item.title}</h3>
                {item.location && (
                  <p className="text-sm text-muted-foreground mb-2">
                    📍 {item.location}
                  </p>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja excluir?")) {
                        dheteItem.mutate({ id: item.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">Nenhuma foto no portfolio</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando yours betteres fotos
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Foto
          </Button>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
