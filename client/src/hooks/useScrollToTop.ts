import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Hook que rola a page para o topo always que a rota mudar
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
}
