-- ============================================================================
-- FLOWCLIK - SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- PARTE 1: Tabelas Principais (Tenants, Users, Config)
-- ============================================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================================================
-- TABELA: tenants (Fotógrafos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subdomain` VARCHAR(63) NOT NULL UNIQUE,
  `customDomain` VARCHAR(255),
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `phone` VARCHAR(50),
  `logo` TEXT,
  `primaryColor` VARCHAR(50) DEFAULT '#000000',
  `accentColor` VARCHAR(50) DEFAULT '#FF0000',
  `baseCountry` VARCHAR(100) DEFAULT 'Brasil',
  `baseCurrency` VARCHAR(10) DEFAULT 'BRL',
  `currencySymbol` VARCHAR(10) DEFAULT 'R$',
  `timezone` VARCHAR(100) DEFAULT 'America/Sao_Paulo',
  `status` ENUM('active','inactive','suspended') DEFAULT 'active',
  `trialEndsAt` TIMESTAMP NULL,
  `pagarmeApiKey` TEXT,
  `asaasCustomerId` VARCHAR(255),
  `asaasSubscriptionId` VARCHAR(255),
  `subscriptionStatus` ENUM('trialing','active','past_due','canceled','unpaid') DEFAULT 'trialing',
  `subscriptionCurrentPeriodEnd` TIMESTAMP NULL,
  `subscriptionCanceledAt` TIMESTAMP NULL,
  `storageLimit` BIGINT DEFAULT 10737418240,
  `galleryLimit` INT DEFAULT 10,
  `extraStorage` BIGINT DEFAULT 0,
  `extraGalleries` INT DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: users (Usuários - Fotógrafos e Clientes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `openId` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(320) NOT NULL,
  `password` VARCHAR(255),
  `name` VARCHAR(255),
  `loginMethod` ENUM('email','google','facebook') DEFAULT 'email',
  `role` ENUM('admin','user','master') DEFAULT 'user' NOT NULL,
  `phone` VARCHAR(50),
  `address` VARCHAR(255),
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `zipCode` VARCHAR(20),
  `country` VARCHAR(100) DEFAULT 'Brasil',
  `cpf` VARCHAR(14),
  `street` VARCHAR(255),
  `number` VARCHAR(20),
  `complement` VARCHAR(255),
  `neighborhood` VARCHAR(100),
  `lastSignedIn` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: siteConfig (Configurações do Site do Fotógrafo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `siteConfig` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `siteName` VARCHAR(255) DEFAULT 'FlowClik' NOT NULL,
  `siteTagline` TEXT,
  `siteLogo` TEXT,
  `siteThemeLayout` ENUM('classic','sidebar','wedding','wedding-videos') DEFAULT 'classic' NOT NULL,
  `siteThemeMode` ENUM('light','dark') DEFAULT 'light' NOT NULL,
  `siteThemeAccentColor` ENUM('red','black','blue') DEFAULT 'red' NOT NULL,
  `siteFont` VARCHAR(50) DEFAULT 'inter' NOT NULL,
  `parallaxEnabled` TINYINT DEFAULT 0 NOT NULL,
  `parallaxImageUrl` TEXT,
  `parallaxTitle` VARCHAR(255),
  `parallaxSubtitle` TEXT,
  `paymentStripeEnabled` TINYINT DEFAULT 0 NOT NULL,
  `paymentBankTransferEnabled` TINYINT DEFAULT 0 NOT NULL,
  `paymentCashEnabled` TINYINT DEFAULT 0 NOT NULL,
  `paymentPixEnabled` TINYINT DEFAULT 0 NOT NULL,
  `paymentPagarmeEnabled` TINYINT DEFAULT 0 NOT NULL,
  `paymentPixKey` TEXT,
  `paymentPagarmeApiKey` TEXT,
  `bankName` VARCHAR(255),
  `bankAccountHolder` VARCHAR(255),
  `bankAccountNumber` VARCHAR(100),
  `bankAgency` VARCHAR(50),
  `bankAccountType` ENUM('corrente','poupanca'),
  `bankPix` VARCHAR(255),
  `cashInstructions` TEXT,
  `emailSender` VARCHAR(255),
  `resendApiKey` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: subscriptions (Assinaturas dos Fotógrafos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT NOT NULL,
  `plan` ENUM('basico','cortesia','vitalicio') DEFAULT 'basico' NOT NULL,
  `status` ENUM('trialing','active','past_due','canceled','unpaid') DEFAULT 'trialing' NOT NULL,
  `storageLimit` BIGINT DEFAULT 10737418240 NOT NULL,
  `galleryLimit` INT DEFAULT 10 NOT NULL,
  `extraStorage` BIGINT DEFAULT 0 NOT NULL,
  `extraGalleries` INT DEFAULT 0 NOT NULL,
  `cancelAtPeriodEnd` TINYINT DEFAULT 0 NOT NULL,
  `currentPeriodStart` TIMESTAMP NULL,
  `currentPeriodEnd` TIMESTAMP NULL,
  `canceledAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: contactInfo (Informações de Contato do Fotógrafo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `contactInfo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `phone` VARCHAR(50),
  `whatsapp` VARCHAR(50),
  `email` VARCHAR(320),
  `address` VARCHAR(255),
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `zipCode` VARCHAR(20),
  `country` VARCHAR(100) DEFAULT 'Brasil',
  `instagram` VARCHAR(255),
  `facebook` VARCHAR(255),
  `twitter` VARCHAR(255),
  `linkedin` VARCHAR(255),
  `youtube` VARCHAR(255),
  `tiktok` VARCHAR(255),
  `pinterest` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
SET FOREIGN_KEY_CHECKS=1;
