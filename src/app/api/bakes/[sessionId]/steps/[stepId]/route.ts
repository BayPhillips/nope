import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; stepId: string }> }
) {
  const { stepId } = await params;
  const body = await request.json();
  const { action, notes } = body;

  const now = new Date();
  let updateData: {
    startedAt?: Date;
    completedAt?: Date;
    notes?: string;
  } = {};

  if (action === "start") {
    updateData.startedAt = now;
  } else if (action === "complete") {
    updateData.completedAt = now;
  }

  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const step = await prisma.bakeStep.update({
    where: { id: stepId },
    data: updateData,
  });

  return NextResponse.json(step);
}
