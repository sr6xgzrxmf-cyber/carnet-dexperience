import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const articlesDirectory = path.join(process.cwd(), "content", "articles");

export type ArticleMeta = {
  title: string;
  date?: string; // "YYYY-MM-DD"
  tags?: string[];
  cover?: string; // "/images/articles/xxx.png"
  source?: string;
  excerpt?: string;
};

export type ArticleItem = {
  slug: string;
  meta: ArticleMeta;
  content: string;
};

function toSortKey(date?: string) {
  if (!date) return "0000-00-00";
  return date;
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

  // tri décroissant par date
  return items.sort((a, b) => {
    const aKey = toSortKey(a.meta.date);
    const bKey = toSortKey(b.meta.date);
    return bKey.localeCompare(aKey);
  });
}

export function getArticleBySlug(slug: string): ArticleItem | null {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return { slug, meta: data as ArticleMeta, content };
}

export async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}