import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await request.json();
  const { rating, outcomeNotes, improvementNotes } = body;

  const log = await prisma.bakeLog.upsert({
    where: { sessionId },
    create: {
      sessionId,
      rating: rating || null,
      outcomeNotes: outcomeNotes?.trim() || null,
      improvementNotes: improvementNotes?.trim() || null,
    },
    update: {
      rating: rating || null,
      outcomeNotes: outcomeNotes?.trim() || null,
      improvementNotes: improvementNotes?.trim() || null,
    },
  });

  await prisma.bakeSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  return NextResponse.json(log);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await request.json();
  const { rating, outcomeNotes, improvementNotes } = body;

  const log = await prisma.bakeLog.update({
    where: { sessionId },
    data: {
      rating: rating || null,
      outcomeNotes: outcomeNotes?.trim() || null,
      improvementNotes: improvementNotes?.trim() || null,
    },
  });

  return NextResponse.json(log);
}
