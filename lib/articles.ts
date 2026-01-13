import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

const articlesDirectory = path.join(process.cwd(), "content", "articles");

export type ArticleMeta = {
  title: string;
  date?: any; // <- important: peut être string OU Date selon le YAML parser
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

function toTimestamp(input: any): number {
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

export function getAllArticles(): ArticleItem[] {
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

  // tri décroissant par date (robuste)
  return items.sort((a, b) => {
    const at = toTimestamp(a.meta.date);
    const bt = toTimestamp(b.meta.date);
    return bt - at;
  });
}

export function getArticleBySlug(slug: string): ArticleItem | null {
  const clean = decodeURIComponent(slug).trim();
  const fullPath = path.join(articlesDirectory, `${clean}.md`);

  console.log("[getArticleBySlug] slug =", JSON.stringify(slug));
  console.log("[getArticleBySlug] clean =", JSON.stringify(clean));
  console.log("[getArticleBySlug] fullPath =", fullPath);
  console.log("[getArticleBySlug] exists =", fs.existsSync(fullPath));

  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return { slug: clean, meta: data as ArticleMeta, content };
}

export async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkGfm) // ✅ tables, task lists, strikethrough, etc.
    .use(html)
    .process(markdown);

  return result.toString();
}