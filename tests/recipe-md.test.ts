import { describe, expect, it } from "vite-plus/test";

import type { RecipeMdData } from "@/lib/recipe-md";

import { parseRecipe, serializeRecipe } from "@/lib/recipe-md";

// ── serialize ──

describe("serializeRecipe", () => {
  it("should serialize a complete recipe with FM", () => {
    const recipe: RecipeMdData = {
      name: "红酒炖鸡",
      description: "正宗法式乡村名菜",
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
      ],
      steps: [
        { sortOrder: 0, content: "将鸡块放入大碗中，倒入整瓶红酒。" },
        {
          sortOrder: 1,
          name: "煎鸡块",
          content: "取出鸡块并彻底擦干。\n\n![步骤图片](images/step-2-1.jpg)",
        },
        { sortOrder: 2, content: "同一口锅中煎培根丁至酥脆。" },
      ],
    };

    const md = serializeRecipe(recipe);
    expect(md).toMatch(/^---\nname: 红酒炖鸡\n/);
    expect(md).toContain("tags:");
    expect(md).toContain("  - 法式料理");
    expect(md).toContain("  - 慢炖菜");
    expect(md).toContain("time: 120");
    expect(md).toContain("![cover](images/cover.jpg)");
    expect(md).toContain("正宗法式乡村名菜");
    expect(md).toContain("- 牛肩肉: 1000 g [切 5cm 方块]");
    expect(md).toContain("- 红葡萄酒: 750 ml [勃艮第或黑皮诺]");
    expect(md).toContain("- 培根丁: 150 g");
    expect(md).toContain("1. 将鸡块放入大碗中，倒入整瓶红酒。");
    expect(md).toContain("2. 煎鸡块");
    expect(md).toContain("3. 同一口锅中煎培根丁至酥脆。");
    expect(md).not.toContain("# 红酒炖鸡");
    expect(md).not.toContain("## 食材");
    expect(md).not.toContain("## 步骤");
    expect(md).not.toContain("###");
  });

  it("should use halfwidth colons", () => {
    const recipe: RecipeMdData = {
      name: "测试",
      ingredients: [{ name: "盐", quantity: "5", unit: "g" }],
      steps: [],
    };
    const md = serializeRecipe(recipe);
    expect(md).toContain("- 盐: 5 g");
    expect(md).not.toContain("：");
  });

  it("should serialize without cover image", () => {
    const recipe: RecipeMdData = {
      name: "简单食谱",
      description: "描述",
      ingredients: [],
      steps: [],
    };
    const md = serializeRecipe(recipe);
    expect(md).not.toContain("![");
  });

  it("should serialize without description", () => {
    const recipe: RecipeMdData = {
      name: "无描述",
      ingredients: [],
      steps: [],
    };
    const md = serializeRecipe(recipe);
    expect(md).toMatch(/^---\nname: 无描述\n---/);
  });

  it("should handle ingredient with only name", () => {
    const recipe: RecipeMdData = {
      name: "test",
      ingredients: [{ name: "盐" }],
      steps: [],
    };
    const md = serializeRecipe(recipe);
    expect(md).toContain("- 盐: ");
  });

  it("should handle ingredient with quantity but no unit", () => {
    const recipe: RecipeMdData = {
      name: "test",
      ingredients: [{ name: "鸡蛋", quantity: "3" }],
      steps: [],
    };
    const md = serializeRecipe(recipe);
    expect(md).toContain("- 鸡蛋: 3");
  });

  it("should serialize step with name as ordered list", () => {
    const recipe: RecipeMdData = {
      name: "test",
      ingredients: [],
      steps: [{ sortOrder: 0, name: "腌制", content: "腌制步骤" }],
    };
    const md = serializeRecipe(recipe);
    expect(md).toContain("1. 腌制");
    expect(md).toContain("   腌制步骤");
    expect(md).not.toContain("###");
  });

  it("should serialize step without name as ordered list", () => {
    const recipe: RecipeMdData = {
      name: "test",
      ingredients: [],
      steps: [{ sortOrder: 0, content: "步骤内容" }],
    };
    const md = serializeRecipe(recipe);
    expect(md).toContain("1. 步骤内容");
  });
});

// ── parse ──

