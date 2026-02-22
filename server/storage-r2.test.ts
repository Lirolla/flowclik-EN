import { describe, it, expect } from 'vitest';
import { ENV } from './_core/env';

describe('R2 Storage Configuration', () => {
  it('should have all required R2 environment variables from ENV', () => {
    expect(ENV.r2AccountId).toBeTruthy();
    expect(ENV.r2AccessKeyId).toBeTruthy();
    expect(ENV.r2SecretAccessKey).toBeTruthy();
    expect(ENV.r2BucketName).toBeTruthy();
    expect(ENV.r2PublicUrl).toBeTruthy();
    
    // Verify que valores não estão vazios (hardcoded no env.ts)
    expect(ENV.r2AccountId.length).toBeGreaterThan(10);
    expect(ENV.r2BucketName.length).toBeGreaterThan(0);
    expect(ENV.r2PublicUrl.length).toBeGreaterThan(0);
  });

  it('should generate correct R2 paths for tenants', async () => {
    const { R2Paths } = await import('./storage');
    
    // Testar paths de galeria
    const galeriaPath = R2Paths.galeria(1, 'casamento-maria', 'originais', 'foto.jpg');
    expect(galeriaPath).toBe('tenant-1/galleries/casamento-maria/originais/foto.jpg');
    
    // Testar paths de banner
    const bannerPath = R2Paths.banner(1, 'banner-123.jpg');
    expect(bannerPath).toBe('tenant-1/banners/banner-123.jpg');
    
    // Testar paths de portfolio
    const portfolioPath = R2Paths.portfolio(1, 'foto-123.jpg');
    expect(portfolioPath).toBe('tenant-1/portfolio/foto-123.jpg');
    
    // Testar paths de config
    const configPath = R2Paths.config(5, 'logo.jpg');
    expect(configPath).toBe('tenant-5/config/logo.jpg');
  });

  it('should have initializeTenantStorage function', async () => {
    const { initializeTenantStorage } = await import('./storage');
    expect(typeof initializeTenantStorage).toBe('function');
  });
});
