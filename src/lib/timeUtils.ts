export function elapsedSeconds(startedAt: Date): number {
  return Math.floor((Date.now() - startedAt.getTime()) / 1000);
}

export function formatDuration(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const sign = totalSeconds < 0 ? "-" : "";
  if (h > 0) return `${sign}${h}h ${m}m`;
  if (m > 0) return `${sign}${m}m ${pad(s)}s`;
  return `${sign}${pad(s)}s`;
}

export function formatDurationMins(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function remainingSeconds(
  startedAt: Date,
  durationMins: number
): number {
  const elapsed = elapsedSeconds(startedAt);
  return durationMins * 60 - elapsed;
}
