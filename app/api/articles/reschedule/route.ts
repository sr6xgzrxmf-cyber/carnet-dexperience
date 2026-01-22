import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type Body = { slug: string; date: string };

function quoteDateInFrontmatter(raw: string) {
  // Remplace une ligne "date: 2026-01-25" par 'date: "2026-01-25"'
  return raw.replace(
    /^date:\s*(\d{4}-\d{2}-\d{2})\s*$/m,
    'date: "$1"'
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

  const newDate = String(body.date).slice(0, 10);

  const oldSlug = body.slug;
  const oldPath = path.join(ARTICLES_DIR, `${oldSlug}.md`);

  if (!fs.existsSync(oldPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 1) Mise à jour YAML
  const raw = fs.readFileSync(oldPath, "utf8");
  const parsed = matter(raw);

  const nextData = { ...parsed.data, date: newDate };
  let nextRaw = matter.stringify(parsed.content ?? "", nextData);
  nextRaw = quoteDateInFrontmatter(nextRaw);

  // 2) Rename si le slug commence par une date
  // ex: 2026-01-10-mon-article => 2026-01-25-mon-article
  let newSlug = oldSlug;
  const m = oldSlug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);

  if (m) {
    const [, oldDatePart, rest] = m;

    if (oldDatePart !== newDate) {
      newSlug = `${newDate}-${rest}`;
      const newPath = path.join(ARTICLES_DIR, `${newSlug}.md`);

      if (fs.existsSync(newPath)) {
        return NextResponse.json(
          { error: `Target filename already exists: ${newSlug}.md` },
          { status: 409 }
        );
      }

      // On renomme d’abord, puis on écrit le contenu modifié dans le nouveau fichier
      fs.renameSync(oldPath, newPath);
      fs.writeFileSync(newPath, nextRaw, "utf8");

      return NextResponse.json({ ok: true, slug: newSlug, renamed: true });
    }
  }

  // Sinon : pas de rename, on écrit dans le fichier existant
  fs.writeFileSync(oldPath, nextRaw, "utf8");

  return NextResponse.json({ ok: true, slug: oldSlug, renamed: false });
}