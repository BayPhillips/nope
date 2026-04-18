export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { RecipeWithRelations } from "@/types";

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: { orderBy: { sortOrder: "asc" } },
      steps: { orderBy: { sortOrder: "asc" } },
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: { log: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/recipes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg mb-4">No recipes yet</p>
          <Button asChild>
            <Link href="/recipes/new">Create your first recipe</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(recipes as RecipeWithRelations[]).map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
