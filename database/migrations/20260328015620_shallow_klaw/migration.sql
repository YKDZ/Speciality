ALTER TABLE `recipe_steps` ADD `name` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ingredients` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`description` text,
	`image` text,
	`video` text,
	`price` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_ingredients`(`id`, `name`, `description`, `image`, `video`, `price`, `created_at`) SELECT `id`, `name`, `description`, `image`, `video`, `price`, `created_at` FROM `ingredients`;--> statement-breakpoint
DROP TABLE `ingredients`;--> statement-breakpoint
ALTER TABLE `__new_ingredients` RENAME TO `ingredients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tags`(`id`, `name`, `created_at`) SELECT `id`, `name`, `created_at` FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `ingredients_name_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `tags_name_unique`;--> statement-breakpoint
DROP TABLE `todos`;