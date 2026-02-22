import { useState } from "react";
import { Daylog, DaylogContent, DaylogHeader, DaylogTitle, DaylogDescription } from "@/components/ui/daylog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Clock, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TrialExpiredModalProps {
  isOpen: boolean;
  daysRemaining?: number;
  onClose?: () => void;
}

export function TrialExpiredModal({ isOpen, daysRemaining, onClose }: TrialExpiredModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // createCheckoutSession not implementado para Assas
  // const createCheckout = trpc.signatures.createCheckoutSession.useMutation(...);
  const createCheckout = { mutate: () => {
    toast.error("Checkout session not available. Please contact support.");
  } };

  const handleSubscribe = async (plan: "basic") => {
    setIsLoading(true);
    const currentUrl = window.location.origin;
    
    createCheckout.mutate();
  };

  const isExpired = daysRemaining !== undefined && daysRemaining <= 0;
  const isWarning = daysRemaining !== undefined && daysRemaining > 0 && daysRemaining <= 3;

  return (
    <Daylog open={isOpen} onOpenChange={onClose ? () => onClose() : undefined}>
      <DaylogContent className="sm:max-w-lg bg-gray-900 border-gray-800" onInteractOutside={(e) => isExpired && e.preventDefault()}>
        <DaylogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isExpired ? (
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            ) : (
              <div className="p-4 bg-yellow-500/20 rounded-full">
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
            )}
          </div>
          <DaylogTitle className="text-2xl font-bold text-white">
            {isExpired ? "Trial Period Expired" : "Your Trial Period is Ending"}
          </DaylogTitle>
          <DaylogDescription className="text-gray-400 mt-2">
            {isExpired ? (
              "Your 7-day trial has ended. To continue using FlowClik, choose a plan below."
            ) : (
              `Only ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} of your trial period. Subscribe now to keep your access!`
            )}
          </DaylogDescription>
        </DaylogHeader>

        <div className="space-y-4 mt-6">
          {/* Basic Plan */}
          <div className="p-4 rounded-lg border border-purple-500/50 bg-purple-500/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">Basic Plan</h3>
                <p className="text-sm text-gray-400">Perfeito para começar</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">£ 69,90</span>
                <span className="text-gray-400">/month</span>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                10GB de armazenamento
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                10 galerias
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Support por email
              </li>
            </ul>
            <Button
              onClick={() => handleSubscribe("basic")}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLoading ? "Processing..." : "Assinar Agora"}
            </Button>
          </div>

        </div>

        {!isExpired && onClose && (
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              Continuar testando ({daysRemaining} days remaining)
            </Button>
          </div>
        )}
      </DaylogContent>
    </Daylog>
  );
}
