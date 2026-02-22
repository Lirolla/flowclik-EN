import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Upload, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle, Camera, Video, Briefcase, Calendar, X, Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
// REMOVIDO: Multi-país (agora 100% Brasil)
// import { COUNTRIES, COUNTRY_LIST, type CountryCode } from "@/lib/currency";
// import { COUNTRY_MAP, CountryInfo } from "../../../../shared/countryUtils";

export default function AdminSettings() {
  return (
    <DashboardLayout>
      <AdminSettingsContent />
    </DashboardLayout>
  );
}

function AdminSettingsContent() {
  // Business Mode
  const [businessMode, setBusinessMode] = useState<"photography_only" | "video_only" | "both">("photography_only");
  const [stockPhotosEnabled, setStockPhotosEnabled] = useState(false);
  
  // Visual Theme
  const [siteThemeLayout, setSiteThemeLayout] = useState<"classic" | "sidebar" | "wedding" | "wedding-videos" | "editorial" | "cinematic">("classic");
  const [siteThemeMode, setSiteThemeMode] = useState<"light" | "dark">("dark");
  const [siteThemeAccentColor, setSiteThemeAccentColor] = useState<"red" | "black" | "blue">("red");

  // Blocked Dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  // Basic Info
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // About fields
  const [aboutTitlePt, setAboutTitle] = useState("");
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
  

  
  // Payment methods
  const [paymentBankTransferEnabled, setPaymentBankTransferEnabled] = useState(false);
  const [paymentBankDetails, setPaymentBankDetails] = useState("");
  const [paymentCashEnabled, setPaymentCashEnabled] = useState(false);
  const [paymentCashInstructions, setPaymentCashInstructions] = useState("");
  const [paymentPixEnabled, setPaymentPixEnabled] = useState(false);
  const [paymentPixKey, setPaymentPixKey] = useState("");
  const [paymentLinkEnabled, setPaymentLinkEnabled] = useState(false);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState("");
  
  // Site Font
  const [siteFont, setSiteFont] = useState<"poppins" | "inter" | "roboto" | "playfair" | "montserrat" | "lato">("inter");
  
  // Parallax settings
  const [parallaxEnabled, setParallaxEnabled] = useState(false);
  const [parallaxImageUrl, setParallaxImageUrl] = useState("");
  const [parallaxTitle, setParallaxTitle] = useState("");
  const [parallaxSubtitle, setParallaxSubtitle] = useState("");
  const [parallaxFile, setParallaxFile] = useState<File | null>(null);
  const [parallaxPreview, setParallaxPreview] = useState<string | null>(null);
  const [uploadingParallax, setUploadingParallax] = useState(false);
  
  // Regional settings (HARDCODED BRASIL)
  const baseCountry = "United Kingdom";
  const baseCurrency = "GBP";
  const currencySymbol = "£";
  const timezone = "Europe/London";
  const phoneCountryCode = "+44";

  const { data: config, isLoading } = trpc.siteConfig.get.useQuery();
  const { data: blockedDates } = trpc.blockedDates.list.useQuery();
  
  const updateConfigMutation = trpc.siteConfig.update.useMutation({
    onSuccess: () => {
      toast.success("Settings salvas com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const uploadImageMutation = trpc.meday.uploadImage.useMutation();

  const updateBusinessModeMutation = trpc.siteConfig.updateBusinessMode.useMutation({
    onSuccess: () => {
      toast.success("Modo de negócio atualizado!");
    },
  });

  const createBlockMutation = trpc.blockedDates.create.useMutation({
    onSuccess: () => {
      toast.success("Período bloqueado com sucesso!");
      setStartDate("");
      setEndDate("");
      setBlockReason("");
    },
  });

  const deleteBlockMutation = trpc.blockedDates.delete.useMutation({
    onSuccess: () => {
      toast.success("Bloqueio removido!");
    },
  });

  const utils = trpc.useUtils();

  useEffect(() => {
    if (config) {
      setBusinessMode(config.businessMode || "photography_only");
      setStockPhotosEnabled(!!config.stockPhotosEnabled);
      
      setSiteThemeLayout(config.siteThemeLayout || "classic");
      setSiteThemeMode(config.siteThemeMode || "dark");
      setSiteThemeAccentColor(config.siteThemeAccentColor || "red");
      setSiteName(config.siteName || "");
      setSiteTagline(config.siteTagline || "");
      setLogoUrl(config.logoUrl || "");
      setLogoPreview(config.logoUrl || null);
      
      setAboutTitle((config as any).aboutTitle || "");
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

      
      setPaymentBankTransferEnabled(!!config.paymentBankTransferEnabled);
      setPaymentBankDetails(config.paymentBankDetails || "");
      setPaymentCashEnabled(!!config.paymentCashEnabled);
      setPaymentCashInstructions(config.paymentCashInstructions || "");
      setPaymentPixEnabled(!!(config as any).paymentPixEnabled);
      setPaymentPixKey((config as any).paymentPixKey || "");
      setPaymentLinkEnabled(!!(config as any).paymentLinkEnabled);
      setPaymentLinkUrl((config as any).paymentLinkUrl || "");
      
      setSiteFont((config.siteFont as "poppins" | "inter" | "roboto" | "playfair" | "montserrat" | "lato") || "inter");
      
      setParallaxEnabled(!!config.parallaxEnabled);
      setParallaxImageUrl(config.parallaxImageUrl || "");
      setParallaxTitle(config.parallaxTitle || "");
      setParallaxSubtitle(config.parallaxSubtitle || "");
      setParallaxPreview(config.parallaxImageUrl || null);
      
      // Regional settings (hardcoded Brasil - sem setters)
    }
  }, [config]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, select apenas imagens");
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

    updateConfigMutation.mutate({
      siteName,
      siteTagline: siteTagline || undefined,
      logoUrl: finalLogoUrl || undefined,
      aboutTitle: aboutTitlePt || undefined,
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

      
      paymentBankTransferEnabled,
      paymentBankDetails: paymentBankDetails || undefined,
      paymentCashEnabled,
      paymentCashInstructions: paymentCashInstructions || undefined,
      paymentPixEnabled,
      paymentPixKey: paymentPixKey || undefined,
      paymentLinkEnabled,
      // Link de Pagamento salvo
      
      // Appearance do Site
      siteThemeLayout,
      siteThemeMode,
      siteThemeAccentColor,
      siteFont,
      
      parallaxEnabled,
      parallaxImageUrl: parallaxImageUrl || undefined,
      parallaxTitle: parallaxTitle || undefined,
      
      // Regional settings (hardcoded Brasil)
      baseCountry: "United Kingdom",
      baseCurrency: "GBP",
      currencySymbol: "£",
      timezone: "Europe/London",
      phoneCountryCode: "+44",
      parallaxSubtitle: parallaxSubtitle || undefined,
    });
  };

  const handleBusinessModeChange = (mode: "photography_only" | "video_only" | "both") => {
    setBusinessMode(mode);
    updateBusinessModeMutation.mutate({ businessMode: mode });
    utils.siteConfig.get.invalidate();
  };

  const handleAddBlock = () => {
    if (!startDate || !endDate) {
      toast.error("Preencha as datas de início e fim");
      return;
    }

    createBlockMutation.mutate({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: blockReason || undefined,
    });
    utils.blockedDates.list.invalidate();
  };

  const handleDeleteBlock = (id: number) => {
    deleteBlockMutation.mutate({ id });
    utils.blockedDates.list.invalidate();
  };

  // Status indicators
  const getBusinessModeStatus = () => {
    return businessMode ? "complete" : "empty";
  };

  const getBasicInfoStatus = () => {
    const fields = [siteName, logoUrl];
    const filled = fields.filter(f => f && f.trim()).length;
    if (filled === fields.length) return "complete";
    if (filled > 0) return "partial";
    return "empty";
  };

  const getAboutStatus = () => {
    // @ts-ignore
    const fields = [aboutTitlePt, aboutContent, aboutImage];
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
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Site Settings
          </CardTitle>
          <CardDescription>
            Complete todas as seções para configurar seu site. 🔴 Vermelho = Não preenchido | 🟡 Amarelo = Parcial | 🟢 Verde = Completo
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Accordion de Settings */}
      <Card>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {/* Business Mode */}
            <AccordionItem value="business-mode">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={getBusinessModeStatus()} />
                  <Briefcase className="w-5 h-5" />
                  <span className="font-semibold">Modo de Negócio</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="space-y-4">
                  <Label>Escolha o tipo de serviço que you oferece</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleBusinessModeChange("photography_only")}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        businessMode === "photography_only"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-border hover:border-blue-300"
                      }`}
                    >
                      <Camera className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                      <h3 className="font-semibold mb-2">Só Fotografia</h3>
                      <p className="text-sm text-muted-foreground">
                        Foco em photography services
                      </p>
                    </button>

                    <button
                      onClick={() => handleBusinessModeChange("video_only")}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        businessMode === "video_only"
                          ? "border-red-500 bg-red-50 dark:bg-red-950"
                          : "border-border hover:border-red-300"
                      }`}
                    >
                      <Video className="w-12 h-12 mx-auto mb-3 text-red-600" />
                      <h3 className="font-semibold mb-2">Só Video</h3>
                      <p className="text-sm text-muted-foreground">
                        Foco em produção de videos
                      </p>
                    </button>

                    <button
                      onClick={() => handleBusinessModeChange("both")}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        businessMode === "both"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                          : "border-border hover:border-purple-300"
                      }`}
                    >
                      <div className="flex justify-center gap-2 mb-3">
                        <Camera className="w-10 h-10 text-blue-600" />
                        <Video className="w-10 h-10 text-red-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Fotografia + Video</h3>
                      <p className="text-sm text-muted-foreground">
                        Ofereço ambos os serviços
                      </p>
                    </button>
                  </div>

                  {/* Stock Photos Toggle */}
                  <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold">Ativar Stock Photos</Label>
                        <p className="text-sm text-muted-foreground">
                          Habilite uma página pública para vender fotos avulsas
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const newValue = !stockPhotosEnabled;
                          setStockPhotosEnabled(newValue);
                          updateConfigMutation.mutate({ stockPhotosEnabled: newValue });
                          utils.siteConfig.get.invalidate();
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          stockPhotosEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            stockPhotosEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Appearance */}
            <AccordionItem value="appearance">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status="complete" />
                  <span className="font-semibold">Appearance do Site</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="space-y-6">
                  {/* Layout */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Estilo de Layout</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setSiteThemeLayout("classic")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeLayout === "classic"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                            : "border-border hover:border-purple-300"
                        }`}
                      >
                        <h3 className="font-semibold mb-2">📰 Clássico</h3>
                        <p className="text-sm text-muted-foreground">
                          Menu horizontal no topo
                        </p>
                      </button>
                      <button
                        onClick={() => setSiteThemeLayout("sidebar")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeLayout === "sidebar"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                            : "border-border hover:border-purple-300"
                        }`}
                      >
                        <h3 className="font-semibold mb-2">📱 Barra Lateral</h3>
                        <p className="text-sm text-muted-foreground">
                          Menu fixo na lateral
                        </p>
                      </button>
                      <button
                        onClick={() => setSiteThemeLayout("wedding")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeLayout === "wedding"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                            : "border-border hover:border-purple-300"
                        }`}
                      >
                        <h3 className="font-semibold mb-2">💒 Casamento</h3>
                        <p className="text-sm text-muted-foreground">
                          Fullscreen hero sections
                        </p>
                      </button>
                      <button
                        onClick={() => setSiteThemeLayout("wedding-videos")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeLayout === "wedding-videos"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                            : "border-border hover:border-purple-300"
                        }`}
                      >
                        <h3 className="font-semibold mb-2">🎥 Wedding Videos</h3>
                        <p className="text-sm text-muted-foreground">
                          Rosa/dourado elegante (cores fixas)
                        </p>
                      </button>
                      <button
                        onClick={() => setSiteThemeLayout("editorial")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeLayout === "editorial"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                            : "border-border hover:border-purple-300"
                        }`}
                      >
                        <h3 className="font-semibold mb-2">✦ Editorial</h3>
                        <p className="text-sm text-muted-foreground">
                          Tipografia bold, menu fullscreen (cores fixas)
                        </p>
                      </button>
                      <button
                        onClick={() => setSiteThemeLayout("cinematic")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeLayout === "cinematic"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                            : "border-border hover:border-purple-300"
                        }`}
                      >
                        <h3 className="font-semibold mb-2">🎬 Cinematic</h3>
                        <p className="text-sm text-muted-foreground">
                          Elegante estilo cinema, âmbar/cobre (cores fixas)
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Tema */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Tema de Cores</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setSiteThemeMode("light")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeMode === "light"
                            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                            : "border-border hover:border-yellow-300"
                        }`}
                      >
                        <h3 className="font-semibold mb-2">☀️ Claro</h3>
                        <p className="text-sm text-muted-foreground">
                          Fundo branco, texto preto
                        </p>
                      </button>
                      <button
                        onClick={() => setSiteThemeMode("dark")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeMode === "dark"
                            ? "border-gray-500 bg-gray-50 dark:bg-gray-950"
                            : "border-border hover:border-gray-300"
                        }`}
                      >
                        <h3 className="font-semibold mb-2">🌙 Escuro</h3>
                        <p className="text-sm text-muted-foreground">
                          Fundo preto, texto branco
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Cor de Destaque */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Cor de Destaque</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setSiteThemeAccentColor("red")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeAccentColor === "red"
                            ? "border-red-500 bg-red-50 dark:bg-red-950"
                            : "border-border hover:border-red-300"
                        }`}
                      >
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-600"></div>
                        <h3 className="font-semibold text-sm">Vermelho</h3>
                      </button>
                      <button
                        onClick={() => setSiteThemeAccentColor("black")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeAccentColor === "black"
                            ? "border-gray-800 bg-gray-50 dark:bg-gray-950"
                            : "border-border hover:border-gray-300"
                        }`}
                      >
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-black"></div>
                        <h3 className="font-semibold text-sm">Preto</h3>
                      </button>
                      <button
                        onClick={() => setSiteThemeAccentColor("blue")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          siteThemeAccentColor === "blue"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-border hover:border-blue-300"
                        }`}
                      >
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-600"></div>
                        <h3 className="font-semibold text-sm">Azul</h3>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Site Font */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Fonte do Site</h3>
                    <p className="text-sm text-muted-foreground">Escolha a tipografia principal do seu site</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSiteFont("poppins")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        siteFont === "poppins"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-semibold text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>Poppins</h3>
                      <p className="text-xs text-muted-foreground mt-1">Modern and clean</p>
                    </button>
                    <button
                      onClick={() => setSiteFont("inter")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        siteFont === "inter"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-semibold text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Inter</h3>
                      <p className="text-xs text-muted-foreground mt-1">Professional</p>
                    </button>
                    <button
                      onClick={() => setSiteFont("roboto")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        siteFont === "roboto"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-semibold text-base" style={{ fontFamily: "'Roboto', sans-serif" }}>Roboto</h3>
                      <p className="text-xs text-muted-foreground mt-1">Classic</p>
                    </button>
                    <button
                      onClick={() => setSiteFont("playfair")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        siteFont === "playfair"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>Playfair</h3>
                      <p className="text-xs text-muted-foreground mt-1">Elegant</p>
                    </button>
                    <button
                      onClick={() => setSiteFont("montserrat")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        siteFont === "montserrat"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-semibold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>Montserrat</h3>
                      <p className="text-xs text-muted-foreground mt-1">Geometric</p>
                    </button>
                    <button
                      onClick={() => setSiteFont("lato")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        siteFont === "lato"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-semibold text-base" style={{ fontFamily: "'Lato', sans-serif" }}>Lato</h3>
                      <p className="text-xs text-muted-foreground mt-1">Friendly</p>
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Basic Info */}
            <AccordionItem value="basic">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={getBasicInfoStatus()} />
                  <span className="font-semibold">Informações Básicas</span>
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
                    Recomendado: PNG transparente, 200x200px
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
                    placeholder="Capturando momentos únicos e transformando-os em arte atemporal"
                    rows={3}
                  />
                </div>

                {/* REMOVIDO: Settings Regionais (agora hardcoded Brasil) */}

                {/* Current Logo URL (readonly) */}
                {logoUrl && !logoFile && (
                  <div className="space-y-2">
                    <Label>URL do Logo Atual</Label>
                    <Input value={logoUrl} readOnly className="text-xs text-muted-foreground" />
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Salvar Informações Básicas
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* About */}
            <AccordionItem value="about">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={getAboutStatus()} />
                  <span className="font-semibold">Page Sobre</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Title da Seção *</Label>
                  <Input
                    value={aboutTitlePt}
                    onChange={(e) => setAboutTitle(e.target.value)}
                    placeholder="Ex: Sobre Mim"
                  />
                </div>
                <div>
                  <Label>Conteúdo Principal *</Label>
                  <Textarea
                    // @ts-ignore
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                    placeholder="Conte sua história, experiência e paixão pela fotografia..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Foto de Profile *</Label>
                  <div className="mt-2">
                    {aboutImage ? (
                      <div className="relative inline-block">
                        <img
                          src={aboutImage}
                          alt="Foto de profile"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => setAboutImage("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              try {
                                const base64 = (reader.result as string).split(',')[1];
                                const result = await uploadImageMutation.mutateAsync({
                                  filename: file.name,
                                  contentType: file.type,
                                  data: base64,
                                });
                                setAboutImage(result.url);
                                toast.success("Foto enviada com sucesso!");
                              } catch (error: any) {
                                toast.error(`Erro ao enviar foto: ${error.message}`);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
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
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Salvar Sobre
                  </Button>
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
                  <Label>Texto Introdutório *</Label>
                  <Textarea
                    value={servicesIntro}
                    onChange={(e) => setServicesIntro(e.target.value)}
                    placeholder="Apresente seus serviços de forma atraente..."
                    rows={4}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Os serviços individuais são gerenciados na página Admin → Services
                </p>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Salvar Services
                  </Button>
                </div>
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
                  <Label>Telefone</Label>
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
                    placeholder="contato@exemplo.com"
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
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Salvar Contato
                  </Button>
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
                    placeholder="https://instagram.com/seu_usuario"
                  />
                </div>
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={socialFacebook}
                    onChange={(e) => setSocialFacebook(e.target.value)}
                    placeholder="https://facebook.com/sua_pagina"
                  />
                </div>
                <div>
                  <Label>YouTube</Label>
                  <Input
                    value={socialYouTube}
                    onChange={(e) => setSocialYouTube(e.target.value)}
                    placeholder="https://youtube.com/@seu_canal"
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Salvar Redes Sociais
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Parallax Full-Screen */}
            <AccordionItem value="parallax">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status={parallaxEnabled && parallaxImageUrl ? "complete" : "empty"} />
                  <ImageIcon className="w-5 h-5" />
                  <span className="font-semibold">Parallax Full-Screen</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    checked={parallaxEnabled}
                    onChange={(e) => setParallaxEnabled(e.target.checked)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <Label className="cursor-pointer">Ativar seção parallax na Home</Label>
                </div>
                
                {parallaxEnabled && (
                  <>
                    <div>
                      <Label>Imagem de Fundo</Label>
                      <div className="mt-2">
                        {parallaxImageUrl ? (
                          <div className="relative">
                            <img
                              src={parallaxImageUrl}
                              alt="Imagem parallax"
                              className="w-full max-w-md aspect-video object-cover rounded-lg border-2 border-border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                              onClick={() => {
                                setParallaxImageUrl("");
                                setParallaxPreview(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full max-w-md aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <Upload className="w-12 h-12 mb-2 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Clique para fazer upload</span>
                            <span className="text-xs text-muted-foreground mt-1">Alta resolução (1920x1080 ou maior)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  try {
                                    const base64 = (reader.result as string).split(',')[1];
                                    const result = await uploadImageMutation.mutateAsync({
                                      filename: file.name,
                                      contentType: file.type,
                                      data: base64,
                                    });
                                    setParallaxImageUrl(result.url);
                                    setParallaxPreview(result.url);
                                    toast.success("Imagem enviada com sucesso!");
                                  } catch (error: any) {
                                    toast.error(`Erro ao enviar imagem: ${error.message}`);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Title Principal</Label>
                      <Input
                        value={parallaxTitle}
                        onChange={(e) => setParallaxTitle(e.target.value)}
                        placeholder="Ex: Capturando Momentos Únicos"
                      />
                    </div>
                    
                    <div>
                      <Label>Subtítulo</Label>
                      <Textarea
                        value={parallaxSubtitle}
                        onChange={(e) => setParallaxSubtitle(e.target.value)}
                        placeholder="Ex: Transformamos seus momentos especiais em memórias eternas"
                        rows={2}
                      />
                    </div>
                  </>
                )}
                
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-2">ℹ️ Sobre Parallax</p>
                  <p className="text-muted-foreground">
                    O efeito parallax cria uma seção full-screen com imagem de fundo fixa que dá profundidade ao site. 
                    Ideal para destacar sua marca ou mensagem principal.
                  </p>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Salvar Parallax
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Formas de Pagamento */}
            <AccordionItem value="payment-methods">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <StatusIcon status="complete" />
                  <span className="font-semibold">💳 Formas de Pagamento</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                {/* Bank Transfer */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🏦</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Bank Transfer / Depósito</h4>
                        <p className="text-sm text-muted-foreground">Pagamento direto na conta</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {paymentBankTransferEnabled ? "Ativado" : "Desativado"}
                      </span>
                      <input
                        type="checkbox"
                        checked={paymentBankTransferEnabled}
                        onChange={(e) => setPaymentBankTransferEnabled(e.target.checked)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </div>
                  </div>
                  {paymentBankTransferEnabled && (
                    <div className="mt-3">
                      <Label>Dados Bancários</Label>
                      <Textarea
                        value={paymentBankDetails}
                        onChange={(e) => setPaymentBankDetails(e.target.value)}
                        placeholder="Banco: [Nome do Banco]&#10;Agência: [0000]&#10;Conta: [00000-0]&#10;Titular: [Seu Nome]&#10;CPF/CNPJ: [000.000.000-00]"
                        rows={5}
                      />
                    </div>
                  )}
                </div>
                
                {/* Dinheiro */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">💵</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Dinheiro</h4>
                        <p className="text-sm text-muted-foreground">Pagamento em espécie</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {paymentCashEnabled ? "Ativado" : "Desativado"}
                      </span>
                      <input
                        type="checkbox"
                        checked={paymentCashEnabled}
                        onChange={(e) => setPaymentCashEnabled(e.target.checked)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </div>
                  </div>
                  {paymentCashEnabled && (
                    <div className="mt-3">
                      <Label>Instruções de Pagamento em Dinheiro</Label>
                      <Textarea
                        value={paymentCashInstructions}
                        onChange={(e) => setPaymentCashInstructions(e.target.value)}
                        placeholder="Ex: Pagamento em dinheiro pode ser feito no day do ensaio ou na entrega das fotos. Aceitamos parcelamento em until 3x sem juros."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
                
                {/* PIX */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">💲</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">PIX</h4>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {paymentPixEnabled ? "Ativado" : "Desativado"}
                      </span>
                      <input
                        type="checkbox"
                        checked={paymentPixEnabled}
                        onChange={(e) => setPaymentPixEnabled(e.target.checked)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </div>
                  </div>
                  {paymentPixEnabled && (
                    <div className="mt-3">
                      <Label>Chave PIX</Label>
                      <Input
                        value={paymentPixKey}
                        onChange={(e) => setPaymentPixKey(e.target.value)}
                        placeholder="email@exemplo.com ou CPF/CNPJ ou telefone ou chave aleatória"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Insira sua chave PIX (CPF, CNPJ, e-mail, telefone ou chave aleatória)
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Link de Pagamento */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">💳</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Link de Pagamento</h4>
                        <p className="text-sm text-muted-foreground">Envie link de pagamento para seus clientes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {paymentLinkEnabled ? "Ativado" : "Desativado"}
                      </span>
                      <input
                        type="checkbox"
                        checked={paymentLinkEnabled}
                        onChange={(e) => setPaymentLinkEnabled(e.target.checked)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Salvar Formas de Pagamento
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Info */}
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2 mt-6">
            <p className="font-semibold">ℹ️ Informações:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Complete todas as seções marcadas em vermelho</li>
              <li>O modo de negócio define quais serviços aparecem no site</li>
              <li>Bloqueios de data impedem agendamentos nos períodos escolhidos</li>
              <li>O logo e nome aparecem no cabeçalho do site</li>
              <li>O conteúdo de Sobre/Services aparece nas páginas públicas</li>
              <li>Alterações são aplicadas imedaytamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Bloqueio de Datas - Card Horizontal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5 text-orange-600" />
            Bloqueio de Datas
            {blockedDates && blockedDates.length > 0 && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                {blockedDates.length} período(s)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bloqueie períodos em que you não estará available para agendamentos (férias, viagens, etc)
            </p>
            
            {/* Formulário horizontal */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <Label className="text-sm">Data de Início</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <Label className="text-sm">Data de Fim</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm">Motivo (optional)</Label>
                <Input
                  placeholder="Ex: Férias, Viagem"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
              <Button onClick={handleAddBlock} disabled={createBlockMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Lista de bloqueios */}
            {blockedDates && blockedDates.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Períodos Bloqueados:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {blockedDates.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {new Date(block.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })} - {new Date(block.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}
                        </p>
                        {block.reason && (
                          <p className="text-xs text-muted-foreground truncate">{block.reason}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBlock(block.id)}
                        disabled={deleteBlockMutation.isPending}
                        className="ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
