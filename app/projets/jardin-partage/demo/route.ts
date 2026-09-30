import fs from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { gammVertCookieName, isValidGammVertSession } from "@/lib/gamm-vert-auth";

// Le prototype seul, en plein écran, pour le présenter sans le cadre du site.
export function GET(request: NextRequest) {
  if (!isValidGammVertSession(request.cookies.get(gammVertCookieName())?.value)) {
    return NextResponse.redirect(new URL("/projets/jardin-partage/login", request.url));
  }
  const html = fs.readFileSync(path.join(process.cwd(), "content", "private", "jardin-partage.html"), "utf8");
  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
