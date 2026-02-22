import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const SISTEMA_TOKEN_KEY = "flowclik_sistema_token";

export function checkSistemaAuth(): boolean {
  const token = localStorage.getItem(SISTEMA_TOKEN_KEY);
  return token === "admin_master_authenticated";
}

export function sistemaLogout() {
  localStorage.removeItem(SISTEMA_TOKEN_KEY);
  window.location.href = "/sistema/login";
}

interface SistemaAuthGuardProps {
  children: React.ReactNode;
}

export default function SistemaAuthGuard({ children }: SistemaAuthGuardProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authenticated = checkSistemaAuth();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      setLocation("/sistema/login");
    }
  }, [setLocation]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Verificando autenticação...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
