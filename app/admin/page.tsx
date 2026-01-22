import Link from "next/link";

function Card({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/20 p-6 hover:bg-neutral-50 dark:hover:bg-neutral-950/35"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {desc}
          </p>
        </div>
        <div className="shrink-0 text-sm text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
          Ouvrir →
        </div>
      </div>
    </Link>
  );
}

export default function AdminHomePage() {
  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
          Tes outils internes : contrôle éditorial, séries, calendrier.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Contrôle éditorial"
          desc="Vérifie covers, cohérence slug↔cover, fichiers liés, brief DA, et ouvre directement une série."
          href="/admin/controle"
        />
        <Card
          title="Séries"
          desc="Catalogue des séries + statut (publiés / à paraître) + accès au détail d’une série."
          href="/admin/series"
        />
        <Card
          title="Calendrier"
          desc="Vue de production / planification (ta page existante)."
          href="/admin/calendrier"
        />
      </section>

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6">
        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Idée pour plus tard (optionnel)
        </div>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          Ici on pourra afficher : articles avec covers manquantes, prochaines publications, et séries incomplètes.
        </p>
      </section>
    </main>
  );
}
