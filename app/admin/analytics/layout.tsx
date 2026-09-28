import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { analyticsCookieName, isLocalAdmin, isValidAnalyticsSession } from "@/lib/analytics-auth";

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  // En local, l'administration reste ouverte, statistiques comprises.
  if (!isLocalAdmin() && !isValidAnalyticsSession(store.get(analyticsCookieName())?.value)) redirect("/admin/analytics-login");
  return children;
}
