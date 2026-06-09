import Link from "next/link";
import Image from "next/image";
import ContactButton from "@/components/ContactButton";
import { getAllArticles, type ArticleItem } from "@/lib/articles";

type HomeArticle = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  cover: string | null;
};

function normalizeCoverSrc(cover: unknown): string | null {
  if (typeof cover !== "string" || !cover.trim()) return null;
  const value = cover.trim();
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

function toHomeArticle(item: ArticleItem): HomeArticle {
  const date =
    typeof item.meta.date === "string"
      ? item.meta.date
      : item.meta.date instanceof Date
        ? item.meta.date.toISOString().slice(0, 10)
        : typeof item.meta.date === "number"
          ? new Date(item.meta.date).toISOString().slice(0, 10)
          : "";

  return {
    slug: item.slug,
    title: item.meta.title ?? item.slug,
    date,
    excerpt: item.meta.excerpt ?? "",
    cover: normalizeCoverSrc(item.meta.cover),
  };
}

export default async function HomePage() {
  const allArticles = getAllArticles({ includeFuture: false }).map(toHomeArticle);
  const articleBySlug = new Map(allArticles.map((article) => [article.slug, article] as const));

  const curatedArticleSlugs = [
    "2026-05-18-construire-un-partenariat-sans-devenir-commercial",
    "2026-04-30-ameliorer-un-process-sans-conflit",
    "2026-05-26-relancer-decider-arreter",
  ];

  const recentArticles = curatedArticleSlugs
    .map((slug) => articleBySlug.get(slug))
    .filter((article): article is HomeArticle => Boolean(article));

  const recruiterEntryHref = "/parcours";
  const practiceEntryHref =
    "/articles/2026-01-17-pourquoi-raconter-une-progression-plutot-que-donner-des-conseils";
  const archivesEntryHref = "/articles/archives";

  return (
    <section className="space-y-16 pt-10 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <header className="grid gap-10 md:grid-cols-[minmax(0,1fr)_260px] md:gap-12">
          <div className="space-y-6 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
              Parcours, travail récent, terrain
            </p>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Carnet d’expérience
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
                J’aide à clarifier, transmettre et rendre adoptables des sujets complexes,
                entre stratégie et terrain.
              </p>

              <p className="max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
                Si tu arrives ici pour comprendre mon profil aujourd’hui, commence par le
                parcours, puis par les textes récents. Les articles plus anciens restent
                visibles parce qu’ils montrent le temps long du travail, pas seulement sa
                version la plus récente.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href="/parcours"
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Voir le parcours
              </Link>

              <Link
                href="/articles"
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60"
              >
                Commencer par les articles
              </Link>

              <Link
                href="/situations-d-intervention"
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60"
              >
                Situations d’intervention
              </Link>

              <ContactButton
                label="Me contacter"
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60"
              />
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-[260px]">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/laurent-portrait.png"
                  alt="Laurent Guyonnet"
                  fill
                  sizes="(max-width: 768px) 60vw, 260px"
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </header>
      </div>

      <section className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        <Link
          href={recruiterEntryHref}
          className="group rounded-3xl border border-neutral-200 bg-white/80 p-6 transition hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-950/20 dark:hover:border-neutral-700"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Pour recruteurs
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            Voir d’abord le profil, puis le travail récent
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Le parcours donne la trajectoire. Les articles récents montrent la manière de
            penser, de cadrer et de rendre les choses lisibles aujourd’hui.
          </p>
          <p className="mt-5 text-sm text-neutral-600 transition group-hover:translate-x-0.5 dark:text-neutral-400">
            Voir le parcours →
          </p>
        </Link>

        <Link
          href={practiceEntryHref}
          className="group rounded-3xl border border-neutral-200 bg-white/80 p-6 transition hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-950/20 dark:hover:border-neutral-700"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Pour comprendre la pratique
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            Les textes les plus récents sont les plus représentatifs
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Ils sont plus nets, plus incarnés et plus proches de ce que je fais vraiment :
            clarifier, décider, transmettre, structurer.
          </p>
          <p className="mt-5 text-sm text-neutral-600 transition group-hover:translate-x-0.5 dark:text-neutral-400">
            Comprendre la logique →
          </p>
        </Link>

        <Link
          href={archivesEntryHref}
          className="group rounded-3xl border border-neutral-200 bg-white/80 p-6 transition hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-950/20 dark:hover:border-neutral-700"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Pour remonter le temps
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            Les articles 2023 restent utiles
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Je ne les efface pas. Ils montrent que ce travail éditorial ne date pas de
            quelques mois. Je les reprends progressivement, sans masquer leur histoire.
          </p>
          <p className="mt-5 text-sm text-neutral-600 transition group-hover:translate-x-0.5 dark:text-neutral-400">
            Explorer les archives →
          </p>
        </Link>
      </section>

      <section className="mx-auto max-w-5xl rounded-3xl border border-neutral-200 bg-white/80 p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Commencer ici
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Les textes les plus proches de ma pratique actuelle
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              Pas trois variantes du même sujet : trois angles différents pour comprendre
              comment je structure une relation, clarifie un process et reprends la
              maîtrise d’une situation.
            </p>
          </div>

          <Link
            href="/articles"
            className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            Voir tous les articles →
          </Link>
        </div>

        {recentArticles.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {recentArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950/20"
              >
                {article.cover ? (
                  <div className="relative h-52 w-full overflow-hidden">
                    <Image
                      src={article.cover}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  </div>
                ) : (
                  <div className="h-52 w-full bg-neutral-100 dark:bg-neutral-900/40" />
                )}

                <div className="p-6">
                  {article.date ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {article.date}
                    </p>
                  ) : null}

                  <h3 className="mt-2 text-lg font-semibold tracking-tight">
                    {article.title}
                  </h3>

                  {article.excerpt ? (
                    <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                      {article.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-950/20">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Fil rouge
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Un site pour rendre visible le travail réel
          </h2>

          <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
            <p>
              Ce carnet prolonge le CV là où il devient trop court : le contexte, les
              décisions, les contraintes, les méthodes et les apprentissages qui
              accompagnent une trajectoire professionnelle réelle.
            </p>
            <p>
              Depuis plus de quinze ans, mon travail consiste à faire passer une vision du
              papier au terrain. Qu’il s’agisse de former, déployer, transmettre ou
              accompagner, la même question revient : comment produire de la clarté sans
              simplifier à l’excès ?
            </p>
            <p>
              Ici, je documente ce que j’ai vu, compris et ajusté en chemin. Pas pour
              livrer des recettes, mais pour montrer une manière de travailler.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 dark:border-neutral-800 dark:bg-neutral-950/20">
          <h2 className="text-lg font-semibold tracking-tight">
            Les articles 2023 restent en ligne
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Ils montrent que ce travail s’est construit dans la durée. Ils sont moins
            centraux aujourd’hui, mais ils gardent leur valeur comme trace, comme
            progression et comme matière à réécriture.
          </p>

            <Link
              href="/articles/archives"
              className="mt-4 inline-flex text-sm text-neutral-600 hover:underline dark:text-neutral-400"
            >
              Explorer les archives →
            </Link>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 dark:border-neutral-800 dark:bg-neutral-950/20">
          <h2 className="text-lg font-semibold tracking-tight">
            Et après
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Tu peux lire le parcours, parcourir les situations d’intervention,
            découvrir l’accompagnement ou m’écrire si tu veux échanger plus
            directement.
          </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/parcours"
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60"
              >
                Parcours
              </Link>

              <Link
                href="/atelier"
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60"
              >
                Accompagnement
              </Link>

              <ContactButton
                label="Contact"
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              />
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
