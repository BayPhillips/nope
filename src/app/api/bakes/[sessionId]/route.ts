import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await prisma.bakeSession.findUnique({
    where: { id: sessionId },
    include: {
      recipe: {
        include: {
          ingredients: { orderBy: { sortOrder: "asc" } },
        },
      },
      steps: { orderBy: { sortOrder: "asc" } },
      log: true,
    },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await request.json();
  const { status } = body;

  const session = await prisma.bakeSession.update({
    where: { id: sessionId },
    data: {
      status,
      completedAt: status === "COMPLETED" || status === "CANCELLED" ? new Date() : undefined,
    },
    include: {
      recipe: true,
      steps: { orderBy: { sortOrder: "asc" } },
      log: true,
    },
  });

  return NextResponse.json(session);
}
