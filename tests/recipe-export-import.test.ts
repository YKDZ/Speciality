import { describe, expect, it } from "vite-plus/test";

import type { RecipeMdData } from "@/lib/recipe-md";

import { parseRecipe, serializeRecipe } from "@/lib/recipe-md";

describe("Recipe Export/Import Integration", () => {
  it("should roundtrip a complete recipe with cover, ingredients, and steps", () => {
    const recipe: RecipeMdData = {
      name: "红酒炖鸡",
      description:
        "正宗法式乡村名菜：鸡肉在红酒中与蘑菇、培根丁和珍珠洋葱一同慢炖。",
      coverImage: "images/cover.jpg",
      tags: ["法式料理", "慢炖菜"],
      estimatedTime: 120,
      ingredients: [
        { name: "牛肩肉", quantity: "1000", unit: "g", note: "切 5cm 方块" },
        {
          name: "红葡萄酒",
          quantity: "750",
          unit: "ml",
          note: "勃艮第或黑皮诺",
        },
        { name: "培根丁", quantity: "150", unit: "g" },
        { name: "珍珠洋葱", quantity: "200", unit: "g", note: "去皮" },
        { name: "番茄膏", quantity: "2", unit: "tbsp" },
      ],
      steps: [
        {
          sortOrder: 0,
          content: "将鸡块放入大碗中，倒入整瓶红酒。",
        },
        {
          sortOrder: 1,
          name: "煎鸡块",
          content: "取出鸡块并彻底擦干。\n\n![步骤图片](images/step-2-1.jpg)",
        },
        {
          sortOrder: 2,
          name: "煎培根",
          content:
            "同一口锅中煎培根丁至酥脆。\n\n![图片1](images/step-3-1.jpg)\n\n![图片2](images/step-3-2.jpg)",
        },
      ],
    };

    const md = serializeRecipe(recipe);
    const parsed = parseRecipe(md);

    expect(parsed.name).toBe(recipe.name);
    expect(parsed.description).toBe(recipe.description);
    expect(parsed.coverImage).toBe(recipe.coverImage);
    expect(parsed.tags).toEqual(recipe.tags);
    expect(parsed.estimatedTime).toBe(recipe.estimatedTime);
    expect(parsed.ingredients).toEqual(recipe.ingredients);
    expect(parsed.steps).toEqual(recipe.steps);

    // Second roundtrip should be stable
    const md2 = serializeRecipe(parsed);
    expect(md2).toBe(md);
  });

  it("should handle halfwidth colon parsing in v4 format", () => {
    const md = `---
name: 测试食谱
---

---

- 盐: 5 g
- 糖: 10 g [白砂糖]
- 辣椒: 3 个

---

1. 加盐和糖

   加盐和糖。
`;
    const parsed = parseRecipe(md);
    expect(parsed.ingredients[0]).toEqual({
      name: "盐",
      quantity: "5",
      unit: "g",
      note: undefined,
    });
    expect(parsed.ingredients[1]).toEqual({
      name: "糖",
      quantity: "10",
      unit: "g",
      note: "白砂糖",
    });
    expect(parsed.ingredients[2]).toEqual({
      name: "辣椒",
      quantity: "3",
      unit: "个",
      note: undefined,
    });
  });

  it("should handle fullwidth colon parsing in v4 format", () => {
    const md = `---
name: 测试食谱
---

---

- 盐：5 g
- 糖：10 g [白砂糖]

---

1. 加盐

   加盐。
`;
    const parsed = parseRecipe(md);
    expect(parsed.ingredients[0]).toEqual({
      name: "盐",
      quantity: "5",
      unit: "g",
      note: undefined,
    });
    expect(parsed.ingredients[1]).toEqual({
      name: "糖",
      quantity: "10",
      unit: "g",
      note: "白砂糖",
    });
  });

  it("should handle various quantity+unit edge cases in v4 format", () => {
    const md = `---
name: 边界测试
---

---

- 盐: 10g
- 油: 50.6ml
- 肉: 5斤
- 五花肉: 五斤
- 排骨: 三 斤
- 味精: 少许

---

1. 做菜

   做菜。
`;
    const parsed = parseRecipe(md);

    // 10g → quantity=10, unit=g
    expect(parsed.ingredients[0]).toEqual({
      name: "盐",
      quantity: "10",
      unit: "g",
      note: undefined,
    });

    // 50.6ml → quantity=50.6, unit=ml
    expect(parsed.ingredients[1]).toEqual({
      name: "油",
      quantity: "50.6",
      unit: "ml",
      note: undefined,
    });

    // 5斤 → quantity=5, unit=斤
    expect(parsed.ingredients[2]).toEqual({
      name: "肉",
      quantity: "5",
      unit: "斤",
      note: undefined,
    });

    // 五斤 → quantity=五斤, unit=undefined
    expect(parsed.ingredients[3]).toEqual({
      name: "五花肉",
      quantity: "五斤",
      unit: undefined,
      note: undefined,
    });

    // 三 斤 → quantity=三, unit=斤
    expect(parsed.ingredients[4]).toEqual({
      name: "排骨",
      quantity: "三",
      unit: "斤",
      note: undefined,
    });

    // 少许 → quantity=少许, unit=undefined
    expect(parsed.ingredients[5]).toEqual({
      name: "味精",
      quantity: "少许",
      unit: undefined,
      note: undefined,
    });
  });

  it("should handle ordered list steps in v4 format", () => {
    const md = `---
name: 步骤测试
---

---

- 盐: 适量

---

1. 

   第一步

2. 

   第二步

3. 

   第三步
`;
    const parsed = parseRecipe(md);
    expect(parsed.steps).toHaveLength(3);
    expect(parsed.steps[0].sortOrder).toBe(0);
    expect(parsed.steps[0].name).toBeUndefined();
    expect(parsed.steps[1].sortOrder).toBe(1);
    expect(parsed.steps[2].sortOrder).toBe(2);
  });

  it("should handle ordered list steps with names", () => {
    const md = `---
name: 步骤测试
---

---

- 盐: 适量

---

1. 腌制

   腌制步骤

2. 烹饪

   烹饪步骤
`;
    const parsed = parseRecipe(md);
    expect(parsed.steps).toHaveLength(2);
    expect(parsed.steps[0].name).toBe("腌制");
    expect(parsed.steps[0].sortOrder).toBe(0);
    expect(parsed.steps[1].name).toBe("烹饪");
    expect(parsed.steps[1].sortOrder).toBe(1);
  });
});
