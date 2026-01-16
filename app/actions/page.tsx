import Link from "next/link";

export default function ActionsHome() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/70 p-6 sm:p-8 dark:border-neutral-200 dark:border-neutral-800 dark:bg-white/70 dark:bg-white dark:bg-neutral-950/15">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-900 dark:text-neutral-100">
        Sommaire
      </h2>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400">
        Ces pages sont pensées comme des “modules” indépendants. Une fois stables,
        on les intégrera dans /articles.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link
          href="/actions/archives"
          className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-50 dark:border-neutral-200 dark:border-neutral-800 dark:bg-white dark:bg-white dark:bg-neutral-950/20 dark:hover:bg-white dark:bg-neutral-950/35"
        >
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-900 dark:text-neutral-100">
            Archives
          </div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400">
            Liste simple : date grise — titre, puis résumé en italique.
          </div>
        </Link>

        <Link
          href="/actions/filtres"
          className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-50 dark:border-neutral-200 dark:border-neutral-800 dark:bg-white dark:bg-white dark:bg-neutral-950/20 dark:hover:bg-white dark:bg-neutral-950/35"
        >
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-900 dark:text-neutral-100">
            Filtres
          </div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400">
            Extraction des tags, filtres multi-critères, résultats en cartes avec covers.
          </div>
        </Link>

        <Link
          href="/actions/par-ou-commencer"
          className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-50 dark:border-neutral-200 dark:border-neutral-800 dark:bg-white dark:bg-white dark:bg-neutral-950/20 dark:hover:bg-white dark:bg-neutral-950/35"
        >
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-900 dark:text-neutral-100">
            Par où commencer
          </div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400">
            Entrées éditoriales / séries mises en avant (narratif).
          </div>
        </Link>

        <Link
          href="/actions/filtres-et-archives"
          className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-50 dark:border-neutral-200 dark:border-neutral-800 dark:bg-white dark:bg-white dark:bg-neutral-950/20 dark:hover:bg-white dark:bg-neutral-950/35"
        >
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-900 dark:text-neutral-100">
            Filtres & Archives
          </div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400">
            Vue complète : filtrer, explorer, puis parcourir l’ensemble.
          </div>
        </Link>
      </div>
    </section>
  );
}