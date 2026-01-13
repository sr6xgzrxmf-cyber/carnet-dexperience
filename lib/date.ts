export function toTimestamp(input: any): number {
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
    if (typeof input.date === "string") return toTimestamp(input.date);
    if (typeof input.value === "string") return toTimestamp(input.value);

    const y = input.year ?? input.y;
    const mo = input.month ?? input.mo ?? input.m;
    const d = input.day ?? input.d;

    if (Number.isFinite(y) && Number.isFinite(mo) && Number.isFinite(d)) {
      return Date.UTC(Number(y), Number(mo) - 1, Number(d));
    }
  }

  return 0;
}

export function sortByDateDesc<T extends { date?: any }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    return toTimestamp(b.date) - toTimestamp(a.date);
  });
}