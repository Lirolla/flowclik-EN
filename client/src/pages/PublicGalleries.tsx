import { trpc } from "@/lib/trpc";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Image as ImageIcon, Loader2 } from "lucide-react";

export default function PublicGalleries() {
  const { data: collections, isLoading } = trpc.collections.getPublic.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <LayoutWrapper currentPage="galerias">

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background to-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
              Gallerys
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Explore nossas coleções de moments uniques
            </p>
          </div>
        </div>
      </section>

      {/* Galleries Grid */}
      <section className="py-20">
        <div className="container">

        {!collections || collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nonea galeria pública available no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection: any) => (
              <Link key={collection.id} href={`/gallery/${collection.slug}`}>
                <a>
                  <Card className="overflow-hidden group hover:shadow-xl transition-all cursor-pointer">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {collection.coverImageUrl ? (
                        <img
                          src={collection.coverImageUrl}
                          alt={collection.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                      {collection.eventDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(collection.eventDate).toLocaleDateString('en-GB')}
                        </p>
                      )}
                    </div>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
        </div>
      </section>

    </LayoutWrapper>
  );
}
