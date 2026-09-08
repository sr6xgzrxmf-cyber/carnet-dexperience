"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { analyticsCookieName, areCorrectAnalyticsCredentials, createAnalyticsSession } from "@/lib/analytics-auth";

export async function loginAnalytics(_state: { error: string }, formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!areCorrectAnalyticsCredentials(username, password)) return { error: "Identifiant ou mot de passe incorrect." };
  const store = await cookies();
  store.set(analyticsCookieName(), createAnalyticsSession(), { httpOnly: true, sameSite: "strict",
    secure: process.env.NODE_ENV === "production", path: "/admin/analytics", maxAge: 60 * 60 * 12 });
  redirect("/admin/analytics");
}
