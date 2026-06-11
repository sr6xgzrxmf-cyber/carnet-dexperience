"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function CleanupSafeAliasesButton({
  deletableFiles,
  disabled,
}: {
  deletableFiles: number;
  disabled: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCleanup() {
    const confirmed = window.confirm(
      `Supprimer ${deletableFiles} alias techniques ? Cette action conservera les images utilisées par les articles et les variantes ajoutées manuellement.`
    );

    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/images/cleanup-safe-aliases", {
        method: "POST",
      });

      const data = (await response.json()) as { error?: string; deletedCount?: number };
      if (!response.ok) {
        setError(data.error ?? "Le nettoyage a échoué.");
        return;
      }

      const deletedCount = data.deletedCount ?? 0;
      setSuccess(
        deletedCount > 0
          ? `${deletedCount} fichier(s) technique(s) supprimé(s).`
          : "Aucun alias technique à supprimer."
      );

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Le nettoyage a échoué.");
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCleanup}
        disabled={disabled || isPending || deletableFiles === 0}
        className={[
          "rounded-xl px-4 py-2 text-sm transition",
          disabled || deletableFiles === 0
            ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600"
            : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
        ].join(" ")}
      >
        {isPending ? "Nettoyage…" : `Nettoyer les alias techniques (${deletableFiles})`}
      </button>

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
