import { useMemo } from 'react';

/**
 * Hook para detectar se o domain current is flowclik.com (landing page)
 * 
 * @returns true se for flowclik.com, false caso contrário
 */
export function useIsLandingPage(): boolean {
  return useMemo(() => {
    const hostname = window.location.hostname;
    return hostname === 'flowclik.com' || hostname === 'www.flowclik.com';
  }, []);
}
