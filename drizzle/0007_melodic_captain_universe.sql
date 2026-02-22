ALTER TABLE `siteConfig` ADD `paymentPixEnabled` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` ADD `paymentPixKey` text;--> statement-breakpoint
ALTER TABLE `siteConfig` ADD `paymentPagarmeEnabled` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `siteConfig` ADD `paymentPagarmeApiKey` text;--> statement-breakpoint
ALTER TABLE `siteConfig` ADD `siteFont` varchar(50) DEFAULT 'inter';