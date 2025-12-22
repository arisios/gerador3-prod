ALTER TABLE `influencerProducts` MODIFY COLUMN `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `influencerProducts` ADD `influencer_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `influencerProducts` ADD `suggested_approaches` json;--> statement-breakpoint
ALTER TABLE `influencerProducts` ADD `selected_approaches` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `influencerProducts` ADD `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `influencerProducts` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `influencerProducts` DROP COLUMN `influencerId`;--> statement-breakpoint
ALTER TABLE `influencerProducts` DROP COLUMN `salesApproach`;--> statement-breakpoint
ALTER TABLE `influencerProducts` DROP COLUMN `createdAt`;