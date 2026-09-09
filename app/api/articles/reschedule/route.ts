import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { findLocalArticleFile } from "@/lib/local-article-files";
import { normalizeArticleDate } from "@/lib/article-date";
import { appendAdminHistory } from "@/lib/admin-history";


const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type Body = { slug: string; date: string };

function writeCanonicalDateInFrontmatter(raw: string, date: string) {
  // Le format canonique du site reste : date: "2026-01-25"
  return raw.replace(
    /^date:\s*.*$/m,
    `date: "${date}"`
  );
}

export async function PATCH(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const body = (await req.json()) as Body;

  if (!body?.slug || !body?.date) {
    return NextResponse.json({ error: "Missing slug or date" }, { status: 400 });
  }

  const newDate = normalizeArticleDate(body.date);
  if (!newDate) {
    return NextResponse.json(
      { error: "Invalid date. Expected a calendar date such as 2026-01-25." },
      { status: 400 }
    );
  }

  const oldSlug = body.slug;
  const oldPath = findLocalArticleFile(oldSlug);

  if (!oldPath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 1) Mise à jour YAML
  const raw = fs.readFileSync(oldPath, "utf8");
  const parsed = matter(raw);
  const previousDate = normalizeArticleDate(parsed.data?.date);

  const nextData = { ...parsed.data, date: newDate };
  let nextRaw = matter.stringify(parsed.content ?? "", nextData);
  nextRaw = writeCanonicalDateInFrontmatter(nextRaw, newDate);

  // 2) Rename si le slug commence par une date
  // ex: 2026-01-10-mon-article => 2026-01-25-mon-article
  let newSlug = oldSlug;
  const m = oldSlug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);

  if (m) {
    const [, oldDatePart, rest] = m;

    if (oldDatePart !== newDate) {
      newSlug = `${newDate}-${rest}`;
      const newPath = path.join(path.dirname(oldPath), `${newSlug}.md`);

      if (fs.existsSync(newPath)) {
        return NextResponse.json(
          { error: `Target filename already exists: ${newSlug}.md` },
          { status: 409 }
        );
      }

      // On renomme d’abord, puis on écrit le contenu modifié dans le nouveau fichier
      fs.renameSync(oldPath, newPath);
      fs.writeFileSync(newPath, nextRaw, "utf8");
      appendAdminHistory({
        action: "article.reschedule",
        target: newSlug,
        summary: `Date déplacée de ${previousDate ?? "sans date"} à ${newDate}`,
        before: { slug: oldSlug, date: previousDate },
        after: { slug: newSlug, date: newDate },
      });

      return NextResponse.json({ ok: true, slug: newSlug, renamed: true });
    }
  }

  // Sinon : pas de rename, on écrit dans le fichier existant
  fs.writeFileSync(oldPath, nextRaw, "utf8");
  appendAdminHistory({
    action: "article.reschedule",
    target: oldSlug,
    summary: `Date déplacée de ${previousDate ?? "sans date"} à ${newDate}`,
    before: { slug: oldSlug, date: previousDate },
    after: { slug: oldSlug, date: newDate },
  });

  return NextResponse.json({ ok: true, slug: oldSlug, renamed: false });
}
