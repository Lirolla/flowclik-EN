import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import imageCompression from 'browser-image-compression';

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  price: number;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export default function AdminGalleryUpload() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const collectionId = parseInt(params.id || "0");

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const utils = trpc.useUtils();
  const { data: collection, isLoading, error } = trpc.collections.getById.useQuery({ id: collectionId });
  const { data: medayList } = trpc.meday.listByCollection.useQuery({ collectionId });

  const uploadMutation = trpc.meday.upload.useMutation({
    onSuccess: () => {
      utils.meday.listByCollection.invalidate({ collectionId });
    },
  });

  const deleteMutation = trpc.meday.delete.useMutation({
    onSuccess: () => {
      utils.meday.listByCollection.invalidate({ collectionId });
      toast({
        title: "Foto excluída",
        description: "A foto foi removida da galeria",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: "",
      price: 0,
      uploading: false,
      uploaded: false,
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const uploadSingleFile = async (uploadFile: UploadFile) => {
    updateFile(uploadFile.id, { uploading: true, error: undefined });

    try {
      // Comprimir imagem antes de enviar (resolve erro com fotos grandes 25MB+)
      const options = {
        maxSizeMB: 2, // Maximum 2MB após compressão
        maxWidthOrHeight: 4000, // Maximum 4000px (excelente qualidade)
        useWebWorker: true, // Usar worker para não travar UI
        fileType: 'image/jpeg' as const,
      };
      
      const compressedFile = await imageCompression(uploadFile.file, options);
      
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });

      const imageData = await base64Promise;

      await uploadMutation.mutateAsync({
        collectionId,
        title: uploadFile.title,
        description: uploadFile.description || undefined,
        imageData,
        forSale: true,
        price: uploadFile.price,
      });

      updateFile(uploadFile.id, { uploading: false, uploaded: true });
    } catch (error: any) {
      updateFile(uploadFile.id, {
        uploading: false,
        error: error.message || "Erro no upload",
      });
      
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar a foto",
        variant: "destructive",
      });
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => !f.uploaded && !f.uploading);
    
    if (pendingFiles.length === 0) {
      toast({
        title: "Nonea foto para enviar",
        description: "Todas as fotos já foram enviadas",
        variant: "default",
      });
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    
    for (const file of pendingFiles) {
      try {
        await uploadSingleFile(file);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    // Show notification final
    if (successCount > 0) {
      toast({
        title: "✅ Upload concluído!",
        description: `${successCount} foto${successCount > 1 ? 's' : ''} enviada${successCount > 1 ? 's' : ''} com sucesso${errorCount > 0 ? ` (${errorCount} com erro)` : ''}`,
      });
    } else if (errorCount > 0) {
      toast({
        title: "Erro no upload",
        description: `Falha ao enviar ${errorCount} foto${errorCount > 1 ? 's' : ''}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeday = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta foto?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando galeria...</p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  if (error || !collection) {
    return (
      <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          <p>Error loading galeria: {error?.message || "Gallery not found"}</p>
          <p className="text-sm mt-2">ID: {collectionId}</p>
          <Button onClick={() => setLocation("/admin/galleries")} className="mt-4">
            Voltar para Gallerys
          </Button>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin/galleries")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Gallerys
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            <p className="text-muted-foreground mt-2">
              Faça upload de fotos para esta galeria
            </p>
          </div>
          <Button
            onClick={() => setLocation(`/admin/galleries/${collectionId}/album-final`)}
            variant="outline"
            className="gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Final Album
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              Arraste fotos aqui or click to select
            </h3>
            <p className="text-muted-foreground mb-4">
              Formatos suportados: JPG, PNG, WEBP
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <Button asChild>
              <label htmlFor="file-input" className="cursor-pointer">
                Selecionar Arquivos
              </label>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <p className="font-semibold">
                  {files.length} arquivo(s) selecionado(s)
                </p>
                <Button
                  onClick={uploadAll}
                  disabled={files.every((f) => f.uploaded || f.uploading)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Todos
                </Button>
              </div>

              <div className="space-y-4">
                {files.map((uploadFile) => (
                  <Card key={uploadFile.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Preview */}
                        <img
                          src={uploadFile.preview}
                          alt={uploadFile.title}
                          className="w-24 h-24 object-cover rounded"
                        />

                        {/* Form */}
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={uploadFile.title}
                                onChange={(e) =>
                                  updateFile(uploadFile.id, {
                                    title: e.target.value,
                                  })
                                }
                                disabled={uploadFile.uploading || uploadFile.uploaded}
                              />
                            </div>
                            <div>
                              <Label>Price (£)</Label>
                              <Input
                                type="number"
                                value={uploadFile.price}
                                onChange={(e) =>
                                  updateFile(uploadFile.id, {
                                    price: parseFloat(e.target.value) || 0,
                                  })
                                }
                                disabled={uploadFile.uploading || uploadFile.uploaded}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Description (optional)</Label>
                            <Input
                              value={uploadFile.description}
                              onChange={(e) =>
                                updateFile(uploadFile.id, {
                                  description: e.target.value,
                                })
                              }
                              disabled={uploadFile.uploading || uploadFile.uploaded}
                            />
                          </div>

                          {uploadFile.error && (
                            <p className="text-sm text-red-500">{uploadFile.error}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {uploadFile.uploaded ? (
                            <span className="text-sm text-green-500 font-semibold">
                              ✓ Shipped
                            </span>
                          ) : uploadFile.uploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => uploadSingleFile(uploadFile)}
                              >
                                Enviar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFile(uploadFile.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Photos */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Fotos na Gallery</h2>
        
        {!medayList || medayList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nonea foto nesta galeria ainda
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {medayList.map((meday) => (
              <Card key={meday.id} className="overflow-hidden">
                <div className="relative group">
                  <img
                    src={meday.thumbnailUrl || ''}
                    alt={meday.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteMeday(meday.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-semibold text-sm truncate">{meday.title}</p>
                  {meday.priceDigital && meday.priceDigital > 0 && (
                    <p className="text-sm text-muted-foreground">
                      £ {(meday.priceDigital || 0).toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
