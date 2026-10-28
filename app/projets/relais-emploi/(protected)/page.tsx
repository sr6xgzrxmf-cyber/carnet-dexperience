import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { isRelaisOwnerSession, relaisCookieName } from "@/lib/relais-emploi-auth";
import Demo from "./Demo";
import QrShare from "./QrShare";
import { logoutRelais } from "./actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function RelaisEmploiPage({ searchParams }: { searchParams: Promise<{ bienvenue?: string }> }) {
  const isOwner = isRelaisOwnerSession((await cookies()).get(relaisCookieName())?.value);
  const welcome = (await searchParams).bienvenue === "1";
  // Le script qui monte le WordPress de démonstration : thème, formulaires, newsletter et données fictives.
  const setupCode = fs.readFileSync(path.join(process.cwd(), "content", "private", "relais-emploi-demo.php"), "utf8");
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">Accès privé — proposition au Relais Emploi Lyon</p>
          <h1 className="mt-2 font-[var(--font-lora)] text-4xl">Faire vivre le réseau du Relais</h1>
        </div>
        <form action={logoutRelais}>
          <button className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700">Se déconnecter</button>
        </form>
      </div>
      <p className="mt-3 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
        Un vrai WordPress, monté comme le site du Relais, pour essayer le parcours proposé : inscription en ligne, pitch final, nouvelles
        des anciens et newsletter. Suivez les étapes à gauche, ou naviguez librement dans le site et son administration.
      </p>
      {welcome ? (
        <p className="mt-3 max-w-3xl rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Bienvenue ! Le WordPress de démonstration s’installe dans votre navigateur : comptez environ une minute.
        </p>
      ) : null}
      {isOwner ? <QrShare /> : null}
      <Demo setupCode={setupCode} />
    </div>
  );
}
