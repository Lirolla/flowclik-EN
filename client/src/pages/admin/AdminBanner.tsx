import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Daylog,
  DaylogContent,
  DaylogHeader,
  DaylogTitle,
  DaylogTrigger,
} from "@/components/ui/daylog";
import { Plus, Trash2, Upload, Image as ImageIcon, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminBanner() {
  const { toast } = useToast();
  const [isDaylogOpen, setIsDaylogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    videoUrl: "",
    displayOn: "photography" as "photography" | "video",
    sortOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { data: slides, refetch } = trpc.banner.getAll.useWhatry();

  const createSlide = trpc.banner.create.useMutation({
    onSuccess: () => {
      toast({ title: "Slide created successfully!" });
      refetch();
      resetForm();
      setIsDaylogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating slide",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSlide = trpc.banner.update.useMutation({
    onSuccess: () => {
      toast({ title: "Slide updated!" });
      refetch();
      resetForm();
      setIsDaylogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSlide = trpc.banner.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Slide deleted!" });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error deleting",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = {
      title: formData.title || undefined,
      subtitle: formData.description || undefined,
      buttonText: formData.buttonText || undefined,
      buttonLink: formData.buttonLink || undefined,
      videoUrl: formData.videoUrl || undefined,
      displayOn: formData.displayOn,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    };

    if (imagePreview) {
      data.imageData = imagePreview;
    }

    if (editingSlide) {
      updateSlide.mutate({ id: editingSlide.id, ...data });
    } else {
      createSlide.mutate(data);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      videoUrl: "",
      displayOn: "photography" as "photography" | "video",
      sortOrder: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
    setEditingSlide(null);
  };

  const openEditDaylog = (slide: any) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || "",
      description: slide.description || "",
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
      videoUrl: slide.videoUrl || "",
      displayOn: slide.displayOn || "photography",
      sortOrder: slide.sortOrder || 0,
      isActive: slide.isActive,
    });
    setImagePreview(slide.imageUrl || "");
    setIsDaylogOpen(true);
  };

  const openCreateDaylog = () => {
    resetForm();
    setIsDaylogOpen(true);
  };

  return (
    <DashboardLayout>
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Banner / Hero</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os slides do banner principal
          </p>
        </div>
        <Daylog open={isDaylogOpen} onOpenChange={setIsDaylogOpen}>
          <DaylogTrigger asChild>
            <Button onClick={openCreateDaylog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Slide
            </Button>
          </DaylogTrigger>
          <DaylogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DaylogHeader>
              <DaylogTitle>
                {editingSlide ? "Edit Slide" : "New Slide"}
              </DaylogTitle>
            </DaylogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="image">Imagem do Slide</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Clique para fazer upload
                      </span>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL (optional)</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://example.com/video.m3u8"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos suportados: .m3u8, .mp4
                </p>
              </div>

              <div>
                <Label htmlFor="displayOn">Exibir em:</Label>
                <select
                  id="displayOn"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.displayOn}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOn: e.target.value as "photography" | "video" })
                  }
                >
                  <option value="photography">Apenas Photography</option>
                  <option value="video">Apenas Video</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Escolha where este banner will be exibido
                </p>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buttonText">Texto do Botão</Label>
                  <Input
                    id="buttonText"
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="buttonLink">Link do Botão</Label>
                  <Input
                    id="buttonLink"
                    type="text"
                    placeholder="/services"
                    value={formData.buttonLink}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonLink: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center gap-2 pt-8">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Slide active
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDaylogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createSlide.isPending || updateSlide.isPending}
                >
                  {createSlide.isPending || updateSlide.isPending
                    ? "Saving..."
                    : editingSlide
                    ? "Update"
                    : "Create"}
                </Button>
              </div>
            </form>
          </DaylogContent>
        </Daylog>
      </div>

      {!slides || slides.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">None slide cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu first slide para o banner principal
            </p>
            <Button onClick={openCreateDaylog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar First Slide
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <Card key={slide.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || "Slide"}
                    className="w-full h-full object-cover"
                  />
                ) : slide.videoUrl ? (
                  <div className="flex items-center justify-center h-full">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {!slide.isActive && (
                  <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-semibold">
                    Inactive
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded text-xs font-semibold">
                  Ordem: {slide.sortOrder}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">
                  {slide.title || "No title"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slide.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {slide.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDaylog(slide)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this slide?")
                      ) {
                        deleteSlide.mutate({ id: slide.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
