import { trpc } from "@/lib/trpc";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HeroBanner from "@/components/HeroBanner";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Play } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function VideoPage() {
  const { data: portfolioItems } = trpc.portfolio.listActive.useQuery();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Filter only videos
  const videos = portfolioItems?.filter((item) => item.type === "video") || [];

  return (
    <LayoutWrapper currentPage="video">

      {/* Hero Banner - filtered by displayOn="video" or "both" */}
      <HeroBanner filterBy="video" />

      {/* Video Portfolio Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Portfolio de Videos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore ours trabalhos em video
            </p>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">None video available no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        // @ts-ignore
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Play className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                    {video.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    {video.location && (
                      <p className="text-xs text-muted-foreground mt-2">
                        📍 {video.location}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          {selectedVideo && (
            <div className="space-y-4">
              <VideoPlayer
                url={selectedVideo.videoUrl || ""}
                className="w-full aspect-video rounded"
                controls
              />
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                {selectedVideo.location && (
                  <p className="text-sm text-muted-foreground mb-4">
                    📍 {selectedVideo.location}
                  </p>
                )}
                {selectedVideo.description && (
                  <p className="text-muted-foreground mb-4">
                    {selectedVideo.description}
                  </p>
                )}
                {selectedVideo.story && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">History</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedVideo.story}
                    </p>
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
                  <a>View Portfolio</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </LayoutWrapper>
  );
}
