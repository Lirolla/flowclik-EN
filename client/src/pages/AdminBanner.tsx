import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Video } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function AdminBanner() {
  const { user } = useAuth();
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const utils = trpc.useUtils();
  const { data: slides, isLoading } = trpc.banner.getAll.useQuery();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta página
          </p>
          <Button asChild>
            <Link href="/">
              <a>Voltar ao Início</a>
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-serif mb-2">
              Gerenciar Banner
            </h1>
            <p className="text-muted-foreground">
              Configure os slides do banner da página inicial
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Slide
          </Button>
        </div>

        {/* Slide Form */}
        {showForm && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingSlide ? "Editar Slide" : "Novo Slide"}
            </h3>
            <SlideForm
              slide={editingSlide}
              onSave={() => {
                setShowForm(false);
                setEditingSlide(null);
                utils.banner.getAll.invalidate();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingSlide(null);
              }}
            />
          </Card>
        )}

        {/* Slides List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="aspect-video bg-muted rounded mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : slides && slides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slides.map((slide: any) => (
              <Card key={slide.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {slide.slideType === "image" && slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || "Slide"}
                      className="w-full h-full object-cover"
                    />
                  ) : slide.slideType === "video" && slide.videoUrl ? (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <Video className="h-16 w-16 text-white/50" />
                      <p className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                        Vídeo
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  {!slide.isActive && (
                    <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
                      Inativo
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">
                    {slide.title || "Sem título"}
                  </h3>
                  {slide.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {slide.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSlide(slide);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nenhum slide configurado</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro slide para o banner da página inicial
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Slide
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function SlideForm({
  slide,
  onSave,
  onCancel,
}: {
  slide?: any;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [slideType, setSlideType] = useState(slide?.slideType || "image");
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl || "");
  const [videoUrl, setVideoUrl] = useState(slide?.videoUrl || "");
  const [title, setTitle] = useState(slide?.title || "");
  const [description, setDescription] = useState(slide?.description || "");
  const [buttonText, setButtonText] = useState(slide?.buttonText || "");
  const [buttonLink, setButtonLink] = useState(slide?.buttonLink || "");
  const [displayOn, setDisplayOn] = useState(slide?.displayOn || "both");
  const [isActive, setIsActive] = useState(slide?.isActive ?? true);

  const createMutation = trpc.banner.create.useMutation({
    onSuccess: () => {
      toast.success("Slide criado com sucesso!");
      onSave();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar slide");
    },
  });

  const updateMutation = trpc.banner.update.useMutation({
    onSuccess: () => {
      toast.success("Slide atualizado com sucesso!");
      onSave();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar slide");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (slideType === "image" && !imageUrl) {
      toast.error("URL da imagem é obrigatória");
      return;
    }
    
    if (slideType === "video" && !videoUrl) {
      toast.error("URL do vídeo é obrigatória");
      return;
    }

    const data = {
      title: title || null,
      subtitle: description || null,
      buttonText: buttonText || null,
      buttonLink: buttonLink || null,
      imageData: slideType === "image" ? imageUrl : undefined,
      videoUrl: slideType === "video" ? videoUrl : null,
      displayOn: displayOn as "photography" | "video" | "both",
      isActive,
    };

    if (slide?.id) {
      updateMutation.mutate({ id: slide.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de Slide</Label>
        <Select value={slideType} onValueChange={setSlideType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Imagem</SelectItem>
            <SelectItem value="video">Vídeo (.m3u8)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {slideType === "image" ? (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL da Imagem *</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            required
          />
          <p className="text-xs text-muted-foreground">
            Cole a URL da imagem ou faça upload para o R2
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="videoUrl">URL do Vídeo (.m3u8) *</Label>
          <Input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://.../video.m3u8"
            required
          />
          <p className="text-xs text-muted-foreground">
            URL do arquivo HLS (.m3u8) para streaming
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do slide"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição que aparecerá no slide"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buttonText">Texto do Botão</Label>
          <Input
            id="buttonText"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="Ex: Saiba Mais"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buttonLink">Link do Botão</Label>
          <Input
            id="buttonLink"
            type="url"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="/galerias"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Exibir Banner Em</Label>
        <Select value={displayOn} onValueChange={setDisplayOn}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="photography">Apenas Fotografia</SelectItem>
            <SelectItem value="video">Apenas Vídeo</SelectItem>
            <SelectItem value="both">Fotografia e Vídeo</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Escolha em quais páginas este banner deve aparecer
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="isActive">Slide ativo</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit">Salvar Slide</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
