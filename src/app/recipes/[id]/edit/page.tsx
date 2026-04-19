import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import type { RecipeWithRelations } from "@/types";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { sortOrder: "asc" } },
      steps: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!recipe) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Recipe</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">{recipe.name}</p>
      </div>
      <RecipeForm mode="edit" initialData={recipe as RecipeWithRelations} />
    </div>
  );
}
