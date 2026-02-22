import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ArrowLeft, X, ChevronLeft, ChevronRight, Camera, Video, ShoppingCart, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
// import BuyPhotoDialog from "@/components/BuyPhotoDialog"; // Feature removed

export default function PublicGalleryView() {
  const [, params] = useRoute("/galeria/:slug");
  const slug = params?.slug || "";

  const { data: collection, isLoading: collectionLoading } = trpc.collections.getBySlug.useQuery({ slug });
  const { data: mediaItems, isLoading: mediaLoading } = trpc.collections.getWithMedia.useQuery(
    { id: collection?.id || 0 },
    { enabled: !!collection?.id }
  );

  const { data: existingSelections } = trpc.photoSelections.getByCollection.useQuery(
    { collectionId: collection?.id || 0 },
    { enabled: !!collection?.id }
  );

  const toggleSelectionMutation = trpc.photoSelections.toggleSelection.useMutation();
  const saveFeedbackMutation = trpc.photoSelections.saveFeedback.useMutation();
  const submitSelectionMutation = trpc.photoSelections.submitSelection.useMutation();
  const utils = trpc.useUtils();

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // const [buyPhotoDialogOpen, setBuyPhotoDialogOpen] = useState(false); // Feature removed
  // const [selectedPhoto, setSelectedPhoto] = useState<any>(null); // Feature removed
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selections, setSelections] = useState<Record<number, boolean>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [currentFeedback, setCurrentFeedback] = useState("");

  // Load existing selections
  useEffect(() => {
    if (existingSelections) {
      const selectionsMap: Record<number, boolean> = {};
      const feedbacksMap: Record<number, string> = {};
      existingSelections.forEach((sel: any) => {
        selectionsMap[sel.mediaItemId] = sel.isSelected;
        if (sel.clientFeedback) {
          feedbacksMap[sel.mediaItemId] = sel.clientFeedback;
        }
      });
      setSelections(selectionsMap);
      setFeedbacks(feedbacksMap);
    }
  }, [existingSelections]);

  if (collectionLoading || mediaLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Carregando galeria...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl font-bold mb-4">Galeria não encontrada</h1>
        <Link href="/galerias">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para galerias
          </Button>
        </Link>
      </div>
    );
  }

  // Password protection
  if (collection.password && !isAuthenticated) {
    const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === collection.password) {
        setIsAuthenticated(true);
        setPasswordError("");
      } else {
        setPasswordError("Senha incorreta. Tente novamente.");
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-card rounded-lg border">
          <h1 className="text-2xl font-bold mb-2">{collection.name}</h1>
          <p className="text-muted-foreground mb-6">Esta galeria é protegida por senha</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Digite a senha
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border rounded-md bg-background"
                placeholder="Senha"
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-2">{passwordError}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Acessar Galeria
            </Button>
          </form>
          
          <Link href="/galerias" className="block mt-4">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const items = (mediaItems as any)?.mediaItems || [];
  
  // Detect if gallery has only videos
  const hasOnlyVideos = items.length > 0 && items.every((item: any) => item.mediaType === "video");
  const layoutType = hasOnlyVideos ? "youtube" : (collection.layoutType || "masonry");

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null && lightboxIndex < items.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const toggleSelection = async (mediaItemId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newValue = !selections[mediaItemId];
    setSelections({ ...selections, [mediaItemId]: newValue });
    
    await toggleSelectionMutation.mutateAsync({
      mediaItemId,
      collectionId: collection?.id || 0,
      isSelected: newValue,
    });
  };

  const saveFeedback = async (mediaItemId: number, feedback: string) => {
    setFeedbacks({ ...feedbacks, [mediaItemId]: feedback });
    
    await saveFeedbackMutation.mutateAsync({
      mediaItemId,
      collectionId: collection?.id || 0,
      feedback,
    });
  };

  const handleSubmitSelection = async () => {
    const selectedCount = Object.values(selections).filter(Boolean).length;
    if (selectedCount === 0) {
      alert("Selecione pelo menos uma foto antes de enviar.");
      return;
    }

    if (confirm(`Você selecionou ${selectedCount} foto(s). Deseja enviar sua seleção?`)) {
      await submitSelectionMutation.mutateAsync({ collectionId: collection?.id || 0 });
      alert("Seleção enviada com sucesso! O fotógrafo irá editar as fotos selecionadas.");
    }
  };

  const selectedCount = Object.values(selections).filter(Boolean).length;

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-background">

      {/* Gallery Content */}
      <div className="container py-8 pt-32">
        {/* Selection Header */}
        {isAuthenticated && items.length > 0 && (
          <div className="mb-6 p-4 bg-card rounded-lg border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">{selectedCount} foto(s) selecionada(s)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Marque as fotos favoritas e deixe seus palpites de edição
              </p>
            </div>
            {selectedCount > 0 && (
              <Button onClick={handleSubmitSelection} className="gap-2">
                <Send className="w-4 h-4" />
                Enviar Seleção
              </Button>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma mídia nesta galeria ainda.</p>
          </div>
        ) : (
          <>
            {/* Grid Layout */}
            {layoutType === "grid" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-muted"
                    onClick={() => openLightbox(index)}
                  >
                    {item.mediaType === "photo" ? (
                      <img
                        src={item.thumbnailUrl || item.previewUrl || item.originalUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={item.originalUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Video className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    )}
                    {/* Heart button */}
                    {isAuthenticated && (
                      <button
                        onClick={(e) => toggleSelection(item.id, e)}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            selections[item.id] ? "fill-red-500 text-red-500" : "text-white"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Masonry Layout */}
            {layoutType === "masonry" && (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {items.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="relative break-inside-avoid mb-4 overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => openLightbox(index)}
                  >
                    {item.mediaType === "photo" ? (
                      <img
                        src={item.previewUrl || item.originalUrl}
                        alt={item.title}
                        className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="relative">
                        <video
                          src={item.originalUrl}
                          className="w-full h-auto"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Video className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    )}
                    {/* Heart button */}
                    {isAuthenticated && (
                      <button
                        onClick={(e) => toggleSelection(item.id, e)}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            selections[item.id] ? "fill-red-500 text-red-500" : "text-white"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* YouTube Layout (only videos) */}
            {layoutType === "youtube" && (
              <div className="max-w-4xl mx-auto space-y-6">
                {items.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="md:flex">
                      {/* Video Thumbnail */}
                      <div className="md:w-2/5 relative aspect-video bg-black">
                        <video
                          src={item.originalUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="md:w-3/5 p-6">
                        <h3 className="text-xl font-bold mb-2">{item.title || "Vídeo sem título"}</h3>
                        {item.description && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            <span>Vídeo</span>
                          </div>
                          {collection.name && (
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-1 bg-accent rounded text-accent-foreground text-xs">
                                {collection.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* YouTube Layout (only videos) */}
            {layoutType === "youtube" && (
              <div className="max-w-4xl mx-auto space-y-6">
                {items.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="md:flex">
                      <div className="md:w-2/5 relative aspect-video bg-black">
                        <video src={item.originalUrl} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="md:w-3/5 p-6">
                        <h3 className="text-xl font-bold mb-2">{item.title || "Vídeo"}</h3>
                        {item.description && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Vídeo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fullscreen Layout */}
            {layoutType === "fullscreen" && (
              <div className="max-w-6xl mx-auto">
                <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ height: "75vh" }}>
                  {items[lightboxIndex || 0]?.mediaType === "photo" ? (
                    <img
                      src={items[lightboxIndex || 0]?.originalUrl}
                      alt={items[lightboxIndex || 0]?.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <VideoPlayer url={items[lightboxIndex || 0]?.originalUrl} />
                  )}
                  
                  {/* Navigation */}
                  <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white"
                      onClick={prevImage}
                      disabled={(lightboxIndex || 0) === 0}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white"
                      onClick={nextImage}
                      disabled={(lightboxIndex || 0) === items.length - 1}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
                
                {/* Thumbnails */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {items.map((item: any, index: number) => (
                    <div
                      key={item.id}
                      className={`relative flex-shrink-0 w-20 h-20 rounded cursor-pointer overflow-hidden ${
                        index === (lightboxIndex || 0) ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setLightboxIndex(index)}
                    >
                      {item.mediaType === "photo" ? (
                        <img
                          src={item.thumbnailUrl || item.previewUrl || item.originalUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-muted">
                          <video
                            src={item.originalUrl}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Video className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>

      {/* Lightbox (for Grid and Masonry layouts) */}
      {lightboxIndex !== null && layoutType !== "fullscreen" && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={prevImage}
            disabled={lightboxIndex === 0}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={nextImage}
            disabled={lightboxIndex === items.length - 1}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          <div className="flex flex-col items-center justify-center max-w-7xl w-full h-[85vh] p-4">
            {items[lightboxIndex]?.mediaType === "photo" ? (
              <img
                src={items[lightboxIndex]?.originalUrl}
                alt={items[lightboxIndex]?.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <div className="w-full max-w-4xl">
                <VideoPlayer url={items[lightboxIndex]?.originalUrl} />
              </div>
            )}
            <div className="text-white text-center mt-4 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold">{items[lightboxIndex]?.title}</h3>
              {items[lightboxIndex]?.description && (
                <p className="text-sm text-gray-300 mt-1">{items[lightboxIndex]?.description}</p>
              )}
              
              {/* Selection and Feedback */}
              {isAuthenticated && (
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => toggleSelection(items[lightboxIndex]?.id)}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        selections[items[lightboxIndex]?.id] ? "fill-red-500 text-red-500" : "text-white"
                      }`}
                    />
                    <span>{selections[items[lightboxIndex]?.id] ? "Remover dos favoritos" : "Marcar como favorita"}</span>
                  </button>
                  
                  <div className="text-left">
                    <label className="block text-sm font-medium mb-2">Palpites de edição (opcional)</label>
                    <textarea
                      value={feedbacks[items[lightboxIndex]?.id] || ""}
                      onChange={(e) => {
                        const newFeedbacks = { ...feedbacks, [items[lightboxIndex]?.id]: e.target.value };
                        setFeedbacks(newFeedbacks);
                      }}
                      onBlur={() => saveFeedback(items[lightboxIndex]?.id, feedbacks[items[lightboxIndex]?.id] || "")}
                      placeholder="Ex: Mudar cor do céu, remover pessoa do fundo, aumentar brilho..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Buy Button (only for photos with price) - Feature removed */}
              {/* {items[lightboxIndex]?.mediaType === "photo" && items[lightboxIndex]?.price && items[lightboxIndex]?.price > 0 && (
                <Button
                  onClick={() => {
                    setSelectedPhoto(items[lightboxIndex]);
                    setBuyPhotoDialogOpen(true);
                  }}
                  className="mt-4"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Comprar Foto - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "GBP" }).format(items[lightboxIndex]?.price)}
                </Button>
              )} */}
            </div>
          </div>
        </div>
      )}

      {/* Buy Photo Dialog - Feature removed */}
      {/* {selectedPhoto && (
        <BuyPhotoDialog
          photo={selectedPhoto}
          basePrice={Math.round((selectedPhoto.price || 0) * 100)} // Convert to cents
          open={buyPhotoDialogOpen}
          onOpenChange={setBuyPhotoDialogOpen}
        />
      )} */}
      
      <Footer />
    </LayoutWrapper>
  );
}
