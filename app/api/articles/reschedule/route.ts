import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

type Body = { slug: string; date: string };

export async function PATCH(req: Request) {
  const body = (await req.json()) as Body;

  if (!body?.slug || !body?.date) {
    return NextResponse.json({ error: "Missing slug or date" }, { status: 400 });
  }

  const filePath = path.join(ARTICLES_DIR, `${body.slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);

  const nextData = { ...parsed.data, date: body.date };
  const nextRaw = matter.stringify(parsed.content, nextData);

  fs.writeFileSync(filePath, nextRaw, "utf8");
  return NextResponse.json({ ok: true });
}
