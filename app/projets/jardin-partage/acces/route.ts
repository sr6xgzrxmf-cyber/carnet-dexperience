import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  createGammVertSession,
  gammVertCookieName,
  gammVertCookieOptions,
  readGammVertAccessKey,
} from "@/lib/gamm-vert-auth";

// Porte d'entrée des QR codes : la clé ouvre la session et mène au prototype en plein écran.
export async function GET(request: NextRequest) {
  const access = readGammVertAccessKey(request.nextUrl.searchParams.get("cle"));
  if (!access) {
    const login = new URL("/projets/jardin-partage/login", request.url);
    login.searchParams.set("lien", "expire");
    return NextResponse.redirect(login);
  }

  // Un simple compteur par étiquette : ni adresse IP ni identifiant du visiteur.
  await prisma.analyticsEvent
    .create({
      data: {
        kind: "human",
        eventType: "qr_scan",
        path: "/projets/jardin-partage/acces",
        source: "QR code",
        metadata: { label: access.label },
      },
    })
    .catch(() => undefined);

  const response = NextResponse.redirect(new URL("/projets/jardin-partage/demo?bienvenue=1", request.url));
  response.cookies.set(gammVertCookieName(), createGammVertSession("qr"), gammVertCookieOptions(true));
  return response;
}
