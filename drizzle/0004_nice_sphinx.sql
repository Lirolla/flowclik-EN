ALTER TABLE `aboutPage` MODIFY COLUMN `title` varchar(255) DEFAULT 'About Us';--> statement-breakpoint
ALTER TABLE `aboutPage` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `albumGuests` MODIFY COLUMN `viewedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `albumGuests` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `announcement_views` MODIFY COLUMN `viewedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `announcement_views` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `title` varchar(255);--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `message` text;--> statement-breakpoint
ALTER TABLE `announcements` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `appointmentExtras` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `appointmentPhotos` MODIFY COLUMN `uploadedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `appointmentPhotos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `bannerSlides` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `blockedDates` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `clientMessages` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `collections` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `contactInfo` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `contractTemplates` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `coupons` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `custom_domains` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `downloadLogs` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `downloadPermissions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `finalAlbums` MODIFY COLUMN `uploadedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `finalAlbums` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `mediaItems` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `orderItems` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `paymentTransactions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `photoComments` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `photoSales` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `photoSelections` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `portfolioItems` MODIFY COLUMN `title` varchar(255);--> statement-breakpoint
ALTER TABLE `portfolioItems` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `title` varchar(255);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `stockPhotos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `support_ticket_replies` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `support_tickets` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `aboutPage` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `albumGuests` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `announcement_views` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `announcements` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `appointmentExtras` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `appointmentPhotos` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `appointments` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `bannerSlides` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `blockedDates` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `clientMessages` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `clients` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `collections` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `contactInfo` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `contractTemplates` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `coupons` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `custom_domains` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `downloadLogs` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `downloadPermissions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `finalAlbums` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `mediaItems` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `orderItems` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `orders` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `paymentTransactions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `photoComments` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `photoSales` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `photoSelections` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `portfolioItems` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `products` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `services` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `siteConfig` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `stockPhotos` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `support_ticket_replies` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `support_tickets` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `tenants` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `users` ADD PRIMARY KEY(`id`);