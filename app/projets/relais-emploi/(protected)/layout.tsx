import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidRelaisSession, relaisCookieName } from "@/lib/relais-emploi-auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function RelaisEmploiLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!isValidRelaisSession(store.get(relaisCookieName())?.value)) redirect("/projets/relais-emploi/login");
  return children;
}
