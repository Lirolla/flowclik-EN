import { useState, useEffect } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MapPin, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function Portfolio() {
  const { data: allItems, isLoading } = (trpc.portfolio.listActive.useQuery() as any);
  const { data: siteConfig } = (trpc.site.getConfig.useQuery() as any);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"photo" | "video">("photo");

  const items = allItems?.filter((item: any) => item.type === filter);
  const selectedItem = selectedIndex !== null && items ? items[selectedIndex] : null;

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null || !items) return;
      
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex(prev => prev! > 0 ? prev! - 1 : items.length - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex(prev => prev! < items.length - 1 ? prev! + 1 : 0);
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, items]);

  // Touch swipe for mobile
  useEffect(() => {
    if (selectedIndex === null || !items) return;
    let startX = 0;
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diffX = e.changedTouches[0].clientX - startX;
      const diffY = e.changedTouches[0].clientY - startY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          setSelectedIndex(prev => prev! > 0 ? prev! - 1 : items.length - 1);
        } else {
          setSelectedIndex(prev => prev! < items.length - 1 ? prev! + 1 : 0);
        }
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [selectedIndex, items]);

  const goToPrevious = () => {
    if (!items || selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : items.length - 1);
  };

  const goToNext = () => {
    if (!items || selectedIndex === null) return;
    setSelectedIndex(selectedIndex < items.length - 1 ? selectedIndex + 1 : 0);
  };

  return (
    <LayoutWrapper currentPage="portfolio">

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background to-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
              Portfólio
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Uma seleção dos nossos melhores trabalhos
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20">
        <div className="container">
          {/* Filter Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setFilter("photo")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === "photo"
                  ? "bg-muted/20"
                  : "bg-muted text-muted-foreground hover:bg-accent/50"
              }`}
            >
              📷 Fotos
            </button>
            <button
              onClick={() => setFilter("video")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === "video"
                  ? "bg-muted/20"
                  : "bg-muted text-muted-foreground hover:bg-accent/50"
              }`}
            >
              🎥 Videos
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : items && items.length > 0 ? (
            filter === "video" ? (
              // Layout Grid 4 colunas para videos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item: any, index: any) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden cursor-pointer group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-card"
                    onClick={() => setSelectedIndex(index)}
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={item.thumbnailUrl || item.imageUrl || ""}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Play className="h-8 w-8 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              // Layout Grid para fotos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item: any, index: any) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all"
                    onClick={() => setSelectedIndex(index)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={item.thumbnailUrl || item.imageUrl || ""}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                          {item.location && (
                            <p className="text-sm flex items-center justify-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {item.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Em breve</h3>
              <p className="text-muted-foreground">
                Estamos preparando nosso portfólio. Volte em breve!
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Fullscreen Lightbox */}
      {selectedIndex !== null && selectedItem && items && (
        <div 
          className="fixed inset-0 z-[9999] bg-black"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIndex(null);
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 md:p-3 transition-all backdrop-blur-sm"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Counter */}
          {items.length > 1 && (
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50 text-white/70 text-sm md:text-base font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {selectedIndex + 1} / {items.length}
            </div>
          )}

          {/* Navigation Arrows - Desktop */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 lg:p-4 transition-all backdrop-blur-sm items-center justify-center"
              >
                <ChevronLeft className="h-6 w-6 lg:h-8 lg:w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 lg:p-4 transition-all backdrop-blur-sm items-center justify-center"
              >
                <ChevronRight className="h-6 w-6 lg:h-8 lg:w-8" />
              </button>
            </>
          )}

          {/* Main Content Area */}
          <div className="h-full w-full flex flex-col">
            {/* Image/Video - Takes most of the screen */}
            <div 
              className="flex-1 flex items-center justify-center px-2 pt-14 pb-2 md:px-20 md:pt-16 md:pb-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedIndex(null);
              }}
            >
              {selectedItem.type === "video" && selectedItem.videoUrl ? (
                <VideoPlayer 
                  url={selectedItem.videoUrl || ""} 
                  className="w-full max-w-6xl aspect-video rounded-lg"
                />
              ) : (
                <img
                  src={selectedItem.imageUrl || ""}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain select-none"
                  style={{ maxHeight: "calc(100vh - 140px)" }}
                  draggable={false}
                />
              )}
            </div>

            {/* Info Bar - Bottom */}
            <div className="shrink-0 bg-gradient-to-t from-black via-black/90 to-transparent px-4 md:px-8 pb-4 md:pb-6 pt-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white font-serif">
                  {selectedItem.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1.5 md:mt-2">
                  {selectedItem.location && (
                    <p className="flex items-center gap-1.5 text-white/70 text-sm md:text-base">
                      <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                      {selectedItem.location}
                    </p>
                  )}
                  {selectedItem.description && (
                    <p className="text-white/60 text-sm md:text-base">
                      {selectedItem.description}
                    </p>
                  )}
                </div>
                {selectedItem.story && (
                  <p className="text-white/50 text-xs md:text-sm mt-2 line-clamp-2">
                    {selectedItem.story}
                  </p>
                )}
              </div>

              {/* Mobile Navigation Dots */}
              {items.length > 1 && (
                <div className="flex md:hidden justify-center gap-1.5 mt-3">
                  {items.slice(
                    Math.max(0, selectedIndex - 3),
                    Math.min(items.length, selectedIndex + 4)
                  ).map((_: any, i: number) => {
                    const realIndex = Math.max(0, selectedIndex - 3) + i;
                    return (
                      <button
                        key={realIndex}
                        onClick={() => setSelectedIndex(realIndex)}
                        className={`rounded-full transition-all ${
                          realIndex === selectedIndex
                            ? "w-6 h-2 bg-white"
                            : "w-2 h-2 bg-white/30"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                <Link href="/services">
                  <a>Ver Services</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </LayoutWrapper>
  );
}
