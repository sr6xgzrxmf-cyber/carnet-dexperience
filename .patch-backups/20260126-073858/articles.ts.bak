import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

const articlesDirectory = path.join(process.cwd(), "content", "articles");

export type ArticleMeta = {
  title: string;
  date?: any; // important: peut être string OU Date selon le YAML parser
  tags?: string[];
  cover?: string; // "/images/articles/xxx.jpg"
  source?: string;
  excerpt?: string;
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
 */
export function toTimestamp(input: any): number {
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
    if (typeof input.date === "string") return toTimestamp(input.date);
    if (typeof input.value === "string") return toTimestamp(input.value);
  }

  return 0;
}

/**
 * Article "publié" si:
 * - pas de date => publié
 * - date <= maintenant
 */
export function isPublishedDate(input: any, now: number = Date.now()): boolean {
  const ts = toTimestamp(input);
  if (!ts) return true;
  return ts <= now;
}

/* =========================
   Cache (mémoire) simple
   - évite de re-lire le disque à répétition pendant un rendu
   - s'invalide tout seul si le nombre de fichiers change
   - safe pour ton usage (petit volume)
========================= */

type Cache = {
  fileCount: number;
  items: ArticleItem[];
  bySlug: Map<string, ArticleItem>;
};

let cache: Cache | null = null;

function readAllFromDisk(): ArticleItem[] {
  const fileNames = fs
    .readdirSync(articlesDirectory)
    .filter((f) => f.endsWith(".md"));

  const items = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(articlesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return { slug, meta: data as ArticleMeta, content };
  });

  return items.sort((a, b) => toTimestamp(b.meta.date) - toTimestamp(a.meta.date));
}

function getCache(): Cache {
  const fileNames = fs
    .readdirSync(articlesDirectory)
    .filter((f) => f.endsWith(".md"));

  const fileCount = fileNames.length;

  if (cache && cache.fileCount === fileCount) return cache;

  const items = readAllFromDisk();
  const bySlug = new Map<string, ArticleItem>();
  for (const it of items) bySlug.set(it.slug, it);

  cache = { fileCount, items, bySlug };
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

  const now = Date.now();
  return items.filter((a) => isPublishedDate(a.meta.date, now));
}

/**
 * Raccourci: articles publiés seulement (date <= maintenant)
 */
export function getPublishedArticles(): ArticleItem[] {
  return getAllArticles({ includeFuture: false });
}

/**
 * Renvoie l'article par slug.
 * Options:
 * - includeFuture: autorise le renvoi d'un article futur (default: true)
 *   (si false, renvoie null si date > maintenant)
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

  if (!includeFuture && !isPublishedDate(item.meta?.date)) return null;

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
    .use(remarkGfm) // tables, task lists, strikethrough, etc.
    .use(html)
    .process(markdown);

  return result.toString();
}
