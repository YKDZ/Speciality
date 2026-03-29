export interface ShoppingAmount {
  quantity?: string;
  unit?: string;
  recipeName: string;
}

/** Grouped by ingredient + note; amounts kept separate. */
export interface GroupedShoppingItem {
  ingredientId: string;
  ingredientName: string;
  amounts: ShoppingAmount[];
  note?: string;
}

/** A single display-ready amount line after optional numeric merging. */
export interface MergedAmountLine {
  display: string;
  recipeNames: string[];
}

/** Grouped item with amounts merged where possible. */
export interface MergedShoppingItem {
  ingredientId: string;
  ingredientName: string;
  lines: MergedAmountLine[];
  note?: string;
}

/**
 * Group raw shopping items by (ingredientId + note).
 * Amounts are kept separate per recipe.
 */
export const groupShoppingItems = (
  items: {
    ingredientId: string;
    ingredientName: string;
    quantity?: string;
    unit?: string;
    note?: string;
    recipeName: string;
  }[],
): GroupedShoppingItem[] => {
  const map = new Map<string, GroupedShoppingItem>();
  for (const item of items) {
    const key = `${item.ingredientId}::${item.note ?? ""}`;
    const existing = map.get(key);
    if (existing) {
      existing.amounts.push({
        quantity: item.quantity,
        unit: item.unit,
        recipeName: item.recipeName,
      });
    } else {
      map.set(key, {
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        amounts: [
          {
            quantity: item.quantity,
            unit: item.unit,
            recipeName: item.recipeName,
          },
        ],
        note: item.note,
      });
    }
  }
  return [...map.values()];
};

const isNumeric = (s: string | undefined): s is string =>
  s !== undefined && s.trim() !== "" && !isNaN(Number(s));

/**
 * Merge amounts within a grouped item:
 * amounts with numeric quantities AND identical units are summed;
 * others are kept as-is.
 */
export const mergeAmounts = (amounts: ShoppingAmount[]): MergedAmountLine[] => {
  const numericBuckets = new Map<
    string,
    { total: number; unit: string; recipeNames: string[] }
  >();
  const nonNumeric: MergedAmountLine[] = [];

  for (const a of amounts) {
    if (isNumeric(a.quantity) && a.unit) {
      const bucket = numericBuckets.get(a.unit);
      if (bucket) {
        bucket.total += Number(a.quantity);
        bucket.recipeNames.push(a.recipeName);
      } else {
        numericBuckets.set(a.unit, {
          total: Number(a.quantity),
          unit: a.unit,
          recipeNames: [a.recipeName],
        });
      }
    } else {
      const display =
        a.quantity || a.unit ? `${a.quantity ?? ""} ${a.unit ?? ""}` : "—";
      nonNumeric.push({ display, recipeNames: [a.recipeName] });
    }
  }

  const lines: MergedAmountLine[] = [];
  for (const [, b] of numericBuckets) {
    const val = Number.isInteger(b.total) ? b.total : +b.total.toFixed(2);
    lines.push({ display: `${val} ${b.unit}`, recipeNames: b.recipeNames });
  }
  lines.push(...nonNumeric);
  return lines;
};

/** Build fully merged items (for the merged view). */
export const buildMergedItems = (
  grouped: GroupedShoppingItem[],
): MergedShoppingItem[] =>
  grouped.map((g) => ({
    ingredientId: g.ingredientId,
    ingredientName: g.ingredientName,
    lines: mergeAmounts(g.amounts),
    note: g.note,
  }));

const amountDisplay = (a: ShoppingAmount) =>
  a.quantity || a.unit ? `${a.quantity ?? ""} ${a.unit ?? ""}` : "—";

/** Export grouped (separated) view as text. */
export const exportGroupedAsText = (
  items: GroupedShoppingItem[],
  title: string,
  singleRecipe: boolean,
): string => {
  const lines: string[] = [`# ${title}`, ""];
  for (const item of items) {
    const amounts = item.amounts
      .map((a) => {
        const qty = amountDisplay(a);
        return singleRecipe ? qty : `${qty}（${a.recipeName}）`;
      })
      .join("、");
    const noteInfo = item.note ? ` [${item.note}]` : "";
    lines.push(`- ${item.ingredientName}：${amounts}${noteInfo}`);
  }
  return lines.join("\n");
};

/** Export merged view as text. */
export const exportMergedAsText = (
  items: MergedShoppingItem[],
  title: string,
  singleRecipe: boolean,
): string => {
  const lines: string[] = [`# ${title}`, ""];
  for (const item of items) {
    const amounts = item.lines
      .map((l) => {
        const names = l.recipeNames.join(", ");
        return singleRecipe ? l.display : `${l.display}（${names}）`;
      })
      .join("、");
    const noteInfo = item.note ? ` [${item.note}]` : "";
    lines.push(`- ${item.ingredientName}：${amounts}${noteInfo}`);
  }
  return lines.join("\n");
};

export const copyToClipboard = (text: string) => {
  void navigator.clipboard.writeText(text);
};
