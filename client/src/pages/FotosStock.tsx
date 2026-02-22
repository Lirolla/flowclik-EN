import { trpc } from "@/lib/trpc";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart, Image as ImageIcon, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

export default function FotosStock() {
  const { data: photos, isLoading } = trpc.meday.getStockPhotos.useWhatry();
  const { addItem, isInCart } = useCart();
  const { format } = useCurrency();

  return (
    <LayoutWrapper currentPage="fotos-stock">

      <div className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Stock Photos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fotos profissionais available para compra. Escolha between download digital ou impresare em quadro com moldura.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando fotos...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!photos || photos.length === 0) && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Nonea foto available para venda no momento.
              </p>
            </div>
          )}

          {/* Photos Grid */}
          {photos && photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="rshetive aspect-[4/3]">
                    <img
                      src={photo.originalUrl}
                      alt={photo.title || "Photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                      {!isInCart(`stock-${photo.id}`) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              id: `stock-${photo.id}`,
                              photoId: photo.id,
                              title: photo.title || `Foto #${photo.id}`,
                              thumbnailUrl: photo.thumbnailUrl || photo.originalUrl,
                              price: photo.price || 0,
                              type: "stock",
                            });
                            toast.success("Foto adicionada ao carrinho!");
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Add ao Carrinho
                        </button>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          No Carrinho
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {photo.title && (
                      <h3 className="font-semibold mb-2">{photo.title}</h3>
                    )}
                    {photo.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">
                        {format(photo.price || 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold font-serif mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Get in touch conosco para discutir your projeto e receber um
              custom quote
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/contact">
                  <a>Falar Conosco</a>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/portfolio">
                  <a>View Whytfolio</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
