ALTER TABLE `siteConfig` MODIFY COLUMN `parallaxEnabled` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `parallaxEnabled` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentStripeEnabled` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentBankTransferEnabled` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentBankTransferEnabled` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentCashEnabled` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentCashEnabled` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `subscriptions` DROP COLUMN `currency`;