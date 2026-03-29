export const UNIT_CONVERSIONS: Record<
  string,
  { base: string; factor: number }
> = {
  // 质量 → g
  mg: { base: "g", factor: 0.001 },
  g: { base: "g", factor: 1 },
  kg: { base: "g", factor: 1000 },
  oz: { base: "g", factor: 28.3495 },
  lb: { base: "g", factor: 453.592 },
  斤: { base: "g", factor: 500 },
  两: { base: "g", factor: 50 },
  // 体积 → ml
  ml: { base: "ml", factor: 1 },
  l: { base: "ml", factor: 1000 },
  L: { base: "ml", factor: 1000 },
  tsp: { base: "ml", factor: 4.929 },
  tbsp: { base: "ml", factor: 14.787 },
  cup: { base: "ml", factor: 236.588 },
  fl_oz: { base: "ml", factor: 29.574 },
  // 个数 → piece
  piece: { base: "piece", factor: 1 },
  个: { base: "piece", factor: 1 },
  根: { base: "piece", factor: 1 },
  只: { base: "piece", factor: 1 },
  条: { base: "piece", factor: 1 },
  片: { base: "piece", factor: 1 },
  颗: { base: "piece", factor: 1 },
  粒: { base: "piece", factor: 1 },
};

export const parseAmount = (
  amountStr: string,
): { value: number; unit: string } | null => {
  const match = amountStr.match(/^([\d.]+)\s*(.+)$/);
  if (!match) return null;
  return { value: parseFloat(match[1]), unit: match[2].trim() };
};

export const convertToBase = (
  value: number,
  unit: string,
): { value: number; baseUnit: string } | null => {
  const conv = UNIT_CONVERSIONS[unit];
  if (!conv) return null;
  return { value: value * conv.factor, baseUnit: conv.base };
};
