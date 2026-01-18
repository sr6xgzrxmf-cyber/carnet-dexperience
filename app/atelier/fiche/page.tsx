import { startSubmission } from "./actions";
import Link from "next/link";

export default function StartFichePage() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">
        La fiche (version en ligne)
      </h1>

<p className="mt-3 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
  Tu avances par étapes. Tu reçois un code maintenant, puis un récap complet à la fin. Pas de spam.
</p>

      <form action={startSubmission} className="mt-8 space-y-3">
        <label className="block text-sm text-neutral-700 dark:text-neutral-300">
          Ton email
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 px-4 py-3"
          />
        </label>

        <button className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
          Commencer
        </button>

        <div className="pt-2 text-xs text-neutral-500">
          Déjà un code ?{" "}
          <Link className="underline underline-offset-4" href="/atelier/fiche/reprendre">
            Reprendre
          </Link>
        </div>
      </form>
    </section>
  );
}