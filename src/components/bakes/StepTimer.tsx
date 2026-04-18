"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatDuration, elapsedSeconds, remainingSeconds } from "@/lib/timeUtils";

interface StepTimerProps {
  startedAt: Date | null;
  completedAt: Date | null;
  durationMins: number | null;
}

export function StepTimer({ startedAt, completedAt, durationMins }: StepTimerProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!startedAt || completedAt) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [startedAt, completedAt]);

  if (!startedAt) {
    return (
      <span className="text-sm text-[var(--muted-foreground)]">
        {durationMins ? `~${durationMins >= 60 ? `${Math.floor(durationMins / 60)}h ${durationMins % 60 > 0 ? `${durationMins % 60}m` : ""}` : `${durationMins}m`}` : "Untimed"}
      </span>
    );
  }

  if (completedAt) {
    const totalSecs = Math.floor(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000
    );
    return (
      <span className="text-sm text-green-600 font-mono">
        ✓ {formatDuration(totalSecs)}
      </span>
    );
  }

  // Active step
  if (durationMins) {
    const remaining = remainingSeconds(new Date(startedAt), durationMins);
    const isOvertime = remaining < 0;
    const pct = Math.max(0, Math.min(100, ((durationMins * 60 - remaining) / (durationMins * 60)) * 100));
    const isAlmostDone = remaining < durationMins * 60 * 0.1;

    return (
      <div className="flex flex-col gap-1 min-w-[100px]">
        <span
          className={cn(
            "text-sm font-mono font-semibold",
            isOvertime ? "text-red-600" : isAlmostDone ? "text-amber-600" : "text-[var(--foreground)]"
          )}
        >
          {isOvertime ? "+" : ""}{formatDuration(Math.abs(remaining))}
          {isOvertime && <span className="text-xs font-normal ml-1">over</span>}
        </span>
        <div className="h-1.5 w-full bg-[var(--secondary)] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOvertime ? "bg-red-500 w-full" : isAlmostDone ? "bg-amber-500" : "bg-[var(--primary)]"
            )}
            style={{ width: `${isOvertime ? 100 : pct}%` }}
          />
        </div>
      </div>
    );
  }

  // Untimed active step - count up
  const elapsed = elapsedSeconds(new Date(startedAt));
  return (
    <span className="text-sm font-mono text-[var(--foreground)]">
      {formatDuration(elapsed)}
    </span>
  );
}
