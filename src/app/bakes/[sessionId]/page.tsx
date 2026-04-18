import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BakeTimeline } from "@/components/bakes/BakeTimeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/shared/StarRating";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { STEP_TYPE_LABELS } from "@/types";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { BakeSessionWithRelations } from "@/types";

export default async function BakeSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
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

  if (!session) notFound();

  if (session.status === "IN_PROGRESS") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Baking: {session.recipe.name}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Started {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
            </p>
          </div>
          <Badge variant="amber">In Progress</Badge>
        </div>
        <BakeTimeline initialSession={session as BakeSessionWithRelations} />
      </div>
    );
  }

  // Completed or Cancelled — read-only view
  const isCompleted = session.status === "COMPLETED";
  const totalMins = session.completedAt
    ? Math.round(
        (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) /
          60000
      )
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{session.recipe.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {format(new Date(session.startedAt), "PPP")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <Badge variant="green" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Cancelled
            </Badge>
          )}
          {!session.log && isCompleted && (
            <Button asChild size="sm">
              <Link href={`/bakes/${session.id}/log`}>Add Log</Link>
            </Button>
          )}
        </div>
      </div>

      {session.log && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bake Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {session.log.rating && <StarRating value={session.log.rating} readonly />}
            {session.log.outcomeNotes && (
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Outcome</p>
                <p className="text-sm mt-1">{session.log.outcomeNotes}</p>
              </div>
            )}
            {session.log.improvementNotes && (
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Next Time</p>
                <p className="text-sm mt-1">{session.log.improvementNotes}</p>
              </div>
            )}
            <div className="pt-1">
              <Button asChild variant="outline" size="sm">
                <Link href={`/bakes/${session.id}/log`}>Edit Log</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {totalMins !== null && (
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Clock className="h-4 w-4" />
          Total time: {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {session.steps.map((step, idx) => {
              const stepDuration =
                step.startedAt && step.completedAt
                  ? Math.round(
                      (new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()) /
                        60000
                    )
                  : null;
              return (
                <div key={step.id} className="flex items-center gap-3 py-1.5">
                  <div className="flex-shrink-0">
                    {step.completedAt ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-[var(--border)]" />
                    )}
                  </div>
                  <span className="text-sm flex-1">{step.label}</span>
                  {stepDuration !== null && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {stepDuration >= 60
                        ? `${Math.floor(stepDuration / 60)}h ${stepDuration % 60}m`
                        : `${stepDuration}m`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/bakes">← Back to History</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/recipes/${session.recipeId}`}>View Recipe</Link>
        </Button>
      </div>
    </div>
  );
}
