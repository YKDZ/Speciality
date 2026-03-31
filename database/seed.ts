/**
 * 种子脚本 - 向数据库填充测试食谱数据（中餐 + 法餐）
 *
 * 两种调用方式：
 *  1. 直接运行：npx tsx database/seed.ts
 *  2. 服务启动时自动调用：import { seed } from "./seed"
 */
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { v4 as uuidv4 } from "uuid";

import type { dbSqlite } from "./drizzle/db";

import { relations } from "./drizzle/relations";
import { ingredientsTable } from "./drizzle/schema/ingredients";
import { metadataTable } from "./drizzle/schema/metadata";
import { recipesTable, recipeStepsTable } from "./drizzle/schema/recipes";
import {
  recipeIngredientsTable,
  recipeTagsTable,
  reviewsTable,
} from "./drizzle/schema/relations";
import { tagsTable } from "./drizzle/schema/tags";

// ── 工具 ──

const id = () => uuidv4();
const ago = (days: number) => new Date(Date.now() - days * 86_400_000);

// ── 标签 ──

const tagData = [
  // Chinese cuisine tags (English)
  "Home-Style",
  "Sichuan",
  "Cantonese",
  "Hunan",
  "Shandong",
  "Vegetarian",
  "Quick & Easy",
  "Soup & Stew",
  // French cuisine tags (Chinese)
  "法式料理",
  "小酒馆风味",
  "法式甜品",
  "法式浓汤",
  "慢炖菜",
] as const;

const tags = tagData.map((name) => ({ id: id(), name, createdAt: ago(30) }));

// ── 食材 ──

const ingredientData = [
  // ── Chinese cuisine ingredients (English) ──
  { name: "Pork Belly", description: "Fatty-lean layered pork" },
  { name: "Tofu", description: "Soft or firm bean curd" },
  { name: "Egg", description: "Free-range preferred" },
  { name: "Tomato", description: "Ripe red tomato" },
  { name: "Potato", description: "Yellow-fleshed potato" },
  { name: "Green Pepper", description: "Fresh green pepper" },
  { name: "Garlic", description: "Fresh garlic cloves" },
  { name: "Ginger", description: "Mature ginger root" },
  { name: "Scallion", description: "Green onion / spring onion" },
  { name: "Soy Sauce", description: "Light or dark soy sauce" },
  { name: "Vinegar", description: "Aged black or aromatic vinegar" },
  { name: "Cooking Wine", description: "Chinese rice cooking wine" },
  { name: "Sugar", description: "Fine granulated sugar" },
  { name: "Salt", description: "Table salt" },
  { name: "Sichuan Peppercorn", description: "Numbing Sichuan pepper" },
  { name: "Dried Chili", description: "Dried red chili pepper" },
  { name: "Doubanjiang", description: "Pixian chili bean paste" },
  { name: "Starch", description: "Corn or potato starch" },
  { name: "Beef Brisket", description: "Brisket with tendons" },
  { name: "Shrimp", description: "Fresh peeled shrimp" },
  { name: "Carrot", description: "Orange carrot" },
  { name: "Wood Ear Mushroom", description: "Dried, rehydrated" },
  { name: "Broccoli", description: "Fresh broccoli crown" },
  { name: "Spare Ribs", description: "Pork spare ribs" },
  { name: "Chicken Breast", description: "Boneless chicken breast" },
  { name: "Star Anise", description: "Whole star anise pod" },
  { name: "Cinnamon", description: "Cinnamon bark stick" },
  { name: "Rock Sugar", description: "Yellow rock sugar" },
  // ── French cuisine ingredients (Chinese) ──
  { name: "鸡腿", description: "带骨带皮鸡腿" },
  { name: "红葡萄酒", description: "酒体饱满，适合炖煮" },
  { name: "培根丁", description: "烟熏培根切丁" },
  { name: "珍珠洋葱", description: "整颗去皮小洋葱" },
  { name: "蘑菇", description: "新鲜白蘑菇或褐蘑菇" },
  { name: "干邑白兰地", description: "法国白兰地" },
  { name: "番茄膏", description: "浓缩番茄酱" },
  { name: "百里香", description: "新鲜百里香枝" },
  { name: "月桂叶", description: "干月桂叶" },
  { name: "蒜", description: "新鲜蒜瓣" },
  { name: "无盐黄油", description: "法式黄油，含脂 82%" },
  { name: "中筋面粉", description: "法式 T55 面粉" },
  { name: "洋葱", description: "黄洋葱" },
  { name: "干白葡萄酒", description: "适合溜锅和调酱" },
  { name: "牛肉高汤", description: "浓郁牛骨汤" },
  { name: "法棍面包", description: "经典法式长棍面包" },
  { name: "格吕耶尔奶酪", description: "陈年瑞士风格硬质奶酪" },
  { name: "食盐", description: "调味用盐" },
  { name: "西葫芦", description: "新鲜绿西葫芦" },
  { name: "茄子", description: "圆茄子" },
  { name: "甜椒", description: "红色或黄色甜椒" },
  { name: "番茄", description: "成熟红番茄" },
  { name: "橄榄油", description: "特级初榨橄榄油" },
  { name: "普罗旺斯香草", description: "干制混合香草" },
  { name: "蛋黄", description: "新鲜蛋黄" },
  { name: "香草荚", description: "波旁香草豆荚" },
  { name: "细砂糖", description: "精制白砂糖" },
  { name: "全脂牛奶", description: "全脂纯牛奶" },
  { name: "牛肩肉", description: "去骨牛肩肉，适合慢炖" },
  { name: "淡奶油", description: "含脂 35% 的稀奶油" },
  { name: "胡萝卜", description: "新鲜橙色胡萝卜" },
] as const satisfies { name: string; description: string }[];

const ingredients = ingredientData.map((ing) => ({
  id: id(),
  name: ing.name,
  description: ing.description,
  createdAt: ago(30),
}));

/** 按食材名查找 id */
const ingId = (name: string) => {
  const found = ingredients.find((i) => i.name === name);
  if (!found) throw new Error(`食材 "${name}" 未定义`);
  return found.id;
};

