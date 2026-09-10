import { NextRequest } from "next/server";
import { identifyAiBot } from "@/lib/analytics-classification";
import { prisma } from "@/lib/db";

const choices = new Set(["accepted", "refused"]);

function isSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Origine invalide" }, { status: 403 });
  }
  if (identifyAiBot(request.headers.get("user-agent"))) {
    return new Response(null, { status: 204 });
  }

  const body = await request.json().catch(() => null) as { choice?: unknown } | null;
  const choice = typeof body?.choice === "string" ? body.choice : "";
  if (!choices.has(choice)) {
    return Response.json({ error: "Choix invalide" }, { status: 400 });
  }

  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const aggregateId = `consent:${day.toISOString().slice(0, 10)}:${choice}`;
  const expiresBefore = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: expiresBefore } } }),
    prisma.$executeRaw`
    INSERT INTO "AnalyticsEvent"
      ("id", "createdAt", "kind", "eventType", "path", "metadata")
    VALUES
      (${aggregateId}, ${day}, 'consent', ${choice}, '(agrégé)', '{"count": 1}'::jsonb)
    ON CONFLICT ("id") DO UPDATE SET
      "metadata" = jsonb_set(
        COALESCE("AnalyticsEvent"."metadata", '{}'::jsonb),
        '{count}',
        to_jsonb(COALESCE(("AnalyticsEvent"."metadata"->>'count')::integer, 0) + 1),
        true
      )
    `,
  ]);

  return new Response(null, { status: 204 });
}
