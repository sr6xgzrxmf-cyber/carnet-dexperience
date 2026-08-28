import { NextResponse } from "next/server";
import fs from "fs";
import matter from "gray-matter";
import { findLocalArticleFile } from "@/lib/local-article-files";


const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

export async function GET(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const filePath = findLocalArticleFile(slug);
  if (!filePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);

  return NextResponse.json({
    slug,
    data: parsed.data ?? {},
    contentPreview: (parsed.content ?? "").slice(0, 500),
  });
}
