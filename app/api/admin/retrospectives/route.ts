import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "content", "retrospectives.json");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type Body = { featuredSeriesList: string[] };

function readJson(): Body {
  if (!fs.existsSync(FILE_PATH)) return { featuredSeriesList: [] };
  const raw = fs.readFileSync(FILE_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return {
    featuredSeriesList: Array.isArray(parsed?.featuredSeriesList)
      ? parsed.featuredSeriesList.map(String)
      : [],
  };
}

export async function GET() {
  return NextResponse.json(readJson());
}

export async function PATCH(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const body = (await req.json()) as Partial<Body>;
  const list = Array.isArray(body?.featuredSeriesList)
    ? body.featuredSeriesList!.map(String)
    : [];

  const clean = Array.from(new Set(list.map((s) => s.trim()).filter(Boolean)));

  fs.writeFileSync(
    FILE_PATH,
    JSON.stringify({ featuredSeriesList: clean }, null, 2) + "\n",
    "utf8"
  );

  return NextResponse.json({ ok: true, featuredSeriesList: clean });
}
