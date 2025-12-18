CREATE TABLE `contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('carousel','image','video') NOT NULL,
	`template` varchar(100) NOT NULL,
	`title` text,
	`description` text,
	`hook` text,
	`hookType` varchar(50),
	`formula` varchar(20),
	`objective` enum('sale','authority','growth') DEFAULT 'authority',
	`person` enum('first','second','third') DEFAULT 'second',
	`clickbait` boolean DEFAULT false,
	`status` enum('draft','generating','ready','published') DEFAULT 'draft',
	`batchId` varchar(36),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `idealClients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`demographics` json,
	`psychographics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `idealClients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencerContents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencerId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('carousel','image','video') NOT NULL,
	`template` varchar(100) NOT NULL,
	`title` text,
	`description` text,
	`hook` text,
	`status` enum('draft','generating','ready','published') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `influencerContents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencerSlides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`order` int NOT NULL,
	`text` text,
	`imageUrl` text,
	`imagePrompt` text,
	`imageBank` json,
	`selectedImageIndex` int DEFAULT 0,
	`style` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `influencerSlides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('normal','transformation') DEFAULT 'normal',
	`description` text,
	`referenceImageUrl` text,
	`beforeImageUrl` text,
	`afterImageUrl` text,
	`style` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `influencers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`level` enum('primary','secondary','unexplored') NOT NULL,
	`pain` text NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pains_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sourceType` enum('site','instagram','tiktok','description') NOT NULL,
	`sourceUrl` text,
	`sourceDescription` text,
	`analysis` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`order` int NOT NULL,
	`text` text,
	`imageUrl` text,
	`imagePrompt` text,
	`imageBank` json,
	`selectedImageIndex` int DEFAULT 0,
	`visualTemplate` varchar(50),
	`style` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `slides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`source` enum('google','tiktok') NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`classification` enum('emerging','rising','peak','declining'),
	`viralProbability` int,
	`suggestedNiches` json,
	`collectedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`defaultStyle` json,
	`trendAlertEnabled` boolean DEFAULT true,
	`trendAlertThreshold` int DEFAULT 70,
	`trendAlertCategories` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `virals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`source` enum('viralhog','reddit') NOT NULL,
	`title` varchar(500) NOT NULL,
	`category` varchar(100),
	`viralProbability` int,
	`suggestedNiches` json,
	`suggestedAngles` json,
	`expiresAt` timestamp,
	`collectedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `virals_id` PRIMARY KEY(`id`)
);
