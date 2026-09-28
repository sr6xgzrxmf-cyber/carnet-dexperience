import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { analyticsCookieName, isLocalAdmin, isValidAnalyticsSession } from "./analytics-auth";

// Le proxy protège déjà /admin et /api/admin ; cette vérification couvre
// aussi /api/articles et sert de seconde barrière.
export async function isAdminRequest() {
  if (isLocalAdmin()) return true;
  const store = await cookies();
  return isValidAnalyticsSession(store.get(analyticsCookieName())?.value);
}

export function adminUnauthorized() {
  return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
}
