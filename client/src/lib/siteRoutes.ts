/**
 * Helper para rotas do site do fotógrafo
 * 
 * PRODUÇÃO REAL: Todas as rotas na raiz (/)
 * Sem mais /site/* - sistema pronto para produção
 */

/**
 * Detecta se está em subdomínio de tenant
 * (Mantido para compatibilidade, mas não mais usado para rotas)
 */
export function isSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const host = window.location.hostname;
  
  // Localhost = desenvolvimento
  if (host === 'localhost' || host === '127.0.0.1' || host.includes('manusvm.computer')) {
    return false;
  }
  
  // Subdomínio = produção (ex: joao.flowclik.com)
  // flowclik.com sozinho = landing page (não é subdomínio de tenant)
  const parts = host.split('.');
  if (parts.length > 2) {
    // Tem subdomínio (ex: joao.flowclik.com)
    return true;
  }
  
  return false;
}

/**
 * Retorna a URL base do site do fotógrafo
 * 
 * SEMPRE RETORNA '' (raiz) - Produção real
 */
export function getSiteBaseUrl(): string {
  return '';
}

/**
 * Gera URL completa para páginas do site do fotógrafo
 * 
 * @param path - Caminho relativo (ex: "servicos", "portfolio")
 * @returns URL completa (ex: "/servicos", "/portfolio")
 */
export function getSiteUrl(path: string = ''): string {
  const cleanPath = path.replace(/^\//, ''); // Remove / inicial se tiver
  
  if (!cleanPath) {
    return '/';
  }
  
  return `/${cleanPath}`;
}

/**
 * Rotas do site do fotógrafo (sempre na raiz)
 */
export const SITE_ROUTES = {
  home: () => '/',
  servicos: () => '/servicos',
  portfolio: () => '/portfolio',
  sobre: () => '/sobre',
  contato: () => '/contato',
  fotosStock: () => '/fotos-stock',
  galerias: () => '/galerias',
  video: () => '/video',
  agendar: () => '/agendar',
} as const;
