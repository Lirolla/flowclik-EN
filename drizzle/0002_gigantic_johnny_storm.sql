ALTER TABLE `siteConfig` MODIFY COLUMN `baseCountry` varchar(100) DEFAULT 'Brasil';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `baseCurrency` varchar(10) DEFAULT 'BRL';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `currencySymbol` varchar(10) DEFAULT 'R$';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `timezone` varchar(100) DEFAULT 'America/Sao_Paulo';--> statement-breakpoint
ALTER TABLE `siteConfig` MODIFY COLUMN `phoneCountryCode` varchar(10) DEFAULT '+55';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `baseCountry` varchar(100) DEFAULT 'Brasil';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `baseCurrency` varchar(10) DEFAULT 'BRL';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `currencySymbol` varchar(10) DEFAULT 'R$';--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `timezone` varchar(100) DEFAULT 'America/Sao_Paulo';--> statement-breakpoint
ALTER TABLE `tenants` DROP COLUMN `paymentGateway`;--> statement-breakpoint
ALTER TABLE `tenants` DROP COLUMN `mercadopagoAccessToken`;--> statement-breakpoint
ALTER TABLE `tenants` DROP COLUMN `stripeSecretKey`;