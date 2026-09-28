import { NextResponse } from "next/server";
import fs from "fs";
import matter from "gray-matter";
import { findLocalArticleFile } from "@/lib/local-article-files";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-access";

export async function GET(req: Request) {
  if (!(await isAdminRequest())) return adminUnauthorized();

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
