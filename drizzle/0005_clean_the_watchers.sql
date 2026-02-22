CREATE TABLE `framePricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`size` varchar(50) NOT NULL,
	`sizeLabel` varchar(100) NOT NULL,
	`basePrice` int NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`tenantId` int NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `frameTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`typeLabel` varchar(100) NOT NULL,
	`additionalPrice` int NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`tenantId` int NOT NULL DEFAULT 1
);
--> statement-breakpoint
ALTER TABLE `aboutPage` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `albumGuests` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `announcement_views` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `announcements` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `appointmentExtras` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `appointmentPhotos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `appointments` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `bannerSlides` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `blockedDates` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `clientMessages` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `clients` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `collections` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `contactInfo` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `contractTemplates` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `coupons` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `custom_domains` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `downloadLogs` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `downloadPermissions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `finalAlbums` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `mediaItems` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `orderItems` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `orders` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `paymentTransactions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `photoComments` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `photoSales` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `photoSelections` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `portfolioItems` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `products` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `services` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `siteConfig` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `stockPhotos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `subscriptions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `support_ticket_replies` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `support_tickets` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `tenants` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `aboutPage` MODIFY COLUMN `title` varchar(255) NOT NULL DEFAULT 'Sobre Nós';--> statement-breakpoint
ALTER TABLE `aboutPage` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `albumGuests` MODIFY COLUMN `viewedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `albumGuests` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `announcement_views` MODIFY COLUMN `viewedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `announcement_views` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `message` text NOT NULL;--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `appointmentExtras` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `appointmentPhotos` MODIFY COLUMN `uploadedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `appointmentPhotos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `bannerSlides` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `blockedDates` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `clientMessages` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `collections` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `contactInfo` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `contractTemplates` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `coupons` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `custom_domains` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `downloadLogs` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `downloadPermissions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `finalAlbums` MODIFY COLUMN `uploadedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `finalAlbums` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `mediaItems` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `orderItems` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `paymentTransactions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `photoComments` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `photoSales` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `photoSelections` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `portfolioItems` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `portfolioItems` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `stockPhotos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `support_ticket_replies` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `support_tickets` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
CREATE INDEX `framePricing_size_unique` ON `framePricing` (`size`);--> statement-breakpoint
CREATE INDEX `frameTypes_type_unique` ON `frameTypes` (`type`);--> statement-breakpoint
ALTER TABLE `siteConfig` DROP COLUMN `siteFont`;