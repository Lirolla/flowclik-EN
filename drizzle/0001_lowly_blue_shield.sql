CREATE TABLE `albumGuests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`relationship` varchar(100),
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `albumGuests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcement_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`announcementId` int NOT NULL,
	`userId` int NOT NULL,
	`dismissed` tinyint NOT NULL DEFAULT 0,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcement_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('urgent','important','info') NOT NULL DEFAULT 'info',
	`targetPlan` enum('all','starter','pro','enterprise') NOT NULL DEFAULT 'all',
	`isActive` tinyint NOT NULL DEFAULT 1,
	`expiresAt` timestamp,
	`createdBy` int NOT NULL,
	`tenantId` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointmentExtras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appointmentId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`price` int NOT NULL,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointmentExtras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointmentPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appointmentId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int,
	`isSelectedByClient` tinyint NOT NULL DEFAULT 0,
	`tenantId` int NOT NULL DEFAULT 1,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointmentPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int,
	`userId` int,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(50),
	`appointmentDate` timestamp NOT NULL,
	`appointmentTime` varchar(10),
	`status` enum('pending','awaiting_payment','confirmed','session_done','editing','awaiting_selection','final_editing','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('pending','awaiting_payment','partial','paid','failed','refunded') DEFAULT 'pending',
	`paymentMethod` enum('cash','bank_transfer','stripe'),
	`notes` text,
	`adminNotes` text,
	`contractUrl` text,
	`contractSigned` tinyint NOT NULL DEFAULT 0,
	`eventLocation` text,
	`numberOfPeople` int,
	`estimatedDuration` varchar(50),
	`selectionApproved` tinyint NOT NULL DEFAULT 0,
	`selectionApprovedAt` timestamp,
	`finalPrice` int,
	`paidAmount` int DEFAULT 0,
	`paidAt` timestamp,
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`slug` varchar(255),
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bannerSlides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slideType` enum('image','video') NOT NULL DEFAULT 'image',
	`imageUrl` text,
	`videoUrl` text,
	`title` varchar(255),
	`description` text,
	`buttonText` varchar(100),
	`buttonLink` varchar(500),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`displayOn` enum('photography','video','both') NOT NULL DEFAULT 'both',
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bannerSlides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blockedDates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`reason` varchar(255),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blockedDates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appointmentId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderRole` enum('admin','client') NOT NULL,
	`message` text NOT NULL,
	`fileUrl` text,
	`fileName` varchar(255),
	`isRead` tinyint NOT NULL DEFAULT 0,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clientMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`coverImageUrl` text,
	`isFeatured` tinyint NOT NULL DEFAULT 0,
	`isPublic` tinyint NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`appointmentId` int,
	`layoutType` enum('grid','masonry','fullscreen') NOT NULL DEFAULT 'masonry',
	`eventDate` date,
	`password` varchar(255),
	`salesEnabled` tinyint NOT NULL DEFAULT 0,
	`publicSlug` varchar(255),
	`pricePerPhoto` int NOT NULL DEFAULT 2500,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contactInfo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`address` text,
	`city` varchar(100),
	`state` varchar(100),
	`zipCode` varchar(20),
	`country` varchar(100) DEFAULT 'Brasil',
	`mapLatitude` varchar(50),
	`mapLongitude` varchar(50),
	`instagramUrl` text,
	`facebookUrl` text,
	`linkedinUrl` text,
	`twitterUrl` text,
	`youtubeUrl` text,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contactInfo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` int NOT NULL,
	`minPurchase` int DEFAULT 0,
	`maxUses` int,
	`usedCount` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `downloadLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int NOT NULL,
	`userId` int NOT NULL,
	`downloadType` enum('single_photo','all_photos_zip') NOT NULL,
	`photoId` int,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `downloadLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `downloadPermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int NOT NULL,
	`allowDownload` tinyint NOT NULL DEFAULT 0,
	`downloadExpiresAt` timestamp,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `downloadPermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finalAlbums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appointmentId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int,
	`order` int NOT NULL DEFAULT 0,
	`tenantId` int NOT NULL DEFAULT 1,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `finalAlbums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `framePricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`size` varchar(50) NOT NULL,
	`sizeLabel` varchar(100) NOT NULL,
	`basePrice` int NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `framePricing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `frameTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`typeLabel` varchar(100) NOT NULL,
	`additionalPrice` int NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `frameTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mediaItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int,
	`mediaType` enum('photo','video') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`originalUrl` text NOT NULL,
	`previewUrl` text,
	`thumbnailUrl` text,
	`watermarkedUrl` text,
	`priceDigital` int DEFAULT 0,
	`price` int NOT NULL DEFAULT 0,
	`width` int,
	`height` int,
	`isPublic` tinyint NOT NULL DEFAULT 1,
	`isFeatured` tinyint NOT NULL DEFAULT 0,
	`isFavorite` tinyint NOT NULL DEFAULT 0,
	`isStock` tinyint NOT NULL DEFAULT 0,
	`availableForSale` tinyint NOT NULL DEFAULT 0,
	`category` enum('paisagem','carros','pessoas','eventos','produtos','outros'),
	`stockDescription` text,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mediaItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`mediaId` int,
	`itemType` enum('digital','print') NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`price` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`printSize` varchar(50),
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`totalAmount` int NOT NULL,
	`discountAmount` int NOT NULL DEFAULT 0,
	`finalAmount` int NOT NULL,
	`status` enum('pending','paid','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
	`stripePaymentId` varchar(255),
	`couponCode` varchar(50),
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appointmentId` int NOT NULL,
	`amount` int NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','stripe') NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`notes` text,
	`paidAt` timestamp,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photoComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`appointmentId` int NOT NULL,
	`clientEmail` varchar(255) NOT NULL,
	`comment` text NOT NULL,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photoComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photoSales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`collectionId` int,
	`buyerEmail` varchar(320) NOT NULL,
	`buyerName` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`stripeSessionId` varchar(255) NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`productType` enum('digital','framed') NOT NULL DEFAULT 'digital',
	`frameSize` varchar(50),
	`frameType` varchar(50),
	`downloadToken` varchar(64),
	`downloadExpiresAt` timestamp,
	`downloadCount` int NOT NULL DEFAULT 0,
	`paidAt` timestamp,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photoSales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photoSelections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediaItemId` int NOT NULL,
	`collectionId` int NOT NULL,
	`isSelected` tinyint NOT NULL DEFAULT 0,
	`clientFeedback` text,
	`editedPhotoUrl` text,
	`status` enum('pending','editing','completed') NOT NULL DEFAULT 'pending',
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photoSelections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`story` text,
	`imageUrl` text,
	`thumbnailUrl` text,
	`videoUrl` text,
	`type` enum('photo','video') NOT NULL DEFAULT 'photo',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`showOnHome` tinyint NOT NULL DEFAULT 0,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolioItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`duration` int,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`serviceType` enum('photography','video','both') NOT NULL DEFAULT 'photography',
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteName` varchar(255) NOT NULL DEFAULT 'FlowClik',
	`siteTagline` text,
	`logoUrl` text,
	`primaryColor` varchar(50) DEFAULT '#000000',
	`accentColor` varchar(50) DEFAULT '#C9A961',
	`businessMode` enum('photography_only','video_only','both') NOT NULL DEFAULT 'photography_only',
	`siteThemeLayout` enum('classic','sidebar','wedding','wedding-videos') NOT NULL DEFAULT 'classic',
	`siteThemeMode` enum('light','dark') NOT NULL DEFAULT 'dark',
	`siteThemeAccentColor` enum('red','black','blue') NOT NULL DEFAULT 'red',
	`aboutTitle` varchar(255),
	`aboutContent` text,
	`aboutImage` text,
	`aboutMission` text,
	`aboutVision` text,
	`aboutValues` text,
	`servicesIntro` text,
	`contactPhone` varchar(50),
	`contactEmail` varchar(255),
	`contactWhatsApp` varchar(50),
	`contactAddress` text,
	`socialInstagram` varchar(255),
	`socialFacebook` varchar(255),
	`socialYouTube` varchar(255),
	`stockPhotosEnabled` tinyint NOT NULL DEFAULT 0,
	`parallaxEnabled` tinyint NOT NULL DEFAULT 0,
	`parallaxImageUrl` text,
	`parallaxTitle` varchar(255),
	`parallaxSubtitle` text,
	`paymentStripeEnabled` tinyint NOT NULL DEFAULT 1,
	`paymentBankTransferEnabled` tinyint NOT NULL DEFAULT 0,
	`paymentBankDetails` text,
	`paymentCashEnabled` tinyint NOT NULL DEFAULT 0,
	`paymentCashInstructions` text,
	`baseCountry` varchar(100) DEFAULT 'Brasil',
	`baseCurrency` varchar(10) DEFAULT 'BRL',
	`currencySymbol` varchar(10) DEFAULT 'R$',
	`timezone` varchar(100) DEFAULT 'America/Sao_Paulo',
	`phoneCountryCode` varchar(10) DEFAULT '+55',
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('paisagem','carros','pessoas','eventos','produtos','outros') NOT NULL,
	`originalUrl` text NOT NULL,
	`thumbnailUrl` text,
	`previewUrl` text,
	`price` int NOT NULL DEFAULT 0,
	`width` int,
	`height` int,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`frameEnabled` tinyint NOT NULL DEFAULT 0,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stockPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`plan` enum('starter','pro','enterprise','full') NOT NULL DEFAULT 'starter',
	`status` enum('trialing','active','past_due','cancelled','paused') NOT NULL DEFAULT 'trialing',
	`storageLimit` bigint NOT NULL DEFAULT 10737418240,
	`galleryLimit` int NOT NULL DEFAULT 10,
	`extraStorage` bigint NOT NULL DEFAULT 0,
	`extraGalleries` int NOT NULL DEFAULT 0,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` tinyint NOT NULL DEFAULT 0,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_ticket_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`isInternal` tinyint NOT NULL DEFAULT 0,
	`tenantId` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_ticket_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`lastReplyAt` timestamp,
	`lastReplyBy` int,
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subdomain` varchar(100) NOT NULL,
	`customDomain` varchar(255),
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`logo` text,
	`primaryColor` varchar(50) DEFAULT '#000000',
	`accentColor` varchar(50) DEFAULT '#C9A961',
	`baseCountry` varchar(100) DEFAULT 'Brasil',
	`baseCurrency` varchar(10) DEFAULT 'BRL',
	`currencySymbol` varchar(10) DEFAULT 'R$',
	`timezone` varchar(100) DEFAULT 'America/Sao_Paulo',
	`status` enum('active','suspended','cancelled') NOT NULL DEFAULT 'active',
	`trialEndsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `state` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `zipCode` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100) DEFAULT 'Brasil';--> statement-breakpoint
ALTER TABLE `users` ADD `cpf` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `street` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `number` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `complement` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `neighborhood` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `tenantId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_collection` ON `albumGuests` (`collectionId`);--> statement-breakpoint
CREATE INDEX `idx_email` ON `albumGuests` (`email`);--> statement-breakpoint
CREATE INDEX `idx_appointments_tenantId` ON `appointments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_appointments_status` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_appointments_serviceId` ON `appointments` (`serviceId`);--> statement-breakpoint
CREATE INDEX `collections_slug_unique` ON `collections` (`slug`);--> statement-breakpoint
CREATE INDEX `collections_publicSlug_unique` ON `collections` (`publicSlug`);--> statement-breakpoint
CREATE INDEX `idx_collections_tenantId` ON `collections` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_collections_appointmentId` ON `collections` (`appointmentId`);--> statement-breakpoint
CREATE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE INDEX `downloadPermissions_collectionId_unique` ON `downloadPermissions` (`collectionId`);--> statement-breakpoint
CREATE INDEX `idx_finalAlbums_appointmentId` ON `finalAlbums` (`appointmentId`);--> statement-breakpoint
CREATE INDEX `idx_finalAlbums_tenantId` ON `finalAlbums` (`tenantId`);--> statement-breakpoint
CREATE INDEX `framePricing_size_unique` ON `framePricing` (`size`);--> statement-breakpoint
CREATE INDEX `frameTypes_type_unique` ON `frameTypes` (`type`);--> statement-breakpoint
CREATE INDEX `idx_mediaItems_collectionId` ON `mediaItems` (`collectionId`);--> statement-breakpoint
CREATE INDEX `idx_mediaItems_tenantId` ON `mediaItems` (`tenantId`);--> statement-breakpoint
CREATE INDEX `photoSales_downloadToken_unique` ON `photoSales` (`downloadToken`);--> statement-breakpoint
CREATE INDEX `idx_photoSelections_collectionId` ON `photoSelections` (`collectionId`);--> statement-breakpoint
CREATE INDEX `idx_photoSelections_isSelected` ON `photoSelections` (`isSelected`);--> statement-breakpoint
CREATE INDEX `idx_photoSelections_tenantId` ON `photoSelections` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_portfolioItems_tenantId` ON `portfolioItems` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_portfolioItems_isActive` ON `portfolioItems` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_portfolioItems_showOnHome` ON `portfolioItems` (`showOnHome`);--> statement-breakpoint
CREATE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_services_tenantId` ON `services` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_services_isActive` ON `services` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_subscriptions_status` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_subscriptions_tenantId` ON `subscriptions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_ticket` ON `support_ticket_replies` (`ticketId`);--> statement-breakpoint
CREATE INDEX `idx_tenant` ON `support_tickets` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `support_tickets` (`status`);--> statement-breakpoint
CREATE INDEX `subdomain` ON `tenants` (`subdomain`);--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_tenantId_idx` ON `users` (`tenantId`);