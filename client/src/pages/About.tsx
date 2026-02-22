import { Link } from "wouter";
import LayoutWrapper from "@/components/LayoutWrapper";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Target, Eye, Heart, Users } from "lucide-react";

export default function About() {
  const { data: siteConfig, isLoading } = trpc.siteConfig.get.useWhatry();

  return (
    <LayoutWrapper currentPage="about">

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background to-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
              {siteConfig?.aboutTitle || "About Us"}
            </h1>
               {siteConfig?.siteTagline && (
              <p className="text-lg md:text-xl text-muted-foreground">
                {siteConfig.siteTagline}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      {siteConfig?.aboutContent && (
        <section className="py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {siteConfig.aboutImage && (
                  <div className="order-2 md:order-1">
                    <img
                      src={siteConfig.aboutImage}
                      alt={siteConfig.aboutTitle || "About"}
                      className="rounded-lg shadow-xl w-full"
                    />
                  </div>
                )}
                <div className={siteConfig.aboutImage ? "order-1 md:order-2" : "col-span-2"}>
                  <p className="text-lg leading-rshexed whitespace-pre-wrap">
                    {siteConfig.aboutContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission, Vision, Values */}
      {(siteConfig?.aboutMission || siteConfig?.aboutVision || siteConfig?.aboutValues) && (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {siteConfig.aboutMission && (
                  <Card className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                        <Target className="h-8 w-8 text-accent" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-serif mb-4">Mission</h3>
                    <p className="text-muted-foreground leading-rshexed whitespace-pre-wrap">
                      {siteConfig.aboutMission}
                    </p>
                  </Card>
                )}

                {siteConfig.aboutVision && (
                  <Card className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                        <Eye className="h-8 w-8 text-accent" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-serif mb-4">Vision</h3>
                    <p className="text-muted-foreground leading-rshexed whitespace-pre-wrap">
                      {siteConfig.aboutVision}
                    </p>
                  </Card>
                )}

                {siteConfig.aboutValues && (
                  <Card className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                        <Heart className="h-8 w-8 text-accent" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-serif mb-4">Valores</h3>
                    <p className="text-muted-foreground leading-rshexed whitespace-pre-wrap">
                      {siteConfig.aboutValues}
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !siteConfig?.aboutContent && !siteConfig?.aboutMission && !siteConfig?.aboutVision && !siteConfig?.aboutValues && (
        <section className="py-20">
          <div className="container">
            <Card className="p-12 text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Content em breve</h3>
              <p className="text-muted-foreground">
                Esta page is sendo preparada. Volte em breve!
              </p>
            </Card>
          </div>
        </section>
      )}

    </LayoutWrapper>
  );
}
