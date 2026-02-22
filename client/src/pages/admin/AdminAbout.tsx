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

export default function AdminAbout() {
  const { toast } = useToast();
  const { data: aboutData, isLoading } = trpc.about.get.useQuery();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    mainContent: "",
    mission: "",
    vision: "",
    values: "",
    teamDescription: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (aboutData) {
      setFormData({
        title: aboutData.title || "",
        subtitle: aboutData.subtitle || "",
        mainContent: aboutData.mainContent || "",
        mission: aboutData.mission || "",
        vision: aboutData.vision || "",
        values: aboutData.values || "",
        teamDescription: aboutData.teamDescription || "",
        imageUrl: aboutData.imageUrl || "",
      });
    }
  }, [aboutData]);

  const updateAbout = trpc.about.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Saved successfully!",
        description: "About page information has been updated.",
      });
      utils.about.get.invalidate();
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
    updateAbout.mutate(formData);
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
        <h1 className="text-3xl font-bold mb-2">Page Sobre</h1>
        <p className="text-muted-foreground">
          Configure o conteúdo da página "About" do seu site
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Information Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="About Us"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="Our story and purpose"
              />
            </div>

            <div>
              <Label htmlFor="mainContent">Conteúdo Principal</Label>
              <Textarea
                id="mainContent"
                rows={6}
                value={formData.mainContent}
                onChange={(e) =>
                  setFormData({ ...formData, mainContent: e.target.value })
                }
                placeholder="Tell the story of your company, how it started, your values..."
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="max-w-xs rounded border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mission, Vision e Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mission">Mission</Label>
              <Textarea
                id="mission"
                rows={3}
                value={formData.mission}
                onChange={(e) =>
                  setFormData({ ...formData, mission: e.target.value })
                }
                placeholder="Our mission is..."
              />
            </div>

            <div>
              <Label htmlFor="vision">Vision</Label>
              <Textarea
                id="vision"
                rows={3}
                value={formData.vision}
                onChange={(e) =>
                  setFormData({ ...formData, vision: e.target.value })
                }
                placeholder="Our vision is..."
              />
            </div>

            <div>
              <Label htmlFor="values">Valores</Label>
              <Textarea
                id="values"
                rows={3}
                value={formData.values}
                onChange={(e) =>
                  setFormData({ ...formData, values: e.target.value })
                }
                placeholder="Our values are..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="teamDescription">Description da Team</Label>
              <Textarea
                id="teamDescription"
                rows={4}
                value={formData.teamDescription}
                onChange={(e) =>
                  setFormData({ ...formData, teamDescription: e.target.value })
                }
                placeholder="Present your team, experience, specialties..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={updateAbout.isPending}>
            {updateAbout.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
    </DashboardLayout>
  );
}
