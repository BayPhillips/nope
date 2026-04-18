"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IngredientsTable } from "./IngredientsTable";
import { StepTemplateList } from "./StepTemplateList";
import type { RecipeFormData, RecipeWithRelations } from "@/types";
import { STEP_TYPE_LABELS } from "@/types";

interface RecipeFormProps {
  initialData?: RecipeWithRelations;
  mode: "create" | "edit";
}

function defaultFormData(): RecipeFormData {
  return {
    name: "",
    description: "",
    notes: "",
    ingredients: [
      { id: crypto.randomUUID(), name: "Bread Flour", weightG: 450, isFlour: true, sortOrder: 0 },
      { id: crypto.randomUUID(), name: "Whole Wheat Flour", weightG: 50, isFlour: true, sortOrder: 1 },
      { id: crypto.randomUUID(), name: "Water", weightG: 375, isFlour: false, sortOrder: 2 },
      { id: crypto.randomUUID(), name: "Sourdough Starter", weightG: 100, isFlour: false, sortOrder: 3 },
      { id: crypto.randomUUID(), name: "Salt", weightG: 10, isFlour: false, sortOrder: 4 },
    ],
    steps: [
      { id: crypto.randomUUID(), type: "AUTOLYSE", label: "Autolyse", description: "Combine flour and water, rest.", durationMins: 30, tempC: null, sortOrder: 0 },
      { id: crypto.randomUUID(), type: "MIX", label: "Mix in Starter & Salt", description: "Add levain and salt, incorporate fully.", durationMins: 10, tempC: null, sortOrder: 1 },
      { id: crypto.randomUUID(), type: "BULK_FERMENT", label: "Bulk Fermentation", description: "Ferment at room temperature with stretch and folds.", durationMins: 240, tempC: 24, sortOrder: 2 },
      { id: crypto.randomUUID(), type: "FOLD", label: "Stretch & Fold (x4)", description: "Perform 4 sets of stretch and folds every 30 minutes.", durationMins: 30, tempC: null, sortOrder: 3 },
      { id: crypto.randomUUID(), type: "PRESHAPE", label: "Preshape", description: "Gently preshape the dough.", durationMins: 5, tempC: null, sortOrder: 4 },
      { id: crypto.randomUUID(), type: "BENCH_REST", label: "Bench Rest", description: "Rest uncovered on the bench.", durationMins: 30, tempC: null, sortOrder: 5 },
      { id: crypto.randomUUID(), type: "SHAPE", label: "Final Shape", description: "Shape into a batard or boule.", durationMins: 10, tempC: null, sortOrder: 6 },
      { id: crypto.randomUUID(), type: "PROOF", label: "Proof", description: "Place in a floured banneton.", durationMins: 60, tempC: 24, sortOrder: 7 },
      { id: crypto.randomUUID(), type: "COLD_PROOF", label: "Cold Proof", description: "Overnight in the fridge.", durationMins: 720, tempC: 4, sortOrder: 8 },
      { id: crypto.randomUUID(), type: "BAKE", label: "Bake", description: "Score and bake in a Dutch oven.", durationMins: 45, tempC: 250, sortOrder: 9 },
      { id: crypto.randomUUID(), type: "COOL", label: "Cool", description: "Cool on a wire rack before slicing.", durationMins: 60, tempC: null, sortOrder: 10 },
    ],
  };
}

function recipeToFormData(recipe: RecipeWithRelations): RecipeFormData {
  return {
    name: recipe.name,
    description: recipe.description ?? "",
    notes: recipe.notes ?? "",
    ingredients: recipe.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      weightG: ing.weightG,
      isFlour: ing.isFlour,
      sortOrder: ing.sortOrder,
    })),
    steps: recipe.steps.map((step) => ({
      id: step.id,
      type: step.type,
      label: step.label,
      description: step.description ?? "",
      durationMins: step.durationMins,
      tempC: step.tempC,
      sortOrder: step.sortOrder,
    })),
  };
}

export function RecipeForm({ initialData, mode }: RecipeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<RecipeFormData>(
    initialData ? recipeToFormData(initialData) : defaultFormData()
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Recipe name is required");
      return;
    }
    if (form.ingredients.length === 0) {
      toast.error("Add at least one ingredient");
      return;
    }
    if (!form.ingredients.some((i) => i.isFlour)) {
      toast.error("At least one ingredient must be marked as flour");
      return;
    }

    setSaving(true);
    try {
      const url = mode === "create" ? "/api/recipes" : `/api/recipes/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save recipe");
      }

      const saved = await res.json();
      toast.success(mode === "create" ? "Recipe created!" : "Recipe updated!");
      router.push(`/recipes/${saved.id}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recipe Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Classic Country Loaf"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this recipe..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Tips, variations, sourcing notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients & Baker&apos;s Math</CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Check &quot;Flour?&quot; for all flour components. Percentages are calculated relative to total flour weight.
          </p>
        </CardHeader>
        <CardContent>
          <IngredientsTable
            ingredients={form.ingredients}
            onChange={(ingredients) => setForm((f) => ({ ...f, ingredients }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Process Steps</CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Drag to reorder. Duration and temperature are optional guides shown during baking.
          </p>
        </CardHeader>
        <CardContent>
          <StepTemplateList
            steps={form.steps}
            onChange={(steps) => setForm((f) => ({ ...f, steps }))}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create Recipe" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
