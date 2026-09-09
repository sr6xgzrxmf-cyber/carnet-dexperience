"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  at: string;
  action: string;
  target: string;
  summary: string;
  before?: unknown;
  after?: unknown;
};

export default function AdminHistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/history", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("L’historique est disponible uniquement en local.");
        return res.json();
      })
      .then((data) => setEntries(data.entries ?? []))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm text-neutral-500">Administration locale</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Historique éditorial</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          Les changements de dates, de métadonnées, de statuts et de mises en avant sont conservés sur cet ordinateur.
        </p>
      </header>

      {loading ? <p>Chargement…</p> : null}
      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
      {!loading && !error && !entries.length ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-neutral-500">Aucune modification enregistrée pour le moment.</p>
      ) : null}

      <ol className="grid gap-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-2xl border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800 dark:bg-neutral-950/20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{entry.summary}</p>
                <p className="mt-1 text-sm text-neutral-500">{entry.target} · {entry.action}</p>
              </div>
              <time className="text-xs text-neutral-500" dateTime={entry.at}>
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.at))}
              </time>
            </div>
            {(entry.before !== undefined || entry.after !== undefined) ? (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-medium">Voir les détails</summary>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <pre className="overflow-auto rounded-xl bg-neutral-100 p-3 text-xs dark:bg-neutral-900">Avant\n{JSON.stringify(entry.before, null, 2)}</pre>
                  <pre className="overflow-auto rounded-xl bg-neutral-100 p-3 text-xs dark:bg-neutral-900">Après\n{JSON.stringify(entry.after, null, 2)}</pre>
                </div>
              </details>
            ) : null}
          </li>
        ))}
      </ol>
    </main>
  );
}
