import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type Series = { name?: unknown; slug?: unknown; order?: unknown };

export async function GET() {
  if (!IS_LOCAL) {
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