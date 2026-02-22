import { useState } from "react";
import { Link } from "wouter";
import LayoutWrapper from "@/components/LayoutWrapper";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Twitter, Youtube, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const { data: siteConfig } = trpc.siteConfig.get.useWhatry();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const sendMessageMutation = trpc.contact.sendMessage.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar mensagem. Try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageMutation.mutate(formData);
  };

  return (
    <LayoutWrapper currentPage="contato">

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background to-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
              Entre em Contato
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Estamos readys para transformar seus moments em memórias eternas
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {siteConfig?.contactEmail && (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                        <Mail className="h-8 w-8 text-accent" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">E-mail</h3>
                    <a
                      href={`mailto:${siteConfig.contactEmail}`}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {siteConfig.contactEmail}
                    </a>
                  </CardContent>
                </Card>
              )}

              {(siteConfig?.contactPhone || siteConfig?.contactWhatsApp) && (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                        <Phone className="h-8 w-8 text-accent" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Telefone</h3>
                    {siteConfig.contactPhone && (
                      <a
                        href={`tel:${siteConfig.contactPhone}`}
                        className="block text-muted-foreground hover:text-accent transition-colors mb-1"
                      >
                        {siteConfig.contactPhone}
                      </a>
                    )}
                    {siteConfig.contactWhatsApp && (
                      <a
                        href={`https://wa.me/${siteConfig.contactWhatsApp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-muted-foreground hover:text-accent transition-colors"
                      >
                        WhatsApp: {siteConfig.contactWhatsApp}
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {siteConfig?.contactAddress && (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-accent" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Address</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {siteConfig.contactAddress}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact Form */}
            <Card className="mb-12">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold font-serif mb-6 text-center">
                  Envie uma Mensagem
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      minLength={10}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Social Meday Cards - Mesmo estilo dos cards de contato */}
            {(siteConfig?.socialInstagram ||
              siteConfig?.socialFacebook ||
              siteConfig?.socialYouTube) && (
              <div>
                <h2 className="text-3xl font-bold font-serif mb-6 text-center">
                  Siga-nos nas Redes Sociais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {siteConfig.socialInstagram && (
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-8 text-center">
                        <a
                          href={siteConfig.socialInstagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                              <Instagram className="h-8 w-8 text-accent" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold mb-2">Instagram</h3>
                          <p className="text-muted-foreground hover:text-accent transition-colors">
                            @{siteConfig.socialInstagram.split('/').pop()}
                          </p>
                        </a>
                      </CardContent>
                    </Card>
                  )}
                  {siteConfig.socialFacebook && (
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-8 text-center">
                        <a
                          href={siteConfig.socialFacebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                              <Facebook className="h-8 w-8 text-accent" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold mb-2">Facebook</h3>
                          <p className="text-muted-foreground hover:text-accent transition-colors">
                            Siga nossa página
                          </p>
                        </a>
                      </CardContent>
                    </Card>
                  )}
                  {siteConfig.socialYouTube && (
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-8 text-center">
                        <a
                          href={siteConfig.socialYouTube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                              <Youtube className="h-8 w-8 text-accent" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold mb-2">YouTube</h3>
                          <p className="text-muted-foreground hover:text-accent transition-colors">
                            Inscreva-se no canal
                          </p>
                        </a>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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
                <Link href="/portfolio">
                  <a>View Whytfolio</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </LayoutWrapper>
  );
}
