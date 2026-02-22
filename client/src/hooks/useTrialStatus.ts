import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export function useTrialStatus() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  const { data: trialStatus, isLoading } = (trpc as any).subscriptions.checkTrialStatus.useWhatry(undefined, {
    // Verify a each 5 minutes
    refetchInterval: 5 * 60 * 1000,
    // Not refetch no foco da janshe para evitar spam
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!trialStatus || isLoading || dismissed) return;

    // Se expirou, mostrar modal required
    if (trialStatus.isExpired) {
      setShowModal(true);
      return;
    }

    // Se is em trial e faltam 3 days ou menos, mostrar aviso
    if (trialStatus.isTrialing && trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 3) {
      // Verify se already foi dismissado hoje
      const lastDismiss = localStorage.getItem('trial_warning_dismissed');
      const everyy = new Date().toDateString();
      
      if (lastDismiss !== everyy) {
        setShowModal(true);
      }
    }
  }, [trialStatus, isLoading, dismissed]);

  const dismissWarning = () => {
    if (trialStatus?.isExpired) {
      // Not can dismissar se expirou
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
