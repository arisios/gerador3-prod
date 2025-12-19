CREATE TABLE `apiProviders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`type` enum('image','video') NOT NULL,
	`creditsPerUse` int NOT NULL,
	`costPerUseInCents` int NOT NULL,
	`quality` enum('economy','standard','premium') NOT NULL,
	`isActive` boolean DEFAULT true,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiProviders_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiProviders_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `creditPackages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`credits` int NOT NULL,
	`priceInCents` int NOT NULL,
	`stripePriceId` varchar(255),
	`isActive` boolean DEFAULT true,
	`isFeatured` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditPackages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('purchase','usage','refund','bonus') NOT NULL,
	`amount` int NOT NULL,
	`balance` int NOT NULL,
	`description` text,
	`stripePaymentIntentId` varchar(255),
	`stripeSessionId` varchar(255),
	`provider` varchar(50),
	`generationType` varchar(50),
	`referenceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`stripeCustomerId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credits_id` PRIMARY KEY(`id`),
	CONSTRAINT `credits_userId_unique` UNIQUE(`userId`)
);
