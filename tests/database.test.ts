import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as recipeQueries from "@/database/drizzle/queries/recipes";
import * as tagQueries from "@/database/drizzle/queries/tags";
import { relations } from "@/database/drizzle/relations";

const createTestDb = () => {
  const sqlite = new Database(":memory:");
  const db = drizzle({ client: sqlite, relations });
  migrate(db, { migrationsFolder: "./database/migrations" });
  return db;
};

describe("Recipe Queries", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("should insert and retrieve a recipe", () => {
    const recipe = recipeQueries.insertRecipe(db, {
      name: "红烧肉",
      description: "经典红烧肉",
      estimatedTime: 60,
    });

    expect(recipe).toBeDefined();
    expect(recipe.name).toBe("红烧肉");
    expect(recipe.id).toBeTruthy();

    const found = recipeQueries.getRecipeById(db, recipe.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe("红烧肉");
  });

  it("should search recipes by name", () => {
    recipeQueries.insertRecipe(db, { name: "红烧肉" });
    recipeQueries.insertRecipe(db, { name: "西红柿炒蛋" });
    recipeQueries.insertRecipe(db, { name: "蒸鱼" });

    const results = recipeQueries.searchRecipes(db, "红");
    expect(results.length).toBe(2);
  });

  it("should update a recipe", () => {
    const recipe = recipeQueries.insertRecipe(db, { name: "红烧肉" });
    const updated = recipeQueries.updateRecipe(db, recipe.id, {
      name: "红烧排骨",
    });

    expect(updated).toBeDefined();
    expect(updated.name).toBe("红烧排骨");
  });

  it("should delete a recipe", () => {
    const recipe = recipeQueries.insertRecipe(db, { name: "红烧肉" });
    recipeQueries.deleteRecipe(db, recipe.id);

    const found = recipeQueries.getRecipeById(db, recipe.id);
    expect(found).toBeUndefined();
  });

  it("should manage recipe steps", () => {
    const recipe = recipeQueries.insertRecipe(db, { name: "红烧肉" });
    const steps = recipeQueries.upsertSteps(db, recipe.id, [
      { content: "将五花肉切块", sortOrder: 0 },
      { content: "热锅冷油", sortOrder: 1 },
      { content: "小火炖煮", sortOrder: 2 },
    ]);

    expect(steps.length).toBe(3);

    const found = recipeQueries.getStepsByRecipeId(db, recipe.id);
    expect(found.length).toBe(3);
    expect(found[0].content).toBe("将五花肉切块");
  });

  it("should manage recipe images", () => {
    const recipe = recipeQueries.insertRecipe(db, { name: "红烧肉" });
    recipeQueries.upsertImages(db, recipe.id, [
      { url: "https://example.com/img1.jpg", sortOrder: 0 },
      { url: "https://example.com/img2.jpg", sortOrder: 1 },
    ]);

    const images = recipeQueries.getImagesByRecipeId(db, recipe.id);
    expect(images.length).toBe(2);
  });

  it("should manage reviews", () => {
    const recipe = recipeQueries.insertRecipe(db, { name: "红烧肉" });
    const review = recipeQueries.insertReview(db, {
      recipeId: recipe.id,
      author: "小明",
      rating: 5,
      comment: "非常好吃！",
    });

    expect(review.author).toBe("小明");
    expect(review.rating).toBe(5);

    const reviews = recipeQueries.getReviewsByRecipeId(db, recipe.id);
    expect(reviews.length).toBe(1);
  });
});

describe("Ingredient Queries", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("should create and list ingredients", () => {
    ingredientQueries.insertIngredient(db, { name: "五花肉" });
    ingredientQueries.insertIngredient(db, { name: "酱油" });

    const all = ingredientQueries.getAllIngredients(db);
    expect(all.length).toBe(2);
  });

  it("should search ingredients", () => {
    ingredientQueries.insertIngredient(db, { name: "五花肉" });
    ingredientQueries.insertIngredient(db, { name: "猪排骨" });
    ingredientQueries.insertIngredient(db, { name: "酱油" });

    const results = ingredientQueries.searchIngredients(db, "猪");
    expect(results.length).toBe(1);
  });

  it("should update an ingredient", () => {
    const ing = ingredientQueries.insertIngredient(db, { name: "五花肉" });
    const updated = ingredientQueries.updateIngredient(db, ing.id, {
      name: "精品五花肉",
    });
    expect(updated.name).toBe("精品五花肉");
  });

  it("should delete an ingredient", () => {
    const ing = ingredientQueries.insertIngredient(db, { name: "五花肉" });
    ingredientQueries.deleteIngredient(db, ing.id);

    const found = ingredientQueries.getIngredientById(db, ing.id);
    expect(found).toBeUndefined();
  });
});

describe("Tag Queries", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("should create and list tags", () => {
    tagQueries.insertTag(db, "川菜");
    tagQueries.insertTag(db, "粤菜");

    const all = tagQueries.getAllTags(db);
    expect(all.length).toBe(2);
  });

  it("should update a tag", () => {
    const tag = tagQueries.insertTag(db, "川菜");
    const updated = tagQueries.updateTag(db, tag.id, "四川菜");
    expect(updated.name).toBe("四川菜");
  });

  it("should delete a tag", () => {
    const tag = tagQueries.insertTag(db, "川菜");
    tagQueries.deleteTag(db, tag.id);

    const found = tagQueries.getTagById(db, tag.id);
    expect(found).toBeUndefined();
  });
});

describe("Recipe Relations", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("should associate ingredients with recipes", () => {
    const recipe = recipeQueries.insertRecipe(db, { name: "红烧肉" });
    const ing = ingredientQueries.insertIngredient(db, { name: "五花肉" });

    recipeQueries.upsertRecipeIngredients(db, recipe.id, [
      { ingredientId: ing.id, amount: "500g", note: "带皮" },
    ]);

    const ingredients = recipeQueries.getIngredientsByRecipeId(db, recipe.id);
    expect(ingredients.length).toBe(1);
    expect(ingredients[0].ingredientName).toBe("五花肉");
    expect(ingredients[0].amount).toBe("500g");
  });

  it("should associate tags with recipes", () => {
    const recipe = recipeQueries.insertRecipe(db, { name: "红烧肉" });
    const tag = tagQueries.insertTag(db, "川菜");

    recipeQueries.upsertRecipeTags(db, recipe.id, [tag.id]);

    const tags = recipeQueries.getTagsByRecipeId(db, recipe.id);
    expect(tags.length).toBe(1);
    expect(tags[0].tagName).toBe("川菜");
  });
});
