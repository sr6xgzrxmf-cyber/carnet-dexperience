import Link from "next/link";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function ActionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-transparent text-neutral-900 dark:text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs text-neutral-500">Espace de travail</div>
            <h1 className="mt-1 text-2xl font-semibold">Actions</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400">
              Pages internes (non liées au site public) pour tester des composants avant intégration.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/actions/archives"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50 dark:border-neutral-200 dark:border-neutral-800 dark:bg-white dark:bg-white dark:bg-neutral-950/30 dark:text-neutral-200 dark:hover:bg-white dark:bg-neutral-950/50"
            >
              Archives
            </Link>
            <Link
              href="/actions/filtres"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50 dark:border-neutral-200 dark:border-neutral-800 dark:bg-white dark:bg-white dark:bg-neutral-950/30 dark:text-neutral-200 dark:hover:bg-white dark:bg-neutral-950/50"
            >
              Filtres
            </Link>
            <Link
              href="/actions/par-ou-commencer"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50 dark:border-neutral-200 dark:border-neutral-800 dark:bg-white dark:bg-white dark:bg-neutral-950/30 dark:text-neutral-200 dark:hover:bg-white dark:bg-neutral-950/50"
            >
              Par où commencer
            </Link>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}