import LoginForm from "./LoginForm";
import { safeAdminRedirect } from "@/lib/analytics-auth";

export default async function AnalyticsLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm next={safeAdminRedirect(next)} />;
}
