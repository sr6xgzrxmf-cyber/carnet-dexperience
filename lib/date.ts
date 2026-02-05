export function toTimestamp(input: unknown): number {
  if (!input) return 0;

  if (input instanceof Date) {
    const t = input.getTime();
    return Number.isFinite(t) ? t : 0;
  }

  if (typeof input === "number") {
    return Number.isFinite(input) ? input : 0;
  }

  if (typeof input === "string") {
    const s = input.trim();

    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      return Date.UTC(y, mo, d);
    }

    const t = Date.parse(s);
    return Number.isNaN(t) ? 0 : t;
  }

  if (typeof input === "object") {
    const obj = input as {
      date?: unknown;
      value?: unknown;
      year?: unknown;
      y?: unknown;
      month?: unknown;
      mo?: unknown;
      m?: unknown;
      day?: unknown;
      d?: unknown;
    };
    if (typeof obj.date === "string") return toTimestamp(obj.date);
    if (typeof obj.value === "string") return toTimestamp(obj.value);

    const y = obj.year ?? obj.y;
    const mo = obj.month ?? obj.mo ?? obj.m;
    const d = obj.day ?? obj.d;

    if (Number.isFinite(y) && Number.isFinite(mo) && Number.isFinite(d)) {
      return Date.UTC(Number(y), Number(mo) - 1, Number(d));
    }
  }

  return 0;
}

export function sortByDateDesc<T extends { date?: unknown }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    return toTimestamp(b.date) - toTimestamp(a.date);
  });
}
