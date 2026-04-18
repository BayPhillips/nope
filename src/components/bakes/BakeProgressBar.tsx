import { Progress } from "@/components/ui/progress";
import { formatDurationMins } from "@/lib/timeUtils";
import type { BakeStep } from "@prisma/client";

interface BakeProgressBarProps {
  steps: BakeStep[];
}

export function BakeProgressBar({ steps }: BakeProgressBarProps) {
  const completed = steps.filter((s) => s.completedAt).length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const remainingMins = steps
    .filter((s) => !s.completedAt && s.durationMins)
    .reduce((sum, s) => sum + (s.durationMins ?? 0), 0);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{completed}/{total} steps complete</span>
        {remainingMins > 0 && (
          <span className="text-[var(--muted-foreground)]">
            ~{formatDurationMins(remainingMins)} remaining
          </span>
        )}
      </div>
      <Progress value={pct} />
    </div>
  );
}
