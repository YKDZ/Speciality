CREATE TABLE `combo_recipes` (
	`id` text PRIMARY KEY,
	`combo_id` text NOT NULL,
	`recipe_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_combo_recipes_combo_id_combos_id_fk` FOREIGN KEY (`combo_id`) REFERENCES `combos`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_combo_recipes_recipe_id_recipes_id_fk` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `combos` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`description` text,
	`estimated_time` integer,
	`cover_image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
