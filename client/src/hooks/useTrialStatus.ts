import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export function useTrialStatus() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  const { data: trialStatus, isLoading } = (trpc as any).subscriptions.checkTrialStatus.useQuery(undefined, {
    // Verificar a cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
    // Não refetch no foco da janela para evitar spam
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!trialStatus || isLoading || dismissed) return;

    // Se expirou, mostrar modal obrigatório
    if (trialStatus.isExpired) {
      setShowModal(true);
      return;
    }

    // Se está em trial e faltam 3 dias ou menos, mostrar aviso
    if (trialStatus.isTrialing && trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 3) {
      // Verificar se já foi dismissado hoje
      const lastDismiss = localStorage.getItem('trial_warning_dismissed');
      const today = new Date().toDateString();
      
      if (lastDismiss !== today) {
        setShowModal(true);
      }
    }
  }, [trialStatus, isLoading, dismissed]);

  const dismissWarning = () => {
    if (trialStatus?.isExpired) {
      // Não pode dismissar se expirou
      return;
    }
    setDismissed(true);
    setShowModal(false);
    localStorage.setItem('trial_warning_dismissed', new Date().toDateString());
  };

  return {
    trialStatus,
    isLoading,
    showModal,
    dismissWarning,
    isExpired: trialStatus?.isExpired ?? false,
    daysRemaining: trialStatus?.daysRemaining ?? null,
  };
}
