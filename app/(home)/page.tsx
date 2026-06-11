import Link from "next/link";
import Image from "next/image";
import ContactButton from "@/components/ContactButton";
import {
  featuredSeriesList,
  featuredSeriesSummaries,
  featuredSeriesTeasers,
  featuredWorkArticles,
} from "@/content/editorial";
import { getAllArticles, type ArticleItem } from "@/lib/articles";
import { getAllSeriesCatalog } from "@/lib/series-catalog";

type HomeArticle = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  cover: string | null;
  series?: {
    slug?: string;
    order?: number;
  };
};

type FeaturedHomeArticle = {
  article: HomeArticle;
  label: string;
};

type HomeSeries = {
  slug: string;
  title: string;
  articleCount: number;
  startHref: string | null;
  startTitle?: string;
  teaserBenefit?: string;
  teaserForWhom?: string;
  summary?: string;
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

  const rawSeries =
    item.meta.series && typeof item.meta.series === "object"
      ? (item.meta.series as { slug?: unknown; order?: unknown })
      : undefined;
  const seriesOrder =
    typeof rawSeries?.order === "number"
      ? rawSeries.order
      : typeof rawSeries?.order === "string"
        ? Number(rawSeries.order)
        : undefined;

  return {
    slug: item.slug,
    title: item.meta.title ?? item.slug,
    date,
    excerpt: item.meta.excerpt ?? "",
    cover: normalizeCoverSrc(item.meta.cover),
    series:
      rawSeries && typeof rawSeries.slug === "string"
        ? {
            slug: rawSeries.slug,
            order: Number.isFinite(seriesOrder) ? seriesOrder : undefined,
          }
        : undefined,
  };
}

function FeaturedArticleCard({
  article,
  label,
}: FeaturedHomeArticle) {
  return (
    <Link
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
            {label}
          </span>
          {article.date ? <span>{article.date}</span> : null}
        </div>

        <h3 className="mt-2 text-lg font-semibold tracking-tight">{article.title}</h3>

        {article.excerpt ? (
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            {article.excerpt}
          </p>
        ) : null}

        <p className="mt-5 text-sm text-neutral-600 transition group-hover:translate-x-0.5 dark:text-neutral-400">
          Lire l’article →
        </p>
      </div>
    </Link>
  );
}

