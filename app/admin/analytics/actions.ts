"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { analyticsCookieName } from "@/lib/analytics-auth";

export async function logoutAnalytics() {
  const store = await cookies();
  store.set(analyticsCookieName(), "", { httpOnly: true, sameSite: "strict",
    secure: process.env.NODE_ENV === "production", path: "/admin/analytics", maxAge: 0 });
  redirect("/admin/analytics-login");
}
