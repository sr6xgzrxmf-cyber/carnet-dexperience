import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { findLocalArticleFile, listLocalArticleFiles } from "@/lib/local-article-files";
import { normalizeArticleDate } from "@/lib/article-date";
import { appendAdminHistory } from "@/lib/admin-history";
import { normalizeEditorialStatus, type EditorialStatus } from "@/lib/editorial-status";


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
    status?: EditorialStatus | null;
    excerpt?: string | null;
    cover?: string | null;
    tags?: string[] | null;
    series?: SeriesPatch;
  };
  dryRun?: boolean;
};

function listArticleFiles(): string[] {
  return listLocalArticleFiles();
}

function readArticle(slug: string) {
  const filePath = findLocalArticleFile(slug);
  if (!filePath) throw new Error("Article not found");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return { filePath, raw, parsed };
}

function writeArticle(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, "utf8");
}

function canonicalizeDateLine(raw: string, value: unknown): string {
  const date = normalizeArticleDate(value);
  return date ? raw.replace(/^date:\s*.*$/m, `date: "${date}"`) : raw;
}

function toNumberOrNull(v: unknown): number | null {
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

  if (typeof body.patch.date === "string" && !normalizeArticleDate(body.patch.date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (
    typeof body.patch.status === "string" &&
    !normalizeEditorialStatus(body.patch.status)
  ) {
    return NextResponse.json({ error: "Invalid editorial status" }, { status: 400 });
  }

  const { filePath, parsed } = readArticle(slug);
  let nextSlug = slug;
  let nextFilePath = filePath;
  type Frontmatter = Record<string, unknown> & { series?: Record<string, unknown> | null };
  const nextData: Frontmatter = { ...(parsed.data ?? {}) } as Frontmatter;

  // Apply simple fields
  if (typeof body.patch.title === "string") nextData.title = body.patch.title;

  if (body.patch.date === null) delete nextData.date;
  else if (typeof body.patch.date === "string") {
    nextData.date = normalizeArticleDate(body.patch.date)!;
    const datedSlug = /^(\d{4}-\d{2}-\d{2})-(.+)$/.exec(slug);
    if (datedSlug && datedSlug[1] !== nextData.date) {
      nextSlug = `${nextData.date}-${datedSlug[2]}`;
      nextFilePath = path.join(path.dirname(filePath), `${nextSlug}.md`);
      if (fs.existsSync(nextFilePath)) {
        return NextResponse.json(
          { error: `Target filename already exists: ${nextSlug}.md` },
          { status: 409 }
        );
      }
    }
  } else if (nextData.date !== undefined) {
    nextData.date = normalizeArticleDate(nextData.date) ?? nextData.date;
  }

  if (body.patch.status === null) delete nextData.status;
  else if (typeof body.patch.status === "string") nextData.status = body.patch.status;

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

      const existingSeries =
        nextData.series && typeof nextData.series === "object"
          ? (nextData.series as Record<string, unknown>)
          : {};
      nextData.series = {
        ...existingSeries,
        slug: seriesSlug,
        ...(seriesName ? { name: seriesName } : {}),
        ...(desiredOrder != null ? { order: desiredOrder } : {}),
      };

      if (desiredOrder != null) {
        // Load all items in this series (excluding current)
        const files = listArticleFiles();
        const siblings: Array<{ slug: string; filePath: string; data: Frontmatter; order: number | null; content: string }> = [];

        for (const fp of files) {
          const s = path.basename(fp, ".md");
          if (s === slug) continue;
          const raw = fs.readFileSync(fp, "utf8");
          const p = matter(raw);
          const d: Frontmatter = (p.data ?? {}) as Frontmatter;
          const ser =
            d.series && typeof d.series === "object"
              ? (d.series as Record<string, unknown>)
              : null;
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

          const sibSeries =
            sib.data.series && typeof sib.data.series === "object"
              ? { ...(sib.data.series as Record<string, unknown>) }
              : {};
          sibSeries.order = newOrder;
          sib.data.series = sibSeries;

          if (sib.data.date !== undefined) {
            sib.data.date = normalizeArticleDate(sib.data.date) ?? sib.data.date;
          }
          const nextRaw = canonicalizeDateLine(
            matter.stringify(sib.content, sib.data),
            sib.data.date
          );
          writes.push({ filePath: sib.filePath, raw: nextRaw });
          updatedFiles.push(path.relative(process.cwd(), sib.filePath));
        }
      }
    }
  }

  // Write current article (always last)
  const nextRawCurrent = canonicalizeDateLine(
    matter.stringify(parsed.content ?? "", nextData),
    nextData.date
  );
  writes.push({ filePath: nextFilePath, raw: nextRawCurrent });
  updatedFiles.push(path.relative(process.cwd(), nextFilePath));

  // Dedupe
  const seen = new Set<string>();
  const finalWrites = writes.filter((w) => (seen.has(w.filePath) ? false : (seen.add(w.filePath), true)));

  if (!dryRun) {
    if (nextFilePath !== filePath) fs.renameSync(filePath, nextFilePath);
    for (const w of finalWrites) writeArticle(w.filePath, w.raw);
    appendAdminHistory({
      action: "article.update",
      target: nextSlug,
      summary: `Métadonnées modifiées (${Object.keys(body.patch).join(", ")})`,
      before: Object.fromEntries(Object.keys(body.patch).map((key) => [key, parsed.data?.[key]])),
      after: Object.fromEntries(Object.keys(body.patch).map((key) => [key, nextData[key]])),
    });
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    slug: nextSlug,
    renamed: nextSlug !== slug,
    updated: Array.from(new Set(updatedFiles)),
  });
}
