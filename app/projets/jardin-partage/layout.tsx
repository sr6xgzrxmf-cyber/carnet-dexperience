import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { gammVertCookieName, isValidGammVertSession } from "@/lib/gamm-vert-auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function JardinPartageLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!isValidGammVertSession(store.get(gammVertCookieName())?.value)) redirect("/projets/jardin-partage/login");
  return children;
}
