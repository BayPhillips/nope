export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/StarRating";
import { BakeProgressBar } from "@/components/bakes/BakeProgressBar";
import { formatDistanceToNow, format } from "date-fns";
import { BookOpen, Play, History, ChevronRight, Plus } from "lucide-react";

export default async function DashboardPage() {
  const [recipeCount, activeSessions, recentSessions, totalBakes] = await Promise.all([
    prisma.recipe.count(),
    prisma.bakeSession.findMany({
      where: { status: "IN_PROGRESS" },
      include: { recipe: true, steps: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.bakeSession.findMany({
      where: { status: { not: "IN_PROGRESS" } },
      include: { recipe: true, log: true },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    prisma.bakeSession.count({ where: { status: "COMPLETED" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sourdough Manager</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Your baking dashboard</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recipeCount}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Recipes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
              <History className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBakes}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Bakes Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Play className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeSessions.length}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Active Session{activeSessions.length !== 1 ? "s" : ""}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Active Bake</h2>
          {activeSessions.map((session) => (
            <Card key={session.id} className="border-[var(--primary)] bg-[var(--accent)]/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{session.recipe.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Started {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="amber">In Progress</Badge>
                </div>
                <BakeProgressBar steps={session.steps} />
                <Button asChild size="sm">
                  <Link href={`/bakes/${session.id}`}>
                    <Play className="h-4 w-4 mr-1" />
                    Resume Bake
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeSessions.length === 0 && (
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/bakes/new">
              <Plus className="h-4 w-4 mr-2" />
              Start a Bake
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/recipes/new">
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </Link>
          </Button>
        </div>
      )}

      {recentSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Bakes</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/bakes">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/bakes/${session.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{session.recipe.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {format(new Date(session.startedAt), "PPP")}
                      </p>
                    </div>
                    {session.log?.rating && (
                      <StarRating value={session.log.rating} readonly size="sm" />
                    )}
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {recipeCount === 0 && activeSessions.length === 0 && (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg font-medium mb-2">Welcome to Sourdough Manager!</p>
          <p className="text-sm mb-6">Start by creating your first recipe.</p>
          <Button asChild>
            <Link href="/recipes/new">Create a Recipe</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
