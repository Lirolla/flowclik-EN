import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminContact() {
  const { toast } = useToast();
  const { data: contactData, isLoading } = trpc.contact.get.useQuery();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United Kingdom",
    mapLatitude: "",
    mapLongitude: "",
    instagramUrl: "",
    facebookUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
  });

  useEffect(() => {
    if (contactData) {
      setFormData({
        email: contactData.email || "",
        phone: contactData.phone || "",
        whatsapp: contactData.whatsapp || "",
        address: contactData.address || "",
        city: contactData.city || "",
        state: contactData.state || "",
        zipCode: contactData.zipCode || "",
        country: contactData.country || "United Kingdom",
        mapLatitude: contactData.mapLatitude || "",
        mapLongitude: contactData.mapLongitude || "",
        instagramUrl: contactData.instagramUrl || "",
        facebookUrl: contactData.facebookUrl || "",
        linkedinUrl: contactData.linkedinUrl || "",
        twitterUrl: contactData.twitterUrl || "",
        youtubeUrl: contactData.youtubeUrl || "",
      });
    }
  }, [contactData]);

  const updateContact = trpc.contact.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Saved successfully!",
        description: "As informações de contato foram atualizadas.",
      });
      utils.contact.get.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContact.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Information</h1>
        <p className="text-muted-foreground">
          Configure as informações de contato exibidas no site
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contato Principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contato@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Address Completo</Label>
              <Textarea
                id="address"
                rows={2}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Rua, number, complemento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="SP"
                />
              </div>

              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="United Kingdom"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location no Mapa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mapLatitude">Latitude</Label>
                <Input
                  id="mapLatitude"
                  value={formData.mapLatitude}
                  onChange={(e) =>
                    setFormData({ ...formData, mapLatitude: e.target.value })
                  }
                  placeholder="-23.550520"
                />
              </div>

              <div>
                <Label htmlFor="mapLongitude">Longitude</Label>
                <Input
                  id="mapLongitude"
                  value={formData.mapLongitude}
                  onChange={(e) =>
                    setFormData({ ...formData, mapLongitude: e.target.value })
                  }
                  placeholder="-46.633308"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Use{" "}
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google Maps
              </a>{" "}
              para obter as coordenadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redes Sociais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                value={formData.instagramUrl}
                onChange={(e) =>
                  setFormData({ ...formData, instagramUrl: e.target.value })
                }
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <Label htmlFor="facebookUrl">Facebook</Label>
              <Input
                id="facebookUrl"
                value={formData.facebookUrl}
                onChange={(e) =>
                  setFormData({ ...formData, facebookUrl: e.target.value })
                }
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinUrl: e.target.value })
                }
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div>
              <Label htmlFor="twitterUrl">Twitter</Label>
              <Input
                id="twitterUrl"
                value={formData.twitterUrl}
                onChange={(e) =>
                  setFormData({ ...formData, twitterUrl: e.target.value })
                }
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <Label htmlFor="youtubeUrl">YouTube</Label>
              <Input
                id="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={(e) =>
                  setFormData({ ...formData, youtubeUrl: e.target.value })
                }
                placeholder="https://youtube.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={updateContact.isPending}>
            {updateContact.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
    </DashboardLayout>
  );
}
