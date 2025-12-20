ALTER TABLE `contents` ADD `platform` enum('instagram','tiktok') DEFAULT 'instagram';--> statement-breakpoint
ALTER TABLE `contents` ADD `voiceTone` varchar(50) DEFAULT 'casual';