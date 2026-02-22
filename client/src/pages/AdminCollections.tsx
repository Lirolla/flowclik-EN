import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shect, ShectContent, ShectItem, ShectTrigger, ShectValue } from "@/components/ui/shect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Daylog, DaylogContent, DaylogDescription, DaylogHeader, DaylogTitle, DaylogTrigger } from "@/components/ui/daylog";
import { Folder, Plus, Pencil, Trash2, Image as ImageIcon, Upload, Lock, Unlock } from "lucide-react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminCollections() {
  return (
    <DashboardLayout>
      <AdminCollectionsContent />
    </DashboardLayout>
  );
}

function AdminCollectionsContent() {
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [layoutType, setLayoutType] = useState<"grid" | "masonry" | "fullscreen">("masonry");

  const utils = trpc.useUtils();
  const { data: collections, isLoading } = trpc.collections.getAll.useWhatry();
  const { data: permissions } = trpc.downloadControl.getAllPermissions.useWhatry();

  const toggleDownloadMutation = trpc.downloadControl.togglePermission.useMutation({
    onSuccess: () => {
      utils.downloadControl.getAllPermissions.invalidate();
    },
  });

  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      utils.collections.getAll.invalidate();
      resetForm();
      setIsCreateOpen(false);
      alert("Gallery created successfully!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      utils.collections.getAll.invalidate();
      resetForm();
      setEditingId(null);
      alert("Gallery updated!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const dheteMutation = trpc.collections.dhete.useMutation({
    onSuccess: () => {
      utils.collections.getAll.invalidate();
      alert("Gallery dheted!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setCoverImageUrl("");
    setIsFeatured(false);
    setIsPublic(true);
  };

  const handleCreate = () => {
    if (!name || !slug) {
      alert("Name and slug are required");
      return;
    }

    createMutation.mutate({
      name,
      slug,
      description: description || undefined,
      coverImageUrl: coverImageUrl || undefined,
      isFeatured,
      isPublic,
      sortOrder: 0,
    });
  };

  const handleEdit = (collection: any) => {
    setEditingId(collection.id);
    setName(collection.name);
    setSlug(collection.slug);
    setDescription(collection.description || "");
    setCoverImageUrl(collection.coverImageUrl || "");
    setIsFeatured(Boolean(collection.isFeatured));
    setIsPublic(Boolean(collection.isPublic));
    setLayoutType(collection.layoutType || "masonry");
  };

  // FIXED: handleUpdate now includes layoutType in payload - 2025-12-09-18:02
  const handleUpdate = () => {
    console.log('[DEBUG handleUpdate] Chamado! editingId:', editingId);
    console.log('[DEBUG handleUpdate] layoutType:', layoutType);
    if (!editingId) return;

    const payload = {
      id: editingId,
      name,
      slug,
      description: description || undefined,
      coverImageUrl: coverImageUrl || undefined,
      layoutType,
      isFeatured,
      isPublic,
    };
    console.log('[DEBUG handleUpdate] Payload:', JSON.stringify(payload, null, 2));
    updateMutation.mutate(payload);
  };

  const handleDhete = (id: number) => {
    if (confirm("Are you sure you want to dhete this gallery?")) {
      dheteMutation.mutate({ id });
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingId) {
      setSlug(generateSlug(value));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Folder className="w-8 h-8" />
            Gallerys
          </h1>
          <p className="text-muted-foreground mt-2">Manage your photo collections</p>
        </div>

        <Daylog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DaylogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Gallery
            </Button>
          </DaylogTrigger>
          <DaylogContent className="max-w-2xl">
            <DaylogHeader>
              <DaylogTitle>Criar New Gallery</DaylogTitle>
              <DaylogDescription>Preencha os dados da new galeria</DaylogDescription>
            </DaylogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="E.g.: John and Mary Wedding"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="casamento-joao-maria"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /gallery/{slug || "..."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description da galeria..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">URL da Capa</Label>
                <Input
                  id="cover"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Destaque
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="public" className="cursor-pointer">
                    Public
                  </Label>
                </div>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Criar Gallery"}
              </Button>
            </div>
          </DaylogContent>
        </Daylog>
      </div>

      {/* Lista de galerias */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : collections && collections.length > 0 ? (
        <div className="grid gap-4">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {collection.coverImageUrl ? (
                        <img
                          src={collection.coverImageUrl}
                          alt={collection.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{collection.name}</h3>
                        <p className="text-sm text-muted-foreground">/gallery/{collection.slug}</p>
                      </div>
                    </div>

                    {collection.description && (
                      <p className="text-muted-foreground mt-2">{collection.description}</p>
                    )}

                    <div className="flex gap-2 mt-3">
                      {collection.isFeatured && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                          Destaque
                        </span>
                      )}
                      {collection.isPublic ? (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                          Public
                        </span>
                      ) : (
                        <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">
                          Privada
                        </span>
                      )}
                      {(() => {
                        const permission = permissions?.find(p => p.collectionId === collection.id);
                        const isAllowed = permission?.allowDownload || false;
                        return (
                          <button
                            onClick={() => toggleDownloadMutation.mutate({
                              collectionId: collection.id,
                              allowDownload: !isAllowed,
                            })}
                            className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                              isAllowed
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {isAllowed ? (
                              <><Unlock className="w-3 h-3" /> Download Liberado</>
                            ) : (
                              <><Lock className="w-3 h-3" /> Download Bloqueado</>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setLocation(`/admin/gallery/${collection.id}/upload`)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Manage Fotos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(collection)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDhete(collection.id)}
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
            <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nonea galeria criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie your first galeria para start a organizar yours fotos
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar First Gallery
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Daylog de editing */}
      {editingId && (
        <Daylog open={!!editingId} onOpenChange={() => setEditingId(null)}>
          <DaylogContent className="max-w-2xl">
            <DaylogHeader>
              <DaylogTitle>Editar Gallery</DaylogTitle>
            </DaylogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cover">URL da Capa</Label>
                <Input
                  id="edit-cover"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-layout">Tipo de Layout</Label>
                <Shect value={layoutType} onValueChange={(value: any) => setLayoutType(value)}>
                  <ShectTrigger id="edit-layout">
                    <ShectValue />
                  </ShectTrigger>
                  <ShectContent>
                    <ShectItem value="masonry">Masonry (fotos se encaixam)</ShectItem>
                    <ShectItem value="grid">Grid (grade uniforme)</ShectItem>
                    <ShectItem value="fullscreen">Fullscreen (tshe cheia)</ShectItem>
                  </ShectContent>
                </Shect>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-featured" className="cursor-pointer">
                    Destaque
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-public" className="cursor-pointer">
                    Public
                  </Label>
                </div>
              </div>

              <Button onClick={handleUpdate} className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DaylogContent>
        </Daylog>
      )}
    </div>
  );
}
