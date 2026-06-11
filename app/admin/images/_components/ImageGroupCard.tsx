"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ImageCandidate, ImageDuplicateGroup, ImageReference } from "@/lib/image-review";

function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function fmtDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
}

function categoryLabel(candidate: ImageCandidate) {
  switch (candidate.category) {
    case "article-image":
      return "Image actuellement utilisée";
    case "related-variant":
      return "Variante détectée";
    case "orphan-canonical":
      return "Canonique libre";
    case "legacy-alias":
      return "Alias historique";
  }
}

function articleLabel(ref: ImageReference) {
  return ref.articleDate ? `${ref.articleDate} · ${ref.articleTitle}` : ref.articleTitle;
}

export default function ImageGroupCard({ group }: { group: ImageDuplicateGroup }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function assignCandidate(articleSlug: string, sourceFile: string) {
    const key = `${articleSlug}:${sourceFile}`;
    setPendingKey(key);
    setError(null);

    try {
      const response = await fetch("/api/admin/images/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleSlug, sourceFile }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Impossible d’affecter cette image.");
        setPendingKey(null);
        return;
      }

      startTransition(() => {
        router.refresh();
        setPendingKey(null);
      });
    } catch {
      setError("La copie de l’image a échoué.");
      setPendingKey(null);
    }
  }

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950/20">
      <div className="space-y-5">
        <div>
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {group.kind === "shared-article-image"
              ? "Même image utilisée par plusieurs articles"
              : "Alias techniques autour d’une image canonique"}
          </div>
          <p className="mt-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            {group.kind === "shared-article-image"
              ? "Dépose une variante dans `public/images/articles` avec le même nom de base, par exemple `... 2.jpg`, puis clique sur le bouton de l’article concerné."
              : "Tu peux aussi réaffecter une variante ici avant de supprimer les anciens alias."}
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
            Articles concernés
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {group.referencedCanonicals.map((ref) => {
              const src = encodeURI(`/images/articles/${ref.file}`);
              return (
                <div
                  key={ref.file}
                  className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="relative aspect-[16/10] bg-neutral-100 dark:bg-neutral-900/50">
                    <Image src={src} alt={ref.file} fill className="object-cover" unoptimized />
                  </div>
                  <div className="space-y-1 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {ref.articleTitle}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {ref.articleDate ? `${ref.articleDate} · ` : ""}
                      {ref.articleSlug}
                    </div>
                    <div className="font-mono text-xs text-neutral-500">{ref.file}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Variantes disponibles
            </div>
            <div className="text-xs text-neutral-500">
              {group.selectionCandidates.length} fichier(s) proposés
            </div>
          </div>

          <div className="mt-3 grid gap-4 xl:grid-cols-2">
            {group.selectionCandidates.map((candidate) => {
              const src = encodeURI(`/images/articles/${candidate.file}`);
              return (
                <div
                  key={candidate.file}
                  className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="relative aspect-[16/10] bg-neutral-100 dark:bg-neutral-900/50">
                    <Image src={src} alt={candidate.file} fill className="object-cover" unoptimized />
                  </div>
                  <div className="space-y-3 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                        {categoryLabel(candidate)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {fmtBytes(candidate.size)} · {fmtDate(candidate.modifiedAt)}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                      {candidate.file}
                    </div>

                    {candidate.articleReference ? (
                      <div className="text-sm text-neutral-700 dark:text-neutral-300">
                        Utilisée par : {articleLabel(candidate.articleReference)}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      {group.referencedCanonicals.map((ref) => {
                        const key = `${ref.articleSlug}:${candidate.file}`;
                        const isCurrent = ref.file === candidate.file;
                        const pending = pendingKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={pending || isCurrent}
                            onClick={() => assignCandidate(ref.articleSlug, candidate.file)}
                            className={[
                              "rounded-xl px-3 py-2 text-sm transition",
                              isCurrent
                                ? "bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-500"
                                : "bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
                            ].join(" ")}
                          >
                            {isCurrent
                              ? `Déjà sur ${ref.articleTitle}`
                              : pending
                                ? `Affectation…`
                                : `Affecter à ${ref.articleTitle}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {group.orphanCanonicals.length > 0 ? (
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Fichiers canoniques non utilisés
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.orphanCanonicals.map((file) => (
                <code
                  key={file}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  {file}
                </code>
              ))}
            </div>
          </div>
        ) : null}

        {group.legacyAliases.length > 0 ? (
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Anciens alias
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.legacyAliases.map((file) => (
                <code
                  key={file}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  {file}
                </code>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </div>
    </article>
  );
}
