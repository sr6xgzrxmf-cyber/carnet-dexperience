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

const DA_PREFIX = `Tu es directeur artistique pour mon site “Carnet d’expérience”.

Je te donne une image de référence qui définit mon univers visuel :
une scène réaliste, narrative, avec des personnages en situation, comme une photo de reportage ou de magazine, éclairée par un flash de photographe.

Tu dois toujours générer des images qui respectent cette DA :
– Toujours avec une image en paysage même si je te donne des images de reference en portrait
– Photographie ultra-réaliste (pas illustration, pas cartoon)
– Éclairage au flash puissant, frontal, type studio ou reportage
– Arrière-plan plus sombre ou plus doux, sujets très nets et lumineux
– Personnages crédibles, modernes, professionnels, incarnés
– Sens du récit (on doit comprendre une histoire)
– Esthétique premium, éditoriale, pas stock photo
– Pas d’icônes, pas d’UI, pas d’effets futuristes
– Pas de texte incrusté

Les images doivent ressembler à une photo de magazine ou de plateau photo racontant une scène réelle, comme l’image de référence.

Voici la scène que je veux illustrer :
`;

function fileExistsPublic(publicPath: string) {
  // publicPath like "/images/articles/xxx.jpg"
  if (!publicPath.startsWith("/")) return false;
  const abs = path.join(PUBLIC_DIR, publicPath);
  return fs.existsSync(abs);
}

function normalizeDate(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function guessCover(slug: string) {
  return `/images/articles/${slug}.jpg`;
}

function extractBriefFromMarkdown(md: string) {
  const cleaned = md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]*\]\(([^)]+)\)/g, "")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.slice(0, 280);
}

function extractLinkedFiles(md: string) {
  const links: string[] = [];
  const re = /$begin:math:display$[^$end:math:display$]*\]$begin:math:text$([^)]+)$end:math:text$/g; // ✅ corrigé
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
    const { data: rawData, content } = matter(raw);
    const data = (rawData ?? {}) as Record<string, unknown>;

    const series = (data.series ?? null) as Series | null;

    const date = normalizeDate(data.date);
    const title = String(data.title ?? slug);

    const cover = data.cover != null ? String(data.cover) : null;
    const coverExpected = guessCover(slug);
    const coverOk = cover ? fileExistsPublic(cover) : false;
    const coverExpectedOk = fileExistsPublic(coverExpected);

    const tags = Array.isArray(data.tags)
      ? data.tags.map((t) => String(t))
      : [];

    const excerpt = data.excerpt != null ? String(data.excerpt) : null;

    const linked = extractLinkedFiles(content ?? "");
    const linkedChecks = linked.map((href) => ({
      href,
      exists: fileExistsPublic(href),
    }));

    const brief = excerpt?.trim()
      ? excerpt.trim()
      : extractBriefFromMarkdown(content ?? "");

    // “fiche DA” (courte)
    const da = [
      `Titre: ${title}`,
      date ? `Date: ${date}` : `Date: (manquante)`,
      series?.slug
        ? `Série: ${String(series.slug)}${series?.order != null ? ` (order ${String(series.order)})` : ""}`
        : "Série: hors-série",
      tags.length ? `Tags: ${tags.join(", ")}` : "Tags: (aucun)",
      `Brief: ${brief || "(vide)"}`,
    ].join("\n");

    // ✅ prompt complet prêt à coller
    const daPrompt = `${DA_PREFIX}${brief || "(vide)"}`;

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

      // ✅ pour ton bouton “copier nom”
      expectedBasename: slug, // sans extension
      expectedCoverPath: coverExpected, // si tu veux aussi un bouton “copier chemin”

      linked: linkedChecks,

      brief,

      // ancien bloc (utile)
      da,

      // ✅ nouveau bloc (prompt prêt à coller)
      daPrompt,

      problems,
    };
  });

  items.sort((a, b) => {
    const pa = a.problems.length;
    const pb = b.problems.length;
    if (pa !== pb) return pb - pa;
    return String(a.date ?? "").localeCompare(String(b.date ?? ""));
  });

  return NextResponse.json({ items });
}
