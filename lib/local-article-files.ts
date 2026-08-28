import fs from "fs";
import path from "path";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function collectMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];

  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(fullPath);
  }
  return files;
}

export function listLocalArticleFiles(): string[] {
  return collectMarkdownFiles(ARTICLES_DIR);
}

export function findLocalArticleFile(slug: string): string | null {
  const expectedName = `${slug}.md`;
  return listLocalArticleFiles().find((filePath) => path.basename(filePath) === expectedName) ?? null;
}
