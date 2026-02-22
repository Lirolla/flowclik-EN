import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Hook que rola a página para o topo sempre que a rota mudar
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
}
