/**
 * Helper for photographer's site routes
 * 
 * PRODUCTION: All routes at root (/)
 * No more /site/* - system ready for production
 */

/**
 * Detects if running on a tenant subdomain
 * (Kept for compatibility, but no longer used for routes)
 */
export function isSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const host = window.location.hostname;
  
  // Localhost = development
  if (host === 'localhost' || host === '127.0.0.1' || host.includes('manusvm.computer')) {
    return false;
  }
  
  // Subdomain = production (e.g.: john.flowclik.com)
  // flowclik.com alone = landing page (not a tenant subdomain)
  const parts = host.split('.');
  if (parts.length > 2) {
    // Has subdomain (e.g.: john.flowclik.com)
    return true;
  }
  
  return false;
}

/**
 * Returns the photographer's site base URL
 * 
 * ALWAYS RETURNS '' (root) - Production
 */
export function getSiteBaseUrl(): string {
  return '';
}

/**
 * Generates full URL for photographer's site pages
 * 
 * @param path - Relative path (e.g.: "services", "portfolio")
 * @returns Full URL (e.g.: "/services", "/portfolio")
 */
export function getSiteUrl(path: string = ''): string {
  const cleanPath = path.replace(/^\//, ''); // Remove leading / if present
  
  if (!cleanPath) {
    return '/';
  }
  
  return `/${cleanPath}`;
}

/**
 * Photographer's site routes (always at root)
 */
export const SITE_ROUTES = {
  home: () => '/',
  services: () => '/services',
  portfolio: () => '/portfolio',
  about: () => '/about',
  contact: () => '/contact',
  stockPhotos: () => '/stock-photos',
  galleries: () => '/galleries',
  video: () => '/video',
  book: () => '/book',
} as const;
