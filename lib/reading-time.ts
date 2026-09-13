const WORDS_PER_MINUTE = 200;

export function estimateReadingMinutes(markdown: string): number {
  if (!markdown?.trim()) return 0;

  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^[>#\s]*/gm, " ")
    .replace(/[*_~|]/g, " ");

  const words = text.split(/\s+/).filter(Boolean).length;
  if (!words) return 0;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes?: number): string | null {
  if (!minutes) return null;
  if (minutes < 90) return `${minutes} min de lecture`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest
    ? `${hours} h ${String(rest).padStart(2, "0")} de lecture`
    : `${hours} h de lecture`;
}
