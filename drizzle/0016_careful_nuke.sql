CREATE TABLE `influencerIdealClients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nicheId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`demographics` json,
	`psychographics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `influencerIdealClients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencerNiches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `influencerNiches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencerPains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`idealClientId` int NOT NULL,
	`level` enum('primary','secondary','unexplored') NOT NULL,
	`pain` text NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `influencerPains_id` PRIMARY KEY(`id`)
);
