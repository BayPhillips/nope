"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeHydration } from "@/lib/bakersMath";
import type { RecipeWithRelations } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function StartBakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("recipeId");
  const [recipes, setRecipes] = useState<RecipeWithRelations[]>([]);
  const [selected, setSelected] = useState<string | null>(preselectedId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then(setRecipes)
      .catch(() => toast.error("Failed to load recipes"));
  }, []);

  async function startBake() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.activeSessionId) {
          toast.error(data.error, {
            action: {
              label: "Resume",
              onClick: () => router.push(`/bakes/${data.activeSessionId}`),
            },
          });
        } else {
          throw new Error(data.error || "Failed to start bake");
        }
        return;
      }
      toast.success("Bake session started!");
      router.push(`/bakes/${data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start bake");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/recipes">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Start a Bake</h1>
          <p className="text-[var(--muted-foreground)] text-sm">Choose a recipe to bake</p>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <p className="mb-4">No recipes yet.</p>
          <Button asChild>
            <Link href="/recipes/new">Create a Recipe First</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => {
            const hydration = computeHydration(recipe.ingredients);
            return (
              <div
                key={recipe.id}
                onClick={() => setSelected(recipe.id)}
                className={`border rounded-xl p-4 cursor-pointer transition-all hover:border-[var(--primary)] ${
                  selected === recipe.id
                    ? "border-[var(--primary)] bg-[var(--accent)]/30"
                    : "border-[var(--border)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    {recipe.description && (
                      <p className="text-sm text-[var(--muted-foreground)]">{recipe.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hydration && <Badge variant="secondary">{Math.round(hydration)}%</Badge>}
                    <Badge variant="outline">{recipe.steps.length} steps</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={startBake} disabled={!selected || loading}>
          {loading ? "Starting…" : "Start Bake Session"}
        </Button>
      </div>
    </div>
  );
}

export default function StartBakePage() {
  return (
    <Suspense>
      <StartBakeContent />
    </Suspense>
  );
}
