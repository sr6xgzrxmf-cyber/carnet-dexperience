import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

function isLocalRequest(req: NextRequest) {
  const host =
    (req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "")
      .toLowerCase()
      .trim();

  // accepte avec ou sans port
  if (host === "localhost" || host.startsWith("localhost:")) return true;
  if (host === "127.0.0.1" || host.startsWith("127.0.0.1:")) return true;
  if (host === "[::1]" || host.startsWith("[::1]:")) return true; // IPv6 local

  return false;
}

type Series = { name?: unknown; slug?: unknown; order?: unknown };

export async function GET(req: NextRequest) {
  if (!isLocalRequest(req)) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const files = fs.existsSync(ARTICLES_DIR)
    ? fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"))
    : [];

  const items = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, filename), "utf8");
    const { data } = matter(raw);

    const series = (data.series ?? null) as Series | null;

    return {
      slug,
      title: String(data.title ?? slug),
      date: data.date ? String(data.date).slice(0, 10) : null,
      excerpt: data.excerpt ? String(data.excerpt) : null,
      cover: data.cover ? String(data.cover) : null,
      tags: Array.isArray(data.tags) ? data.tags.map((t: any) => String(t)) : [],
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