/** 按标签名查找 id */
const tagId = (name: string) => {
  const found = tags.find((t) => t.name === name);
  if (!found) throw new Error(`标签 "${name}" 未定义`);
  return found.id;
};

// ── 食谱定义 ──

interface RecipeSeed {
  name: string;
  description: string;
  coverImage?: string;
  estimatedTime: number;
  tags: string[];
  ingredients: {
    name: string;
    quantity: string;
    unit?: string;
    note?: string;
  }[];
  steps: { name?: string; content: string }[];
  reviews: { author: string; rating: number; comment: string }[];
  daysAgo: number;
}

const recipeSeedData = [
  // ═══════════════════════════════════════════
  // Chinese Cuisine - all content in English
  // ═══════════════════════════════════════════
  {
    name: "Red Braised Pork Belly",
    description:
      "A classic home-style dish - rich, glossy, and melt-in-your-mouth tender. Pork belly is blanched, caramelized with rock sugar, and slow-braised to perfection.",
    coverImage: "/seed-images/seed-red-braised-pork-belly.jpg",
    estimatedTime: 90,
    tags: ["Home-Style", "Shandong"],
    ingredients: [
      {
        name: "Pork Belly",
        quantity: "500",
        unit: "g",
        note: "cut into 3cm cubes",
      },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp" },
      { name: "Rock Sugar", quantity: "30", unit: "g" },
      { name: "Cooking Wine", quantity: "2", unit: "tbsp" },
      { name: "Ginger", quantity: "3", unit: "slices" },
      { name: "Star Anise", quantity: "2" },
      { name: "Cinnamon", quantity: "1", note: "small piece" },
      { name: "Scallion", quantity: "2", unit: "stalks" },
    ],
    steps: [
      {
        name: "Blanch",
        content:
          "Place pork belly in cold water with cooking wine and ginger slices. Bring to a boil, skim off the foam, then drain.",
      },
      {
        name: "Caramelize sugar",
        content:
          "Add a little oil to the wok, then add rock sugar and melt over low heat until amber and bubbly.",
      },
      {
        name: "Coat the pork",
        content:
          "Add the pork belly and stir-fry until each piece is evenly coated in the caramelized sugar.",
      },
      {
        name: "Add seasonings",
        content:
          "Add soy sauce and cooking wine, then star anise, cinnamon, ginger slices, and scallion sections.",
      },
      {
        name: "Braise",
        content:
          "Pour in enough hot water to cover the meat. Bring to a boil, then reduce to low heat and simmer for 60 minutes.",
      },
      {
        name: "Reduce sauce",
        content:
          "Turn up the heat and reduce the sauce until thick and glossy.",
      },
    ],
    reviews: [
      {
        author: "Xiao Ming",
        rating: 5,
        comment: "Beautiful glaze, melts in your mouth - absolutely delicious!",
      },
      {
        author: "Foodie Ah Hua",
        rating: 4,
        comment: "Great flavor. The caramel could be a touch darker.",
      },
      {
        author: "Lao Zhang",
        rating: 5,
        comment: "Classic taste, works perfectly every time.",
      },
    ],
    daysAgo: 20,
  },
  {
    name: "Mapo Tofu",
    description:
      "A famous Sichuan dish - numbing, spicy, and deeply savory. Silken tofu is simmered in a bold sauce of doubanjiang and Sichuan peppercorn.",
    coverImage: "/seed-images/seed-mapo-tofu.jpg",
    estimatedTime: 25,
    tags: ["Sichuan", "Quick & Easy"],
    ingredients: [
      {
        name: "Tofu",
        quantity: "1",
        note: "block (~400g), cut into 2cm cubes",
      },
      { name: "Pork Belly", quantity: "100", unit: "g", note: "minced" },
      { name: "Doubanjiang", quantity: "1.5", unit: "tbsp" },
      {
        name: "Sichuan Peppercorn",
        quantity: "1",
        unit: "tsp",
        note: "ground",
      },
      { name: "Garlic", quantity: "3", unit: "cloves", note: "minced" },
      { name: "Ginger", quantity: "1", note: "small piece, minced" },
      { name: "Soy Sauce", quantity: "1", unit: "tbsp" },
      {
        name: "Starch",
        quantity: "1",
        unit: "tbsp",
        note: "mixed with water to form slurry",
      },
      { name: "Scallion", quantity: "2", unit: "stalks", note: "chopped" },
    ],
    steps: [
      {
        name: "Blanch tofu",
        content:
          "Bring salted water to a boil, blanch the tofu cubes for 2 minutes, then drain.",
      },
      {
        name: "Fry the meat",
        content:
          "Heat oil in a wok, add the minced pork and stir-fry until browned.",
      },
      {
        name: "Cook the paste",
        content:
          "Add doubanjiang, minced ginger, and garlic. Stir-fry until fragrant and the oil turns red.",
      },
      {
        name: "Simmer tofu",
        content:
          "Add water and bring to a boil. Gently slide in the tofu cubes and simmer on low heat for 5 minutes to absorb the sauce.",
      },
      {
        name: "Thicken and serve",
        content:
          "Drizzle in the starch slurry to thicken, then sprinkle ground Sichuan pepper and chopped scallions on top.",
      },
    ],
    reviews: [
      {
        author: "Li the Sichuan Fan",
        rating: 5,
        comment: "Numbing and spicy - incredibly authentic!",
      },
      {
        author: "Tofu Lover",
        rating: 5,
        comment: "Silky tofu packed with flavor, perfect over rice.",
      },
    ],
    daysAgo: 15,
  },
  {
    name: "Tomato and Egg Stir-Fry",
    description:
      "One of the simplest home-cooked dishes - tangy, slightly sweet, and loved by all ages. Mastering the heat is the key.",
    coverImage: "/seed-images/seed-tomato-egg-stir-fry.jpg",
    estimatedTime: 15,
    tags: ["Home-Style", "Quick & Easy"],
    ingredients: [
      { name: "Tomato", quantity: "2", note: "cut into wedges" },
      { name: "Egg", quantity: "3" },
      { name: "Sugar", quantity: "1", unit: "tsp" },
      { name: "Salt", quantity: "to taste" },
      { name: "Scallion", quantity: "1", unit: "stalk", note: "chopped" },
    ],
    steps: [
      {
        name: "Scramble eggs",
        content:
          "Beat the eggs. Add generous oil to a hot wok and quickly scramble into large, fluffy curds. Remove and set aside.",
      },
      {
        name: "Cook tomatoes",
        content:
          "In the remaining oil, stir-fry the tomato wedges until they break down and release their juices.",
      },
      {
        name: "Combine",
        content:
          "Season with sugar and salt, return the eggs, toss to combine, and finish with chopped scallions.",
      },
    ],
    reviews: [
      {
        author: "Student Xiao Wang",
        rating: 5,
        comment: "Simple and delicious - the very first dish I learned!",
      },
      {
        author: "Mom",
        rating: 4,
        comment: "A dash of ketchup makes it even richer.",
      },
      {
        author: "Fitness Fan",
        rating: 4,
        comment: "Tastes great even with less oil and sugar.",
      },
      {
        author: "Kitchen Newbie",
        rating: 5,
        comment: "Nailed it on my first try - so happy!",
      },
    ],
    daysAgo: 10,
  },
  {
    name: "Kung Pao Chicken",
    description:
      "A Sichuan classic - tender chicken, crunchy peanuts, and a sweet-sour-spicy sauce that keeps you coming back for more.",
    coverImage: "/seed-images/seed-kung-pao-chicken.jpg",
    estimatedTime: 30,
    tags: ["Sichuan", "Home-Style"],
    ingredients: [
      { name: "Chicken Breast", quantity: "300", unit: "g", note: "diced" },
      { name: "Sichuan Peppercorn", quantity: "1", unit: "tsp" },
      { name: "Dried Chili", quantity: "8-10", note: "snipped, seeds removed" },
      { name: "Garlic", quantity: "3", unit: "cloves" },
      { name: "Ginger", quantity: "2", unit: "slices" },
      {
        name: "Scallion",
        quantity: "2",
        unit: "stalks",
        note: "cut into sections",
      },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp" },
      { name: "Vinegar", quantity: "1", unit: "tbsp" },
      { name: "Sugar", quantity: "1", unit: "tbsp" },
      { name: "Starch", quantity: "1", unit: "tbsp", note: "for marinating" },
      { name: "Cooking Wine", quantity: "1", unit: "tbsp" },
    ],
    steps: [
      {
        name: "Marinate chicken",
        content:
          "Toss the diced chicken with cooking wine, soy sauce, and starch. Marinate for 15 minutes.",
      },
      {
        name: "Mix the sauce",
        content:
          "Combine soy sauce, vinegar, sugar, starch, and a splash of water in a bowl. Set aside.",
      },
      {
        name: "Toast aromatics",
        content:
          "Add oil to the wok, then stir-fry Sichuan peppercorns and dried chilies on low heat until fragrant and darkened.",
      },
      {
        name: "Stir-fry chicken",
        content:
          "Turn up the heat, add the chicken and stir-fry briskly until just cooked through.",
      },
      {
        name: "Finish",
        content:
          "Add garlic, ginger, and scallion sections. Pour in the sauce and toss until glossy. Fold in fried peanuts and serve immediately.",
      },
    ],
    reviews: [
      {
        author: "Foodie Chen",
        rating: 5,
        comment: "Tender chicken and crispy peanuts - so fragrant!",
      },
      {
        author: "Spice Lover",
        rating: 4,
        comment: "Could use even more chilies for extra kick.",
      },
    ],
    daysAgo: 18,
  },
  {
    name: "Hot and Sour Shredded Potatoes",
    description:
      "Crisp, tangy, and slightly spicy - a beloved everyday dish that is as quick to make as it is satisfying to eat.",
    estimatedTime: 20,
    tags: ["Home-Style", "Quick & Easy"],
    coverImage: "/seed-images/seed-hot-sour-shredded-potatoes.jpg",
    ingredients: [
      { name: "Potato", quantity: "2", note: "julienned and soaked in water" },
      { name: "Dried Chili", quantity: "5" },
      { name: "Sichuan Peppercorn", quantity: "a pinch" },
      { name: "Vinegar", quantity: "2", unit: "tbsp" },
      { name: "Salt", quantity: "to taste" },
      { name: "Scallion", quantity: "1", unit: "stalk" },
      { name: "Garlic", quantity: "2", unit: "cloves" },
    ],
    steps: [
      {
        name: "Prep potatoes",
        content:
          "Peel and julienne the potatoes. Soak in cold water for 10 minutes to remove excess starch, then drain well.",
      },
      {
        name: "Bloom aromatics",
        content:
          "Heat oil in a wok, add Sichuan peppercorns and dried chilies on low heat until fragrant.",
      },
      {
        name: "Flash-fry",
        content:
          "Turn to high heat, add the potato shreds and stir-fry vigorously for 2\u20133 minutes. Add vinegar, salt, and minced garlic, toss to combine, and serve.",
      },
    ],
    reviews: [
      {
        author: "Rice King",
        rating: 5,
        comment: "Super crispy and addictive - perfect with steamed rice.",
      },
      {
        author: "Veggie Fan Xiao Ya",
        rating: 5,
        comment: "A simple and tasty vegetarian favorite!",
      },
    ],
    daysAgo: 8,
  },
  {
    name: "Sweet and Sour Spare Ribs",
    description:
      "Glossy, crispy on the outside, tender on the inside, with a perfect balance of sweet and sour. The ribs are fried first, then coated in a caramelized sauce.",
    coverImage: "/seed-images/seed-sweet-sour-spare-ribs.jpg",
    estimatedTime: 60,
    tags: ["Home-Style", "Shandong"],
    ingredients: [
      {
        name: "Spare Ribs",
        quantity: "500",
        unit: "g",
        note: "chopped into short sections",
      },
      { name: "Sugar", quantity: "3", unit: "tbsp" },
      { name: "Vinegar", quantity: "3", unit: "tbsp" },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp" },
      { name: "Cooking Wine", quantity: "1", unit: "tbsp" },
      { name: "Ginger", quantity: "3", unit: "slices" },
      { name: "Scallion", quantity: "2", unit: "stalks" },
      { name: "Starch", quantity: "to taste" },
    ],
    steps: [
      {
        name: "Blanch",
        content:
          "Place ribs in cold water with ginger and cooking wine. Bring to a boil, skim off foam, then drain.",
      },
      {
        name: "Fry ribs",
        content:
          "Dust the ribs with a thin layer of starch and deep-fry until golden. Remove and drain.",
      },
      {
        name: "Make the sauce",
        content:
          "In a clean wok with a little oil, melt sugar until bubbly, then add vinegar, soy sauce, and a splash of water to form the sweet-and-sour glaze.",
      },
      {
        name: "Coat and serve",
        content:
          "Toss the fried ribs in the sauce until evenly coated. Garnish with chopped scallions and sesame seeds.",
      },
    ],
    reviews: [
      {
        author: "Busy Mom",
        rating: 5,
        comment: "My kids' absolute favorite - they always ask for seconds.",
      },
      {
        author: "Sweet Tooth",
        rating: 5,
        comment: "The sweet-and-sour balance is spot on!",
      },
      {
        author: "Weekend Cook",
        rating: 4,
        comment: "Frying uses a lot of oil, but the result is worth it.",
      },
    ],
    daysAgo: 12,
  },
  {
    name: "Garlic Broccoli",
    description:
      "A light, healthy stir-fry bursting with garlic aroma and vibrant green crunch.",
    estimatedTime: 10,
    tags: ["Vegetarian", "Quick & Easy"],
    coverImage: "/seed-images/seed-garlic-broccoli.jpg",
    ingredients: [
      { name: "Broccoli", quantity: "1", note: "head, broken into florets" },
      { name: "Garlic", quantity: "5", unit: "cloves", note: "minced" },
      { name: "Salt", quantity: "to taste" },
    ],
    steps: [
      {
        name: "Blanch",
        content:
          "Boil water with a pinch of salt and a drop of oil. Blanch the broccoli for 1 minute, then plunge into ice water.",
      },
      {
        name: "Fry garlic",
        content:
          "Heat oil in a wok and gently fry the minced garlic until light gold.",
      },
      {
        name: "Stir-fry",
        content:
          "Add the broccoli, stir-fry on high heat for 1 minute, season with salt, and serve.",
      },
    ],
    reviews: [
      {
        author: "Gym Goer",
        rating: 5,
        comment: "Simple, healthy, and a daily staple for me.",
      },
      {
        author: "Green Eater",
        rating: 4,
        comment: "A splash of oyster sauce takes it up a notch.",
      },
    ],
    daysAgo: 5,
  },
  {
    name: "Red Braised Beef Brisket",
    description:
      "A hearty braise with fork-tender beef brisket, potatoes, and carrots in a rich, savory sauce - pure comfort food.",
    estimatedTime: 120,
    coverImage: "/seed-images/seed-red-braised-beef-brisket.jpg",
    tags: ["Home-Style", "Soup & Stew"],
    ingredients: [
      { name: "Beef Brisket", quantity: "600", unit: "g", note: "cubed" },
      { name: "Potato", quantity: "2", note: "cubed" },
      { name: "Carrot", quantity: "1", note: "roll-cut" },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp" },
      { name: "Doubanjiang", quantity: "1", unit: "tbsp" },
      { name: "Star Anise", quantity: "2" },
      { name: "Cinnamon", quantity: "1", note: "small piece" },
      { name: "Ginger", quantity: "4", unit: "slices" },
      { name: "Cooking Wine", quantity: "2", unit: "tbsp" },
      { name: "Scallion", quantity: "3", unit: "stalks" },
    ],
    steps: [
      {
        name: "Blanch",
        content:
          "Place beef in cold water with cooking wine and ginger. Bring to a boil, skim foam, and drain.",
      },
      {
        name: "Sear",
        content:
          "Heat oil in a pot, fry scallions, ginger, garlic, star anise, and cinnamon until fragrant, then add the beef and stir-fry.",
      },
      {
        name: "Season",
        content:
          "Add doubanjiang and soy sauce, stir-fry until the beef is evenly colored.",
      },
      {
        name: "Braise",
        content:
          "Pour in enough hot water to cover the beef. Bring to a boil, then simmer on low heat for 1.5 hours.",
      },
      {
        name: "Add vegetables",
        content:
          "Add potatoes and carrots, continue braising for 20 minutes until tender.",
      },
      {
        name: "Reduce sauce",
        content:
          "Turn up the heat and reduce the sauce until thick. Adjust seasoning and serve.",
      },
    ],
    reviews: [
      {
        author: "Beef Lover",
        rating: 5,
        comment: "Meltingly tender - the sauce over rice is heavenly.",
      },
      {
        author: "Winter Essential",
        rating: 5,
        comment: "Nothing beats a pot of this on a cold day.",
      },
    ],
    daysAgo: 22,
  },
  {
    name: "Yu Xiang Shredded Pork",
    description:
      "A Sichuan classic that, despite its name (fish-fragrant), contains no fish. A harmonious blend of sour, sweet, salty, spicy, and savory in every bite.",
    coverImage: "/seed-images/seed-yuxiang-shredded-pork.jpg",
    estimatedTime: 25,
    tags: ["Sichuan", "Home-Style"],
    ingredients: [
      { name: "Pork Belly", quantity: "200", unit: "g", note: "shredded" },
      {
        name: "Wood Ear Mushroom",
        quantity: "50",
        unit: "g",
        note: "soaked and shredded",
      },
      { name: "Carrot", quantity: "0.5", note: "shredded" },
      { name: "Green Pepper", quantity: "1", note: "shredded" },
      { name: "Doubanjiang", quantity: "1", unit: "tbsp" },
      { name: "Vinegar", quantity: "1.5", unit: "tbsp" },
      { name: "Sugar", quantity: "1", unit: "tbsp" },
      { name: "Soy Sauce", quantity: "1", unit: "tbsp" },
      { name: "Starch", quantity: "1", unit: "tbsp" },
      { name: "Cooking Wine", quantity: "1", unit: "tbsp" },
      { name: "Garlic", quantity: "3", unit: "cloves" },
      { name: "Ginger", quantity: "1", note: "small piece" },
      { name: "Scallion", quantity: "2", unit: "stalks" },
    ],
    steps: [
      {
        name: "Marinate pork",
        content:
          "Toss the shredded pork with cooking wine, soy sauce, and starch. Marinate for 10 minutes.",
      },
      {
        name: "Mix the yu xiang sauce",
        content:
          "Combine vinegar, sugar, soy sauce, starch, and a little water in a bowl. Stir well.",
      },
      {
        name: "Stir-fry pork",
        content:
          "Heat oil in a wok, stir-fry the pork until just cooked, then set aside.",
      },
      {
        name: "Stir-fry vegetables",
        content:
          "In the remaining oil, fry doubanjiang with minced ginger and garlic until fragrant. Add carrot, wood ear, and green pepper shreds and toss.",
      },
      {
        name: "Combine",
        content:
          "Return the pork, pour in the yu xiang sauce, and stir-fry on high heat until glossy. Finish with chopped scallions.",
      },
    ],
    reviews: [
      {
        author: "Fish-Free Fan",
        rating: 5,
        comment:
          "The sauce is incredible - sour, sweet, and spicy all at once.",
      },
      {
        author: "Rice Destroyer",
        rating: 5,
        comment: "I always cook an extra bowl of rice when making this.",
      },
      {
        author: "Cooking Student",
        rating: 4,
        comment:
          "Getting the sauce ratio right is key - worth a few practice runs.",
      },
    ],
    daysAgo: 14,
  },
  {
    name: "Egg Fried Rice",
    description:
      "Deceptively simple yet a true test of wok skills. Each grain should be separate, golden, and fragrant with egg.",
    coverImage: "/seed-images/seed-egg-fried-rice.jpg",
    estimatedTime: 10,
    tags: ["Home-Style", "Quick & Easy"],
    ingredients: [
      { name: "Egg", quantity: "2" },
      { name: "Scallion", quantity: "2", unit: "stalks", note: "chopped" },
      { name: "Salt", quantity: "to taste" },
    ],
    steps: [
      {
        name: "Scramble eggs",
        content:
          "Beat the eggs and pour into a hot, oiled wok. Quickly break into small pieces.",
      },
      {
        name: "Fry rice",
        content:
          "Add day-old cold rice and stir-fry vigorously on high heat until every grain is separate and coated with egg.",
      },
      {
        name: "Season",
        content:
          "Season with salt, toss in chopped scallions, and stir-fry to combine.",
      },
    ],
    reviews: [
      {
        author: "Late Night Kitchen",
        rating: 5,
        comment: "Simple happiness - the best late-night comfort food.",
      },
      {
        author: "Lazy Chef",
        rating: 5,
        comment: "The ultimate destination for leftover rice.",
      },
    ],
    daysAgo: 3,
  },
  {
    name: "Shrimp with Silky Scrambled Eggs",
    description:
      "A Cantonese classic - bouncy shrimp enveloped in soft, custard-like scrambled eggs. Incredibly delicate and refined.",
    coverImage: "/seed-images/seed-shrimp-scrambled-eggs.jpg",
    estimatedTime: 15,
    tags: ["Cantonese", "Quick & Easy"],
    ingredients: [
      { name: "Shrimp", quantity: "200", unit: "g", note: "deveined" },
      { name: "Egg", quantity: "4" },
      { name: "Cooking Wine", quantity: "1", unit: "tsp" },
      { name: "Salt", quantity: "to taste" },
      { name: "Scallion", quantity: "1", unit: "stalk", note: "chopped" },
      { name: "Starch", quantity: "a pinch", note: "for marinating shrimp" },
    ],
    steps: [
      {
        name: "Marinate shrimp",
        content:
          "Toss shrimp with a pinch of salt, cooking wine, and starch. Marinate for 10 minutes.",
      },
      {
        name: "Mix egg batter",
        content:
          "Beat the eggs with a little salt, then fold in the marinated shrimp.",
      },
      {
        name: "Silky stir-fry",
        content:
          "Heat generous oil to medium, pour in the shrimp-egg mixture, and gently push with chopsticks. Remove from heat the moment the eggs are barely set. Garnish with scallions.",
      },
    ],
    reviews: [
      {
        author: "Cantonese Food Fan",
        rating: 5,
        comment: "Bouncy shrimp, silky eggs - sheer perfection.",
      },
      {
        author: "Breakfast Lover",
        rating: 4,
        comment: "Wonderful for breakfast - nutritious and quick.",
      },
    ],
    daysAgo: 7,
  },
  {
    name: "Steamed Fish Head with Chopped Chili",
    description:
      "A signature Hunan dish - fresh fish head topped with fiery chopped chilies and steamed to preserve its natural sweetness.",
    coverImage: "/seed-images/seed-steamed-fish-head-chili.jpg",
    estimatedTime: 40,
    tags: ["Hunan"],
    ingredients: [
      { name: "Garlic", quantity: "4", unit: "cloves", note: "minced" },
      { name: "Ginger", quantity: "3", unit: "slices" },
      {
        name: "Scallion",
        quantity: "3",
        unit: "stalks",
        note: "cut into sections",
      },
      { name: "Soy Sauce", quantity: "1", unit: "tbsp" },
      { name: "Cooking Wine", quantity: "2", unit: "tbsp" },
    ],
    steps: [
      {
        name: "Prep fish head",
        content:
          "Clean the fish head and split it open (without cutting through). Rub with cooking wine and ginger, marinate for 15 minutes.",
      },
      {
        name: "Layer toppings",
        content:
          "Place the fish head on a steaming plate and spread chopped chilies, minced garlic, and ginger over the top.",
      },
      {
        name: "Steam",
        content:
          "Steam on high heat for 12\u201315 minutes until the fish is cooked through.",
      },
      {
        name: "Finish",
        content:
          "Remove, drizzle with hot oil and soy sauce, then scatter scallion sections on top.",
      },
    ],
    reviews: [
      {
        author: "Hunan Native",
        rating: 5,
        comment: "Tastes like home - fiery and satisfying!",
      },
      {
        author: "Seafood Lover",
        rating: 5,
        comment: "Steaming keeps the fish wonderfully tender.",
      },
    ],
    daysAgo: 16,
  },

  // ═══════════════════════════════════════════
  // 法式料理 - 所有内容使用中文
  // ═══════════════════════════════════════════
  {
    name: "红酒炖鸡",
    description:
      "正宗法式乡村名菜：鸡肉在红酒中与蘑菇、培根丁和珍珠洋葱一同慢炖，风味浓郁醇厚，暖心暖胃。",
    coverImage: "/seed-images/seed-coq-au-vin.jpg",
    estimatedTime: 120,
    tags: ["法式料理", "慢炖菜"],
    ingredients: [
      { name: "鸡腿", quantity: "8", unit: "块", note: "带骨带皮" },
      {
        name: "红葡萄酒",
        quantity: "750",
        unit: "毫升",
        note: "整瓶，勃艮第为佳",
      },
      { name: "培根丁", quantity: "200", unit: "克" },
      { name: "珍珠洋葱", quantity: "200", unit: "克", note: "去皮" },
      { name: "蘑菇", quantity: "250", unit: "克", note: "切四瓣" },
      { name: "干邑白兰地", quantity: "60", unit: "毫升" },
      { name: "番茄膏", quantity: "2", unit: "勺" },
      { name: "百里香", quantity: "4", unit: "枝" },
      { name: "月桂叶", quantity: "2", unit: "片" },
      { name: "蒜", quantity: "4", unit: "瓣", note: "拍碎" },
      { name: "无盐黄油", quantity: "30", unit: "克" },
      { name: "中筋面粉", quantity: "2", unit: "勺" },
    ],
    steps: [
      {
        name: "腌制",
        content:
          "将鸡块放入大碗中，倒入整瓶红酒，加入百里香、月桂叶和拍碎的蒜瓣。盖上保鲜膜，冷藏腌制一夜，至少 4 小时。",
      },
      {
        name: "煎鸡肉",
        content:
          "取出鸡块并彻底擦干，腌汁留用。用盐和胡椒调味。在铸铁锅中用黄油中大火将鸡块皮面朝下煎至金黄，每面约 4 分钟，取出备用。",
      },
      {
        name: "炒培根与洋葱",
        content:
          "同一口锅中煎培根丁至酥脆，加入珍珠洋葱煎至微黄，再加蘑菇翻炒 3 分钟。",
      },
      {
        name: "烹酒收汁",
        content:
          "撒入面粉翻炒 1 分钟，倒入干邑白兰地，小心点燃焰烧。火焰熄灭后加入腌汁和番茄酱，搅拌均匀。",
      },
      {
        name: "慢炖",
        content:
          "将鸡块放回锅中，液面应几乎没过鸡肉。烧开后转小火，盖上锅盖炖 1.5 小时至鸡肉酥烂。",
      },
      {
        name: "收汁装盘",
        content:
          "取出鸡块和蔬菜。大火收汁至酱汁浓稠可挂匙，将所有食材放回锅中拌匀即可，搭配面包或土豆泥上桌。",
      },
    ],
    reviews: [
      {
        author: "Pierre",
        rating: 5,
        comment: "美味绝伦，隔夜腌制真的是点睛之笔。",
      },
      {
        author: "Julia",
        rating: 5,
        comment: "这才是正宗的法式乡村风味--浓郁、质朴又暖心。",
      },
      {
        author: "Marc",
        rating: 4,
        comment: "非常出色，我在最后又加了一点干邑。",
      },
    ],
    daysAgo: 19,
  },
  {
    name: "法式洋葱汤",
    description:
      "深度焦糖化的洋葱汤，配上烤脆的法棍面包片和融化的格吕耶尔奶酪。秘诀就是耐心--洋葱的焦糖化需要足够时间。",
    coverImage: "/seed-images/seed-french-onion-soup.jpg",
    estimatedTime: 90,
    tags: ["法式料理", "法式浓汤", "小酒馆风味"],
    ingredients: [
      { name: "洋葱", quantity: "6", unit: "大个", note: "切薄丝" },
      { name: "无盐黄油", quantity: "60", unit: "克" },
      { name: "干白葡萄酒", quantity: "200", unit: "毫升" },
      { name: "牛肉高汤", quantity: "1.5", unit: "升" },
      { name: "百里香", quantity: "3", unit: "枝" },
      { name: "月桂叶", quantity: "1", unit: "片" },
      { name: "法棍面包", quantity: "6", unit: "片", note: "烤脆" },
      { name: "格吕耶尔奶酪", quantity: "200", unit: "克", note: "刨丝" },
      { name: "食盐", quantity: "适量" },
    ],
    steps: [
      {
        name: "焦糖化洋葱",
        content:
          "在厚底锅中用中火融化黄油，放入全部洋葱丝和一小撮盐。不时翻炒，持续 45-60 分钟，直到洋葱变为深金色、呈果酱状。切勿心急。",
      },
      {
        name: "溜锅收汁",
        content:
          "倒入白葡萄酒，用铲子刮起锅底焦香物质。继续煮至酒液几乎完全收干。",
      },
      {
        name: "熬汤",
        content:
          "加入牛肉高汤、百里香和月桂叶。烧开后转小火煮 20 分钟。用盐和胡椒调味，取出百里香和月桂叶。",
      },
      {
        name: "组装烤制",
        content:
          "将汤盛入可进烤箱的碗中，放上烤面包片，铺满格吕耶尔奶酪丝。放入烤箱上层烤 3-5 分钟，直到奶酪起泡变金黄。",
      },
    ],
    reviews: [
      {
        author: "Sophie",
        rating: 5,
        comment: "焦糖洋葱赋予了汤不可思议的深度，每一分钟的等待都值得。",
      },
      {
        author: "Fran\u00e7ois",
        rating: 5,
        comment: "就像巴黎小酒馆的味道，奶酪脆壳堪称完美。",
      },
    ],
    daysAgo: 11,
  },
  {
    name: "普罗旺斯炖菜",
    description:
      "一道色彩缤纷的普罗旺斯蔬菜炖菜，尽显夏日风味。每种蔬菜既保留自身特色，又与其他食材和谐交融。",
    coverImage: "/seed-images/seed-ratatouille.jpg",
    estimatedTime: 75,
    tags: ["法式料理", "小酒馆风味"],
    ingredients: [
      { name: "西葫芦", quantity: "2", unit: "根", note: "切半月片" },
      { name: "茄子", quantity: "1", unit: "大个", note: "切丁" },
      { name: "甜椒", quantity: "2", unit: "个", note: "红黄各一，切丁" },
      { name: "番茄", quantity: "4", unit: "个", note: "去皮切碎" },
      { name: "洋葱", quantity: "1", unit: "大个", note: "切丁" },
      { name: "蒜", quantity: "4", unit: "瓣", note: "切末" },
      { name: "橄榄油", quantity: "80", unit: "毫升" },
      { name: "百里香", quantity: "3", unit: "枝" },
      { name: "普罗旺斯香草", quantity: "1", unit: "勺" },
      { name: "月桂叶", quantity: "1", unit: "片" },
      { name: "食盐", quantity: "适量" },
    ],
    steps: [
      {
        name: "处理茄子",
        content:
          "将茄丁撒盐后放入漏篮静置 20 分钟以析出水分，然后用厨房纸巾擦干。",
      },
      {
        name: "分别煎炒蔬菜",
        content:
          "大平底锅加橄榄油，将每种蔬菜分别用中大火煎至微微上色：茄子 5 分钟、西葫芦 3 分钟、甜椒 4 分钟。分别盛入铸铁焖锅中。",
      },
      {
        name: "熬番茄底",
        content:
          "同一平底锅中炒洋葱至透明，加蒜末炒 1 分钟，放入番茄碎、百里香、普罗旺斯香草和月桂叶，小火煮 10 分钟。",
      },
      {
        name: "合炖",
        content:
          "将番茄酱汁倒入装有煎好蔬菜的焖锅中，轻轻搅拌。盖上锅盖小火炖 30 分钟，期间偶尔翻动。",
      },
      {
        name: "静置上桌",
        content:
          "离火静置 10 分钟让风味充分融合。温热或室温食用，淋上特级初榨橄榄油和新鲜罗勒即可。",
      },
    ],
    reviews: [
      {
        author: "Camille",
        rating: 5,
        comment: "吃起来就像普罗旺斯的夏天，色彩斑斓，风味绝佳。",
      },
      { author: "Luc", rating: 4, comment: "很棒的菜，第二天加热吃更入味。" },
      {
        author: "Am\u00e9lie",
        rating: 5,
        comment: "健康又美味，还很精致，完美的工作日晚餐。",
      },
    ],
    daysAgo: 6,
  },
  {
    name: "勃艮第红酒炖牛肉",
    description:
      "勃艮第传奇名菜--牛肉在红酒中与胡萝卜、珍珠洋葱和蘑菇一同慢炖数小时。耐心烹饪，将平凡的牛肩肉化为非凡。",
    coverImage: "/seed-images/seed-beef-bourguignon.jpg",
    estimatedTime: 180,
    tags: ["法式料理", "慢炖菜"],
    ingredients: [
      { name: "牛肩肉", quantity: "1", unit: "千克", note: "切 5cm 方块" },
      {
        name: "红葡萄酒",
        quantity: "750",
        unit: "毫升",
        note: "勃艮第或黑皮诺",
      },
      { name: "培根丁", quantity: "150", unit: "克" },
      { name: "珍珠洋葱", quantity: "200", unit: "克", note: "去皮" },
      { name: "蘑菇", quantity: "200", unit: "克", note: "对半切" },
      { name: "胡萝卜", quantity: "3", unit: "根", note: "切大块" },
      { name: "番茄膏", quantity: "2", unit: "勺" },
      { name: "牛肉高汤", quantity: "500", unit: "毫升" },
      { name: "百里香", quantity: "3", unit: "枝" },
      { name: "月桂叶", quantity: "2", unit: "片" },
      { name: "蒜", quantity: "3", unit: "瓣", note: "拍碎" },
      { name: "中筋面粉", quantity: "3", unit: "勺" },
      { name: "无盐黄油", quantity: "30", unit: "克" },
      { name: "干邑白兰地", quantity: "30", unit: "毫升" },
    ],
    steps: [
      {
        name: "腌制牛肉",
        content:
          "将牛肉块、红酒、百里香、月桂叶和蒜瓣放入大碗中混合。盖上保鲜膜，冷藏腌制至少 6 小时或过夜。",
      },
      {
        name: "煎牛肉",
        content:
          "取出牛肉，彻底擦干，腌汁留用。在铸铁锅中用黄油大火将牛肉分批煎至四面深褐色，取出备用。",
      },
      {
        name: "炒香料",
        content:
          "同一锅中煎培根丁至酥脆，加入胡萝卜和珍珠洋葱煎至微黄。拌入番茄酱和面粉，炒 2 分钟。",
      },
      {
        name: "溜锅焖炖",
        content:
          "倒入干邑刮起锅底精华，加入腌汁及香草和牛肉高汤。将牛肉放回锅中，烧开后盖上锅盖，放入 160\u00b0C 烤箱焖 2.5 小时。",
      },
      {
        name: "加蘑菇",
        content: "焖 2 小时后加入蘑菇，揭盖继续焖最后 30 分钟以收浓酱汁。",
      },
      {
        name: "上桌",
        content:
          "酱汁应浓稠有光泽、能裹住肉块。调好味后搭配黄油蛋面、土豆泥或面包食用。",
      },
    ],
    reviews: [
      {
        author: "Antoine",
        rating: 5,
        comment: "完美。长时间慢炖让牛肉入口即化。",
      },
      {
        author: "\u00c9lise",
        rating: 5,
        comment: "这就是周末烹饪的意义，整栋房子都弥漫着美妙的香气。",
      },
      {
        author: "James",
        rating: 4,
        comment: "非常出色，下次试试用更好的勃艮第红酒。",
      },
    ],
    daysAgo: 25,
  },
  {
    name: "焦糖布蕾",
    description:
      "法式经典甜品--覆盖着一层完美焦脆焦糖壳的丝滑香草布丁。金色外壳之下是如天鹅绒般细腻的蛋奶冻。",
    coverImage: "/seed-images/seed-creme-brulee.jpg",
    estimatedTime: 60,
    tags: ["法式料理", "法式甜品"],
    ingredients: [
      { name: "淡奶油", quantity: "500", unit: "毫升" },
      { name: "蛋黄", quantity: "5", unit: "个", note: "大号" },
      { name: "细砂糖", quantity: "100", unit: "克", note: "另备适量撒面用" },
      { name: "香草荚", quantity: "1", unit: "根", note: "纵切刮籽" },
      { name: "全脂牛奶", quantity: "100", unit: "毫升" },
    ],
    steps: [
      {
        name: "浸泡香草奶液",
        content:
          "将淡奶油、牛奶、香草籽和刮完的豆荚放入锅中，中火加热至即将沸腾（不要煮开）。离火盖盖浸泡 15 分钟。",
      },
      {
        name: "调制蛋奶液",
        content:
          "将蛋黄和糖搅打至颜色发白、质地浓稠。将温热的奶液过细筛，缓缓倒入蛋黄糊中并不停搅拌以防结块。撇去表面泡沫。",
      },
      {
        name: "水浴烘烤",
        content:
          "将蛋奶液倒入布丁杯中，放入深烤盘，注入热水至杯身一半高度。150\u00b0C 烘烤 40-45 分钟，至边缘凝固而中心仍微微颤动。",
      },
      {
        name: "冷藏焦糖化",
        content:
          "冷藏至少 4 小时或过夜。食用前均匀撒上一层细砂糖，用喷枪将糖面烤至深琥珀色、发出清脆的嘎吱声即可。",
      },
    ],
    reviews: [
      {
        author: "Claire",
        rating: 5,
        comment: "丝滑细腻的布丁加上敲开焦糖壳时那声脆响，太治愈了。",
      },
      {
        author: "Michel",
        rating: 5,
        comment: "堪比餐厅水准，用真正的香草荚真的完全不同。",
      },
      {
        author: "Nathalie",
        rating: 4,
        comment: "非常美味，我在蛋奶液里加了一点君度橙酒，强烈推荐。",
      },
    ],
    daysAgo: 4,
  },
] satisfies RecipeSeed[];

