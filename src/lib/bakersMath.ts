export type IngredientInput = {
  id: string;
  name: string;
  weightG: number;
  isFlour: boolean;
  sortOrder: number;
};

export type IngredientWithPct = IngredientInput & {
  percentage: number | null;
};

export function totalFlourG(ingredients: IngredientInput[]): number {
  return ingredients
    .filter((i) => i.isFlour)
    .reduce((sum, i) => sum + i.weightG, 0);
}

export function computePercentage(
  weightG: number,
  flourTotal: number
): number | null {
  if (flourTotal === 0) return null;
  return (weightG / flourTotal) * 100;
}

export function computeHydration(ingredients: IngredientInput[]): number | null {
  const flour = totalFlourG(ingredients);
  if (flour === 0) return null;
  const water = ingredients
    .filter((i) => i.name.toLowerCase().includes("water"))
    .reduce((sum, i) => sum + i.weightG, 0);
  return (water / flour) * 100;
}

export function addPercentages(
  ingredients: IngredientInput[]
): IngredientWithPct[] {
  const flour = totalFlourG(ingredients);
  return ingredients.map((i) => ({
    ...i,
    percentage: computePercentage(i.weightG, flour),
  }));
}

export function hydrationLabel(pct: number): "stiff" | "standard" | "high" {
  if (pct < 68) return "stiff";
  if (pct <= 78) return "standard";
  return "high";
}

export function weightFromPercentage(
  percentage: number,
  flourTotal: number
): number {
  return (percentage / 100) * flourTotal;
}
