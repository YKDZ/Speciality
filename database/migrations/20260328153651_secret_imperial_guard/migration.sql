ALTER TABLE `recipe_ingredients` ADD `quantity` text;--> statement-breakpoint
ALTER TABLE `recipe_ingredients` ADD `unit` text;--> statement-breakpoint
ALTER TABLE `recipe_ingredients` DROP COLUMN `amount`;--> statement-breakpoint
ALTER TABLE `ingredients` DROP COLUMN `price`;--> statement-breakpoint
ALTER TABLE `ingredients` DROP COLUMN `price_value`;--> statement-breakpoint
ALTER TABLE `ingredients` DROP COLUMN `price_unit`;