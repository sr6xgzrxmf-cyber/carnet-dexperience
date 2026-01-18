import Link from "next/link";

export default function FinPage() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Terminé</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Bravo. Ton parcours est enregistré. Tu as reçu les récapitulatifs par mail.
      </p>

      <div className="mt-6">
        <Link className="underline underline-offset-4" href="/articles">
          Retour aux articles
        </Link>
      </div>
    </section>
  );
}
