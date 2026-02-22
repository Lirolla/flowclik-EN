import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Image as ImageIcon, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function StockGallery() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Buscar fotos stock
  const { data: allPhotos, isLoading } = trpc.stock.listPublic.useQuery();
  
  // Filter by search term and category
  const filteredPhotos = (allPhotos || []).filter((photo) => {
    const matchesSearch = searchTerm
      ? photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesCategory = categoryFilter === "all" || photo.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (photo: any) => {
    // Get existing cart from localStorage
    const existingCart = localStorage.getItem("lirolla_cart");
    const cart = existingCart ? JSON.parse(existingCart) : [];

    // Check if item already in cart
    const existingItem = cart.find((item: any) => item.id === photo.id && item.type === "stock");
    
    if (existingItem) {
      alert("Esta foto já está no carrinho!");
      return;
    }

    // Add to cart
    cart.push({
      id: photo.id,
      type: "stock",
      title: photo.title,
      price: photo.price,
      thumbnailUrl: photo.thumbnailUrl,
      quantity: 1,
    });

    localStorage.setItem("lirolla_cart", JSON.stringify(cart));
    alert("Foto adicionada ao carrinho!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a href="/" className="text-2xl font-bold">
                FlowClik
              </a>
              <div className="hidden md:flex gap-6">
                <a href="/" className="hover:text-primary transition-colors">
                  Início
                </a>
                <a href="/galerias" className="hover:text-primary transition-colors">
                  Galerias
                </a>
                <a href="/servicos" className="hover:text-primary transition-colors">
                  Serviços
                </a>
                <a href="/portfolio" className="hover:text-primary transition-colors">
                  Portfólio
                </a>
                <a href="/sobre" className="hover:text-primary transition-colors">
                  Sobre
                </a>
                <a href="/contato" className="hover:text-primary transition-colors">
                  Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Galeria Stock</h1>
              <p className="text-muted-foreground mt-1">
                Fotos profissionais para download imediato
              </p>
            </div>
            <Button onClick={() => setLocation("/carrinho")}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrinho
            </Button>
          </div>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar fotos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="paisagem">Paisagem</SelectItem>
                <SelectItem value="carros">Carros</SelectItem>
                <SelectItem value="pessoas">Pessoas</SelectItem>
                <SelectItem value="eventos">Eventos</SelectItem>
                <SelectItem value="produtos">Produtos</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : filteredPhotos.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || categoryFilter !== "all" ? "Nenhuma foto encontrada" : "Nenhuma foto disponível"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all"
                  ? "Tente buscar com outros termos ou categorias"
                  : "Volte em breve para ver novas fotos"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              {filteredPhotos.length} foto(s) disponível(is)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <img
                      src={photo.previewUrl || photo.thumbnailUrl || photo.originalUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {photo.category}
                        </p>
                        <p className="text-lg font-bold">£ {((photo.price || 0) / 100).toFixed(2)}</p>
                      </div>
                      <Button onClick={() => addToCart(photo)} size="sm">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
