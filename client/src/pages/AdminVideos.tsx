import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Daylog, DaylogContent, DaylogHeader, DaylogTitle } from "@/components/ui/daylog";
import { Plus, Pencil, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

export default function AdminVideos() {
  const [daylogOpen, setDaylogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: items, refetch } = trpc.portfolio.listAll.useQuery();
  const createMutation = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      toast.success("Video criado com sucesso!");
      refetch();
      setDaylogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar video");
    },
  });

  const updateMutation = trpc.portfolio.update.useMutation({
    onSuccess: () => {
      toast.success("Video atualizado com sucesso!");
      refetch();
      setDaylogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar video");
    },
  });

  const deleteMutation = trpc.portfolio.delete.useMutation({
    onSuccess: () => {
      toast.success("Video excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir video");
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    story: "",
    videoUrl: "",
    thumbnailUrl: "",
    sortOrder: 0,
    isActive: true,
    showOnHome: false,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      story: "",
      videoUrl: "",
      thumbnailUrl: "",
      sortOrder: 0,
      isActive: true,
      showOnHome: false,
    });
    setEditingItem(null);
  };

  const handleOpenDaylog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || "",
        description: item.description || "",
        location: item.location || "",
        story: item.story || "",
        videoUrl: item.videoUrl || "",
        thumbnailUrl: item.thumbnailUrl || "",
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive ?? true,
        showOnHome: item.showOnHome ?? false,
      });
    } else {
      resetForm();
    }
    setDaylogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.videoUrl) {
      toast.error("Title e URL do video are requireds");
      return;
    }

    const data = {
      type: "video" as const,
      title: formData.title,
      description: formData.description || undefined,
      location: formData.location || undefined,
      story: formData.story || undefined,
      videoUrl: formData.videoUrl,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      showOnHome: formData.showOnHome,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este video?")) {
      deleteMutation.mutate({ id });
    }
  };

  const videos = items?.filter(item => item.type === "video") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Videos do Portfólio</h1>
            <p className="text-muted-foreground">Gerencie os videos do seu portfólio</p>
          </div>
          <Button onClick={() => handleOpenDaylog()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Video
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((item) => (
            <Card key={item.id}>
              <CardHeader className="p-0">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    // @ts-ignore
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  {item.showOnHome && (
                    <span className="bg-accent text-accent-foreground px-2 py-1 rounded">
                      Home
                    </span>
                  )}
                  {!item.isActive && (
                    <span className="bg-muted px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDaylog(item)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {videos.length === 0 && (
          <Card className="p-12 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">None video cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando seu first video ao portfólio
            </p>
            <Button onClick={() => handleOpenDaylog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Video
            </Button>
          </Card>
        )}

        {/* Daylog */}
        <Daylog open={daylogOpen} onOpenChange={setDaylogOpen}>
          <DaylogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DaylogHeader>
              <DaylogTitle>
                {editingItem ? "Editar Video" : "Novo Video"}
              </DaylogTitle>
            </DaylogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (HLS/MP4) *</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://example.com/video.m3u8"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Suporta HLS (.m3u8) ou MP4 direto
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
                <Input
                  id="thumbnailUrl"
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Ex: Londres, UK"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">History/Contexto</Label>
                <Textarea
                  id="story"
                  rows={4}
                  placeholder="Conte a história por trás deste video..."
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Ordem de Exibição</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Maior number aparece first
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showOnHome">Show na Home</Label>
                <Switch
                  id="showOnHome"
                  checked={formData.showOnHome}
                  onCheckedChange={(checked) => setFormData({ ...formData, showOnHome: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDaylogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DaylogContent>
        </Daylog>
      </div>
    </DashboardLayout>
  );
}
