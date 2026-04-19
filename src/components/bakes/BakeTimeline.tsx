"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BakeStepCard } from "./BakeStepCard";
import { BakeProgressBar } from "./BakeProgressBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { BakeSessionWithRelations } from "@/types";
import type { BakeStep } from "@prisma/client";
import { cn } from "@/lib/cn";

interface BakeTimelineProps {
  initialSession: BakeSessionWithRelations;
}

export function BakeTimeline({ initialSession }: BakeTimelineProps) {
  const router = useRouter();
  const [steps, setSteps] = useState<BakeStep[]>(initialSession.steps);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const activeStep = steps.find((s) => s.startedAt && !s.completedAt);
  const allDone = steps.every((s) => s.completedAt);

  async function patchStep(stepId: string, action: "start" | "complete") {
    setLoading(stepId);
    try {
      const res = await fetch(
        `/api/bakes/${initialSession.id}/steps/${stepId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      if (!res.ok) throw new Error("Failed to update step");
      const updated: BakeStep = await res.json();
      setSteps((prev) => prev.map((s) => (s.id === stepId ? updated : s)));

      if (action === "complete" && autoAdvance) {
        const currentIdx = steps.findIndex((s) => s.id === stepId);
        const nextStep = steps[currentIdx + 1];
        if (nextStep && !nextStep.startedAt) {
          setTimeout(() => {
            patchStep(nextStep.id, "start");
          }, 1500);
        } else if (!nextStep) {
          toast.success("All steps complete! Time to log your bake.");
        }
      }
    } catch {
      toast.error("Failed to update step");
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    await fetch(`/api/bakes/${initialSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    toast.info("Bake session cancelled");
    router.push("/bakes");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <BakeProgressBar steps={steps} />
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="accent-[var(--primary)]"
            />
            Auto-advance
          </label>
          <Button
            variant="outline"
            size="sm"
            className="text-[var(--destructive)]"
            onClick={() => setCancelOpen(true)}
          >
            Cancel Bake
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <BakeStepCard
            key={step.id}
            step={step}
            isActive={activeStep?.id === step.id}
            autoAdvance={autoAdvance}
            onStart={() => patchStep(step.id, "start")}
            onComplete={() => patchStep(step.id, "complete")}
          />
        ))}
      </div>

      {allDone && (
        <div className="text-center p-6 border border-green-200 bg-green-50 rounded-xl">
          <p className="text-green-700 font-semibold text-lg">All steps complete! 🎉</p>
          <p className="text-green-600 text-sm mt-1">Log your bake results and save for next time.</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/bakes/${initialSession.id}/log`)}
          >
            Log This Bake
          </Button>
        </div>
      )}

      {steps.length > 0 && !steps[0].startedAt && (
        <div className="text-center">
          <Button onClick={() => patchStep(steps[0].id, "start")}>
            Start First Step
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Bake Session"
        description="This will mark the session as cancelled. Your progress will not be saved."
        confirmLabel="Cancel Bake"
        destructive
        onConfirm={handleCancel}
      />
    </div>
  );
}
