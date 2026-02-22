-- ============================================================================
-- FLOWCLIK - SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- PARTE 3 (FINAL): Agendamentos, Galerias, Mensagens, Pagamentos
-- ============================================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================================================
-- TABELA: appointments (Agendamentos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `serviceId` INT,
  `userId` INT,
  `clientName` VARCHAR(255) NOT NULL,
  `clientEmail` VARCHAR(320) NOT NULL,
  `clientPhone` VARCHAR(50),
  `appointmentDate` TIMESTAMP NOT NULL,
  `appointmentTime` VARCHAR(10),
  `eventLocation` TEXT,
  `numberOfPeople` INT,
  `estimatedDuration` VARCHAR(50),
  `status` ENUM('pending','awaiting_payment','confirmed','session_done','editing','awaiting_selection','final_editing','delivered','cancelled') DEFAULT 'pending' NOT NULL,
  `paymentStatus` ENUM('pending','awaiting_payment','partial','paid','failed','refunded') DEFAULT 'pending',
  `notes` TEXT,
  `adminNotes` TEXT,
  `contractUrl` TEXT,
  `contractSigned` TINYINT DEFAULT 0 NOT NULL,
  `selectionApproved` TINYINT DEFAULT 0 NOT NULL,
  `selectionApprovedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_date` (`appointmentDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: collections (Galerias/Coleções de Fotos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `collections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `appointmentId` INT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `coverImageUrl` TEXT,
  `isPublic` TINYINT DEFAULT 0 NOT NULL,
  `requiresPassword` TINYINT DEFAULT 0 NOT NULL,
  `password` VARCHAR(255),
  `allowDownload` TINYINT DEFAULT 0 NOT NULL,
  `allowComments` TINYINT DEFAULT 1 NOT NULL,
  `allowSelection` TINYINT DEFAULT 0 NOT NULL,
  `expiresAt` TIMESTAMP NULL,
  `viewCount` INT DEFAULT 0 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_appointment` (`appointmentId`),
  INDEX `idx_public` (`isPublic`),
  INDEX `idx_expires` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: mediaItems (Fotos/Vídeos das Galerias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `mediaItems` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `collectionId` INT NOT NULL,
  `type` ENUM('photo','video') DEFAULT 'photo' NOT NULL,
  `originalUrl` TEXT NOT NULL,
  `thumbnailUrl` TEXT,
  `watermarkedUrl` TEXT,
  `fileName` VARCHAR(255) NOT NULL,
  `fileSize` BIGINT,
  `width` INT,
  `height` INT,
  `mimeType` VARCHAR(100),
  `sortOrder` INT DEFAULT 0 NOT NULL,
  `isSelectedByClient` TINYINT DEFAULT 0 NOT NULL,
  `isFeatured` TINYINT DEFAULT 0 NOT NULL,
  `viewCount` INT DEFAULT 0 NOT NULL,
  `likeCount` INT DEFAULT 0 NOT NULL,
  `downloadCount` INT DEFAULT 0 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_collection` (`collectionId`),
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: conversations (Conversas Fotógrafo-Cliente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `appointmentId` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_appointment` (`appointmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: messages (Mensagens das Conversas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversationId` INT NOT NULL,
  `senderId` INT NOT NULL,
  `senderRole` ENUM('admin','client') NOT NULL,
  `message` TEXT NOT NULL,
  `isRead` TINYINT DEFAULT 0 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_conversation` (`conversationId`),
  INDEX `idx_sender` (`senderId`),
  FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: orders (Pedidos de Compra)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `customerEmail` VARCHAR(320) NOT NULL,
  `customerPhone` VARCHAR(50),
  `totalAmount` INT NOT NULL,
  `paymentMethod` ENUM('cash','bank_transfer','pix','pagarme'),
  `paymentStatus` ENUM('pending','paid','failed','refunded') DEFAULT 'pending' NOT NULL,
  `paidAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: orderItems (Itens dos Pedidos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `orderItems` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `productType` ENUM('stock_photo','collection_photo','service') NOT NULL,
  `productId` INT NOT NULL,
  `productName` VARCHAR(255) NOT NULL,
  `quantity` INT DEFAULT 1 NOT NULL,
  `unitPrice` INT NOT NULL,
  `totalPrice` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: photoSales (Vendas de Fotos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `photoSales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT DEFAULT 1 NOT NULL,
  `photoId` INT NOT NULL,
  `collectionId` INT NOT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `customerEmail` VARCHAR(320) NOT NULL,
  `customerPhone` VARCHAR(50),
  `price` INT NOT NULL,
  `paymentMethod` ENUM('cash','bank_transfer','pix','pagarme'),
  `paymentStatus` ENUM('pending','paid','failed') DEFAULT 'pending' NOT NULL,
  `paidAt` TIMESTAMP NULL,
  `downloadUrl` TEXT,
  `downloadExpiresAt` TIMESTAMP NULL,
  `downloadCount` INT DEFAULT 0 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_photo` (`photoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: announcements (Avisos do Sistema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('urgent','important','info') DEFAULT 'info' NOT NULL,
  `targetPlan` ENUM('all','basico','cortesia','vitalicio') DEFAULT 'all' NOT NULL,
  `isActive` TINYINT DEFAULT 1 NOT NULL,
  `expiresAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `createdBy` INT NOT NULL,
  `tenantId` INT DEFAULT 0 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: announcement_views (Visualizações de Avisos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `announcement_views` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `announcementId` INT NOT NULL,
  `userId` INT NOT NULL,
  `dismissed` TINYINT DEFAULT 0 NOT NULL,
  `viewedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `tenantId` INT DEFAULT 1 NOT NULL,
  FOREIGN KEY (`announcementId`) REFERENCES `announcements`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: support_tickets (Tickets de Suporte)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT NOT NULL,
  `userId` INT NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('open','in_progress','resolved','closed') DEFAULT 'open' NOT NULL,
  `priority` ENUM('low','medium','high','urgent') DEFAULT 'medium' NOT NULL,
  `category` ENUM('technical','billing','feature_request','other') DEFAULT 'other',
  `assignedTo` INT,
  `resolvedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: support_ticket_replies (Respostas dos Tickets)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `support_ticket_replies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticketId` INT NOT NULL,
  `userId` INT NOT NULL,
  `message` TEXT NOT NULL,
  `isStaff` TINYINT DEFAULT 0 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_ticket` (`ticketId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
SET FOREIGN_KEY_CHECKS=1;
