"use client";

import { useActionState, useState } from "react";
import { createAccessQr, type QrResult } from "./actions";

export default function QrShare() {
  const [result, action, pending] = useActionState<QrResult | null, FormData>(createAccessQr, null);
  const [large, setLarge] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const qr = result && "url" in result ? result : null;

  // Replié par défaut, pour ne pas apparaître quand la page est montrée à l'écran.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
      >
        QR code d’accès ▾
      </button>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold">Partager l’accès par QR code</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-neutral-500 underline underline-offset-4">
          Masquer
        </button>
      </div>
      <p className="mt-1 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
        Le QR code ouvre le prototype en plein écran, sans identifiant ni mot de passe. Il reste valable 60 jours. Chaque scan est compté
        sous son étiquette dans les statistiques.
      </p>
      <form action={action} className="mt-4 flex flex-wrap gap-2">
        <input
          name="label"
          required
          maxLength={80}
          placeholder="Étiquette, ex. Entretien Gamm vert Lozanne"
          className="min-w-64 flex-1 rounded-xl border border-neutral-300 bg-transparent px-4 py-2.5 text-sm dark:border-neutral-700"
        />
        <button disabled={pending} className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900">
          {pending ? "Création…" : "Créer le QR code"}
        </button>
      </form>
      {result && "error" in result ? <p className="mt-3 text-sm text-red-700 dark:text-red-300">{result.error}</p> : null}

      {qr ? (
        <div className="mt-5 flex flex-wrap items-center gap-6">
          <div className="w-44 rounded-xl bg-white p-2 ring-1 ring-neutral-200" dangerouslySetInnerHTML={{ __html: qr.svg }} />
          <div className="text-sm">
            <p className="font-semibold">{qr.label}</p>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">Valable jusqu’au {qr.expires}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setLarge(true)} className="rounded-full border border-neutral-300 px-4 py-2 font-semibold dark:border-neutral-700">
                Afficher en grand
              </button>
              <a href={qr.png} download={`qr-jardin-partage-${qr.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`} className="rounded-full border border-neutral-300 px-4 py-2 font-semibold dark:border-neutral-700">
                Enregistrer l’image
              </a>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(qr.url).then(() => setCopied(true), () => setCopied(false))}
                className="rounded-full border border-neutral-300 px-4 py-2 font-semibold dark:border-neutral-700"
              >
                {copied ? "Lien copié ✓" : "Copier le lien"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {qr && large ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR code en grand"
          onClick={() => setLarge(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center gap-5 bg-white p-6 text-center text-neutral-900"
        >
          <div className="w-[min(78vw,70vh)]" dangerouslySetInnerHTML={{ __html: qr.svg }} />
          <p className="text-2xl font-semibold">Le Jardin Partagé</p>
          <p className="text-base text-neutral-600">Scannez pour ouvrir le prototype · touchez l’écran pour fermer</p>
        </div>
      ) : null}
    </section>
  );
}
