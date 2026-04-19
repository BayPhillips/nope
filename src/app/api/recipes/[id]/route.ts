import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { sortOrder: "asc" } },
      steps: { orderBy: { sortOrder: "asc" } },
      sessions: {
        orderBy: { startedAt: "desc" },
        include: { log: true },
      },
    },
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, description, notes, ingredients, steps } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const recipe = await prisma.$transaction(async (tx) => {
    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await tx.recipeStep.deleteMany({ where: { recipeId: id } });

    return tx.recipe.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        notes: notes?.trim() || null,
        ingredients: {
          create: ingredients.map((ing: { name: string; weightG: number; isFlour: boolean; sortOrder: number }) => ({
            name: ing.name,
            weightG: ing.weightG,
            isFlour: ing.isFlour,
            sortOrder: ing.sortOrder,
          })),
        },
        steps: {
          create: steps.map((step: { type: string; label: string; description?: string; durationMins?: number | null; tempF?: number | null; sortOrder: number }) => ({
            type: step.type,
            label: step.label,
            description: step.description || null,
            durationMins: step.durationMins || null,
            tempF: step.tempF || null,
            sortOrder: step.sortOrder,
          })),
        },
      },
      include: {
        ingredients: { orderBy: { sortOrder: "asc" } },
        steps: { orderBy: { sortOrder: "asc" } },
      },
    });
  });

  return NextResponse.json(recipe);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const activeSession = await prisma.bakeSession.findFirst({
    where: { recipeId: id, status: "IN_PROGRESS" },
  });

  if (activeSession) {
    return NextResponse.json(
      { error: "Cannot delete a recipe with an active bake session" },
      { status: 409 }
    );
  }

  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
