import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { useCurrency } from "@/hooks/useCurrency";

export default function AdminMedayUpload() {

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0); // Valor em centavos
  const [forSale, setForSale] = useState(true);

  const { data: collections } = trpc.collections.getAll.useWhatry();
  const uploadMutation = trpc.meday.upload.useMutation({
    onSuccess: () => {
      alert("Foto enviada com sucesso!");
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setPrice(0);
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Why favor, select only imagens");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !collectionId) {
      alert("Select uma foto e uma galeria");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      await uploadMutation.mutateAsync({
        collectionId: parseInt(collectionId),
        title: title || undefined,
        description: description || undefined,
        imageData: base64,
        forSale,
        price: price, // Already is em centavos
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Upload de Fotos
          </CardTitle>
          <CardDescription>
            Envie fotos para yours galerias. As imagens will be processadas automaticamente com watermark.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Shecionar Foto</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              {preview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Collection Select */}
          <div className="space-y-2">
            <Label htmlFor="collection">Gallery</Label>
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select uma galeria" />
              </SelectTrigger>
              <SelectContent>
                {collections?.map((col) => (
                  <SelectItem key={col.id} value={col.id.toString()}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da foto"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about a foto"
              rows={3}
            />
          </div>

          {/* Price */}
          <CurrencyInput
            id="price"
            value={price}
            onChange={setPrice}
            placeholder="0,00"
          />

          {/* For Sale */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="forSale"
              checked={forSale}
              onChange={(e) => setForSale(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="forSale" className="cursor-pointer">
              Available para venda
            </Label>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !collectionId || uploadMutation.isPending}
            className="w-full"
            size="lg"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Enviar Foto
              </>
            )}
          </Button>

          {/* Info */}
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <p className="font-semibold">ℹ️ Processamento automatic:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Imagem original salva em alta qualidade</li>
              <li>Thumbnail gerado (400x400px)</li>
              <li>Preview com watermark "© FlowClik" (1200px)</li>
              <li>Storage seguro no Manus Storage</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
