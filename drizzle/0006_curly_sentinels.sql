ALTER TABLE `siteConfig` MODIFY COLUMN `baseCountry` varchar(100) DEFAULT 'Reino Unido';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `baseCurrency` varchar(10) DEFAULT 'GBP';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `currencySymbol` varchar(10) DEFAULT '£';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `timezone` varchar(100) DEFAULT 'Europe/London';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `phoneCountryCode` varchar(10) DEFAULT '+44';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `baseCountry` varchar(100) DEFAULT 'Reino Unido';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `baseCurrency` varchar(10) DEFAULT 'GBP';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `currencySymbol` varchar(10) DEFAULT '£';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `timezone` varchar(100) DEFAULT 'Europe/London';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `paymentGateway` enum('mercadopago','stripe') DEFAULT 'stripe';