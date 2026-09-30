import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function GammVertLoginPage({ searchParams }: { searchParams: Promise<{ lien?: string }> }) {
  const expired = (await searchParams).lien === "expire";
  return <LoginForm notice={expired ? "Ce lien d’accès a expiré. Demandez-en un nouveau à Laurent Guyonnet." : ""} />;
}
