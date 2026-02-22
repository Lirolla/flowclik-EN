-- ============================================================================
-- FLOWCLIK - SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- PARTE 2: Tabelas de Conteúdo (Serviços, Portfólio, Banner, etc)
-- ============================================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================================================
-- TABELA: services (Serviços Oferecidos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` INT NOT NULL,
  `duration` VARCHAR(50),
  `isActive` TINYINT DEFAULT 1 NOT NULL,
  `sortOrder` INT DEFAULT 0 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_active` (`isActive`),
  INDEX `idx_sort` (`sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: portfolioItems (Itens do Portfólio)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `portfolioItems` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `imageUrl` TEXT NOT NULL,
  `thumbnailUrl` TEXT,
  `category` VARCHAR(100),
  `tags` TEXT,
  `isFeatured` TINYINT DEFAULT 0 NOT NULL,
  `sortOrder` INT DEFAULT 0 NOT NULL,
  `viewCount` INT DEFAULT 0 NOT NULL,
  `likeCount` INT DEFAULT 0 NOT NULL,
  `isActive` TINYINT DEFAULT 1 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_featured` (`isFeatured`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: bannerSlides (Slides do Banner Principal)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `bannerSlides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `title` VARCHAR(255),
  `subtitle` TEXT,
  `imageUrl` TEXT NOT NULL,
  `buttonText` VARCHAR(100),
  `buttonLink` VARCHAR(255),
  `isActive` TINYINT DEFAULT 1 NOT NULL,
  `sortOrder` INT DEFAULT 0 NOT NULL,
  `overlayOpacity` INT DEFAULT 50,
  `textAlignment` ENUM('left','center','right') DEFAULT 'center',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: aboutPage (Página Sobre)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `aboutPage` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `title` VARCHAR(255) DEFAULT 'Sobre Nós' NOT NULL,
  `subtitle` TEXT,
  `mainContent` TEXT,
  `mission` TEXT,
  `vision` TEXT,
  `values` TEXT,
  `teamDescription` TEXT,
  `imageUrl` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: stockPhotos (Fotos Stock para Venda)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `stockPhotos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `imageUrl` TEXT NOT NULL,
  `thumbnailUrl` TEXT,
  `price` INT NOT NULL,
  `category` VARCHAR(100),
  `tags` TEXT,
  `downloads` INT DEFAULT 0 NOT NULL,
  `isActive` TINYINT DEFAULT 1 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: contractTemplates (Modelos de Contrato)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `contractTemplates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `content` TEXT NOT NULL,
  `isActive` TINYINT DEFAULT 1 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: blockedDates (Datas Bloqueadas para Agendamento)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `blockedDates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `startDate` TIMESTAMP NOT NULL,
  `endDate` TIMESTAMP NOT NULL,
  `reason` VARCHAR(255),
  `isActive` TINYINT DEFAULT 1 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
SET FOREIGN_KEY_CHECKS=1;
