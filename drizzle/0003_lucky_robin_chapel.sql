ALTER TABLE `tenants` ADD `paymentGateway` enum('mercadopago','stripe') DEFAULT 'mercadopago';--> statement-breakpoint
ALTER TABLE `tenants` ADD `mercadopagoAccessToken` text;--> statement-breakpoint
ALTER TABLE `tenants` ADD `stripeSecretKey` text;