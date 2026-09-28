import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { describeUserAgent, identifyAiBot, identifyTrafficSource } from "@/lib/analytics-classification";
import { ADMIN_LOGIN_PATH, analyticsCookieName, isLocalAdmin, isValidAnalyticsSession } from "@/lib/analytics-auth";

function guardAdmin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");
  if (!isAdminPage && !isAdminApi) return null;
  if (pathname === ADMIN_LOGIN_PATH || isLocalAdmin()) return NextResponse.next();
  if (isValidAnalyticsSession(request.cookies.get(analyticsCookieName())?.value)) return NextResponse.next();

  if (isAdminApi) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const login = new URL(ADMIN_LOGIN_PATH, request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const adminResponse = guardAdmin(request);
  if (adminResponse) return adminResponse;

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
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!api|admin|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|pdf|docx)).*)",
  ],
};
