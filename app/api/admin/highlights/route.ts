import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/articles";
import { normalizeArticleDate } from "@/lib/article-date";
import {
  effectiveEditorialStatus,
  normalizeEditorialStatus,
} from "@/lib/editorial-status";
import {
  normalizeHomeHighlights,
  readHomeHighlights,
  writeHomeHighlights,
} from "@/lib/home-highlights";
import { appendAdminHistory } from "@/lib/admin-history";

const IS_LOCAL = process.env.NODE_ENV !== "production" && !process.env.VERCEL;

export async function GET() {
  if (!IS_LOCAL) {
    return NextResponse.json({ error: "Local-only admin feature." }, { status: 403 });
  }

  const articles = getAllArticles({ includeFuture: true }).map((article) => ({
    slug: article.slug,
    title: article.meta.title ?? article.slug,
    date: normalizeArticleDate(article.meta.date),
    cover: article.meta.cover ?? null,
    status: normalizeEditorialStatus(article.meta.status),
    effectiveStatus: effectiveEditorialStatus(article.meta.status, article.meta.date),
    searchText: [
      article.meta.excerpt ?? "",
      ...(article.meta.tags ?? []),
      article.content,
    ].join(" "),
  }));

  return NextResponse.json({ items: readHomeHighlights(), articles });
}

export async function PATCH(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json({ error: "Local-only admin feature." }, { status: 403 });
  }

  const body = (await req.json()) as { items?: unknown };
  const items = normalizeHomeHighlights(body.items);
  const knownSlugs = new Set(
    getAllArticles({ includeFuture: true }).map((article) => article.slug)
  );
  const unknown = items.filter((item) => !knownSlugs.has(item.slug));
  if (unknown.length) {
    return NextResponse.json(
      { error: `Article introuvable : ${unknown.map((item) => item.slug).join(", ")}` },
      { status: 400 }
    );
  }

  const before = readHomeHighlights();
  writeHomeHighlights(items);
  appendAdminHistory({
    action: "homepage.highlights",
    target: "accueil",
    summary: `${items.filter((item) => item.active).length} mise(s) en avant active(s)`,
    before,
    after: items,
  });

  return NextResponse.json({ ok: true, items });
}
