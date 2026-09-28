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
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-access";
import { isLocalAdmin } from "@/lib/analytics-auth";
import { commitRepoChanges, GithubContentError, ONLINE_SAVE_NOTICE } from "@/lib/github-content";

const HIGHLIGHTS_REPO_PATH = "content/home-highlights.json";

export async function GET() {
  if (!(await isAdminRequest())) return adminUnauthorized();

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
  if (!(await isAdminRequest())) return adminUnauthorized();

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

  const activeCount = items.filter((item) => item.active).length;

  if (!isLocalAdmin()) {
    try {
      await commitRepoChanges(
        `Admin : met à jour les mises en avant (${activeCount} active(s))`,
        [{ path: HIGHLIGHTS_REPO_PATH, content: JSON.stringify({ items }, null, 2) + "\n" }]
      );
    } catch (error) {
      const message = error instanceof GithubContentError ? error.message : "Enregistrement GitHub impossible.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
    return NextResponse.json({ ok: true, items, message: ONLINE_SAVE_NOTICE });
  }

  const before = readHomeHighlights();
  writeHomeHighlights(items);
  appendAdminHistory({
    action: "homepage.highlights",
    target: "accueil",
    summary: `${activeCount} mise(s) en avant active(s)`,
    before,
    after: items,
  });

  return NextResponse.json({ ok: true, items, message: "Mises en avant enregistrées." });
}
