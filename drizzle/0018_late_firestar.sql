CREATE TABLE `influencerProductReferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`type` enum('product_photo','screenshot','environment','context') NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `influencerProductReferences_id` PRIMARY KEY(`id`)
);
