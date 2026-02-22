import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isSubdomain, getSiteBaseUrl, getSiteUrl, SITE_ROUTES } from './siteRoutes';

describe('siteRoutes', () => {
  beforeEach(() => {
    // Reset window.location mock
    vi.resetAllMocks();
  });

  describe('isSubdomain', () => {
    it('deve retornar false para localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(isSubdomain()).toBe(false);
    });

    it('deve retornar false para manusvm.computer', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: '3000-ibdn9wcen8mmg7h77m0ou-a6b8f1bd.manusvm.computer' },
        writable: true,
      });
      expect(isSubdomain()).toBe(false);
    });

    it('deve retornar false para flowclik.com (domain principal)', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'flowclik.com' },
        writable: true,
      });
      expect(isSubdomain()).toBe(false);
    });

    it('deve retornar true para joao.flowclik.com (subdomain)', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });
      expect(isSubdomain()).toBe(true);
    });

    it('deve retornar true para maria.flowclik.com (subdomain)', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'maria.flowclik.com' },
        writable: true,
      });
      expect(isSubdomain()).toBe(true);
    });
  });

  describe('getSiteBaseUrl', () => {
    it('deve retornar /site para localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(getSiteBaseUrl()).toBe('/site');
    });

    it('deve retornar string vazia para subdomain', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });
      expect(getSiteBaseUrl()).toBe('');
    });
  });

  describe('getSiteUrl', () => {
    it('deve gerar /site para home em localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(getSiteUrl('')).toBe('/site');
    });

    it('deve gerar /site/services para servicos em localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(getSiteUrl('servicos')).toBe('/site/services');
    });

    it('deve gerar / para home em subdomain', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });
      expect(getSiteUrl('')).toBe('/');
    });

    it('deve gerar /services para servicos em subdomain', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });
      expect(getSiteUrl('servicos')).toBe('/services');
    });

    it('deve remover / inicial do path se fornecido', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(getSiteUrl('/services')).toBe('/site/services');
    });
  });

  describe('SITE_ROUTES', () => {
    it('deve gerar rotas corretas em localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });

      expect(SITE_ROUTES.home()).toBe('/site');
      expect(SITE_ROUTES.services()).toBe('/site/services');
      expect(SITE_ROUTES.portfolio()).toBe('/site/portfolio');
      expect(SITE_ROUTES.about()).toBe('/site/about');
      expect(SITE_ROUTES.contact()).toBe('/site/contact');
      expect(SITE_ROUTES.galleries()).toBe('/site/galleries');
      expect(SITE_ROUTES.stockPhotos()).toBe('/site/stock-photos');
      expect(SITE_ROUTES.video()).toBe('/site/video');
      expect(SITE_ROUTES.book()).toBe('/site/book');
    });

    it('deve gerar rotas corretas em subdomain', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });

      expect(SITE_ROUTES.home()).toBe('/');
      expect(SITE_ROUTES.services()).toBe('/services');
      expect(SITE_ROUTES.portfolio()).toBe('/portfolio');
      expect(SITE_ROUTES.about()).toBe('/about');
      expect(SITE_ROUTES.contact()).toBe('/contact');
      expect(SITE_ROUTES.galleries()).toBe('/galleries');
      expect(SITE_ROUTES.stockPhotos()).toBe('/stock-photos');
      expect(SITE_ROUTES.video()).toBe('/video');
      expect(SITE_ROUTES.book()).toBe('/book');
    });
  });
});
