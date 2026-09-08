import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { describeUserAgent, identifyAiBot, identifyAiReferral, identifyTrafficSource } from "@/lib/analytics-classification";

function text(value: unknown, limit = 255) {
  return typeof value === "string" && value ? value.slice(0, limit) : null;
}

export async function POST(request: NextRequest) {
  if (identifyAiBot(request.headers.get("user-agent"))) return new Response(null, { status: 204 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.path !== "string" || typeof body.eventType !== "string") {
    return Response.json({ error: "Requête invalide" }, { status: 400 });
  }
  const path = body.path.slice(0, 500);
  if (path.startsWith("/admin")) return new Response(null, { status: 204 });
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 1000) : null;
  const utmSource = typeof body.utmSource === "string" ? body.utmSource.slice(0, 255) : null;
  const aiSource = identifyAiReferral(referrer, utmSource);
  const userAgent = request.headers.get("user-agent")?.slice(0, 1000) ?? null;
  const clientMetadata = body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
    ? body.metadata as Record<string, unknown> : {};
  const device = describeUserAgent(userAgent);
  const source = aiSource ?? identifyTrafficSource(referrer, utmSource);
  const visitorId = text(body.visitorId, 80);
  const expiresBefore = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: expiresBefore } } }),
    prisma.analyticsEvent.create({ data: {
    kind: aiSource ? "ai_referral" : "human",
    eventType: body.eventType.slice(0, 80),
    sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : null,
    path, referrer, source, userAgent,
    metadata: { ...clientMetadata, ...device, visitorId,
      utmSource, utmMedium: text(body.utmMedium), utmCampaign: text(body.utmCampaign),
      utmContent: text(body.utmContent), utmTerm: text(body.utmTerm), clickId: text(body.clickId),
      acceptLanguage: request.headers.get("accept-language")?.slice(0, 255) ?? null,
      country: request.headers.get("x-vercel-ip-country"),
      region: request.headers.get("x-vercel-ip-country-region"),
      city: request.headers.get("x-vercel-ip-city"),
    },
    }}),
  ]);
  return new Response(null, { status: 204 });
}
