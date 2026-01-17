"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function AtelierPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/atelier", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/20 p-6 sm:p-10">
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Atelier de posture</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Clarifier, choisir, écrire, agir.</h1>
        <p className="mt-4 text-[15px] leading-6 text-neutral-700 dark:text-neutral-300">
          Quand une situation devient floue ou tendue, on transforme le bruit en décisions claires, en mots justes,
          et en prochaines actions. Outils, cas anonymisés, et livrables réutilisables.
        </p>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
        className="mt-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 p-5">
        <h2 className="text-base font-semibold">Recevoir la fiche (PDF)</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Une fiche courte pour clarifier ta situation et préparer un échange. Zéro blabla, que du praticable.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Prénom" className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/40 px-3 py-2 text-sm outline-none" />
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/40 px-3 py-2 text-sm outline-none" />
          </div>
          <textarea name="situation" rows={4} placeholder="En 5 lignes : la situation, ce qui bloque, ce que tu veux obtenir."
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/40 px-3 py-2 text-sm outline-none" />
          <div className="flex flex-wrap items-center gap-3">
            <button disabled={status === "sending"}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900">
              {status === "sending" ? "Envoi..." : "Recevoir la fiche"}
            </button>
            <span className="text-xs text-neutral-500">
              {status === "sent" ? "C’est envoyé. Check tes mails." : status === "error" ? "Oups. Réessaie dans un instant." : "Tu peux aussi juste lire les articles."}
            </span>
            <Link href="/articles?tag=posture" className="text-sm text-neutral-700 underline underline-offset-4 dark:text-neutral-300">
              Voir les articles
            </Link>
          </div>
        </form>
      </motion.div>
    </section>
  );
}