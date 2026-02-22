import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Daylog, DaylogContent, DaylogDescription, DaylogHeader, DaylogTitle } from "@/components/ui/daylog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign, Mail, Copy, Check, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function AdminEventoVendas() {
  return (
    <DashboardLayout>
      <AdminEventoVendasContent />
    </DashboardLayout>
  );
}

function AdminEventoVendasContent() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState("25.00");

  const utils = trpc.useUtils();
  
  // OPTIMIZED: 1 query traz tudo (appointments + leads count + collection data)
  const { data: appointments, isLoading } = trpc.appointments.getWithFinalAlbums.useQuery();

  const enableSalesMutation = trpc.collections.enableSales.useMutation({
    onSuccess: () => {
      utils.collections.getByAppointmentId.invalidate();
      setSalesModalOpen(false);
      toast.success("Vendas ativadas! Link público gerado.");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleEnableSales = () => {
    if (!selectedEvent?.collectionId) {
      toast.error("Gallery not found");
      return;
    }

    const priceInCents = Math.round(parseFloat(priceInput) * 100);
    enableSalesMutation.mutate({
      collectionId: selectedEvent.collectionId,
      pricePerPhoto: priceInCents,
    });
  };

  const handleCopyLink = () => {
    if (!selectedEvent?.collectionPublicSlug) return;
    const link = `${window.location.origin}/gallery-shop/${selectedEvent.collectionPublicSlug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  const handleSendEmails = () => {
    // TODO: Implement email sending
    toast.info("Sistema de email em desenvolvimento");
  };

  // No need to filter - getWithFinalAlbums already returns only appointments with photos
  const eventsWithAlbums = appointments || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vendas de Fotos por Evento</h1>
        <p className="text-muted-foreground">
          Gerencie vendas de fotos para convidados dos eventos
        </p>
      </div>

      {/* Events List */}
      <div className="grid gap-6">
        {eventsWithAlbums.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                None evento com álbum final delivered
              </p>
            </CardContent>
          </Card>
        ) : (
          eventsWithAlbums.map((event: any) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{event.clientName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.serviceType} • {new Date(event.eventDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                  >
                    {selectedEvent?.id === event.id ? "Hide" : "Gerenciar"}
                  </Button>
                </div>
              </CardHeader>

              {/* Expanded Details */}
              {selectedEvent?.id === event.id && (
                <CardContent className="border-t pt-6 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Users className="w-8 h-8 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">{selectedEvent?.leadsCount || 0}</p>
                            <p className="text-xs text-muted-foreground">Leads Capturados</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-8 h-8 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">
                              {selectedEvent?.collectionSalesEnabled ? "Active" : "Inactive"}
                            </p>
                            <p className="text-xs text-muted-foreground">Status de Vendas</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-8 h-8 text-purple-500" />
                          <div>
                            <p className="text-2xl font-bold">0</p>
                            <p className="text-xs text-muted-foreground">Emails Shippeds</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {!selectedEvent?.collectionSalesEnabled ? (
                      <Button
                        onClick={() => setSalesModalOpen(true)}
                        className="flex-1"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Ativar Vendas de Fotos
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="flex-1"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Link de Vendas
                        </Button>
                        <Button
                          onClick={handleSendEmails}
                          className="flex-1"
                          disabled={!selectedEvent?.leadsCount || selectedEvent.leadsCount === 0}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Enviar para {selectedEvent?.leadsCount || 0} Leads
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Sales Info */}
                  {selectedEvent?.collectionSalesEnabled && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-600">Vendas Ativas</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Preço por foto: £ {((selectedEvent.collectionPricePerPhoto || 0) / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Link: /gallery-shop/{selectedEvent.collectionPublicSlug}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Sales Modal */}
      <Daylog open={salesModalOpen} onOpenChange={setSalesModalOpen}>
        <DaylogContent>
          <DaylogHeader>
            <DaylogTitle>Ativar Vendas de Fotos</DaylogTitle>
            <DaylogDescription>
              Configure o preço por foto. Um link público será gerado para compartilhar com os leads.
            </DaylogDescription>
          </DaylogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerPhoto">Preço por Foto (£)</Label>
              <Input
                id="pricePerPhoto"
                type="number"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="25.00"
              />
              <p className="text-xs text-muted-foreground">
                Valor que será cobrado por cada foto vendida (download digital)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEnableSales}
                disabled={enableSalesMutation.isPending}
                className="flex-1"
              >
                {enableSalesMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  "Ativar Vendas"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSalesModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DaylogContent>
      </Daylog>
    </div>
  );
}
