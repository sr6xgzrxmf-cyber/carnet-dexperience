import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { identifyAiBot, identifyAiReferral } from "@/lib/analytics-classification";

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
  await prisma.analyticsEvent.create({ data: {
    kind: aiSource ? "ai_referral" : "human",
    eventType: body.eventType.slice(0, 80),
    sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : null,
    path, referrer, source: aiSource ?? utmSource,
    metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {
      utmMedium: body.utmMedium ?? null, utmCampaign: body.utmCampaign ?? null,
    },
  }});
  return new Response(null, { status: 204 });
}
