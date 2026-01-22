import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export type SeriesColor =
  | "slate"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "pink"
  | "teal";

export const SERIES_COLORS: SeriesColor[] = [
  "slate",
  "blue",
  "green",
  "amber",
  "red",
  "violet",
  "pink",
  "teal",
];

export type SeriesCatalogItem = {
  slug: string;
  title: string;
  color: SeriesColor;
  status?: "active" | "paused" | "archived";
};

const seriesDirectory = path.join(process.cwd(), "content", "series");

export function getAllSeriesCatalog(): SeriesCatalogItem[] {
  if (!fs.existsSync(seriesDirectory)) return [];

  const files = fs
    .readdirSync(seriesDirectory)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

  const items: SeriesCatalogItem[] = [];

  for (const file of files) {
    const fullPath = path.join(seriesDirectory, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const data = (yaml.load(raw) ?? {}) as Partial<SeriesCatalogItem>;

    if (!data.slug || !data.title) continue;

    const color = (data.color ?? "slate") as SeriesColor;
    items.push({
      slug: data.slug,
      title: data.title,
      color: SERIES_COLORS.includes(color) ? color : "slate",
      status: data.status ?? "active",
    });
  }

  return items.sort((a, b) => a.title.localeCompare(b.title, "fr"));
}
