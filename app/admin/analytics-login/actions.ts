"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { analyticsClientKey, analyticsCookieName, areCorrectAnalyticsCredentials, createAnalyticsSession } from "@/lib/analytics-auth";
import { prisma } from "@/lib/db";

export async function loginAnalytics(_state: { error: string }, formData: FormData) {
  const requestHeaders = await headers();
  const address = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const keyHash = analyticsClientKey(address);
  const now = Date.now();
  const windowStart = new Date(now - 15 * 60 * 1000);
  const cleanupBefore = new Date(now - 24 * 60 * 60 * 1000);
  const [, failures] = await Promise.all([
    prisma.adminLoginAttempt.deleteMany({ where: { createdAt: { lt: cleanupBefore } } }),
    prisma.adminLoginAttempt.count({ where: { keyHash, createdAt: { gte: windowStart } } }),
  ]);
  if (failures >= 5) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!areCorrectAnalyticsCredentials(username, password)) {
    await prisma.adminLoginAttempt.create({ data: { keyHash } });
    return { error: "Identifiant ou mot de passe incorrect." };
  }
  await prisma.adminLoginAttempt.deleteMany({ where: { keyHash } });
  const store = await cookies();
  store.set(analyticsCookieName(), createAnalyticsSession(), { httpOnly: true, sameSite: "strict",
    secure: process.env.NODE_ENV === "production", path: "/admin/analytics", maxAge: 60 * 60 * 12 });
  redirect("/admin/analytics");
}
