ALTER TABLE `image` ADD `filename_normalized` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `label` ADD `name_normalized` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `task` ADD `name_normalized` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `user` ADD `name_normalized` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `user` ADD `surname_normalized` text DEFAULT '';