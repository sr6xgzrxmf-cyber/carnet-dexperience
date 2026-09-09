function formatUtcDate(date: Date): string | null {
  if (!Number.isFinite(date.getTime())) return null;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validatedDateParts(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return formatUtcDate(date);
}

/**
 * Normalise the date shapes that gray-matter/YAML can return to YYYY-MM-DD.
 * Unquoted YAML dates are Date objects, while quoted dates remain strings.
 */
export function normalizeArticleDate(input: unknown): string | null {
  if (input instanceof Date) return formatUtcDate(input);

  if (typeof input === "number") {
    return Number.isFinite(input) ? formatUtcDate(new Date(input)) : null;
  }

  if (input && typeof input === "object") {
    const value = input as { date?: unknown; value?: unknown };
    if (value.date !== undefined) return normalizeArticleDate(value.date);
    if (value.value !== undefined) return normalizeArticleDate(value.value);
    return null;
  }

  if (typeof input !== "string") return null;

  const value = input.trim();
  if (!value) return null;

  // Keep the written calendar day for ISO dates and ISO datetimes, even when
  // the datetime contains a timezone offset.
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s])/.exec(value);
  if (iso) {
    return validatedDateParts(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  // Compatibility with date strings produced by older parsing code.
  const parsed = new Date(value);
  return formatUtcDate(parsed);
}