function FeaturedSeriesCard({ series }: { series: HomeSeries }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950/20">
      <div className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
        Série • {series.articleCount} article{series.articleCount > 1 ? "s" : ""}
      </div>

      <h3 className="mt-3 text-xl font-semibold tracking-tight">{series.title}</h3>

      <div className="mt-3 space-y-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
        <p>{series.teaserBenefit ?? series.summary}</p>
        {series.teaserForWhom ? <p>{series.teaserForWhom}</p> : null}
      </div>

      {series.startTitle ? (
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          Commencer par : {series.startTitle}
        </p>
      ) : null}

      <div className="mt-5">
        {series.startHref ? (
          <Link
            href={series.startHref}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Commencer
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white/60 px-4 py-2 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-neutral-400">
            Bientôt
          </span>
        )}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const allArticles = getAllArticles({ includeFuture: false }).map(toHomeArticle);
  const articleBySlug = new Map(allArticles.map((article) => [article.slug, article] as const));
  const seriesCatalog = getAllSeriesCatalog();
  const seriesBySlug = new Map(seriesCatalog.map((series) => [series.slug, series] as const));

  const featuredArticles = featuredWorkArticles
    .slice(0, 3)
    .map(({ slug, label }) => {
      const article = articleBySlug.get(slug);
      if (!article) return null;
      return { article, label };
    })
    .filter((entry): entry is FeaturedHomeArticle => Boolean(entry?.article));

  const featuredSeries = featuredSeriesList
    .map((slug) => {
      const meta = seriesBySlug.get(slug) ?? { slug, title: slug, description: "" };
      const teaser = featuredSeriesTeasers?.[slug];
      const items = allArticles
        .filter((article) => article.series?.slug === slug)
        .sort((a, b) => (a.series?.order ?? 9999) - (b.series?.order ?? 9999));
      const start = items.find((article) => (article.series?.order ?? 9999) === 0) ?? items[0];

      return {
        slug,
        title: meta.title,
        articleCount: items.length,
        startHref: start ? `/articles/${start.slug}` : null,
        startTitle: start?.title,
        teaserBenefit: teaser?.benefit?.trim(),
        teaserForWhom: teaser?.forWhom?.trim(),
        summary: featuredSeriesSummaries?.[slug]?.trim() || meta.description,
      };
    });

  const recruiterEntryHref = "/parcours";
  const practiceEntryHref = "#commencer-ici";
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
                parcours, puis par une sélection courte d’articles. Les textes plus anciens
                restent visibles parce qu’ils montrent le temps long du travail, pas
                seulement sa version la plus récente.
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
                href={practiceEntryHref}
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
            Voir d’abord le parcours, puis les textes repères
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Le parcours donne la trajectoire. La sélection d’articles montre ensuite la
            manière de cadrer, de décider et de rendre les choses lisibles aujourd’hui.
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
            Trois textes choisis, pas trois variantes du même sujet
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Trois entrées différentes pour voir comment je travaille une posture, un
            process et une relation de partenariat.
          </p>
          <p className="mt-5 text-sm text-neutral-600 transition group-hover:translate-x-0.5 dark:text-neutral-400">
            Voir la sélection →
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
            Les archives montrent le temps long du travail
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Les textes 2023 ne sont pas là par nostalgie. Ils documentent les premières
            formulations, les reprises et la progression éditoriale sur plusieurs années.
          </p>
          <p className="mt-5 text-sm text-neutral-600 transition group-hover:translate-x-0.5 dark:text-neutral-400">
            Explorer les archives →
          </p>
        </Link>
      </section>

      <section
        id="commencer-ici"
        className="mx-auto max-w-5xl rounded-3xl border border-neutral-200 bg-white/80 p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-950/20"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Commencer ici
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Trois textes repères pour entrer dans la pratique actuelle
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              Trois angles différents pour comprendre comment je clarifie une posture,
              stabilise un process et fais avancer une relation sans la tordre.
            </p>
          </div>

          <Link
            href="/articles"
            className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            Voir tous les articles →
          </Link>
        </div>

        {featuredArticles.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredArticles.map(({ article, label }) => (
              <FeaturedArticleCard key={article.slug} article={article} label={label} />
            ))}
          </div>
        ) : null}
      </section>

      <section
        id="series-cles"
        className="mx-auto max-w-5xl rounded-3xl border border-neutral-200 bg-white/80 p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-950/20"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Lire en série
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Trois fils rouges pour aller plus loin que les articles isolés
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              Si tu veux voir une mécanique de travail dans la durée, entre par une série :
              posture, projet en train de se structurer, ou construction de ce carnet comme
              outil professionnel.
            </p>
          </div>

          <Link
            href="/articles#retrospectives"
            className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            Voir toutes les séries →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredSeries.map((series) => (
            <FeaturedSeriesCard key={series.slug} series={series} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 dark:border-neutral-800 dark:bg-neutral-950/20">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Temps long
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">
            Les archives restent utiles
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Elles gardent visibles les premières formulations, les angles abandonnés, les
            essais et les réécritures. C’est une archive de travail, pas un placard.
          </p>

          <Link
            href="/articles/archives"
            className="mt-4 inline-flex text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            Explorer les archives →
          </Link>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 dark:border-neutral-800 dark:bg-neutral-950/20">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Et après
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">
            Continuer la visite
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            Tu peux ensuite lire le parcours, parcourir les situations d’intervention,
            découvrir l’accompagnement ou m’écrire si tu veux échanger plus directement.
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
      </section>
    </section>
  );
}
