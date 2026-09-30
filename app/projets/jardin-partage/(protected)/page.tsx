import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { gammVertCookieName, isGammVertOwnerSession } from "@/lib/gamm-vert-auth";
import QrShare from "./QrShare";
import Widget from "./Widget";
import { logoutGammVert } from "./actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function JardinPartagePage() {
  const isOwner = isGammVertOwnerSession((await cookies()).get(gammVertCookieName())?.value);
  const filePath = path.join(process.cwd(), "content", "private", "jardin-partage.html");
  const html = fs.readFileSync(filePath, "utf8");
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">Accès privé — candidature Gamm Vert Lozanne</p>
          <h1 className="mt-2 font-[var(--font-lora)] text-4xl">Le Jardin Partagé</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/projets/jardin-partage/demo"
            target="_blank"
            rel="noopener"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
          >
            Ouvrir en plein écran ↗
          </a>
          <form action={logoutGammVert}>
            <button className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700">Se déconnecter</button>
          </form>
        </div>
      </div>
      <p className="mt-3 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
        Prototype interactif présenté en complément de la candidature spontanée envoyée à Gamm Vert Lozanne : échange de
        graines entre clients, réservation d&rsquo;ateliers, mise en relation avec les indépendants locaux.
      </p>
      {isOwner ? <QrShare /> : null}
      <Widget html={html} />
    </div>
  );
}
