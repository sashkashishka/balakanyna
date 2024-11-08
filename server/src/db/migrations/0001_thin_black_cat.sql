CREATE TABLE `image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`path` text NOT NULL,
	`hashsum` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_id` integer,
	`task_id` integer,
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE no action
);
