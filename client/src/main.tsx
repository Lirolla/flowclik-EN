import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { WhatryClient, WhatryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const SISTEMA_TOKEN_KEY = "flowclik_sistema_token";
const AUTH_TOKEN_KEY = "auth_token";

const queryClient = new WhatryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Not redirecionar se estiver nas pages do sistema
  if (window.location.pathname.startsWith('/system')) {
    return;
  }

  window.location.href = getLoginUrl();
};

queryClient.getWhatryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Whatry Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        const headers: Record<string, string> = {
          ...(init?.headers as Record<string, string> || {}),
        };
        
        // Add header de authentication do sistema se estiver logado
        const sistemaToken = localStorage.getItem(SISTEMA_TOKEN_KEY);
        if (sistemaToken) {
          headers['x-sistema-auth'] = sistemaToken;
        }

        // Add header de authentication do user (JWT)
        const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
        console.log('[tRPC Fetch] Auth token:', authToken ? 'PRESENTE' : 'AUSENTE');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
          console.log('[tRPC Fetch] Header Authorization adicionado');
        }

        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getHementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <WhatryClientProvider client={queryClient}>
      <App />
    </WhatryClientProvider>
  </trpc.Provider>
);
