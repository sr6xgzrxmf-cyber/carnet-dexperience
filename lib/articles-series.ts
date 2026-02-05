import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type ArticleSeries = { slug: string; order: number };

export type ArticleMetaForSeries = {
  slug: string;
  title: string;
  date?: string;
  cover?: string;
  series?: ArticleSeries;
};

const articlesDirectory = path.join(process.cwd(), "content", "articles");

function safeNumber(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

export function getAllArticlesMetaForSeries(): ArticleMetaForSeries[] {
  if (!fs.existsSync(articlesDirectory)) return [];

  const files = fs.readdirSync(articlesDirectory).filter((f) => f.endsWith(".md"));

  const items: ArticleMetaForSeries[] = [];

  for (const file of files) {
    const fullPath = path.join(articlesDirectory, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data: rawData } = matter(raw);
    const data = (rawData ?? {}) as Record<string, unknown>;

    const slug = file.replace(/\.md$/, "");
    const title = typeof data.title === "string" ? data.title : slug;

    const seriesData =
      data.series && typeof data.series === "object"
        ? (data.series as Record<string, unknown>)
        : null;
    let series: ArticleSeries | undefined;

    if (seriesData) {
      const s = typeof seriesData.slug === "string" ? seriesData.slug : undefined;
      const o = safeNumber(seriesData.order);
      if (s && o !== undefined) series = { slug: s, order: o };
    }

    items.push({
      slug,
      title,
      date: typeof data.date === "string" ? data.date : undefined,
      cover: typeof data.cover === "string" ? data.cover : undefined,
      series,
    });
  }

  return items;
}
