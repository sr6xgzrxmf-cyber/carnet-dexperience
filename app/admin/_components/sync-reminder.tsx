"use client";

import { useEffect, useState } from "react";

type SyncStatus = { behind: number; commits: string[] };

export default function SyncReminder() {
  const [status, setStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
    fetch("/api/admin/sync-status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStatus(data))
      .catch(() => undefined);
  }, []);

  if (!status?.behind) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <p className="font-semibold">
        {status.behind === 1
          ? "1 modification faite en ligne n’est pas encore sur cet ordinateur."
          : `${status.behind} modifications faites en ligne ne sont pas encore sur cet ordinateur.`}
      </p>
      <ul className="mt-2 list-disc pl-5">
        {status.commits.map((commit, index) => (
          <li key={index}>{commit}</li>
        ))}
      </ul>
      <p className="mt-2">
        Avant de modifier quoi que ce soit en local, lance <code className="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/50">git pull</code> dans le terminal, puis recharge la page.
      </p>
    </div>
  );
}
