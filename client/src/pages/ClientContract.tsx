import { useRoute } from "wouter";
import { ClientLayout } from "@/components/ClientLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, FileText, Download } from "lucide-react";

export default function ClientContract() {
  const [, params] = useRoute("/client/contract/:id");
  const appointmentId = params?.id ? parseInt(params.id) : 0;

  const { data: appointment, isLoading } = trpc.appointments.getById.useQuery(
    { id: appointmentId },
    { enabled: appointmentId > 0 }
  );

  if (isLoading) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <p className="text-gray-400">Carregando...</p>
        </div>
      </ClientLayout>
    );
  }

  if (!appointment) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-400">Agendamento não encontrado</p>
        </div>
      </ClientLayout>
    );
  }

  const hasContract = !!appointment.contractUrl;
  const isSigned = appointment.contractSigned;

  return (
    <ClientLayout appointmentId={appointmentId}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Contrato</h1>

        {/* Contract Status */}
        {hasContract ? (
          <Card className={`p-6 ${isSigned ? 'bg-green-900/20 border-green-600' : 'bg-blue-900/20 border-blue-600'}`}>
            <div className="flex items-center gap-4">
              {isSigned ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <div>
                    <h2 className="text-2xl font-semibold text-green-500">Contrato Assinado</h2>
                    <p className="text-gray-300 mt-1">
                      Contrato assinado e confirmado
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <FileText className="h-12 w-12 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-500">Contrato Disponível</h2>
                    <p className="text-gray-300 mt-1">
                      Seu contrato está pronto para visualização
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        ) : (
          <Card className="bg-yellow-900/20 border-yellow-600 p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
              <div>
                <h2 className="text-2xl font-semibold text-yellow-500">Contrato Pendente</h2>
                <p className="text-gray-300 mt-1">
                  O contrato ainda não foi gerado pelo fotógrafo
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Contract Details */}
        {hasContract && (
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes do Contrato
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-400">Cliente</span>
                <span className="font-semibold">{appointment.clientName}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-400">Serviço</span>
                <span className="font-semibold">{appointment.serviceName || "Não especificado"}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-400">Data do Ensaio</span>
                <span className="font-semibold">
                  {appointment.date && new Date(appointment.date).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-400">Status</span>
                <span className={`font-semibold ${isSigned ? 'text-green-500' : 'text-blue-500'}`}>
                  {isSigned ? 'Assinado' : 'Aguardando Assinatura'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valor Total</span>
                <span className="font-semibold text-xl">
                  £{((appointment.finalPrice || appointment.servicePrice || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-6">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => window.open(appointment.contractUrl!, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Contrato (PDF)
              </Button>
            </div>
          </Card>
        )}

        {/* Contract Preview */}
        {hasContract && (
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-xl font-semibold mb-4">Visualização do Contrato</h3>
            <div className="aspect-[8.5/11] bg-black rounded-lg overflow-hidden">
              <iframe
                src={appointment.contractUrl!}
                className="w-full h-full"
                title="Contract"
              />
            </div>
          </Card>
        )}

        {/* Help Info */}
        {hasContract && !isSigned && (
          <Card className="bg-blue-900/20 border-blue-600 p-6">
            <p className="text-gray-300">
              <strong>Precisa assinar o contrato?</strong><br />
              Entre em contato com o fotógrafo através do <a href={`/client/chat/${appointmentId}`} className="text-red-400 underline">chat</a> para combinar a assinatura.
            </p>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
}
