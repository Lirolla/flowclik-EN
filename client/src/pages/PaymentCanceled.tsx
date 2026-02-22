import { Link } from "wouter";
import { XCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentCanceled() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Cancelled
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Seu pagamento foi cancelled ou ocorreu um erro durante o processamento.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-700">
            Não se preocupe, nonea cobrança foi realizada.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Se you encontrou algum problema, get in touch conosco para que possamos ajudá-lo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild variant="outline" size="lg">
              <Link href="javascript:history.back()">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>

            <Button asChild variant="default" size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Ir ao Início
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Precisa de help? Get in touch conosco.
          </p>
        </div>
      </Card>
    </div>
  );
}
