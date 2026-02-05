import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getAllArticlesMetaForSeries } from "./articles-series";

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
  description?: string;
};

const seriesDirectory = path.join(process.cwd(), "content", "series");

// Charge les metadonnées YAML des séries (optionnel)
function getSeriesYamlData(): Map<string, Partial<SeriesCatalogItem>> {
  const map = new Map<string, Partial<SeriesCatalogItem>>();

  if (!fs.existsSync(seriesDirectory)) return map;

  const files = fs
    .readdirSync(seriesDirectory)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

  for (const file of files) {
    const fullPath = path.join(seriesDirectory, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const data = (yaml.load(raw) ?? {}) as Partial<SeriesCatalogItem>;

    if (data.slug) {
      map.set(data.slug, data);
    }
  }

  return map;
}

export function getAllSeriesCatalog(): SeriesCatalogItem[] {
  // Charge les articles pour extraire les séries utilisées
  const articles = getAllArticlesMetaForSeries();
  const yamlData = getSeriesYamlData();

  // Collecte les slugs uniques de séries
  const seriesSlugs = new Set<string>();
  for (const article of articles) {
    if (article.series?.slug) {
      seriesSlugs.add(article.series.slug);
    }
  }

  // Crée les items du catalogue
  const items: SeriesCatalogItem[] = [];

  for (const slug of seriesSlugs) {
    const yaml = yamlData.get(slug);
    const color = (yaml?.color ?? "slate") as SeriesColor;

    items.push({
      slug,
      title: yaml?.title ?? slug, // Fallback au slug si pas de YAML
      color: SERIES_COLORS.includes(color) ? color : "slate",
      status: yaml?.status ?? "active",
      description: yaml?.description,
    });
  }

  return items.sort((a, b) => a.title.localeCompare(b.title, "fr"));
}
