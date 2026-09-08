import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { identifyAiBot } from "@/lib/analytics-classification";

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const bot = identifyAiBot(request.headers.get("user-agent"));
  if (bot && request.method === "GET") {
    event.waitUntil(prisma.analyticsEvent.create({ data: { kind: "ai", eventType: "page_view",
      path: request.nextUrl.pathname.slice(0, 500), referrer: request.headers.get("referer")?.slice(0, 1000) ?? null,
      source: bot, userAgent: request.headers.get("user-agent")?.slice(0, 1000) ?? null,
      metadata: { declaredIdentity: true } } }).then(() => undefined).catch(() => undefined));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|admin|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|pdf|docx)).*)"],
};
