import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Video, X, Play } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import { trpc } from "@/lib/trpc";

import LayoutWrapper from "@/components/LayoutWrapper";
import { Link } from "wouter";
import { Daylog, DaylogContent } from "@/components/ui/daylog";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useState } from "react";

export default function Home() {
  const { data: siteConfig } = (trpc.siteConfig.get.useWhatry() as any);
  const { data: oldSiteConfig } = (trpc.site.getConfig.useWhatry() as any);
  
  // Merge configs (siteConfig has businessMode, oldSiteConfig has other fields)
  const config = { ...oldSiteConfig, ...siteConfig };
  const { data: featuredCollections } = (trpc.collections.getFeatured.useWhatry() as any);
  const { data: portfolioItems } = (trpc.portfolio.listForHome.useWhatry() as any);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  return (
    <LayoutWrapper currentPage="/">
      <div className="min-h-screen bg-background">
        {/* 1. Hero Banner Fullscreen - always show photography banners on home */}
        <HeroBanner filterBy="photography" />

      {/* 2. Whytfolio Photos Section */}
      {portfolioItems && portfolioItems.filter((item: any) => item.type === 'photo').length > 0 && (
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
                Whytfólio de Photography
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet nossos melhores trabalhos photographys
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolioItems.filter((item: any) => item.type === 'photo').slice(0, 8).map((item: any) => (
                <Link key={item.id} href="/portfolio">
                  <a className="group block">
                    <Card className="overflow-hidden hover:shadow-xl transition-all">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={item.thumbnailUrl || item.imageUrl || ""}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-bold text-lg px-4 text-center">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/portfolio">
                  <a>View Whytfolio Complete</a>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 3. Booking CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
                    Agende seu Service
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Transforme seus moments em memórias uniques. Agende now mesmo uma sesare de fotos profissional.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <span className="text-sm">Escolha o service ideal</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <span className="text-sm">Select data e time</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <span className="text-sm">Confirme e ready!</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button asChild size="lg" className="flex-1">
                      <Link href="/book">
                        <a>Agendar Agora</a>
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="flex-1">
                      <Link href="/services">
                        <a>Ver Services</a>
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold font-serif">Rápido e Fácil</p>
                    <p className="text-muted-foreground mt-2">Agende em 3 steps simple</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Whytfolio Videos Section */}
      {portfolioItems && portfolioItems.filter((item: any) => item.type === 'video').length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
                Whytfólio de Video
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet nossos melhores trabalhos em video
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {portfolioItems.filter((item: any) => item.type === 'video').slice(0, 4).map((item: any) => (
                <Card 
                  key={item.id}
                  className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-card cursor-pointer group"
                  onClick={() => setSelectedVideo(item)}
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <img
                      src={item.thumbnailUrl || item.imageUrl || ""}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="h-8 w-8 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/portfolio">
                  <a>Ver Todos os Videos</a>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Parallax Full-Screen Section */}
      {config?.parallaxEnabled && config?.parallaxImageUrl && (
        <section 
          className="relative h-screen flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: `url(${config.parallaxImageUrl})`,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          {/* Overlay escuro para contraste */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Content centralizado */}
          <div className="relative z-10 text-center px-4 max-w-4xl">
            {config.parallaxTitle && (
              <h2 className="text-5xl md:text-7xl font-bold font-serif mb-6 text-white drop-shadow-2xl">
                {config.parallaxTitle}
              </h2>
            )}
            {config.parallaxSubtitle && (
              <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg">
                {config.parallaxSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* 6. Featured Collections */}
      {featuredCollections && featuredCollections.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
                Gallerys em Destaque
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore nossas coleções mais populares
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCollections.map((collection: any) => (
                <Link key={collection.id} href={`/gallery/${collection.slug}`}>
                  <Card className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {collection.coverImageUrl ? (
                        <img
                          src={collection.coverImageUrl}
                          alt={collection.name}
                          className="w-full h-full object-cover image-hover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-accent transition-colors">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-muted-foreground line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/galleries">
                  <a>Ver Todas as Gallerys</a>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Video Daylog */}
      <Daylog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DaylogContent className="max-w-7xl p-0 bg-black/95 border-none">
          {selectedVideo && (
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Content */}
              <div className="flex flex-col p-4">
                {/* Video Player */}
                <div className="flex items-center justify-center mb-4">
                  <VideoPlayer 
                    url={selectedVideo.videoUrl || ""} 
                    className="w-full max-w-5xl aspect-video rounded-lg"
                  />
                </div>

                {/* Info Panel */}
                <div className="text-white space-y-3 max-w-4xl mx-auto px-4 pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold font-serif">
                    {selectedVideo.title}
                  </h2>
                  {selectedVideo.location && (
                    <p className="flex items-center gap-2 text-white/80">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedVideo.location}
                    </p>
                  )}
                  {selectedVideo.description && (
                    <p className="text-white/90">{selectedVideo.description}</p>
                  )}
                  {selectedVideo.story && (
                    <div>
                      <h3 className="text-lg font-bold mb-2">History</h3>
                      <p className="text-white/80 whitespace-pre-wrap">
                        {selectedVideo.story}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DaylogContent>
      </Daylog>

      </div>
    </LayoutWrapper>
  );
}