// ── 核心 seed 函数（可从外部调用） ──

export const seed = (db: ReturnType<typeof dbSqlite>) => {
  // 通过 _metadata 表检查是否已完成 seed
  const seeded = db
    .select()
    .from(metadataTable)
    .where(sql`${metadataTable.key} = 'seed_completed'`)
    .get();
  if (seeded) {
    return;
  }

  // 兼容从旧版本升级：数据已存在但无 _metadata 标记
  const existingData = db
    .select({ count: sql<number>`count(*)` })
    .from(tagsTable)
    .get();
  if (existingData && existingData.count > 0) {
    console.log("Existing data detected, marking seed as completed...");
    db.insert(metadataTable)
      .values({ key: "seed_completed", value: "migrated" })
      .run();
    return;
  }

  console.log("Seeding database...");

  // 使用事务保证原子性：要么全部插入成功，要么全部回滚
  db.transaction((tx) => {
    // 插入标签
    tx.insert(tagsTable).values(tags).run();

    // 插入食材
    tx.insert(ingredientsTable).values(ingredients).run();

    // 插入食谱及关联数据
    for (const recipe of recipeSeedData) {
      const recipeId = id();
      const createdAt = ago(recipe.daysAgo);

      // 食谱主体
      tx.insert(recipesTable)
        .values({
          id: recipeId,
          name: recipe.name,
          description: recipe.description,
          estimatedTime: recipe.estimatedTime,
          coverImage: recipe.coverImage ?? null,
          createdAt,
          updatedAt: createdAt,
        })
        .run();

      // 步骤
      tx.insert(recipeStepsTable)
        .values(
          recipe.steps.map((s, i) => ({
            id: id(),
            recipeId,
            sortOrder: i,
            name: s.name,
            content: s.content,
          })),
        )
        .run();

      // 食谱-食材关联
      tx.insert(recipeIngredientsTable)
        .values(
          recipe.ingredients.map((ri) => ({
            id: id(),
            recipeId,
            ingredientId: ingId(ri.name),
            quantity: ri.quantity,
            unit: ri.unit ?? null,
            note: ri.note ?? null,
          })),
        )
        .run();

      // 食谱-标签关联
      tx.insert(recipeTagsTable)
        .values(
          recipe.tags.map((t) => ({
            id: id(),
            recipeId,
            tagId: tagId(t),
          })),
        )
        .run();

      // 评论
      tx.insert(reviewsTable)
        .values(
          recipe.reviews.map((r, i) => ({
            id: id(),
            recipeId,
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            createdAt: new Date(createdAt.getTime() + (i + 1) * 86_400_000),
          })),
        )
        .run();
    }

    // 标记 seed 完成
    tx.insert(metadataTable)
      .values({ key: "seed_completed", value: new Date().toISOString() })
      .run();
  }); // end transaction

  console.log("Seed data has been successfully populated!");
};

// ── Direct run support: npx tsx database/seed.ts ──

const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("seed.ts") || process.argv[1].endsWith("seed.mjs"));

if (isDirectRun) {
  const DB_PATH = process.env.DATABASE_URL ?? "./data/recipes.db";
  const sqlite = new Database(DB_PATH);
  const directDb = drizzle({ client: sqlite, relations, casing: "snake_case" });
  seed(directDb);
  sqlite.close();
}
