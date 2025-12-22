CREATE TABLE `influencerProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`salesApproach` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `influencerProducts_id` PRIMARY KEY(`id`)
);