describe("parseRecipe", () => {
  it("should parse a complete recipe with FM", () => {
    const md = `---
name: 红酒炖鸡
tags:
  - 法式料理
time: 120
---

![cover](images/cover.jpg)

正宗法式乡村名菜

---

- 牛肩肉: 1000 g [切 5cm 方块]
- 红葡萄酒: 750 ml [勃艮第或黑皮诺]
- 培根丁: 150 g

---

1. 将鸡块放入大碗中，倒入整瓶红酒。

2. 煎鸡块

   取出鸡块并彻底擦干。

3. 同一口锅中煎培根丁至酥脆。
`;
    const result = parseRecipe(md);
    expect(result.name).toBe("红酒炖鸡");
    expect(result.coverImage).toBe("images/cover.jpg");
    expect(result.description).toBe("正宗法式乡村名菜");
    expect(result.tags).toEqual(["法式料理"]);
    expect(result.estimatedTime).toBe(120);
    expect(result.ingredients).toHaveLength(3);
    expect(result.ingredients[0]).toEqual({
      name: "牛肩肉",
      quantity: "1000",
      unit: "g",
      note: "切 5cm 方块",
    });
    expect(result.ingredients[1]).toEqual({
      name: "红葡萄酒",
      quantity: "750",
      unit: "ml",
      note: "勃艮第或黑皮诺",
    });
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].sortOrder).toBe(0);
    expect(result.steps[1].name).toBe("煎鸡块");
    expect(result.steps[1].sortOrder).toBe(1);
  });

  it("should parse fullwidth colons", () => {
    const md = `---
name: 测试
---

---

- 盐：5 g
- 糖：10 g [白砂糖]

---

1. 做菜

   做菜。
`;
    const result = parseRecipe(md);
    expect(result.ingredients[0]).toEqual({
      name: "盐",
      quantity: "5",
      unit: "g",
      note: undefined,
    });
    expect(result.ingredients[1]).toEqual({
      name: "糖",
      quantity: "10",
      unit: "g",
      note: "白砂糖",
    });
  });

  it("should parse without cover or description", () => {
    const md = `---
name: 简单
---

---

- 盐: 适量

---

1. 加盐

   加盐。
`;
    const result = parseRecipe(md);
    expect(result.name).toBe("简单");
    expect(result.coverImage).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.ingredients[0]).toEqual({
      name: "盐",
      quantity: "适量",
      unit: undefined,
      note: undefined,
    });
  });

  // Quantity + unit parsing edge cases

  it("should parse arabic digits with no space before unit: 10g", () => {
    const md = `---
name: T
---

---

- 盐: 10g

---

1. 做

   做。
`;
    const result = parseRecipe(md);
    expect(result.ingredients[0].quantity).toBe("10");
    expect(result.ingredients[0].unit).toBe("g");
  });

  it("should parse decimal with no space: 50.6ml", () => {
    const md = `---
name: T
---

---

- 油: 50.6ml

---

1. 做

   做。
`;
    const result = parseRecipe(md);
    expect(result.ingredients[0].quantity).toBe("50.6");
    expect(result.ingredients[0].unit).toBe("ml");
  });

  it("should parse arabic digits with Chinese unit no space: 5斤", () => {
    const md = `---
name: T
---

---

- 肉: 5斤

---

1. 做

   做。
`;
    const result = parseRecipe(md);
    expect(result.ingredients[0].quantity).toBe("5");
    expect(result.ingredients[0].unit).toBe("斤");
  });

  it("should parse non-arabic text without space as pure quantity: 五斤", () => {
    const md = `---
name: T
---

---

- 肉: 五斤

---

1. 做

   做。
`;
    const result = parseRecipe(md);
    expect(result.ingredients[0].quantity).toBe("五斤");
    expect(result.ingredients[0].unit).toBeUndefined();
  });

  it("should parse non-arabic text with space: 三 斤", () => {
    const md = `---
name: T
---

---

- 肉: 三 斤

---

1. 做

   做。
`;
    const result = parseRecipe(md);
    expect(result.ingredients[0].quantity).toBe("三");
    expect(result.ingredients[0].unit).toBe("斤");
  });

  it("should parse 少许 as pure quantity", () => {
    const md = `---
name: T
---

---

- 盐: 少许

---

1. 做

   做。
`;
    const result = parseRecipe(md);
    expect(result.ingredients[0].quantity).toBe("少许");
    expect(result.ingredients[0].unit).toBeUndefined();
  });

  // Step parsing

  it("should parse steps from ordered list", () => {
    const md = `---
name: T
---

---

- 盐: 适量

---

1. 第一步

2. 第二步

3. 第三步
`;
    const result = parseRecipe(md);
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].sortOrder).toBe(0);
    expect(result.steps[1].sortOrder).toBe(1);
    expect(result.steps[2].sortOrder).toBe(2);
  });

  it("should parse steps with names from ordered list", () => {
    const md = `---
name: T
---

---

- 盐: 适量

---

1. 腌制

   腌制步骤

2. 烹饪

   烹饪步骤
`;
    const result = parseRecipe(md);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].name).toBe("腌制");
    expect(result.steps[0].sortOrder).toBe(0);
    expect(result.steps[1].name).toBe("烹饪");
    expect(result.steps[1].sortOrder).toBe(1);
  });

  it("should parse steps with multiple images", () => {
    const md = `---
name: T
---

---

- 盐: 适量

---

1. 做菜

   做菜

   ![图片1](images/step-1-1.jpg)

   ![图片2](images/step-1-2.jpg)
`;
    const result = parseRecipe(md);
    expect(result.steps[0].content).toContain("![图片1](images/step-1-1.jpg)");
    expect(result.steps[0].content).toContain("![图片2](images/step-1-2.jpg)");
  });
});

