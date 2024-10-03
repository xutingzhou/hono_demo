ALTER TABLE `users` MODIFY COLUMN `phone` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password_change_time` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_activate` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_delete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `modified_at` timestamp DEFAULT (now()) NOT NULL;