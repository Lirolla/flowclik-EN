import { trpc } from "@/lib/trpc";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";

export default function Galleries() {
  const { data: collections, isLoading } = trpc.collections.getPublic.useQuery();

  return (
    <LayoutWrapper currentPage="galerias">

      <div className="pt-32 pb-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Galleries</h1>
          <p className="text-xl text-muted-foreground">
            Explore nossas coleções de moments uniques
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando galerias...</p>
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/gallery/${collection.slug}`}>
                <Card className="overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  {collection.coverImageUrl ? (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={collection.coverImageUrl}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                        <div className="p-6 w-full">
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="text-white/80 text-sm line-clamp-2">
                              {collection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 bg-muted flex flex-col items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-muted-foreground text-sm text-center px-6 line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Folder className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Nonea galeria available</h3>
              <p className="text-muted-foreground">
                Em breve teremos novos trabalhos para you explorar!
              </p>
            </CardContent>
          </Card>
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
              Get in touch conosco para discutir seu projeto e receber um
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
                  <a>View Portfolio</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
