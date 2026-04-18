import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, description, notes, ingredients, steps } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
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
        create: steps.map((step: { type: string; label: string; description?: string; durationMins?: number | null; tempC?: number | null; sortOrder: number }) => ({
          type: step.type,
          label: step.label,
          description: step.description || null,
          durationMins: step.durationMins || null,
          tempC: step.tempC || null,
          sortOrder: step.sortOrder,
        })),
      },
    },
    include: {
      ingredients: true,
      steps: true,
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
