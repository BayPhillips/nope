import { RecipeForm } from "@/components/recipes/RecipeForm";

export default function NewRecipePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Recipe</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          Define your ingredients with baker&apos;s percentages and the step-by-step process.
        </p>
      </div>
      <RecipeForm mode="create" />
    </div>
  );
}
