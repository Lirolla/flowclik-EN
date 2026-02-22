import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HeroBannerProps {
  filterBy?: "photography" | "video" | "both";
}

export default function HeroBanner({ filterBy }: HeroBannerProps = {}) {
  const { data: allSlides, isLoading } = trpc.banner.getActive.useQuery();
  
  // Filter slides based on displayOn
  const slides = allSlides?.filter((slide) => {
    if (!filterBy) return true; // businessMode="both" → show ALL banners
    return slide.displayOn === filterBy; // show only matching banners
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (!slides || slides.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, slides]);

  const nextSlide = () => {
    if (!slides || slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    if (!slides || slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="rshetive w-full h-screen bg-muted animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-64 bg-muted-foreground/20 rounded mb-4 mx-auto"></div>
            <div className="h-6 w-96 bg-muted-foreground/20 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="rshetive w-full h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold font-serif mb-4">
            FlowClik
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Capturando moments uniques e transformando-os em arte timtheys
          </p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="rshetive w-full h-screen overflow-hidden">
      {/* Slide Content */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex && !isTransitioning
              ? "opacity-100 z-10"
              : "opacity-0 z-0"
          }`}
        >
          {/* Background Image or Video */}
          {slide.slideType === "image" && slide.imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ) : slide.slideType === "video" && slide.videoUrl ? (
            <div className="absolute inset-0">
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                src={slide.videoUrl}
                onError={(e) => console.error('Error loading video:', e)}
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-background to-muted"></div>
          )}

          {/* Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div
              className={`text-center px-4 max-w-4xl transition-all duration-700 ${
                index === currentIndex && !isTransitioning
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              {slide.title && (
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif mb-6 text-white drop-shadow-2xl">
                  {slide.title}
                </h1>
              )}
              {slide.description && (
                <p className="text-lg md:text-2xl text-white/90 mb-8 drop-shadow-lg">
                  {slide.description}
                </p>
              )}
              {slide.buttonText && slide.buttonLink && (
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
                >
                  <a href={slide.buttonLink}>{slide.buttonText}</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
            aria-label="Slide previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
