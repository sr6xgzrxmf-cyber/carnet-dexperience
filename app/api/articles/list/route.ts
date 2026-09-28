import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { listLocalArticleFiles } from "@/lib/local-article-files";
import { normalizeArticleDate } from "@/lib/article-date";
import { effectiveEditorialStatus, normalizeEditorialStatus } from "@/lib/editorial-status";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-access";

type Series = { name?: unknown; slug?: unknown; order?: unknown };

export async function GET() {
  if (!(await isAdminRequest())) return adminUnauthorized();

  const files = listLocalArticleFiles();

  const items = files.map((filePath) => {
    const slug = path.basename(filePath, ".md");
    const raw = fs.readFileSync(filePath, "utf8");
    const { data: rawData } = matter(raw);
    const data = (rawData ?? {}) as Record<string, unknown>;

    const series = (data.series ?? null) as Series | null;

    return {
      slug,
      title: String(data.title ?? slug),
      date: normalizeArticleDate(data.date),
      status: normalizeEditorialStatus(data.status),
      effectiveStatus: effectiveEditorialStatus(data.status, data.date),
      excerpt: data.excerpt ? String(data.excerpt) : null,
      cover: data.cover ? String(data.cover) : null,
      tags: Array.isArray(data.tags) ? data.tags.map((t) => String(t)) : [],
      seriesName: series?.name ? String(series.name) : null,
      seriesSlug: series?.slug ? String(series.slug) : null,
      seriesOrder:
        typeof series?.order === "number"
          ? series.order
          : series?.order != null
            ? Number(series.order)
            : null,
    };
  });

  return NextResponse.json({ items });
}
