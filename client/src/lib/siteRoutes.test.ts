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

    it('deve retornar false para flowclik.com (domínio principal)', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'flowclik.com' },
        writable: true,
      });
      expect(isSubdomain()).toBe(false);
    });

    it('deve retornar true para joao.flowclik.com (subdomínio)', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });
      expect(isSubdomain()).toBe(true);
    });

    it('deve retornar true para maria.flowclik.com (subdomínio)', () => {
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

    it('deve retornar string vazia para subdomínio', () => {
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

    it('deve gerar /site/servicos para servicos em localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(getSiteUrl('servicos')).toBe('/site/servicos');
    });

    it('deve gerar / para home em subdomínio', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });
      expect(getSiteUrl('')).toBe('/');
    });

    it('deve gerar /servicos para servicos em subdomínio', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });
      expect(getSiteUrl('servicos')).toBe('/servicos');
    });

    it('deve remover / inicial do path se fornecido', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(getSiteUrl('/servicos')).toBe('/site/servicos');
    });
  });

  describe('SITE_ROUTES', () => {
    it('deve gerar rotas corretas em localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });

      expect(SITE_ROUTES.home()).toBe('/site');
      expect(SITE_ROUTES.servicos()).toBe('/site/servicos');
      expect(SITE_ROUTES.portfolio()).toBe('/site/portfolio');
      expect(SITE_ROUTES.sobre()).toBe('/site/sobre');
      expect(SITE_ROUTES.contato()).toBe('/site/contato');
      expect(SITE_ROUTES.galerias()).toBe('/site/galerias');
      expect(SITE_ROUTES.fotosStock()).toBe('/site/fotos-stock');
      expect(SITE_ROUTES.video()).toBe('/site/video');
      expect(SITE_ROUTES.agendar()).toBe('/site/agendar');
    });

    it('deve gerar rotas corretas em subdomínio', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'joao.flowclik.com' },
        writable: true,
      });

      expect(SITE_ROUTES.home()).toBe('/');
      expect(SITE_ROUTES.servicos()).toBe('/servicos');
      expect(SITE_ROUTES.portfolio()).toBe('/portfolio');
      expect(SITE_ROUTES.sobre()).toBe('/sobre');
      expect(SITE_ROUTES.contato()).toBe('/contato');
      expect(SITE_ROUTES.galerias()).toBe('/galerias');
      expect(SITE_ROUTES.fotosStock()).toBe('/fotos-stock');
      expect(SITE_ROUTES.video()).toBe('/video');
      expect(SITE_ROUTES.agendar()).toBe('/agendar');
    });
  });
});
