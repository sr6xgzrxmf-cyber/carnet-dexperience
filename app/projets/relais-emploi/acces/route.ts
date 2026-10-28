import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createRelaisSession, readRelaisAccessKey, relaisCookieName, relaisCookieOptions } from "@/lib/relais-emploi-auth";

// Porte d'entrée des QR codes et des liens d'accès : la clé ouvre la session et mène à la démonstration.
export async function GET(request: NextRequest) {
  const access = readRelaisAccessKey(request.nextUrl.searchParams.get("cle"));
  if (!access) {
    const login = new URL("/projets/relais-emploi/login", request.url);
    login.searchParams.set("lien", "expire");
    return NextResponse.redirect(login);
  }

  // Un simple compteur par étiquette : ni adresse IP ni identifiant du visiteur.
  await prisma.analyticsEvent
    .create({
      data: {
        kind: "human",
        eventType: "qr_scan",
        path: "/projets/relais-emploi/acces",
        source: "QR code",
        metadata: { label: access.label },
      },
    })
    .catch(() => undefined);

  const response = NextResponse.redirect(new URL("/projets/relais-emploi?bienvenue=1", request.url));
  response.cookies.set(relaisCookieName(), createRelaisSession("qr"), relaisCookieOptions(true));
  return response;
}
