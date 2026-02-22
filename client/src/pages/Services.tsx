import { Link } from "wouter";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/hooks/useCurrency";
import { SITE_ROUTES } from "@/lib/siteRoutes";

export default function Services() {
  const { data: services, isLoading } = trpc.services.getActive.useQuery();
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const { format } = useCurrency();

  return (
    <LayoutWrapper currentPage="servicos">

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background to-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
              Nossos Serviços
            </h1>
            {siteConfig?.servicesIntro && (
              <p className="text-lg md:text-xl text-muted-foreground whitespace-pre-wrap">
                {siteConfig.servicesIntro}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-8 animate-pulse">
                  <div className="h-8 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </Card>
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: any) => (
                <Card
                  key={service.id}
                  className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-accent"
                >
                  <h3 className="text-2xl font-bold font-serif mb-4">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-6">
                    {service.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-accent" />
                        <span>{service.duration} minutos</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent" />
                      <span>Profissionais experientes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent" />
                      <span>Equipamento de alta qualidade</span>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        A partir de
                      </span>
                      <div className="text-3xl font-bold">
                        {format(service.price)}
                      </div>
                    </div>

                    <Button asChild className="w-full" size="lg">
                      <Link href="/agendar">
                        <a>Agendar Agora</a>
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Serviços em breve
              </h3>
              <p className="text-muted-foreground mb-6">
                Estamos preparando nossos serviços. Volte em breve!
              </p>
              <Button asChild>
                <Link href={SITE_ROUTES.home()}>
                  <a>Voltar ao Início</a>
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold font-serif mb-6">
              Pronto para começar?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Entre em contato conosco para discutir seu projeto e receber um
              orçamento personalizado
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/contato">
                  <a>Falar Conosco</a>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/galerias">
                  <a>Ver Portfólio</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </LayoutWrapper>
  );
}