// ── Front Matter ──

describe("Front Matter", () => {
  it("should always output FM with name", () => {
    const recipe: RecipeMdData = {
      name: "简单",
      ingredients: [],
      steps: [],
    };
    const md = serializeRecipe(recipe);
    expect(md).toMatch(/^---\nname: 简单\n---/);
    expect(md).not.toContain("# 简单");
  });

  it("should serialize tags and time in FM", () => {
    const recipe: RecipeMdData = {
      name: "测试",
      tags: ["法式料理", "慢炖菜"],
      estimatedTime: 120,
      ingredients: [{ name: "盐", quantity: "5", unit: "g" }],
      steps: [{ sortOrder: 0, name: "做菜", content: "做菜。" }],
    };
    const md = serializeRecipe(recipe);
    expect(md).toMatch(/^---\nname: 测试\ntags:/);
    expect(md).toContain("  - 法式料理");
    expect(md).toContain("  - 慢炖菜");
    expect(md).toContain("time: 120");
    expect(md).not.toMatch(/^cover:/m);
  });

  it("should parse FM with yaml library", () => {
    const md = `---
name: "含:特殊字符的名称"
tags:
  - 法式料理
time: 120
---

描述内容。

---

- 盐: 5 g

---

1. 做菜

   做菜。
`;
    const result = parseRecipe(md);
    expect(result.name).toBe("含:特殊字符的名称");
    expect(result.tags).toEqual(["法式料理"]);
    expect(result.estimatedTime).toBe(120);
    expect(result.description).toBe("描述内容。");
  });

  it("should parse inline tags format: tags: [a, b]", () => {
    const md = `---
name: 测试
tags: [法式料理, 慢炖菜]
time: 60
---

---

- 盐: 5 g

---

1. 做菜

   做菜。
`;
    const result = parseRecipe(md);
    expect(result.tags).toEqual(["法式料理", "慢炖菜"]);
    expect(result.estimatedTime).toBe(60);
  });

  it("should handle FM with only name", () => {
    const md = `---
name: 简单食谱
---

---

- 盐: 5 g

---

1. 做菜

   做菜。
`;
    const result = parseRecipe(md);
    expect(result.name).toBe("简单食谱");
    expect(result.coverImage).toBeUndefined();
    expect(result.tags).toBeUndefined();
    expect(result.estimatedTime).toBeUndefined();
  });
});

// ── cover image ──

describe("cover image", () => {
  it("should serialize cover as first body element after FM", () => {
    const recipe: RecipeMdData = {
      name: "测试",
      coverImage: "images/cover.jpg",
      ingredients: [],
      steps: [{ sortOrder: 0, name: "做", content: "做。" }],
    };
    const md = serializeRecipe(recipe);
    const fmEnd = md.indexOf("---\n", 4);
    const coverIdx = md.indexOf("![cover](images/cover.jpg)");
    expect(coverIdx).toBeGreaterThan(fmEnd);
    expect(md).not.toMatch(/^cover:/m);
  });

  it("should parse cover from first solo image after FM", () => {
    const md = `---
name: 测试
---

![cover](images/cover.jpg)

描述内容。

---

- 盐: 5 g

---

1. 做菜

   做菜。
`;
    const result = parseRecipe(md);
    expect(result.coverImage).toBe("images/cover.jpg");
    expect(result.description).toBe("描述内容。");
  });

  it("should not treat non-first image as cover", () => {
    const md = `---
name: 测试
---

描述内容。

![不是封面](images/other.jpg)

---

- 盐: 5 g

---

1. 做菜

   做菜。
`;
    const result = parseRecipe(md);
    expect(result.coverImage).toBeUndefined();
    expect(result.description).toContain("描述内容。");
    expect(result.description).toContain("![不是封面](images/other.jpg)");
  });
});

// ── ordered list steps ──

