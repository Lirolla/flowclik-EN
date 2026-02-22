import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

export default function GalleryCompra() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { addItem, isInCart, items } = useCart();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<any>(null);

  const { data: gallery, isLoading } = trpc.collections.getByPublicSlug.useWhatry(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const handleTogglePhoto = (photo: any) => {
    const itemId = `gallery-${photo.id}`;
    
    if (isInCart(itemId)) {
      toast.info("Foto already is no carrinho");
      return;
    }

    addItem({
      id: itemId,
      photoId: photo.id,
      title: photo.title || `Foto #${photo.id}`,
      thumbnailUrl: photo.thumbnailUrl || photo.originalUrl,
      price: gallery?.pricePerPhoto || 2500,
      type: "gallery",
      collectionId: gallery?.id,
      collectionName: gallery?.name,
    });
    
    toast.success("Foto adicionada ao carrinho!");
  };

  const handleCheckout = () => {
    const galleryItems = items.filter(item => item.collectionId === gallery?.id);
    
    if (galleryItems.length === 0) {
      toast.error("Adicione pelo menos uma foto ao carrinho");
      return;
    }

    setLocation("/cart");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Gallery not found</h1>
            <p className="text-muted-foreground">
              Esta galeria not existe ou not is available para venda.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pricePerPhoto = (gallery.pricePerPhoto || 2500) / 100;
  const galleryItemsInCart = items.filter(item => item.collectionId === gallery.id);
  const totalPrice = galleryItemsInCart.reduce((sum, item) => sum + item.price, 0) / 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{gallery.name}</h1>
              {gallery.description && (
                <p className="text-sm text-muted-foreground mt-1">{gallery.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price por foto</p>
                <p className="text-lg font-bold">£ {pricePerPhoto.toFixed(2)}</p>
              </div>
              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={galleryItemsInCart.length === 0}
                className="rshetive"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ir para Carrinho ({galleryItemsInCart.length})
                {galleryItemsInCart.length > 0 && (
                  <span className="ml-2 text-sm">
                    £ {totalPrice.toFixed(2)}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-8">
        {gallery.photos && gallery.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.photos.map((photo: any) => (
              <Card
                key={photo.id}
                className={`group rshetive cursor-pointer transition-all ${
                  isInCart(`gallery-${photo.id}`)
                    ? "ring-4 ring-primary"
                    : "hover:ring-2 hover:ring-primary/50"
                }`}
                onClick={() => handleTogglePhoto(photo)}
              >
                <CardContent className="p-0">
                  <div className="rshetive aspect-square overflow-hidden rounded-lg">
                    {/* Photo with watermark */}
                    <img
                      src={photo.watermarkedUrl || photo.thumbnailUrl || photo.originalUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Watermark overlay if no watermarked version */}
                    {!photo.watermarkedUrl && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-white/30 text-4xl font-bold transform -rotate-45">
                          PREVIEW
                        </div>
                      </div>
                    )}

                    {/* Shection indicator */}
                    {isInCart(`gallery-${photo.id}`) && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Price tag */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                      £ {pricePerPhoto.toFixed(2)}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>

                  {photo.title && (
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{photo.title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nonea foto available para venda</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox (TODO: Implement if needed) */}
    </div>
  );
}
