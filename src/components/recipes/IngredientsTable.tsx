"use client";

import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addPercentages, computeHydration, hydrationLabel, totalFlourG } from "@/lib/bakersMath";
import type { IngredientFormItem } from "@/types";
import { cn } from "@/lib/cn";

interface IngredientsTableProps {
  ingredients: IngredientFormItem[];
  onChange: (ingredients: IngredientFormItem[]) => void;
}

export function IngredientsTable({ ingredients, onChange }: IngredientsTableProps) {
  const withPct = addPercentages(ingredients);
  const hydration = computeHydration(ingredients);
  const flourTotal = totalFlourG(ingredients);

  function add() {
    const newIng: IngredientFormItem = {
      id: crypto.randomUUID(),
      name: "",
      weightG: 0,
      isFlour: false,
      sortOrder: ingredients.length,
    };
    onChange([...ingredients, newIng]);
  }

  function update(id: string, field: keyof IngredientFormItem, value: string | number | boolean) {
    onChange(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  }

  function remove(id: string) {
    onChange(ingredients.filter((ing) => ing.id !== id));
  }

  const hydLabel = hydration ? hydrationLabel(hydration) : null;
  const hydColor =
    hydLabel === "stiff"
      ? "text-amber-600"
      : hydLabel === "high"
      ? "text-blue-600"
      : "text-green-600";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 text-xs font-medium text-[var(--muted-foreground)] px-1">
        <span>Ingredient</span>
        <span className="w-24 text-center">Weight (g)</span>
        <span className="w-16 text-center">Baker's %</span>
        <span className="w-14 text-center">Flour?</span>
        <span className="w-8" />
      </div>

      {withPct.map((ing) => (
        <div
          key={ing.id}
          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center"
        >
          <Input
            placeholder="e.g. Bread Flour, Water, Salt"
            value={ing.name}
            onChange={(e) => update(ing.id, "name", e.target.value)}
          />
          <Input
            type="number"
            min={0}
            step={1}
            className="w-24 text-right"
            value={ing.weightG || ""}
            onChange={(e) => update(ing.id, "weightG", parseFloat(e.target.value) || 0)}
          />
          <div className="w-16 text-center text-sm text-[var(--muted-foreground)]">
            {ing.percentage !== null ? `${ing.percentage.toFixed(1)}%` : "—"}
          </div>
          <div className="w-14 flex justify-center">
            <input
              type="checkbox"
              checked={ing.isFlour}
              onChange={(e) => update(ing.id, "isFlour", e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)] cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(ing.id)}
            className="w-8 h-8 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full mt-1">
        <Plus className="h-4 w-4 mr-1" />
        Add Ingredient
      </Button>

      {flourTotal > 0 && (
        <div className="mt-3 p-3 bg-[var(--muted)] rounded-lg text-sm flex items-center gap-4">
          <span className="text-[var(--muted-foreground)]">Total flour: <strong>{flourTotal}g</strong></span>
          {hydration !== null && (
            <span className={cn("font-medium", hydColor)}>
              Hydration: {Math.round(hydration)}%
              <span className="font-normal text-[var(--muted-foreground)] ml-1">({hydLabel})</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
