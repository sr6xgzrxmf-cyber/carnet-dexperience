import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { describeUserAgent, identifyAiBot, identifyTrafficSource } from "@/lib/analytics-classification";

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const bot = identifyAiBot(request.headers.get("user-agent"));
  if (bot && request.method === "GET") {
    const userAgent = request.headers.get("user-agent")?.slice(0, 1000) ?? null;
    const referrer = request.headers.get("referer")?.slice(0, 1000) ?? null;
    const expiresBefore = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    event.waitUntil(prisma.$transaction([
      prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: expiresBefore } } }),
      prisma.analyticsEvent.create({ data: { kind: "ai", eventType: "page_view",
      path: request.nextUrl.pathname.slice(0, 500), referrer,
      source: bot, userAgent,
      metadata: { declaredIdentity: true, ...describeUserAgent(userAgent),
        trafficSource: identifyTrafficSource(referrer, null),
        country: request.headers.get("x-vercel-ip-country"),
        region: request.headers.get("x-vercel-ip-country-region"),
        city: request.headers.get("x-vercel-ip-city") } } }),
    ]).then(() => undefined).catch(() => undefined));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|admin|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|pdf|docx)).*)"],
};
