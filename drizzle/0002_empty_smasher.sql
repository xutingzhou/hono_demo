ALTER TABLE `users` MODIFY COLUMN `full_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password` varchar(128);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` text NOT NULL DEFAULT ('user');--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_unique` UNIQUE(`phone`);