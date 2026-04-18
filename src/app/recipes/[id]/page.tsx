import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/shared/StarRating";
import { addPercentages, computeHydration, hydrationLabel, totalFlourG } from "@/lib/bakersMath";
import { formatDistanceToNow } from "date-fns";
import { STEP_TYPE_LABELS } from "@/types";
import { Pencil, Play, Clock } from "lucide-react";
import { DeleteRecipeButton } from "./DeleteRecipeButton";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!recipe) notFound();

  const withPct = addPercentages(recipe.ingredients);
  const hydration = computeHydration(recipe.ingredients);
  const flourTotal = totalFlourG(recipe.ingredients);
  const hydLabel = hydration ? hydrationLabel(hydration) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{recipe.name}</h1>
          {recipe.description && (
            <p className="text-[var(--muted-foreground)] mt-1">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/recipes/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <DeleteRecipeButton recipeId={id} />
          <Button asChild size="sm">
            <Link href={`/bakes/new?recipeId=${id}`}>
              <Play className="h-4 w-4 mr-1" />
              Start Bake
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingredients & Baker&apos;s Math</CardTitle>
          {hydration !== null && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[var(--muted-foreground)]">Total flour: <strong>{flourTotal}g</strong></span>
              <Badge
                variant={hydLabel === "stiff" ? "amber" : hydLabel === "high" ? "blue" : "green"}
              >
                {Math.round(hydration)}% hydration ({hydLabel})
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-[var(--border)]">
            {withPct.map((ing) => (
              <div key={ing.id} className="flex items-center py-2 text-sm">
                <span className="flex-1">{ing.name}</span>
                <span className="w-20 text-right font-mono">{ing.weightG}g</span>
                <span className="w-20 text-right text-[var(--muted-foreground)]">
                  {ing.isFlour ? (
                    <Badge variant="secondary" className="text-xs">flour</Badge>
                  ) : (
                    ing.percentage !== null ? `${ing.percentage.toFixed(1)}%` : "—"
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Process Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recipe.steps.map((step, idx) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center text-xs font-semibold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{step.label}</span>
                    <Badge variant="secondary" className="text-xs">{STEP_TYPE_LABELS[step.type]}</Badge>
                    {step.durationMins && (
                      <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.durationMins >= 60
                          ? `${Math.floor(step.durationMins / 60)}h ${step.durationMins % 60 > 0 ? `${step.durationMins % 60}m` : ""}`
                          : `${step.durationMins}m`}
                      </span>
                    )}
                    {step.tempC && (
                      <span className="text-xs text-[var(--muted-foreground)]">{step.tempC}°C</span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {recipe.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{recipe.notes}</p>
          </CardContent>
        </Card>
      )}

      {recipe.sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bake History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[var(--border)]">
              {recipe.sessions.map((session) => (
                <div key={session.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                    </p>
                    {session.log?.outcomeNotes && (
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                        {session.log.outcomeNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {session.log?.rating && <StarRating value={session.log.rating} readonly size="sm" />}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/bakes/${session.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
