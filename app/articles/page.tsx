// app/articles/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getAllArticles, type ArticleItem } from "@/lib/articles";
import {
  featuredWorkArticles,
  featuredSeriesList,
  featuredSeriesSummaries,
  featuredSeriesTeasers,
} from "@/content/editorial";
import { getAllSeriesCatalog } from "@/lib/series-catalog";
import { ARTICLE_THEMES, getArticleThemes } from "@/lib/article-themes";
import type { Metadata } from "next";
import ArticlesCatalog from "./_components/ArticlesCatalog";
import styles from "@/app/editorial-system.module.css";

export const metadata: Metadata = {
  title: "Articles et séries",
  description:
    "Textes, séries et archives pour comprendre comment je clarifie une situation, transmets un cadre et rends des sujets complexes adoptables.",
};

export const revalidate = 300;

type SearchParams = {
  q?: string | string[];
  theme?: string | string[];
};

type ArticleMeta = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  cover?: string | null;
  source?: string;
  tags?: string[];
  themes: string[];
  series?: { name?: string; title?: string; slug?: string; order?: number };
};

function normalizeCoverSrc(cover: unknown): string | null {
  if (typeof cover !== "string" || !cover.trim()) return null;
  const s = cover.trim();
  // accepte URL absolue
  if (/^https?:\/\//i.test(s)) return s;
  // accepte chemins public "/..."
  return s.startsWith("/") ? s : `/${s}`;
}

function getItemMeta(item: ArticleItem): ArticleMeta {
  const m = item?.meta ?? {};
  const tags = Array.isArray(m?.tags) ? m.tags.map(String) : [];
  const rawDate = m?.date;
  const date =
    typeof rawDate === "string"
      ? rawDate
      : rawDate instanceof Date
        ? rawDate.toISOString().slice(0, 10)
        : typeof rawDate === "number"
          ? new Date(rawDate).toISOString().slice(0, 10)
          : rawDate != null
            ? String(rawDate)
            : "";
  const rawSeries =
    m?.series && typeof m.series === "object"
      ? (m.series as { name?: unknown; title?: unknown; slug?: unknown; order?: unknown })
      : undefined;
  const seriesOrder =
    typeof rawSeries?.order === "number"
      ? rawSeries.order
      : typeof rawSeries?.order === "string"
        ? Number(rawSeries.order)
        : undefined;
  const series =
    rawSeries && typeof rawSeries.slug === "string"
      ? {
          slug: rawSeries.slug,
          name: typeof rawSeries.name === "string" ? rawSeries.name : undefined,
          title: typeof rawSeries.title === "string" ? rawSeries.title : undefined,
          order: Number.isFinite(seriesOrder) ? seriesOrder : undefined,
        }
      : undefined;
  const rawCover =
    m?.cover ??
    (m as { image?: unknown }).image ??
    (m as { hero?: unknown }).hero;
  const cover = typeof rawCover === "string" ? rawCover : null;

  return {
    slug: item?.slug ?? "",
    title: m?.title ?? "",
    date,
    excerpt: m?.excerpt ?? "",
    cover,
    source: m?.source ?? "Carnet d’expérience",
    tags,
    themes: getArticleThemes(tags),
    series,
  };
}

function firstParam(value?: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parisTodayISO(now: Date = new Date()): string {
  // YYYY-MM-DD en Europe/Paris
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function normalizeISODate(input?: string | null): string | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function isPublishedParis(date: string | null | undefined, now: Date): boolean {
  const d = normalizeISODate(date);
  if (!d) return true; // pas de date => visible
  return d <= parisTodayISO(now);
}

/* ---------- Mosaic (5 bandes horizontales) ---------- */
function Mosaic({ covers }: { covers: string[] }) {
  const c = covers.slice(0, 3);
  const count = c.length;

  if (!count) {
    return <div className={styles.articleImage} />;
  }

  return (
    <div className={styles.articleImage}>
      <div
        className="grid h-full w-full gap-[2px] bg-black/30"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {c.map((src, idx) => (
          <div key={`${src}-${idx}`} className="relative overflow-hidden">
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ))}
      </div>

      {/* voile + vignettage premium */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
    </div>
  );
}

function ArticlePreviewCard({
  article,
  futureLabel = false,
  eyebrow,
}: {
  article: ArticleMeta;
  futureLabel?: boolean;
  eyebrow?: string;
}) {
  const coverSrc = normalizeCoverSrc(article.cover);

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={styles.articleCard}
    >
      {coverSrc ? (
        <div
          className={styles.articleImage}
          style={{
            transform: "translateZ(0)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            clipPath: "inset(0 round 1rem)",
            WebkitClipPath: "inset(0 round 1rem)",
          }}
        >
          <Image
            src={coverSrc}
            alt={article.title}
            fill
            className="absolute inset-0 h-full w-full"
            style={{
              transform: "translateZ(0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className={styles.articleImage} />
      )}

      <div className={styles.articleBody}>
        <div className="flex flex-wrap items-center gap-2">
          {eyebrow ? (
            <span className={styles.cardEyebrow}>
              {eyebrow}
            </span>
          ) : null}
          {futureLabel ? (
            <span className={styles.tag}>
              À paraître
            </span>
          ) : article.date ? (
            <span className={styles.meta}>{article.date}</span>
          ) : null}
        </div>

        <h3 className={styles.articleTitle}>
          {article.title}
        </h3>

        {article.excerpt ? (
          <p className={`${styles.articleExcerpt} line-clamp-3`}>
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default async function ArticlesHubPage(props: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const sp =
    props.searchParams instanceof Promise
      ? await props.searchParams
      : props.searchParams;

  const initialQuery = firstParam(sp?.q).trim();
  const initialTheme = firstParam(sp?.theme).trim();

  // ⚠️ Fix “hydration-ish” : on fige now une fois (évite toute divergence)
  const now = new Date();

  // ✅ Show future-dated items only in dev or Vercel preview deployments
  const allowFuture =
    process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

  const raw = await getAllArticles({ includeFuture: allowFuture });
  const all = (raw ?? []).map(getItemMeta).filter((a) => a.slug);

  // Published vs À paraître
  const published = all.filter((a) => isPublishedParis(a.date ?? null, now));

  // ✅ En dev/preview : Résultats affiche tout (publiés + futurs)
  // ✅ En prod : Résultats affiche uniquement les publiés
  const resultsBase = allowFuture ? all : published;

  /* ---------- Séries (Par où commencer) ---------- */
  type SeriesCard = {
    slug: string;
    title: string;
    description?: string;
    summary?: string;
    teaserBenefit?: string;
    teaserForWhom?: string;
    items: ArticleMeta[];
    start?: ArticleMeta;
    covers: string[];
  };

  const seriesCatalog = getAllSeriesCatalog();
  const seriesBySlug = new Map(seriesCatalog.map((s) => [s.slug, s]));

  const seriesCards: SeriesCard[] = featuredSeriesList.map((slug) => {
    const meta = seriesBySlug.get(slug) ?? { slug, title: slug, description: "" };
    const teaser = featuredSeriesTeasers?.[slug];
    const teaserBenefit = teaser?.benefit?.trim();
    const teaserForWhom = teaser?.forWhom?.trim();
    const items = published
      .filter((a) => a.series?.slug === slug)
      .sort((a, b) => (a.series?.order ?? 9999) - (b.series?.order ?? 9999));

    const start = items.find((a) => (a.series?.order ?? 9999) === 0) ?? items[0];

    const lastItems = items.slice(-3);
    const covers = lastItems
      .map((a) => normalizeCoverSrc(a.cover))
      .filter(Boolean) as string[];

    return {
      slug: meta.slug,
      title: meta.title,
      description: meta.description,
      summary: featuredSeriesSummaries?.[slug]?.trim() || undefined,
      teaserBenefit,
      teaserForWhom,
      items,
      start,
      covers,
    };
  });

  const articleBySlug = new Map(published.map((article) => [article.slug, article] as const));
  const recentArticles = featuredWorkArticles
    .map(({ slug, label }) => {
      const article = articleBySlug.get(slug);
      if (!article) return null;
      return { article, label };
    })
    .filter(
      (entry): entry is { article: ArticleMeta; label: string } => Boolean(entry?.article)
    );
  const latestArticle = recentArticles[0]?.article ?? null;
  const postureSeries = seriesCards.find((series) => series.slug === "atelier-de-posture");
  const readingPathSpecs = [
    {
      title: "Je manage une équipe",
      description: "Prioriser, rendre les rôles lisibles et faire avancer un collectif sans ajouter de pression inutile.",
      slugs: [
        "2026-03-13-tout-est-prioritaire-signal-d-alerte-managerial",
        "2026-02-16-demenager-une-equipe-sans-en-etre-le-manager",
        "2026-03-17-devenir-facilitateur-le-leadership-discret",
        "2026-03-31-recollectiviser-sans-conflit",
      ],
    },
    {
      title: "Je dois transmettre",
      description: "Passer d’un savoir implicite à un cadre que d’autres peuvent comprendre, utiliser et faire vivre.",
      slugs: [
        "2026-02-17-hygiene-de-langage",
        "2026-04-16-creer-des-cadres-legers-qui-tiennent",
        "2026-03-04-tant-que-ce-n-est-pas-ecrit-ce-n-est-pas-clair",
        "2026-04-02-pourquoi-une-fiche-de-poste-protege-tout-le-monde",
      ],
    },
    {
      title: "Je conduis un changement",
      description: "Tester, observer les résistances et ajuster le dispositif jusqu’à ce qu’il devienne praticable.",
      slugs: [
        "2026-04-14-arreter-de-debattre-tester-30-jours",
        "2026-04-30-ameliorer-un-process-sans-conflit",
        "2026-04-09-quand-le-cadre-est-pose-mais-pas-respecte",
        "2026-04-07-pourquoi-on-confond-souvent-tension-et-conflit",
      ],
    },
  ];
  const readingPaths = readingPathSpecs.map((path) => ({
    ...path,
    articles: path.slugs
      .map((slug) => articleBySlug.get(slug))
      .filter((article): article is ArticleMeta => Boolean(article)),
  }));
  const usedThemes = new Set(resultsBase.flatMap((article) => article.themes));
  const catalogThemes = [
    ...ARTICLE_THEMES.filter((theme) => usedThemes.has(theme)),
    ...(usedThemes.has("Regards sur le travail") ? ["Regards sur le travail"] : []),
  ];
  const catalogArticles = resultsBase.map((article) => ({
    slug: article.slug,
    title: article.title,
    date: article.date,
    excerpt: article.excerpt,
    cover: article.cover,
    tags: article.tags ?? [],
    themes: article.themes,
    seriesTitle: article.series?.title ?? article.series?.name,
    futureLabel: !isPublishedParis(article.date ?? null, now),
  }));

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderSplit}>
          <div>
            <p className={styles.eyebrow}>Articles · séries · archives</p>
            <h1 className={styles.title}>Le travail, documenté</h1>
          </div>
          <p className={styles.headerNote}>
            Des situations réelles, des décisions rendues lisibles et des cadres
            conçus pour être transmis. Commencez par les textes repères ou entrez
            directement par une série.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Commencer ici</p>
            <h2 className={styles.sectionTitle}>
              Trois portes d&apos;entrée selon ce que vous cherchez
            </h2>
          </div>
          <p className={styles.sectionCopy}>
            Recruteur, partenaire, client potentiel ou lecteur curieux&nbsp;: il
            n’est pas nécessaire de tout lire dans l’ordre.
          </p>
        </div>

        <div className={styles.grid3}>
          <Link
            href={latestArticle ? `/articles/${latestArticle.slug}` : "#travail-recent"}
            className={styles.card}
          >
            <p className={styles.cardEyebrow}>Le travail récent</p>
            <h3 className={styles.cardTitle}>Voir la pratique actuelle</h3>
            <p className={styles.cardCopy}>
              Une sélection courte, volontairement diverse, pour voir comment je travaille
              aujourd&apos;hui sur la posture, le cadrage, la relation et la décision.
            </p>
            <span className={styles.cardLink}>Lire les textes repères →</span>
          </Link>

          <Link
            href={postureSeries?.start?.slug ? `/articles/${postureSeries.start.slug}` : "#retrospectives"}
            className={styles.card}
          >
            <p className={styles.cardEyebrow}>La logique de fond</p>
            <h3 className={styles.cardTitle}>Suivre une méthode</h3>
            <p className={styles.cardCopy}>
              Les séries permettent de suivre une mécanique dans le temps : une posture, un
              cadre, une progression, une manière de décider.
            </p>
            <span className={styles.cardLink}>Commencer une série →</span>
          </Link>

          <Link
            href="/articles/archives"
            className={styles.card}
          >
            <p className={styles.cardEyebrow}>Le temps long</p>
            <h3 className={styles.cardTitle}>Explorer les archives</h3>
            <p className={styles.cardCopy}>
              Les archives gardent visibles les textes plus anciens, les premières versions,
              les bifurcations et les changements de ton.
            </p>
            <span className={styles.cardLink}>Remonter le fil →</span>
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.softSurface}`}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Parcours guidés</p>
            <h2 className={styles.sectionTitle}>Quatre textes pour avancer sur votre situation</h2>
          </div>
          <p className={styles.sectionCopy}>
            Trois sélections courtes pour entrer directement par le besoin qui
            vous amène, sans avoir à parcourir tout le catalogue.
          </p>
        </div>

        <div className={styles.grid3}>
          {readingPaths.map((path) => (
            <article key={path.title} className={styles.card}>
              <p className={styles.cardEyebrow}>Parcours de lecture</p>
              <h3 className={styles.cardTitle}>{path.title}</h3>
              <p className={styles.cardCopy}>{path.description}</p>
              <ol className={styles.pathList}>
                {path.articles.map((article, index) => (
                  <li key={article.slug}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Link className={styles.pathLink} href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      {recentArticles.length > 0 ? (
        <section
          id="travail-recent"
          className={styles.section}
        >
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Travail récent</p>
              <h2 className={styles.sectionTitle}>
                Six textes repères pour comprendre ce que je fais aujourd&apos;hui
              </h2>
            </div>
            <p className={styles.sectionCopy}>
              Six entrées volontairement différentes pour voir la posture, le
              processus, la décision, le collectif, la relation et le travail de
              clarification.
            </p>
          </div>

          <div className={styles.grid3}>
            {recentArticles.map(({ article, label }) => (
              <ArticlePreviewCard key={article.slug} article={article} eyebrow={label} />
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="retrospectives"
        className={styles.section}
      >
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Séries à suivre</p>
            <h2 className={styles.sectionTitle}>
              Pour entrer dans une logique de fond, pas seulement dans un article
            </h2>
          </div>
          <p className={styles.sectionCopy}>
            Ces séries servent de points d&apos;entrée éditoriaux. Elles permettent de
            comprendre une ligne de travail, une mécanique ou une bifurcation importante.
          </p>
        </div>

        <div className={styles.grid3}>
          {seriesCards.map((s) => {
            const startHref = s.start?.slug ? `/articles/${s.start.slug}` : null;

            return (
              <div
                key={s.slug}
                className={styles.articleCard}
              >
                {startHref ? (
                  <Link
                    href={startHref}
                    aria-label={`Commencer la série : ${s.title}`}
                    className="block overflow-hidden"
                  >
                    <div className="transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                      {s.covers.length ? (
                        <Mosaic covers={s.covers} />
                      ) : (
                        <div className={styles.articleImage} />
                      )}
                    </div>
                  </Link>
                ) : (
                  <div>
                    {s.covers.length ? (
                      <Mosaic covers={s.covers} />
                    ) : (
                      <div className={styles.articleImage} />
                    )}
                  </div>
                )}

                <div className={styles.articleBody}>
                  <div className={styles.cardEyebrow}>
                    Série • {s.items.length} article{s.items.length > 1 ? "s" : ""}
                  </div>

                  <h3 className={styles.articleTitle}>
                    {s.title}
                  </h3>

                  {(s.teaserBenefit || s.teaserForWhom || s.summary || s.description) ? (
                    <div className={styles.articleExcerpt}>
                      <p>{s.teaserBenefit ?? s.summary ?? s.description}</p>
                      {s.teaserForWhom ? <p>{s.teaserForWhom}</p> : null}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {startHref ? (
                      <Link
                        href={startHref}
                        className={`${styles.button} ${styles.buttonPrimary}`}
                      >
                        Commencer
                      </Link>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Commencer
                      </span>
                    )}

                    
                  </div>

                  {s.items.length ? (
                    <div className="mt-5 border-t border-neutral-200/70 dark:border-neutral-800/70 pt-4">
                      <ul className="space-y-2 text-[12.5px] text-neutral-600 dark:text-neutral-400">
                        {s.items.slice(0, 3).map((a) => (
                          <li
                            key={a.slug}
                            className="flex items-baseline gap-2"
                          >
                            <span className="w-6 shrink-0 text-neutral-400">
                              {(a.series?.order ?? 0).toString().padStart(2, "0")}
                            </span>
                            <span className="text-neutral-700 dark:text-neutral-300">
                              {a.title}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 text-xs text-neutral-500">
                        <Link
                          href={`/articles/archives?series=${s.slug}`}
                          className="hover:underline"
                        >
                          Voir toute la série →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-neutral-500">
                      Aucun article trouvé pour cette série (vérifie `series.slug` dans le YAML).
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="filtres"
        className={styles.section}
      >
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Recherche et catalogue</p>
            <h2 className={styles.sectionTitle}>Trouver le texte utile maintenant</h2>
          </div>
          <p className={styles.sectionCopy}>
            Recherchez un mot libre ou choisissez l’un des neuf grands thèmes.
            Les 55 anciennes étiquettes restent conservées dans les contenus,
            mais ne compliquent plus la navigation.
          </p>
        </div>

        <ArticlesCatalog
          articles={catalogArticles}
          themes={catalogThemes}
          initialQuery={initialQuery}
          initialTheme={initialTheme}
        />
      </section>

      <section className="flex justify-center pt-4">
        <Link
          href="/articles/archives"
          className={styles.textLink}
        >
          Explorer le temps long →
        </Link>
      </section>
    </div>
  );
}
