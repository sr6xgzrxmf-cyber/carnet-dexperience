import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";

const IS_LOCAL = process.env.NODE_ENV !== "production" && !process.env.VERCEL;
const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "articles");

type AssignBody = {
  articleSlug?: string;
  sourceFile?: string;
};

function safeBasename(input: string) {
  const base = path.basename(input).trim();
  if (!base || base === "." || base === "..") return null;
  return base;
}

function readArticleCoverFile(articleSlug: string) {
  const articlePath = path.join(ARTICLES_DIR, `${articleSlug}.md`);
  if (!fs.existsSync(articlePath)) {
    throw new Error(`Article introuvable: ${articleSlug}`);
  }

  const raw = fs.readFileSync(articlePath, "utf8");
  const parsed = matter(raw);
  const cover = typeof parsed.data?.cover === "string" ? parsed.data.cover : "";
  const file = safeBasename(cover) ?? `${articleSlug}.jpg`;
  return file;
}

export async function POST(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const body = (await req.json()) as AssignBody;
  const articleSlug = typeof body.articleSlug === "string" ? body.articleSlug.trim() : "";
  const sourceFile = typeof body.sourceFile === "string" ? safeBasename(body.sourceFile) : null;

  if (!articleSlug || !sourceFile) {
    return NextResponse.json({ error: "Missing articleSlug or sourceFile" }, { status: 400 });
  }

  const sourcePath = path.join(IMAGES_DIR, sourceFile);
  if (!fs.existsSync(sourcePath)) {
    return NextResponse.json({ error: `Source file not found: ${sourceFile}` }, { status: 404 });
  }

  const targetFile = readArticleCoverFile(articleSlug);
  const targetPath = path.join(IMAGES_DIR, targetFile);

  const sourceExt = path.extname(sourceFile).toLowerCase();
  const targetExt = path.extname(targetFile).toLowerCase();
  if (sourceExt !== targetExt) {
    return NextResponse.json(
      {
        error: `Extension mismatch: ${sourceExt || "(none)"} -> ${targetExt || "(none)"}. Exporte la variante avec la même extension.`,
      },
      { status: 400 }
    );
  }

  fs.copyFileSync(sourcePath, targetPath);

  return NextResponse.json({
    ok: true,
    articleSlug,
    sourceFile,
    targetFile,
  });
}
