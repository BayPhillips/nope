import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessions = await prisma.bakeSession.findMany({
    include: {
      recipe: true,
      log: true,
      steps: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { startedAt: "desc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { recipeId } = body;

  if (!recipeId) {
    return NextResponse.json({ error: "recipeId is required" }, { status: 400 });
  }

  const activeSession = await prisma.bakeSession.findFirst({
    where: { status: "IN_PROGRESS" },
    include: { recipe: true },
  });

  if (activeSession) {
    return NextResponse.json(
      {
        error: `You have an active bake session for "${activeSession.recipe.name}"`,
        activeSessionId: activeSession.id,
      },
      { status: 409 }
    );
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const session = await prisma.bakeSession.create({
    data: {
      recipeId,
      steps: {
        create: recipe.steps.map((step) => ({
          type: step.type,
          label: step.label,
          description: step.description,
          durationMins: step.durationMins,
          tempC: step.tempC,
          sortOrder: step.sortOrder,
        })),
      },
    },
    include: {
      recipe: true,
      steps: { orderBy: { sortOrder: "asc" } },
      log: true,
    },
  });

  return NextResponse.json(session, { status: 201 });
}
