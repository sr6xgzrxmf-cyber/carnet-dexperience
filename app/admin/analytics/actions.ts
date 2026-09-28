"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_PATH, ADMIN_LOGIN_PATH, LEGACY_ADMIN_COOKIE_PATH, analyticsCookieName } from "@/lib/analytics-auth";

export async function logoutAnalytics() {
  const store = await cookies();
  for (const path of [ADMIN_COOKIE_PATH, LEGACY_ADMIN_COOKIE_PATH]) {
    store.set(analyticsCookieName(), "", { httpOnly: true, sameSite: "strict",
      secure: process.env.NODE_ENV === "production", path, maxAge: 0 });
  }
  redirect(ADMIN_LOGIN_PATH);
}
