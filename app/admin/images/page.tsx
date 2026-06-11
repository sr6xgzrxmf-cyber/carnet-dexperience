import CleanupSafeAliasesButton from "./_components/CleanupSafeAliasesButton";
import ImageGroupCard from "./_components/ImageGroupCard";
import { getImageReviewData } from "@/lib/image-review";

function SummaryCard({
  label,
  value,
  desc,
}: {
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950/20">
      <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">{desc}</p>
    </div>
  );
}

export default function AdminImagesPage() {
  const { summary, safeAliasGroups, sharedArticleImageGroups } = getImageReviewData();

  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Revue des images</h1>
        <p className="max-w-3xl text-sm leading-6 text-neutral-700 dark:text-neutral-300">
          Cette page sépare les vrais arbitrages visuels des simples doublons techniques. Les
          groupes “partagés par plusieurs articles” sont ceux à revoir en priorité.
        </p>
        <p className="max-w-3xl text-sm leading-6 text-neutral-700 dark:text-neutral-300">
          Pour tester une nouvelle image, dépose-la dans{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-900">
            public/images/articles
          </code>{" "}
          avec le même nom de base, par exemple{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-900">
            2026-01-15-article-zero-manifeste 2.jpg
          </code>
          . Elle apparaîtra comme variante à affecter.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Fichiers"
          value={String(summary.totalFiles)}
          desc="Nombre total d’images présentes dans `public/images/articles`."
        />
        <SummaryCard
          label="Groupes à arbitrer"
          value={String(summary.sharedArticleImageGroups)}
          desc="Images encore partagées entre plusieurs articles réels."
        />
        <SummaryCard
          label="Alias sûrs"
          value={String(summary.safeAliasGroups)}
          desc="Groupes où un seul article utilise l’image, le reste peut être nettoyé après validation."
        />
        <SummaryCard
          label="Doublons"
          value={String(summary.duplicateGroups)}
          desc="Total des groupes de fichiers identiques détectés par hash."
        />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight">Nettoyage technique</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              Maintenant qu’il n’y a plus d’image partagée entre plusieurs articles, tu peux
              supprimer les vieux alias techniques. Ce bouton ne touche ni aux covers utilisées
              par les articles, ni aux variantes déposées manuellement comme{" "}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-900">
                ... 2.jpg
              </code>
              .
            </p>
          </div>

          <CleanupSafeAliasesButton
            deletableFiles={summary.safeDeletableFiles}
            disabled={summary.sharedArticleImageGroups > 0}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Priorité : collisions entre articles</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Si deux articles ou plus montrent la même image, c’est ici qu’il faut décider
            laquelle garder, remplacer ou refaire.
          </p>
        </div>

        {sharedArticleImageGroups.length > 0 ? (
          <div className="space-y-4">
            {sharedArticleImageGroups.map((group) => (
              <ImageGroupCard key={group.hash} group={group} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/20 dark:text-neutral-300">
            Aucune collision entre articles. Chaque article utilise déjà une image distincte.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Alias techniques</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Ces groupes ne demandent pas d’arbitrage créatif. Ils servent surtout à préparer le
            nettoyage des anciens noms de fichiers.
          </p>
        </div>

        <details className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950/20">
          <summary className="cursor-pointer text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Voir les {safeAliasGroups.length} groupes d’alias techniques
          </summary>
          <div className="mt-5 space-y-4">
            {safeAliasGroups.map((group) => (
              <ImageGroupCard key={group.hash} group={group} />
            ))}
          </div>
        </details>
      </section>
    </main>
  );
}