describe("ordered list steps", () => {
  it("should serialize steps as ordered list", () => {
    const recipe: RecipeMdData = {
      name: "测试",
      ingredients: [],
      steps: [
        { sortOrder: 0, name: "焯水", content: "将肉类焯水。" },
        { sortOrder: 1, name: "煎制", content: "大火煎至金黄。" },
      ],
    };
    const md = serializeRecipe(recipe);
    expect(md).toContain("1. 焯水");
    expect(md).toContain("   将肉类焯水。");
    expect(md).toContain("2. 煎制");
    expect(md).toContain("   大火煎至金黄。");
    expect(md).not.toContain("###");
  });

  it("should parse ordered list steps", () => {
    const md = `---
name: 测试
---

---

- 盐: 5 g

---

1. 焯水

   将肉类焯水。

2. 煎制

   大火煎至金黄。
`;
    const result = parseRecipe(md);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].name).toBe("焯水");
    expect(result.steps[0].content).toBe("将肉类焯水。");
    expect(result.steps[1].name).toBe("煎制");
    expect(result.steps[1].content).toBe("大火煎至金黄。");
  });

  it("should handle step with block content (blockquote, image)", () => {
    const md = `---
name: 测试
---

---

- 盐: 5 g

---

1. 焯水

   将肉类焯水。

   > 注意小火慢煮

   ![步骤图片](images/step1.jpg)

2. 煎制

   大火煎至金黄。
`;
    const result = parseRecipe(md);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].content).toContain("将肉类焯水。");
    expect(result.steps[0].content).toContain("> 注意小火慢煮");
    expect(result.steps[0].content).toContain("![步骤图片](images/step1.jpg)");
  });

  it("should handle step without name", () => {
    const md = `---
name: 测试
---

---

- 盐: 5 g

---

1. 做菜。
`;
    const result = parseRecipe(md);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].name).toBeUndefined();
    expect(result.steps[0].content).toBe("做菜。");
  });
});

// ── backward compatibility ──

describe("backward compatibility (minimal)", () => {
  it("should fall back to h1 for name when no FM", () => {
    const md = `# 纯文本食谱

![cover](photo.jpg)

描述。

---

- 盐: 适量

---

1. 做菜

   做菜。
`;
    const result = parseRecipe(md);
    expect(result.name).toBe("纯文本食谱");
    expect(result.coverImage).toBe("photo.jpg");
    expect(result.description).toBe("描述。");
  });

  it("should skip --- in description when not followed by list", () => {
    const md = `---
name: 测试
---

一些描述

---

更多描述

---

- 盐: 5 g

---

1. 做菜

   做菜。
`;
    const result = parseRecipe(md);
    expect(result.description).toContain("一些描述");
    expect(result.description).toContain("更多描述");
    expect(result.ingredients).toHaveLength(1);
  });
});

// ── roundtrip ──

describe("roundtrip v4 format", () => {
  it("should roundtrip with all fields", () => {
    const recipe: RecipeMdData = {
      name: "测试食谱",
      description: "描述文字",
      coverImage: "images/cover.jpg",
      tags: ["家常菜", "快手菜"],
      estimatedTime: 30,
      ingredients: [{ name: "盐", quantity: "5", unit: "g" }],
      steps: [{ sortOrder: 0, name: "做菜", content: "做菜。" }],
    };
    const md1 = serializeRecipe(recipe);
    const parsed = parseRecipe(md1);
    const md2 = serializeRecipe(parsed);
    expect(md2).toBe(md1);
  });

  it("should roundtrip with multi-step block content", () => {
    const recipe: RecipeMdData = {
      name: "复杂食谱",
      ingredients: [{ name: "盐", quantity: "适量" }],
      steps: [
        {
          sortOrder: 0,
          name: "焯水",
          content: "将肉焯水。\n\n> 记得撇浮沫\n\n![图片](images/s1.jpg)",
        },
        { sortOrder: 1, name: "炒制", content: "大火翻炒。" },
      ],
    };
    const md1 = serializeRecipe(recipe);
    const parsed = parseRecipe(md1);
    const md2 = serializeRecipe(parsed);
    expect(md2).toBe(md1);
  });

  it("should roundtrip with only name + steps", () => {
    const recipe: RecipeMdData = {
      name: "简单",
      ingredients: [{ name: "盐", quantity: "适量" }],
      steps: [{ sortOrder: 0, name: "做", content: "加盐。" }],
    };
    const md1 = serializeRecipe(recipe);
    const parsed = parseRecipe(md1);
    const md2 = serializeRecipe(parsed);
    expect(md2).toBe(md1);
  });
});
