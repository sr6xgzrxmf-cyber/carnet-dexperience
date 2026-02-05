import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

const articlesDirectory = path.join(process.cwd(), "content", "articles");

export type ArticleMeta = {
  title: string;
  date?: string | number | Date | { date?: unknown; value?: unknown };
  tags?: string[];
  cover?: string; // "/images/articles/xxx.jpg"
  source?: string;
  excerpt?: string;
  series?: { name?: string; title?: string; slug?: string; order?: number | string };
  impact?: { text?: string; example?: string };
};

export type ArticleItem = {
  slug: string;
  meta: ArticleMeta;
  content: string;
};

/**
 * Convertit une date (string | Date | number | objet) en timestamp UTC robuste.
 * - Supporte "YYYY-MM-DD" (converti en UTC)
 * - Supporte dates ISO et formats parseables par Date.parse
 *
 * NOTE : ce timestamp sert surtout au tri. La publication est gérée par isPublishedDate()
 *        en Europe/Paris (Option C / cas 1).
 */
export function toTimestamp(input: unknown): number {
  if (!input) return 0;

  if (input instanceof Date) {
    const t = input.getTime();
    return Number.isFinite(t) ? t : 0;
  }

  if (typeof input === "number") return Number.isFinite(input) ? input : 0;

  if (typeof input === "string") {
    const s = input.trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const t = Date.parse(s);
    return Number.isNaN(t) ? 0 : t;
  }

  if (typeof input === "object") {
    const obj = input as { date?: unknown; value?: unknown };
    if (typeof obj.date === "string") return toTimestamp(obj.date);
    if (typeof obj.value === "string") return toTimestamp(obj.value);
  }

  return 0;
}

/* -------------------------
   Publication (Option C / cas 1)
   - La `date` YAML (YYYY-MM-DD) EST la date de publication
   - Référence: Europe/Paris
-------------------------- */

function parisTodayISO(now: Date = new Date()): string {
  // YYYY-MM-DD en Europe/Paris (comparable lexicographiquement)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toParisISODate(input: unknown): string | null {
  if (!input) return null;

  if (input instanceof Date) {
    const t = input.getTime();
    if (!Number.isFinite(t)) return null;
    return parisTodayISO(input);
  }

  if (typeof input === "number") {
    if (!Number.isFinite(input)) return null;
    return parisTodayISO(new Date(input));
  }

  if (typeof input === "string") {
    const s = input.trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) return s; // déjà canonique

    const t = Date.parse(s);
    if (!Number.isNaN(t)) return parisTodayISO(new Date(t));

    return null;
  }

  if (typeof input === "object") {
    const obj = input as { date?: unknown; value?: unknown };
    if (typeof obj.date === "string") return toParisISODate(obj.date);
    if (typeof obj.value === "string") return toParisISODate(obj.value);
  }

  return null;
}

/**
 * Article "publié" si:
 * - pas de date => publié
 * - date (YYYY-MM-DD) <= aujourd’hui Europe/Paris => publié
 */
export function isPublishedDate(input: unknown, now: Date = new Date()): boolean {
  const d = toParisISODate(input);
  if (!d) return true;
  return d <= parisTodayISO(now);
}

/* =========================
   Cache (mémoire) simple
========================= */

type Cache = {
  fingerprint: string;
  items: ArticleItem[];
  bySlug: Map<string, ArticleItem>;
};

let cache: Cache | null = null;

function getFileNames(): string[] {
  return fs
    .readdirSync(articlesDirectory)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "fr"));
}

function computeFingerprint(fileNames: string[]): string {
  // En dev, on veut invalider le cache dès qu'un fichier markdown change
  // (mtime/size). On construit un fingerprint stable.
  const parts: string[] = [];

  for (const fileName of fileNames) {
    const fullPath = path.join(articlesDirectory, fileName);
    try {
      const st = fs.statSync(fullPath);
      parts.push(`${fileName}:${st.size}:${st.mtimeMs}`);
    } catch {
      parts.push(`${fileName}:?`);
    }
  }

  return parts.join("|");
}

function readAllFromDisk(fileNames: string[]): ArticleItem[] {
  const safeNames = fileNames.length ? fileNames : getFileNames();

  const items = safeNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(articlesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return { slug, meta: data as ArticleMeta, content };
  });

  return items.sort((a, b) => toTimestamp(b.meta.date) - toTimestamp(a.meta.date));
}

function getCache(): Cache {
  const fileNames = getFileNames();
  const fingerprint = computeFingerprint(fileNames);

  if (cache && cache.fingerprint === fingerprint) return cache;

  const items = readAllFromDisk(fileNames);
  const bySlug = new Map<string, ArticleItem>();
  for (const it of items) bySlug.set(it.slug, it);

  cache = { fingerprint, items, bySlug };
  return cache;
}

/**
 * Renvoie tous les articles triés par date décroissante.
 * Options:
 * - includeFuture: inclure les articles datés dans le futur (default: true)
 */
export function getAllArticles(options?: { includeFuture?: boolean }): ArticleItem[] {
  const includeFuture = options?.includeFuture ?? true;
  const { items } = getCache();
  if (includeFuture) return items;

  const now = new Date();
  return items.filter((a) => isPublishedDate(a.meta.date, now));
}

/**
 * Raccourci: articles publiés seulement (date <= aujourd’hui Europe/Paris)
 */
export function getPublishedArticles(): ArticleItem[] {
  return getAllArticles({ includeFuture: false });
}

/**
 * Renvoie l'article par slug.
 * Options:
 * - includeFuture: autorise le renvoi d'un article futur (default: true)
 *   (si false, renvoie null si date > aujourd’hui Europe/Paris)
 */
export function getArticleBySlug(
  slug: string,
  options?: { includeFuture?: boolean }
): ArticleItem | null {
  const includeFuture = options?.includeFuture ?? true;
  const clean = decodeURIComponent(slug).trim();

  const { bySlug } = getCache();
  const item = bySlug.get(clean) ?? null;
  if (!item) return null;

  if (!includeFuture && !isPublishedDate(item.meta?.date, new Date())) return null;

  return item;
}

/**
 * Raccourci: article publié uniquement (null si futur)
 */
export function getPublishedArticleBySlug(slug: string): ArticleItem | null {
  return getArticleBySlug(slug, { includeFuture: false });
}

export async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(html)
    .process(markdown);

  return result.toString();
}
