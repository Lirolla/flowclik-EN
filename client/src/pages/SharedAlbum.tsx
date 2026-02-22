import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, Download, Mail } from "lucide-react";

export default function SharedAlbum() {
  console.log('=== SharedAlbum RENDERING ===');
  
  const [, params] = useRoute("/shared-album/:slug");
  const slug = params?.slug || "";
  console.log('Slug:', slug);
  
  const { toast } = useToast();
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");

  const registerGuestMutation = trpc.appointments.registerGuest.useMutation({
    onSuccess: () => {
      console.log('Guest registered successfully');
      setEmailSubmitted(true);
      toast({
        title: "Bem-vindo!",
        description: "Você agora tem acesso ao álbum.",
      });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar seu email.",
        variant: "destructive",
      });
    },
  });

  const { data: appointment, isLoading } = trpc.appointments.getBySlug.useQuery(
    { slug },
    { enabled: emailSubmitted && !!slug }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', { email, name, relationship, slug });
    
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email.",
        variant: "destructive",
      });
      return;
    }

    registerGuestMutation.mutate({
      slug,
      email,
      name: name || undefined,
      relationship: relationship || undefined,
    });
  };

  // Email Wall
  if (!emailSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-gray-800">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white mb-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              Álbum Especial
            </h2>
            <p className="text-gray-400 text-sm">
              Para visualizar este álbum, por favor informe seu email.
              Você receberá atualizações quando novas fotos forem adicionadas!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="name" className="text-white">Nome (opcional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="relationship" className="text-white">Relação (opcional)</Label>
              <Input
                id="relationship"
                type="text"
                placeholder="Ex: Amigo, Família, Colega"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={registerGuestMutation.isPending}
            >
              <Mail className="w-4 h-4 mr-2" />
              {registerGuestMutation.isPending ? "Verificando..." : "Ver Álbum"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando álbum...</div>
      </div>
    );
  }

  // Album not found
  if (!appointment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Álbum não encontrado</h1>
          <p className="text-gray-400">O link pode estar incorreto ou o álbum foi removido.</p>
        </div>
      </div>
    );
  }

  const finalPhotos = appointment.photos || [];
  
  // Escolher foto aleatória para o banner hero
  const randomPhoto = finalPhotos.length > 0 
    ? finalPhotos[Math.floor(Math.random() * finalPhotos.length)]
    : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Banner Hero Fullscreen com foto aleatória */}
      {randomPhoto && (
        <div className="relative h-screen w-full overflow-hidden">
          {/* Foto de fundo */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${randomPhoto.photoUrl})` }}
          />
          
          {/* Overlay escuro para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
          
          {/* Conteúdo sobreposto */}
          <div className="relative h-full flex flex-col items-center justify-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 text-center drop-shadow-2xl">
              {appointment.clientName}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 text-center drop-shadow-lg">
              Álbum Especial
            </p>
            
            {/* Seta para scroll */}
            <div className="absolute bottom-8 animate-bounce">
              <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Grid de fotos */}
      <div className="container mx-auto px-4 py-16">
        {finalPhotos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              Ainda não há fotos finais disponíveis.
              Você receberá um email quando forem adicionadas!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Galeria Completa
              </h2>
              <p className="text-gray-400">
                {finalPhotos.length} {finalPhotos.length === 1 ? 'foto' : 'fotos'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {finalPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden group">
                  <img
                    src={photo.photoUrl}
                    alt={`Foto ${photo.id}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
