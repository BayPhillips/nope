"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StepTimer } from "./StepTimer";
import { STEP_TYPE_LABELS } from "@/types";
import { cn } from "@/lib/cn";
import { CheckCircle2, Circle, Clock, Thermometer } from "lucide-react";
import type { BakeStep } from "@prisma/client";

interface BakeStepCardProps {
  step: BakeStep;
  isActive: boolean;
  onStart: () => void;
  onComplete: () => void;
  autoAdvance: boolean;
}

export function BakeStepCard({
  step,
  isActive,
  onStart,
  onComplete,
  autoAdvance,
}: BakeStepCardProps) {
  const isCompleted = !!step.completedAt;
  const isStarted = !!step.startedAt;
  const isPending = !isStarted && !isActive;

  return (
    <div
      className={cn(
        "border rounded-xl p-4 transition-all",
        isActive && "border-[var(--primary)] bg-[var(--accent)]/30 shadow-sm",
        isCompleted && "border-green-200 bg-green-50 opacity-80",
        isPending && "border-[var(--border)] opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : isActive || isStarted ? (
            <div className="h-5 w-5 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]/20 animate-pulse" />
          ) : (
            <Circle className="h-5 w-5 text-[var(--muted-foreground)]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("font-medium text-sm", isCompleted && "line-through text-[var(--muted-foreground)]")}>
              {step.label}
            </span>
            <Badge variant="secondary" className="text-xs">
              {STEP_TYPE_LABELS[step.type]}
            </Badge>
            {step.tempC && (
              <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-0.5">
                <Thermometer className="h-3 w-3" />
                {step.tempC}°C
              </span>
            )}
          </div>

          {step.description && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{step.description}</p>
          )}

          <div className="mt-2 flex items-center gap-3">
            <StepTimer
              startedAt={step.startedAt ? new Date(step.startedAt) : null}
              completedAt={step.completedAt ? new Date(step.completedAt) : null}
              durationMins={step.durationMins}
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col gap-1.5">
          {!isStarted && !isCompleted && (
            <Button size="sm" onClick={onStart}>
              Start
            </Button>
          )}
          {isStarted && !isCompleted && (
            <Button size="sm" onClick={onComplete} variant="outline">
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
