import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type Series = { name?: unknown; slug?: unknown; order?: unknown };

function fileExistsPublic(publicPath: string) {
  // publicPath like "/images/articles/xxx.jpg"
  if (!publicPath.startsWith("/")) return false;
  const abs = path.join(PUBLIC_DIR, publicPath);
  return fs.existsSync(abs);
}

function normalizeDate(v: any): string | null {
  if (v == null) return null;
  const s = String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function guessCover(slug: string) {
  // Heuristique simple : /images/articles/<slug>.jpg
  // (tu peux changer .jpg -> .webp si tu standardises)
  return `/images/articles/${slug}.jpg`;
}

function extractBriefFromMarkdown(md: string) {
  // Sans IA : on prend un extrait "utilisable" (premiers paragraphes, sans markdown lourd)
  const cleaned = md
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
    .replace(/\[[^\]]*\]\(([^)]+)\)/g, "") // links (remove)
    .replace(/[`*_>#-]/g, " ") // basic md chars
    .replace(/\s+/g, " ")
    .trim();

  // ~280 chars de “brief”
  return cleaned.slice(0, 280);
}

function extractLinkedFiles(md: string) {
  // On remonte des liens qui ressemblent à des assets locaux :
  // - /files/...
  // - /docs/...
  // - /downloads/...
  // - /images/...
  const links: string[] = [];
  const re = /$begin:math:display$[^$end:math:display$]*\]$begin:math:text$([^)]+)$end:math:text$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    const href = m[1].trim();
    if (
      href.startsWith("/files/") ||
      href.startsWith("/docs/") ||
      href.startsWith("/downloads/") ||
      href.startsWith("/images/")
    ) {
      links.push(href);
    }
  }
  // dédoublonnage
  return Array.from(new Set(links));
}

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
    const { data, content } = matter(raw);

    const series = (data.series ?? null) as Series | null;

    const date = normalizeDate((data as any).date);
    const title = String((data as any).title ?? slug);

    const cover = (data as any).cover != null ? String((data as any).cover) : null;
    const coverExpected = guessCover(slug);
    const coverOk = cover ? fileExistsPublic(cover) : false;
    const coverExpectedOk = fileExistsPublic(coverExpected);

    const tags = Array.isArray((data as any).tags)
      ? (data as any).tags.map((t: any) => String(t))
      : [];

    const excerpt = (data as any).excerpt != null ? String((data as any).excerpt) : null;

    const linked = extractLinkedFiles(content ?? "");
    const linkedChecks = linked.map((href) => ({
      href,
      exists: fileExistsPublic(href),
    }));

    const brief = excerpt?.trim()
      ? excerpt.trim()
      : extractBriefFromMarkdown(content ?? "");

    // Brief DA (heuristique)
    const da = [
      `Titre: ${title}`,
      date ? `Date: ${date}` : `Date: (manquante)`,
      series?.slug ? `Série: ${String(series.slug)}${series?.order != null ? ` (order ${String(series.order)})` : ""}` : "Série: hors-série",
      tags.length ? `Tags: ${tags.join(", ")}` : "Tags: (aucun)",
      `Brief: ${brief || "(vide)"}`,
    ].join("\n");

    const problems: string[] = [];
    if (!date) problems.push("date manquante ou invalide");
    if (!cover) problems.push("cover manquante");
    if (cover && !coverOk) problems.push("cover référencée mais fichier introuvable");
    if (!cover && coverExpectedOk) problems.push("cover manquante (mais un fichier attendu existe)");
    if (!cover && !coverExpectedOk) problems.push("cover manquante (et aucun fichier attendu trouvé)");

    const missingLinked = linkedChecks.filter((x) => !x.exists);
    if (missingLinked.length) problems.push(`${missingLinked.length} fichier(s) lié(s) manquant(s)`);

    return {
      slug,
      title,
      date,
      seriesName: series?.name ? String(series.name) : null,
      seriesSlug: series?.slug ? String(series.slug) : null,
      seriesOrder:
        typeof series?.order === "number"
          ? series.order
          : series?.order != null
            ? Number(series.order)
            : null,
      tags,
      excerpt,
      cover,
      coverOk,
      coverExpected,
      coverExpectedOk,
      linked: linkedChecks,
      brief,
      da,
      problems,
    };
  });

  // tri : problèmes d’abord, puis date
  items.sort((a, b) => {
    const pa = a.problems.length;
    const pb = b.problems.length;
    if (pa !== pb) return pb - pa;
    return String(a.date ?? "").localeCompare(String(b.date ?? ""));
  });

  return NextResponse.json({ items });
}
