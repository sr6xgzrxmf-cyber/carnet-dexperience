import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type SeriesPatch =
  | null
  | {
      name?: string | null;
      slug: string;
      order?: number | null;
    };

type UpdateBody = {
  slug: string;
  patch: {
    title?: string;
    date?: string | null;
    excerpt?: string | null;
    cover?: string | null;
    tags?: string[] | null;
    series?: SeriesPatch;
  };
  dryRun?: boolean;
};

function listArticleFiles(): string[] {
  return fs.existsSync(ARTICLES_DIR)
    ? fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"))
    : [];
}

function readArticle(slug: string) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return { filePath, raw, parsed };
}

function writeArticle(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, "utf8");
}

function toNumberOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const body = (await req.json()) as UpdateBody;

  if (!body?.slug || !body?.patch) {
    return NextResponse.json({ error: "Missing slug or patch" }, { status: 400 });
  }

  const slug = body.slug;
  const dryRun = !!body.dryRun;

  const { filePath, parsed } = readArticle(slug);
  const nextData: any = { ...(parsed.data ?? {}) };

  // Apply simple fields
  if (typeof body.patch.title === "string") nextData.title = body.patch.title;

  if (body.patch.date === null) delete nextData.date;
  else if (typeof body.patch.date === "string") nextData.date = body.patch.date;

  if (body.patch.excerpt === null) delete nextData.excerpt;
  else if (typeof body.patch.excerpt === "string") nextData.excerpt = body.patch.excerpt;

  if (body.patch.cover === null) delete nextData.cover;
  else if (typeof body.patch.cover === "string") nextData.cover = body.patch.cover;

  if (body.patch.tags === null) delete nextData.tags;
  else if (Array.isArray(body.patch.tags)) nextData.tags = body.patch.tags;

  const updatedFiles: string[] = [];
  const writes: Array<{ filePath: string; raw: string }> = [];

  // Handle series patch + order collisions
  if (body.patch.series !== undefined) {
    const sp = body.patch.series;

    if (sp === null) {
      delete nextData.series;
    } else {
      const seriesSlug = String(sp.slug);
      const seriesName = sp.name != null ? String(sp.name) : undefined;
      const desiredOrder = toNumberOrNull(sp.order);

      nextData.series = {
        ...(nextData.series ?? {}),
        slug: seriesSlug,
        ...(seriesName ? { name: seriesName } : {}),
        ...(desiredOrder != null ? { order: desiredOrder } : {}),
      };

      if (desiredOrder != null) {
        // Load all items in this series (excluding current)
        const files = listArticleFiles();
        const siblings: Array<{ slug: string; filePath: string; data: any; order: number | null; content: string }> = [];

        for (const f of files) {
          const s = f.replace(/\.md$/, "");
          if (s === slug) continue;
          const fp = path.join(ARTICLES_DIR, f);
          const raw = fs.readFileSync(fp, "utf8");
          const p = matter(raw);
          const d: any = p.data ?? {};
          const ser: any = d.series ?? null;
          const sibSeriesSlug = ser?.slug != null ? String(ser.slug) : null;
          if (sibSeriesSlug !== seriesSlug) continue;

          const ord = toNumberOrNull(ser?.order);
          siblings.push({ slug: s, filePath: fp, data: d, order: ord, content: p.content ?? "" });
        }

        // Bump orders >= desiredOrder (descending to avoid collisions)
        const bump = siblings
          .filter((x) => x.order != null && x.order >= desiredOrder)
          .sort((a, b) => (b.order ?? 0) - (a.order ?? 0));

        for (const sib of bump) {
          const currentOrder = sib.order!;
          const newOrder = currentOrder + 1;

          const sibSeries = { ...(sib.data.series ?? {}) };
          sibSeries.order = newOrder;
          sib.data.series = sibSeries;

          const nextRaw = matter.stringify(sib.content, sib.data);
          writes.push({ filePath: sib.filePath, raw: nextRaw });
          updatedFiles.push(path.relative(process.cwd(), sib.filePath));
        }
      }
    }
  }

  // Write current article (always last)
  const nextRawCurrent = matter.stringify(parsed.content ?? "", nextData);
  writes.push({ filePath, raw: nextRawCurrent });
  updatedFiles.push(path.relative(process.cwd(), filePath));

  // Dedupe
  const seen = new Set<string>();
  const finalWrites = writes.filter((w) => (seen.has(w.filePath) ? false : (seen.add(w.filePath), true)));

  if (!dryRun) {
    for (const w of finalWrites) writeArticle(w.filePath, w.raw);
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    updated: Array.from(new Set(updatedFiles)),
  });
}
