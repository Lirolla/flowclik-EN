import { useRoute } from "wouter";
import { ClientLayout } from "@/components/ClientLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, CreditCard, Calendar } from "lucide-react";

export default function ClientPayments() {
  const [, params] = useRoute("/client/payments/:id");
  const appointmentId = params?.id ? parseInt(params.id) : 0;

  const { data: appointment, isLoading } = trpc.appointments.getById.useQuery(
    { id: appointmentId },
    { enabled: appointmentId > 0 }
  );

  const { data: extras = [] } = trpc.appointments.getExtras.useQuery(
    { appointmentId },
    { enabled: appointmentId > 0 }
  );

  if (isLoading) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <p className="text-gray-400">Loading...</p>
        </div>
      </ClientLayout>
    );
  }

  if (!appointment) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-400">Appointment not found</p>
        </div>
      </ClientLayout>
    );
  }

  const isPaid = appointment.paymentStatus === "paid";
  const basePrice = appointment.finalPrice || appointment.servicePrice || 0;
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0);
  const finalPrice = basePrice + extrasTotal;
  const paidAmount = appointment.paidAmount || 0;
  const remaining = finalPrice - paidAmount;

  return (
    <ClientLayout appointmentId={appointmentId}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Pagamentos</h1>

        {/* Payment Status */}
        <Card className={`p-6 ${isPaid ? 'bg-green-900/20 border-green-600' : 'bg-yellow-900/20 border-yellow-600'}`}>
          <div className="flex items-center gap-4">
            {isPaid ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div>
                  <h2 className="text-2xl font-semibold text-green-500">Pagamento Confirmado</h2>
                  <p className="text-gray-300 mt-1">
                    Pagamento realizado em {appointment.paidAt && new Date(appointment.paidAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-yellow-500" />
                <div>
                  <h2 className="text-2xl font-semibold text-yellow-500">Pagamento Pending</h2>
                  <p className="text-gray-300 mt-1">
                    Awaiting confirmation do pagamento
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Payment Details */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Details do Pagamento
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Service Base</span>
              <span className="font-semibold">
                {appointment.serviceName || "Not specified"} - £{((appointment.finalPrice || appointment.servicePrice || 0) / 100).toFixed(2)}
              </span>
            </div>

            {extras.length > 0 && (
              <div className="pb-4 border-b border-gray-800">
                <div className="text-gray-400 mb-2">Services Extras:</div>
                <div className="space-y-2 ml-4">
                  {extras.map((extra) => (
                    <div key={extra.id} className="flex justify-between items-center">
                      <span className="text-gray-300">• {extra.description}</span>
                      <span className="font-semibold">£{(extra.price / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400 font-bold">Valor Total</span>
              <span className="font-semibold text-xl">
                £{(finalPrice / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Valor Pago</span>
              <span className={`font-semibold ${isPaid ? 'text-green-500' : 'text-yellow-500'}`}>
                £{(paidAmount / 100).toFixed(2)}
              </span>
            </div>

            {!isPaid && remaining > 0 && (
              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-400">Saldo Restante</span>
                <span className="font-semibold text-red-500">
                  £{(remaining / 100).toFixed(2)}
                </span>
              </div>
            )}

            {appointment.paymentMethod && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payment Method</span>
                <span className="font-semibold capitalize">
                  {appointment.paymentMethod === 'stripe' ? 'Credit Card' : appointment.paymentMethod}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Payment History */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            History
          </h3>

          <div className="space-y-3">
            {isPaid && appointment.paidAt && (
              <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-600 rounded">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Pagamento Confirmado</p>
                  <p className="text-sm text-gray-400">
                    {new Date(appointment.paidAt).toLocaleString('en-GB')}
                  </p>
                </div>
                <span className="font-semibold text-green-500">
                  £{(paidAmount / 100).toFixed(2)}
                </span>
              </div>
            )}

            {!isPaid && (
              <div className="text-center py-8 text-gray-400">
                <p>None pagamento registrado still</p>
              </div>
            )}
          </div>
        </Card>

        {/* Contact Info */}
        {!isPaid && (
          <Card className="bg-blue-900/20 border-blue-600 p-6">
            <p className="text-gray-300">
              <strong>Precisa de help com o pagamento?</strong><br />
              Get in touch com o photographer through do <a href={`/client/chat/${appointmentId}`} className="text-red-400 underline">chat</a> para combinar a better forma de pagamento.
            </p>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
}
