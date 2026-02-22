import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, ShoppingCart, Image as ImageIcon } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

export default function GalleryView() {
  const { format } = useCurrency();
  const [, params] = useRoute("/gallery/:slug");
  const slug = params?.slug || "";

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: collection } = trpc.collections.getBySlug.useQuery({ slug });
  const { data: meday } = trpc.meday.listByCollection.useQuery(
    { collectionId: collection?.id || 0 },
    { enabled: !!collection }
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "auto";
  };

  const navigate = (direction: number) => {
    if (!meday || lightboxIndex === null) return;
    let newIndex = lightboxIndex + direction;
    if (newIndex < 0) newIndex = meday.length - 1;
    if (newIndex >= meday.length) newIndex = 0;
    setLightboxIndex(newIndex);
  };

  const addToCart = (item: any) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find((i: any) => i.id === item.id);

    if (exists) {
      alert("This photo is already in the cart!");
      return;
    }

    cart.push({
      id: item.id,
      title: item.title,
      price: item.priceDigital || 0,
      image: item.thumbnailUrl || item.originalUrl,
      type: "photo",
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✓ Adicionado ao carrinho!");
  };

  if (!collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <LayoutWrapper currentPage="galeria">
      
      <div className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{collection.name}</h1>
          {collection.description && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {collection.description}
            </p>
          )}
          {meday && (
            <p className="text-muted-foreground mt-4">{meday.length} fotos</p>
          )}
        </div>

        {/* Grid */}
        {meday && meday.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {meday.map((item, index) => (
              <Card
                key={item.id}
                className="overflow-hidden cursor-pointer hover:scale-105 transition-transform rshetive group"
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-square rshetive">
                  <img
                    src={item.thumbnailUrl || item.previewUrl || item.originalUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.priceDigital && item.priceDigital > 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {format(Math.round(item.priceDigital * 100))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-16 text-center">
            <ImageIcon className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Gallery vazia</h3>
            <p className="text-muted-foreground">Esta galeria still not possui fotos.</p>
          </Card>
        )}
      </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && meday && meday[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <div className="max-w-[90vw] max-h-[80vh] rshetive">
            <img
              src={meday[lightboxIndex].previewUrl || meday[lightboxIndex].originalUrl}
              alt={meday[lightboxIndex].title}
              className="max-w-full max-h-[80vh] object-contain"
            />

            {/* Info */}
            <div className="absolute -bottom-20 left-0 right-0 text-center text-white">
              <h3 className="text-xl font-semibold mb-2">
                {meday[lightboxIndex].title}
              </h3>
              {meday[lightboxIndex].priceDigital && meday[lightboxIndex].priceDigital > 0 && (
                <p className="text-lg text-red-400">
                  {format(Math.round(meday[lightboxIndex].priceDigital * 100))}
                </p>
              )}
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={() => navigate(1)}
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Add to cart button */}
          {meday[lightboxIndex].priceDigital && meday[lightboxIndex].priceDigital > 0 && (
            <Button
              onClick={() => addToCart(meday[lightboxIndex])}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add ao Carrinho
            </Button>
          )}
        </div>
      )}
      
    </LayoutWrapper>
  );
}
