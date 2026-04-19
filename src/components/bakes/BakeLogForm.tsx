"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/shared/StarRating";
import type { BakeLog } from "@prisma/client";

interface BakeLogFormProps {
  sessionId: string;
  existingLog?: BakeLog | null;
}

export function BakeLogForm({ sessionId, existingLog }: BakeLogFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(existingLog?.rating ?? null);
  const [outcomeNotes, setOutcomeNotes] = useState(existingLog?.outcomeNotes ?? "");
  const [improvementNotes, setImprovementNotes] = useState(existingLog?.improvementNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = existingLog ? "PATCH" : "POST";
      const res = await fetch(`/api/bakes/${sessionId}/log`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, outcomeNotes, improvementNotes }),
      });
      if (!res.ok) throw new Error("Failed to save log");
      toast.success("Bake logged successfully!");
      router.push("/bakes");
      router.refresh();
    } catch {
      toast.error("Failed to save bake log");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>How did it go?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="outcome">Outcome Notes</Label>
            <Textarea
              id="outcome"
              placeholder="How did the bread turn out? Crust, crumb, flavor, oven spring..."
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="improvements">What to improve next time?</Label>
            <Textarea
              id="improvements"
              placeholder="Longer bulk ferment, higher hydration, different shaping technique..."
              value={improvementNotes}
              onChange={(e) => setImprovementNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Back
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Bake Log"}
        </Button>
      </div>
    </form>
  );
}
