import "server-only";

import fs from "fs";
import path from "path";

export const HIGHLIGHT_SIZES = ["feature", "tall", "compact"] as const;
export type HighlightSize = (typeof HIGHLIGHT_SIZES)[number];

export type HomeHighlight = {
  slug: string;
  label: string;
  size: HighlightSize;
  active: boolean;
};

const FILE_PATH = path.join(process.cwd(), "content", "home-highlights.json");

export function normalizeHomeHighlights(value: unknown): HomeHighlight[] {
  const items = value && typeof value === "object" && "items" in value
    ? (value as { items?: unknown }).items
    : value;
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();
  return items.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const slug = typeof item.slug === "string" ? item.slug.trim() : "";
    if (!slug || seen.has(slug)) return [];
    seen.add(slug);
    const size = HIGHLIGHT_SIZES.includes(item.size as HighlightSize)
      ? (item.size as HighlightSize)
      : "compact";
    return [{
      slug,
      label: typeof item.label === "string" ? item.label.trim().slice(0, 50) : "",
      size,
      active: item.active !== false,
    }];
  });
}

export function readHomeHighlights(): HomeHighlight[] {
  if (!fs.existsSync(FILE_PATH)) return [];
  try {
    return normalizeHomeHighlights(JSON.parse(fs.readFileSync(FILE_PATH, "utf8")));
  } catch {
    return [];
  }
}

export function writeHomeHighlights(items: HomeHighlight[]) {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ items }, null, 2) + "\n", "utf8");
}
