ALTER TABLE `siteConfig` MODIFY COLUMN `parallaxEnabled` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `parallaxEnabled` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentStripeEnabled` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentBankTransferEnabled` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentBankTransferEnabled` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentCashEnabled` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentCashEnabled` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentPixEnabled` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentPixEnabled` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentPagarmeEnabled` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `paymentPagarmeEnabled` boolean NOT NULL DEFAULT false;