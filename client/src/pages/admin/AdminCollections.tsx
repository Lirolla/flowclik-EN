import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Daylog, DaylogContent, DaylogDescription, DaylogHeader, DaylogTitle, DaylogTrigger } from "@/components/ui/daylog";
import { FolderOpen, Plus, Pencil, Trash2, Eye, EyeOff, Upload as UploadIcon, Calendar, Image as ImageIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function AdminCollections() {
  return (
    <DashboardLayout>
      <AdminCollectionsContent />
    </DashboardLayout>
  );
}

function AdminCollectionsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [clientName, setClientName] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    coverImageUrl: "",
    password: "",
    eventDate: "",
    layoutType: "masonry" as "grid" | "masonry" | "fullscreen",
    isPublic: false,
    isFeatured: false,
  });

  const utils = trpc.useUtils();
  const { data: collections, isLoading } = trpc.collections.getAll.useQuery();

  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      utils.collections.getAll.invalidate();
      resetForm();
      setIsCreateOpen(false);
      toast.success("Gallery created successfully!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      utils.collections.getAll.invalidate();
      utils.collections.getBySlug.invalidate();
      utils.collections.getById.invalidate();
      resetForm();
      setEditingId(null);
      setIsCreateOpen(false);
      toast.success("Gallery updated!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.collections.delete.useMutation({
    onSuccess: () => {
      utils.collections.getAll.invalidate();
      toast.success("Gallery deleted!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const togglePublicMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      utils.collections.getAll.invalidate();
      toast.success("Visibility updated!");
    },
  });

  const uploadImageMutation = trpc.meday.uploadImage.useMutation();

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      coverImageUrl: "",
      password: "",
      eventDate: "",
      layoutType: "masonry" as "grid" | "masonry" | "fullscreen",
      isPublic: false,
      isFeatured: false,
    });
    setClientName("");
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value });
    if (!editingId) {
      setFormData({ ...formData, title: value, slug: generateSlug(value) });
    }
  };

  const handleEdit = async (collection: any) => {
    setEditingId(collection.id);
    setFormData({
      title: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      coverImageUrl: collection.coverImageUrl || "",
      password: collection.password || "",
      eventDate: collection.eventDate ? new Date(collection.eventDate).toISOString().split('T')[0] : "",
      layoutType: collection.layoutType || "masonry",
      isPublic: collection.isPublic || false,
      isFeatured: collection.isFeatured || false,
    });
    
    // Marcar se tem cliente vinculado
    if (collection.appointmentId) {
      setClientName("Client linked to appointment #" + collection.appointmentId);
    } else {
      setClientName("");
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    const data = {
      name: formData.title,
      slug: formData.slug,
      description: formData.description || undefined,
      coverImageUrl: formData.coverImageUrl || undefined,
      password: formData.password || undefined,
      eventDate: formData.eventDate || undefined,
      layoutType: formData.layoutType,
      isPublic: formData.isPublic,
      isFeatured: formData.isFeatured,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this gallery?")) {
      deleteMutation.mutate({ id });
    }
  };

  const togglePublic = (collection: any) => {
    togglePublicMutation.mutate({
      id: collection.id,
      isPublic: !collection.isPublic,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="w-8 h-8" />
            Gallerys
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie as galerias de fotos e videos</p>
        </div>

        <Daylog open={isCreateOpen || editingId !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingId(null);
            resetForm();
          }
        }}>
          <DaylogTrigger asChild>
            <Button size="lg" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Gallery
            </Button>
          </DaylogTrigger>
          <DaylogContent className="max-w-2xl">
          <DaylogHeader>
            <DaylogTitle>{editingId ? "Edit Gallery" : "New Gallery"}</DaylogTitle>
            <DaylogDescription>
              {editingId ? "Update gallery details" : "Create a new gallery to organise your photos"}
            </DaylogDescription>
            {editingId && clientName && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="text-sm font-medium text-muted-foreground">
                  📋 {clientName}
                </p>
              </div>
            )}
          </DaylogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title da Gallery *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Casamento João e Maria"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="casamento-joao-maria"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /gallery/{formData.slug || "slug-da-galeria"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the gallery..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Foto de Capa</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = reader.result as string;
                        try {
                          const result = await uploadImageMutation.mutateAsync({
                            filename: file.name,
                            contentType: file.type,
                            data: base64.split(',')[1],
                          });
                          setFormData({ ...formData, coverImageUrl: result.url });
                          toast.success("Image uploaded!");
                        } catch (error: any) {
                          toast.error(error.message || "Error uploading image");
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="flex-1"
                  />
                  {formData.coverImageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, coverImageUrl: "" })}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                {formData.coverImageUrl && (
                  <div className="relative w-full aspect-video rounded overflow-hidden bg-muted">
                    <img
                      src={formData.coverImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha (para compartilhamento)</Label>
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password for client to access gallery"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: senha que será enviada ao cliente junto com o link
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate">Data do Evento</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="layoutType">Tipo de Layout</Label>
                <select
                  id="layoutType"
                  value={formData.layoutType}
                  onChange={(e) => setFormData({ ...formData, layoutType: e.target.value as any })}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="masonry">Masonry (fotos se encaixam)</option>
                  <option value="grid">Grid (grade uniforme)</option>
                  <option value="fullscreen">Fullscreen (tela cheia)</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer">
                    Gallery pública (visible on site)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Destaque
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsCreateOpen(false);
                    setEditingId(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DaylogContent>
        </Daylog>
      </div>

      {/* Collections List */}
      {collections && collections.length > 0 ? (
        <div className="space-y-4">
          {collections.map((collection: any) => (
            <Card key={collection.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 flex items-start gap-4">
                    <FolderOpen className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold">{collection.name}</h3>
                      <p className="text-sm text-muted-foreground">/gallery/{collection.slug}</p>

                      {collection.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2">
                          {collection.description}
                        </p>
                      )}

                      <div className="flex gap-4 mt-3 flex-wrap">
                        {collection.eventDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(collection.eventDate).toLocaleDateString('en-GB')}</span>
                          </div>
                        )}
                        
                        {collection.isPublic ? (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Público
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-500/20 text-gray-500 px-2 py-1 rounded flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Privado
                          </span>
                        )}

                        {collection.isFeatured && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">
                            ⭐ Destaque
                          </span>
                        )}

                        <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded">
                          {collection.layoutType === "masonry" ? "📐 Masonry" : 
                           collection.layoutType === "grid" ? "🔲 Grid" : 
                           "🖼️ Fullscreen"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Foto de Capa */}
                  {collection.coverImageUrl && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={collection.coverImageUrl}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!collection.coverImageUrl && (
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/admin/galleries/${collection.id}/upload`}
                      title="Photo upload"
                    >
                      <UploadIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleEdit(collection);
                        setIsCreateOpen(true);
                      }}
                      title="Edit gallery"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(collection.id)}
                      title="Delete gallery"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nonea galeria criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira galeria para organizar fotos e videos
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar First Gallery
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
