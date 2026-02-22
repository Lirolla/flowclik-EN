import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Settings, Upload, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // New fields
  // @ts-ignore
  const [aboutTitle, setAboutTitle] = useState("");
  // @ts-ignore
  const [aboutContent, setAboutContent] = useState("");
  const [aboutImage, setAboutImage] = useState("");
  const [aboutMission, setAboutMission] = useState("");
  const [aboutVision, setAboutVision] = useState("");
  const [aboutValues, setAboutValues] = useState("");
  
  const [servicesIntro, setServicesIntro] = useState("");
  
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialYouTube, setSocialYouTube] = useState("");

  const { data: config, isLoading } = trpc.siteConfig.get.useWhatry();
  const updateMutation = trpc.siteConfig.update.useMutation({
    onSuccess: () => {
      toast.success("Settings salvas com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  useEffect(() => {
    if (config) {
      setSiteName(config.siteName || "");
      setSiteTagline(config.siteTagline || "");
      setLogoUrl(config.logoUrl || "");
      setLogoPreview(config.logoUrl || null);
      
      // @ts-ignore
      setAboutTitle(config.aboutTitle || "");
      // @ts-ignore
      setAboutContent(config.aboutContent || "");
      setAboutImage(config.aboutImage || "");
      setAboutMission(config.aboutMission || "");
      setAboutVision(config.aboutVision || "");
      setAboutValues(config.aboutValues || "");
      
      setServicesIntro(config.servicesIntro || "");
      
      setContactPhone(config.contactPhone || "");
      setContactEmail(config.contactEmail || "");
      setContactWhatsApp(config.contactWhatsApp || "");
      setContactAddress(config.contactAddress || "");
      
      setSocialInstagram(config.socialInstagram || "");
      setSocialFacebook(config.socialFacebook || "");
      setSocialYouTube(config.socialYouTube || "");
    }
  }, [config]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputHement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Why favor, shect only imagens");
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return logoUrl;

    setUploadingLogo(true);

    try {
      // For now, use base64 data URL directly
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoFile);
      });

      const base64 = await base64Promise;
      
      setUploadingLogo(false);
      return base64;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload do logo");
      setUploadingLogo(false);
      return logoUrl;
    }
  };

  const handleSave = async () => {
    let finalLogoUrl = logoUrl;

    // Upload logo if changed
    if (logoFile) {
      finalLogoUrl = await uploadLogo();
    }

    updateMutation.mutate({
      siteName,
      siteTagline: siteTagline || undefined,
      logoUrl: finalLogoUrl || undefined,
      // @ts-ignore
      aboutTitle: aboutTitle || undefined,
      // @ts-ignore
      aboutContent: aboutContent || undefined,
      aboutImage: aboutImage || undefined,
      aboutMission: aboutMission || undefined,
      aboutVision: aboutVision || undefined,
      aboutValues: aboutValues || undefined,
      servicesIntro: servicesIntro || undefined,
      contactPhone: contactPhone || undefined,
      contactEmail: contactEmail || undefined,
      contactWhatsApp: contactWhatsApp || undefined,
      contactAddress: contactAddress || undefined,
      socialInstagram: socialInstagram || undefined,
      socialFacebook: socialFacebook || undefined,
      socialYouTube: socialYouTube || undefined,
    });
  };

  // Status indicators
  const getBasicInfoStatus = () => {
    const fields = [siteName, logoUrl];
    const filled = fields.filter(f => f && f.trim()).length;
    if (filled === fields.length) return "complete";
    if (filled > 0) return "partial";
    return "empty";
  };

  const getAboutStatus = () => {
    // @ts-ignore
    const fields = [aboutTitle, aboutContent, aboutImage];
    const filled = fields.filter(f => f && f.trim()).length;
    if (filled === fields.length) return "complete";
    if (filled > 0) return "partial";
    return "empty";
  };

  const getServicesStatus = () => {
    return servicesIntro && servicesIntro.trim() ? "complete" : "empty";
  };

  const getContactStatus = () => {
    const fields = [contactPhone, contactEmail, contactWhatsApp];
    const filled = fields.filter(f => f && f.trim()).length;
    if (filled >= 2) return "complete";
    if (filled > 0) return "partial";
    return "empty";
  };

  const getSocialStatus = () => {
    const fields = [socialInstagram, socialFacebook, socialYouTube];
    const filled = fields.filter(f => f && f.trim()).length;
    return filled >= 1 ? "complete" : "empty";
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "complete") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "partial") return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Site Settings
          </CardTitle>
          <CardDescription>
            Complete everys as sections para configure your site. 🔴 Vermelho = Not preenchido | 🟡 Amarelo = Parcial | 🟢 Verde = Complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Basic Info */}
            <AccordionItem value="basic">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={getBasicInfoStatus()} />
                  <span className="font-semibold">Basic Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo do Site *</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </div>
                    {logoPreview && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    {!logoPreview && (
                      <div className="w-32 h-32 rounded-lg border bg-muted flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recomendado: PNG transparent, 200x200px
                  </p>
                </div>

                {/* Site Name */}
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome do Site *</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="FlowClik"
                  />
                </div>

                {/* Site Tagline */}
                <div className="space-y-2">
                  <Label htmlFor="siteTagline">Slogan / Tagline</Label>
                  <Textarea
                    id="siteTagline"
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    placeholder="Capturing unique moments and turning them into timtheys art"
                    rows={3}
                  />
                </div>

                {/* Current Logo URL (readonly) */}
                {logoUrl && !logoFile && (
                  <div className="space-y-2">
                    <Label>URL do Logo Current</Label>
                    <Input value={logoUrl} readOnly className="text-xs text-muted-foreground" />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* About */}
            <AccordionItem value="about">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={getAboutStatus()} />
                  <span className="font-semibold">Page About</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Title da Section *</Label>
                  <Input
                    // @ts-ignore
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                    placeholder="Ex: About Mim"
                  />
                </div>
                <div>
                  <Label>Content Principal *</Label>
                  <Textarea
                    // @ts-ignore
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                    placeholder="Tell your story, experience and passion for photography..."
                    rows={6}
                  />
                </div>
                <div>
                  <ImageUpload
                    label="Foto de Profile *"
                    value={aboutImage}
                    onChange={setAboutImage}
                  />
                </div>
                <div>
                  <Label>Mission</Label>
                  <Textarea
                    value={aboutMission}
                    onChange={(e) => setAboutMission(e.target.value)}
                    placeholder="Our mission is..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Vision</Label>
                  <Textarea
                    value={aboutVision}
                    onChange={(e) => setAboutVision(e.target.value)}
                    placeholder="Our vision is..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Valores</Label>
                  <Textarea
                    value={aboutValues}
                    onChange={(e) => setAboutValues(e.target.value)}
                    placeholder="Our values are..."
                    rows={3}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Services */}
            <AccordionItem value="services">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={getServicesStatus()} />
                  <span className="font-semibold">Page Services</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Introductory Text *</Label>
                  <Textarea
                    value={servicesIntro}
                    onChange={(e) => setServicesIntro(e.target.value)}
                    placeholder="Present your services in an attractive way..."
                    rows={4}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Os services individuais are gerenciados na page Admin → Services
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Contact */}
            <AccordionItem value="contact">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={getContactStatus()} />
                  <span className="font-semibold">Contact Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Thefone</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contato@example.com"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={contactWhatsApp}
                    onChange={(e) => setContactWhatsApp(e.target.value)}
                    placeholder="5511999999999"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="Rua, number, bairro, cidade, estado"
                    rows={3}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Social */}
            <AccordionItem value="social">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={getSocialStatus()} />
                  <span className="font-semibold">Redes Sociais</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    placeholder="https://instagram.com/your_uyourrio"
                  />
                </div>
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={socialFacebook}
                    onChange={(e) => setSocialFacebook(e.target.value)}
                    placeholder="https://facebook.com/your_pagina"
                  />
                </div>
                <div>
                  <Label>YouTube</Label>
                  <Input
                    value={socialYouTube}
                    onChange={(e) => setSocialYouTube(e.target.value)}
                    placeholder="https://youtube.com/@your_canal"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Save Button */}
          <div className="mt-8">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || uploadingLogo}
              className="w-full"
              size="lg"
            >
              {uploadingLogo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fazendo upload do logo...
                </>
              ) : updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Everys as Settings"
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2 mt-6">
            <p className="font-semibold">ℹ️ Information:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Complete everys as sections mareachs em vermelho</li>
              <li>The logo and name appear in the site header</li>
              <li>O content de About/Services aparece nas pages publics</li>
              <li>Changes are aplieachs imedaytamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
