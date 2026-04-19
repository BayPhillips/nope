import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/StarRating";
import { addPercentages, computeHydration, hydrationLabel } from "@/lib/bakersMath";
import { formatDistanceToNow } from "date-fns";
import type { RecipeWithRelations } from "@/types";

interface RecipeCardProps {
  recipe: RecipeWithRelations;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const hydration = computeHydration(recipe.ingredients);
  const lastSession = recipe.sessions?.[0];
  const hydLabel = hydration ? hydrationLabel(hydration) : null;
  const hydVariant = hydLabel === "stiff" ? "amber" : hydLabel === "high" ? "blue" : "green";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{recipe.name}</CardTitle>
          {hydration !== null && (
            <Badge variant={hydVariant}>{Math.round(hydration)}% hydration</Badge>
          )}
        </div>
        {recipe.description && (
          <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{recipe.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
          <span>{recipe.ingredients.length} ingredients</span>
          <span>{recipe.steps.length} steps</span>
        </div>

        {lastSession && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--muted-foreground)]">
              Last baked {formatDistanceToNow(new Date(lastSession.startedAt), { addSuffix: true })}
            </span>
            {lastSession.log?.rating && (
              <StarRating value={lastSession.log.rating} readonly size="sm" />
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/recipes/${recipe.id}`}>View</Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={`/bakes/new?recipeId=${recipe.id}`}>Start Bake</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
