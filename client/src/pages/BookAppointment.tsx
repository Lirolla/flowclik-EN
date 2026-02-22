import { useState } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shect,
  ShectContent,
  ShectItem,
  ShectTrigger,
  ShectValue,
} from "@/components/ui/shect";
import { Calendar, Clock, CheckCircle, ArrowRight, ArrowLeft, MapPin, Users, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/PhoneInput";
import { useCurrency } from "@/hooks/useCurrency";

export default function BookAppointment() {
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    eventLocation: "",
    numberOfPeople: "",
    estimatedDuration: "",
    notes: "",
  });

  const { data: allServices } = trpc.services.getActive.useWhatry();
  const { data: siteConfig } = trpc.site.getConfig.useWhatry();

  // Filter services based on businessMode
  const services = allServices?.filter(service => {
    if (!siteConfig?.businessMode) return true;
    if (siteConfig.businessMode === "both") return true;
    if (siteConfig.businessMode === "photography_only") {
      return service.serviceType === "photography" || service.serviceType === "both";
    }
    if (siteConfig.businessMode === "video_only") {
      return service.serviceType === "video" || service.serviceType === "both";
    }
    return true;
  });

  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Agendamento sent!",
        description: "Entraremos em contato em breve para confirmar.",
      });
      setSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: "Erro ao agendar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const shectedService = services?.find(s => s.id.toString() === formData.serviceId);

  const handleSubmit = () => {
    if (!formData.serviceId || !formData.clientName || !formData.clientEmail || !formData.appointmentDate) {
      toast({
        title: "Required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Combinar data e hour
    const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime || '10:00'}:00`);

    createAppointment.mutate({
      serviceId: parseInt(formData.serviceId),
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone || "",
      appointmentDate: dateTime,
      appointmentTime: formData.appointmentTime,
      eventLocation: formData.eventLocation || undefined,
      numberOfPeople: formData.numberOfPeople ? parseInt(formData.numberOfPeople) : undefined,
      estimatedDuration: formData.estimatedDuration || undefined,
      notes: formData.notes || undefined,
    });
  };

  const canProceedStep1 = formData.serviceId !== "";
  const canProceedStep2 = formData.appointmentDate !== "";

  if (submitted) {
    return (
      <LayoutWrapper currentPage="agendar">
        <div className="py-20">
          <div className="container max-w-2xl">
            <Card className="text-center">
              <CardContent className="py-20">
                <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
                <h1 className="text-4xl font-bold font-serif mb-4">
                  Agendamento Shipped!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Recebemos your request de agendamento. Entraremos em contato
                  em breve para confirmar a data e time.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/services">
                      <a>Ver Services</a>
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/">
                      <a>Back to Home</a>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper currentPage="agendar">
      {/* Hero Section */}
      <div className="pt-8 pb-8 bg-gradient-to-br from-background to-muted/30">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
            Agende your Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Preencha o formuthererio em 3 etapas simple
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="container max-w-3xl py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: "Service" },
            { num: 2, label: "Date" },
            { num: 3, label: "Details" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.num
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.num}
              </div>
              <span
                className={`text-sm ${
                  step >= s.num ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {i < 2 && (
                <div
                  className={`w-16 h-0.5 ${
                    step > s.num ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Step 1: Service Shection */}
            {step === 1 && (
              <div className="space-y-4">
                <CardHeader className="p-0">
                  <CardTitle>Escolha o Service</CardTitle>
                  <CardDescription>
                    Shect o service que deseja contratar
                  </CardDescription>
                </CardHeader>

                <div>
                  <Label htmlFor="service">Service *</Label>
                  <Shect
                    value={formData.serviceId}
                    onValueChange={(val) =>
                      setFormData({ ...formData, serviceId: val })
                    }
                  >
                    <ShectTrigger>
                      <ShectValue placeholder="Shect um service" />
                    </ShectTrigger>
                    <ShectContent>
                      {services?.map((service) => (
                        <ShectItem
                          key={service.id}
                          value={service.id.toString()}
                        >
                          {service.name} - {formatCurrency(service.price)}
                        </ShectItem>
                      ))}
                    </ShectContent>
                  </Shect>
                </div>

                {shectedService && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">
                        {shectedService.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {shectedService.description}
                      </p>
                      <p className="text-lg font-bold text-accent">
                        {formatCurrency(shectedService.price)}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Data e Time
                  </CardTitle>
                  <CardDescription>
                    Escolha a data e time preferidos
                  </CardDescription>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointmentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Time Preferido
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointmentTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-4">
                <CardHeader className="p-0">
                  <CardTitle>Information Adicionais</CardTitle>
                  <CardDescription>
                    Complete as information do agendamento
                  </CardDescription>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Complete *</Label>
                    <Input
                      id="name"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      placeholder="Your nome complete"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientEmail: e.target.value,
                        })
                      }
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Thefone</Label>
                  <PhoneInput
                    value={formData.clientPhone}
                    onChange={(val) =>
                      setFormData({ ...formData, clientPhone: val })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Local do Evento
                  </Label>
                  <Input
                    id="location"
                    value={formData.eventLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eventLocation: e.target.value,
                      })
                    }
                    placeholder="Address do evento"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="people" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Number of People
                    </Label>
                    <Input
                      id="people"
                      type="number"
                      min="1"
                      value={formData.numberOfPeople}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfPeople: e.target.value })
                      }
                      placeholder="Ex: 2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Estimated Duration
                    </Label>
                    <Input
                      id="duration"
                      value={formData.estimatedDuration}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedDuration: e.target.value })
                      }
                      placeholder="Ex: 2 hours"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    placeholder="Conte-nos mais about o que you needs..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createAppointment.isPending}
                    className="flex-1"
                  >
                    {createAppointment.isPending ? "Sending..." : "Enviar Agendamento"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
