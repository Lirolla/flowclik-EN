import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Upload, X, DollarSign, Tag, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { formatCurrency as formatCurrencyHelper, getCurrencySymbol } from "@/lib/currency";

export default function AdminStock() {
  return (
    <DashboardLayout>
      <AdminStockContent />
    </DashboardLayout>
  );
}

function AdminStockContent() {
  const utils = trpc.useUtils();
  
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { data: stockPhotos, isLoading } = trpc.stock.listAll.useQuery();
  
  // Usar símbolo de moeda (Brasil hardcoded)
  const currencySymbol = getCurrencySymbol();
  
  // Country config (Brasil hardcoded)
  const countryConfig = { name: "brazil" };
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  
  // Form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState("");

  const createMutation = trpc.stock.create.useMutation({
    onSuccess: () => {
      utils.stock.listAll.invalidate();
      toast.success("Foto adicionada ao stock!");
      resetForm();
    },
  });

  const deleteMutation = trpc.stock.delete.useMutation({
    onSuccess: () => {
      utils.stock.listAll.invalidate();
      toast.success("Foto removida!");
    },
  });
  
  const updateMutation = trpc.stock.update.useMutation({
    onSuccess: () => {
      utils.stock.listAll.invalidate();
      toast.success("Foto atualizada!");
      setShowEditModal(false);
      setEditingPhoto(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // REMOVIDO: Mutations de frameConfig (sistema de molduras desativado)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setShowUploadModal(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !category || !price) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        // Convert to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Upload to server
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const { url } = await response.json();

        // Create stock photo
        await createMutation.mutateAsync({
          title: title || file.name,
          description,
          category: category as any,
          originalUrl: url,
          thumbnailUrl: url,
          previewUrl: url,
          price: Math.round(parseFloat(price)),
        });
      }

      toast.success(`${selectedFiles.length} foto(s) adicionada(s)!`);
      setShowUploadModal(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao fazer upload!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = () => {
    if (!editingPhoto) return;
    
    updateMutation.mutate({
      id: editingPhoto.id,
      title,
      category: category as any,
      price: Math.round(parseFloat(price)),
      description,
    });
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setTitle("");
    setDescription("");
    setCategory("");
    setPrice("");
    // setFrameEnabled(false); // Frame feature removed
  };

  const formatCurrency = (cents: number) => {
    return formatCurrencyHelper(cents);
  };

  // Frame feature removed
  // const handleUpdateSize = (id: number, basePrice: number) => {
  //   updateSizeMutation.mutate({ id, basePrice });
  // };

  // const handleUpdateType = (id: number, additionalPrice: number) => {
  //   updateTypeMutation.mutate({ id, additionalPrice });
  // };

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <ImageIcon className="w-8 h-8" />
          Gerenciar Fotos Stock
        </h1>
        <p className="text-muted-foreground">
          Upload de fotos exclusivas para venda e configuração de molduras
        </p>
      </div>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">Arraste fotos aqui ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground">
              Formatos aceitos: JPG, PNG, WEBP
            </p>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Photos List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Fotos no Stock ({stockPhotos?.length || 0})
        </h2>
        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : stockPhotos && stockPhotos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma foto no stock ainda. Faça upload acima!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stockPhotos?.map((photo) => (
              <Card key={photo.id} className="relative group">
                <CardContent className="p-2">
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => {
                        setEditingPhoto(photo);
                        setTitle(photo.title || '');
                        setCategory(photo.category);
                        setPrice(photo.price.toString());
                        setDescription(photo.description || '');
                        setShowEditModal(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteMutation.mutate({ id: photo.id })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <img
                    src={photo.thumbnailUrl || photo.originalUrl}
                    alt={photo.title}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                  <p className="text-sm font-semibold truncate">{photo.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    <span>{currencySymbol} {(photo.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Tag className="w-3 h-3" />
                    <span className="capitalize">{photo.category}</span>
                  </div>
                  {/* REMOVIDO: Badge de moldura */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload de Fotos Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedFiles.length} arquivo(s) selecionado(s)
              </p>
            </div>

            <div>
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deixe vazio para usar nome do arquivo"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paisagem">Paisagem</SelectItem>
                  <SelectItem value="carros">Carros</SelectItem>
                  <SelectItem value="pessoas">Pessoas</SelectItem>
                  <SelectItem value="eventos">Eventos</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Preço ({currencySymbol}) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite o valor em {currencySymbol} (ex: 25 = {currencySymbol}25)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a foto para os compradores..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? "Sending..." : "Fazer Upload"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Foto Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingPhoto && (
              <div className="flex justify-center">
                <img
                  src={editingPhoto.thumbnailUrl || editingPhoto.originalUrl}
                  alt={editingPhoto.title}
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}

            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da foto"
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paisagem">Paisagem</SelectItem>
                  <SelectItem value="carros">Carros</SelectItem>
                  <SelectItem value="pessoas">Pessoas</SelectItem>
                  <SelectItem value="eventos">Eventos</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-price">Preço ({currencySymbol})</Label>
              <Input
                id="edit-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite o valor em {currencySymbol} (ex: 25 = {currencySymbol}25)
              </p>
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a foto para os compradores..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleEditSubmit}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? "Saving..." : "Salvar Alterações"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPhoto(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

