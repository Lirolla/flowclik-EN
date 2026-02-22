ALTER TABLE `tenants` ADD `asaasCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `tenants` ADD `asaasSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `tenants` ADD `subscriptionStatus` enum('trialing','active','past_due','canceled') DEFAULT 'trialing';--> statement-breakpoint
ALTER TABLE `tenants` ADD `subscriptionCurrentPeriodEnd` timestamp;--> statement-breakpoint
ALTER TABLE `tenants` ADD `subscriptionCanceledAt` timestamp;--> statement-breakpoint
ALTER TABLE `tenants` ADD `storageLimit` bigint DEFAULT 10737418240 NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `galleryLimit` int DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `extraStorage` bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `extraGalleries` int DEFAULT 0 NOT NULL;