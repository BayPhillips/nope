export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/shared/StarRating";
import { format } from "date-fns";
import { CheckCircle2, Clock, XCircle, Play } from "lucide-react";
import { Plus } from "lucide-react";

export default async function BakesPage() {
  const sessions = await prisma.bakeSession.findMany({
    include: { recipe: true, log: true },
    orderBy: { startedAt: "desc" },
  });

  const active = sessions.filter((s) => s.status === "IN_PROGRESS");
  const history = sessions.filter((s) => s.status !== "IN_PROGRESS");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bake History</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/bakes/new">
            <Plus className="h-4 w-4 mr-2" />
            Start Bake
          </Link>
        </Button>
      </div>

      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-[var(--muted-foreground)] uppercase tracking-wide">
            Active Session
          </h2>
          {active.map((session) => (
            <Card key={session.id} className="border-[var(--primary)] bg-[var(--accent)]/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{session.recipe.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Started {format(new Date(session.startedAt), "PPp")}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/bakes/${session.id}`}>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {history.length === 0 && active.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg mb-4">No bakes yet</p>
          <Button asChild>
            <Link href="/bakes/new">Start your first bake</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.length > 0 && (
            <h2 className="font-semibold text-sm text-[var(--muted-foreground)] uppercase tracking-wide">
              History
            </h2>
          )}
          {history.map((session) => {
            const isCompleted = session.status === "COMPLETED";
            const totalMins = session.completedAt
              ? Math.round(
                  (new Date(session.completedAt).getTime() -
                    new Date(session.startedAt).getTime()) /
                    60000
                )
              : null;

            return (
              <Card key={session.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[var(--muted-foreground)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{session.recipe.name}</p>
                      {session.log?.rating && (
                        <StarRating value={session.log.rating} readonly size="sm" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {format(new Date(session.startedAt), "PPP")}
                      </p>
                      {totalMins !== null && (
                        <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {totalMins >= 60
                            ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`
                            : `${totalMins}m`}
                        </span>
                      )}
                    </div>
                    {session.log?.outcomeNotes && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-1">
                        {session.log.outcomeNotes}
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/bakes/${session.id}`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
