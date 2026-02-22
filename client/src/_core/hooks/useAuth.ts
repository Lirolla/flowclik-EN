import { getLoginUrl } from "@/const";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  tenantId: number;
};

const AUTH_TOKEN_KEY = "auth_token";

// Função para fazer requisição manual com o token (igual ao /system/login)
async function fetchUserWithToken(): Promise<User | null> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;
  
  try {
    const response = await fetch('/api/trpc/customAuth.me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data?.result?.data?.json ?? null;
  } catch {
    return null;
  }
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Buscar usuário usando fetch direto (igual ao /system/login)
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const fetchedUser = await fetchUserWithToken();
        setUser(fetchedUser);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    window.location.href = getLoginUrl();
  }, []);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(user)
    );
    return {
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
    };
  }, [user, loading, error]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    loading,
    state.user,
  ]);

  return {
    ...state,
    refresh: async () => {
      const fetchedUser = await fetchUserWithToken();
      setUser(fetchedUser);
    },
    logout,
  };
}
