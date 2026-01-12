import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const parcoursDirectory = path.join(process.cwd(), "content", "parcours");

export type ParcoursMeta = {
  title: string;
  company?: string;
  location?: string;
  role?: string;
  start?: string;
  end?: string;
  tags?: string[];
  highlights?: string[];
  type?: string;
  items?: Array<{ label: string; org?: string; year?: string }>;
};

export type ParcoursItem = {
  slug: string;
  meta: ParcoursMeta;
  content: string;
};

function toSortKey(date?: string) {
  if (!date) return "0000-00";
  if (/^\d{4}$/.test(date)) return `${date}-01`;
  if (/^\d{4}-\d{2}$/.test(date)) return date;
  return date;
}

export function getAllParcours(): ParcoursItem[] {
  const fileNames = fs.readdirSync(parcoursDirectory).filter((f) => f.endsWith(".md"));

  const items = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(parcoursDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return { slug, meta: data as ParcoursMeta, content };
  });

  return items.sort((a, b) => {
    const aKey = toSortKey(a.meta.start ?? a.meta.end);
    const bKey = toSortKey(b.meta.start ?? b.meta.end);
    return bKey.localeCompare(aKey);
  });
}

export function getParcoursBySlug(slug: string): ParcoursItem | null {
  const fullPath = path.join(parcoursDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return { slug, meta: data as ParcoursMeta, content };
}

export async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
