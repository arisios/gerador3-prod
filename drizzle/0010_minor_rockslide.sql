CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`url` text,
	`source` varchar(255),
	`publishedAt` varchar(50),
	`imageUrl` text,
	`isSelected` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`query` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topics_id` PRIMARY KEY(`id`)
);
