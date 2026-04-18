import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BakeLogForm } from "@/components/bakes/BakeLogForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BakeLogPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await prisma.bakeSession.findUnique({
    where: { id: sessionId },
    include: { recipe: true, log: true },
  });

  if (!session) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/bakes/${sessionId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Log Bake</h1>
          <p className="text-[var(--muted-foreground)] text-sm">{session.recipe.name}</p>
        </div>
      </div>
      <BakeLogForm sessionId={sessionId} existingLog={session.log} />
    </div>
  );
}
