import { normalizeArticleDate } from "./article-date";

export const EDITORIAL_STATUSES = [
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
] as const;

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

export function normalizeEditorialStatus(value: unknown): EditorialStatus | null {
  return typeof value === "string" && EDITORIAL_STATUSES.includes(value as EditorialStatus)
    ? (value as EditorialStatus)
    : null;
}

export function parisTodayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function effectiveEditorialStatus(
  status: unknown,
  date: unknown,
  now: Date = new Date()
): EditorialStatus {
  const explicit = normalizeEditorialStatus(status);
  if (explicit) return explicit;

  const normalizedDate = normalizeArticleDate(date);
  return normalizedDate && normalizedDate > parisTodayISO(now) ? "scheduled" : "published";
}

export function isEditoriallyPublished(
  status: unknown,
  date: unknown,
  now: Date = new Date()
): boolean {
  const effective = effectiveEditorialStatus(status, date, now);
  if (effective === "draft" || effective === "review" || effective === "archived") return false;

  const normalizedDate = normalizeArticleDate(date);
  return !normalizedDate || normalizedDate <= parisTodayISO(now);
}

export const EDITORIAL_STATUS_LABELS: Record<EditorialStatus, string> = {
  draft: "Brouillon",
  review: "À relire",
  scheduled: "Programmé",
  published: "Publié",
  archived: "Archivé",
};
