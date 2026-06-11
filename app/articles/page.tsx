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
import type { Metadata } from "next";
import ArticlesFilters from "./_components/ArticlesFilters";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Articles récents, séries et archives de Laurent Guyonnet sur le travail réel, la décision, la transmission et le terrain.",
};

export const revalidate = 300;

type SearchParams = {
  tag?: string | string[];
  tags?: string | string[];
  showTags?: string; // "all"
};

type ArticleMeta = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  cover?: string | null;
  source?: string;
  tags?: string[];
  series?: { name?: string; title?: string; slug?: string; order?: number };
};

function asArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap((x) => String(x).split(","));
  return String(v).split(",");
}

function normalizeTag(t: string) {
  return t.trim();
}

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
    tags: Array.isArray(m?.tags) ? m.tags.map(String) : [],
    series,
  };
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

function daysUntilParis(date: string | null | undefined, now: Date): number | null {
  const d = normalizeISODate(date);
  if (!d) return null;

  const today = parisTodayISO(now);

  // Diff en jours sur base YYYY-MM-DD -> Date UTC "neutre" (uniquement pour diff jours, pas pour publication)
  const toUTC = (iso: string) => {
    const [y, m, dd] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, dd);
  };

  return Math.round((toUTC(d) - toUTC(today)) / (24 * 60 * 60 * 1000));
}

/* ---------- Mosaic (5 bandes horizontales) ---------- */
function Mosaic({ covers }: { covers: string[] }) {
  const c = covers.slice(0, 3);
  const count = c.length;

  if (!count) {
    return <div className="h-56 w-full bg-neutral-900/10 dark:bg-neutral-900/30" />;
  }

  return (
    <div className="relative h-56 w-full overflow-hidden">
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
              unoptimized
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

function hrefFor(nextTags: string[], showAllTags: boolean) {
  const params = new URLSearchParams();
  nextTags.forEach((t) => params.append("tag", t));
  if (showAllTags) params.set("showTags", "all");
  return `/articles${params.toString() ? `?${params.toString()}` : ""}`;
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
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-950/20 ring-1 ring-neutral-200 dark:ring-neutral-800"
    >
      {coverSrc ? (
        <div
          className="relative h-56 w-full overflow-hidden rounded-t-2xl"
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
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
            style={{
              transform: "translateZ(0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized
          />
          <div className="absolute inset-0 rounded-t-2xl bg-transparent" />
        </div>
      ) : (
        <div className="h-56 w-full bg-neutral-900/10 dark:bg-neutral-900/30" />
      )}

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          {eyebrow ? (
            <span className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              {eyebrow}
            </span>
          ) : null}
          {futureLabel ? (
            <span className="inline-flex items-center rounded-full border border-red-200 dark:border-red-400/40 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 font-medium text-red-700 dark:text-red-400">
              À paraître
            </span>
          ) : article.date ? (
            <span>{article.date}</span>
          ) : null}
        </div>

        <h3 className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {article.title}
        </h3>

        {article.excerpt ? (
          <p className="mt-2 text-sm italic text-neutral-700 dark:text-neutral-300 line-clamp-3">
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

  const showAllTags = sp?.showTags === "all";
  const selected = [...asArray(sp?.tag), ...asArray(sp?.tags)]
    .map(normalizeTag)
    .filter(Boolean);

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

  /* ---------- Filtres & résultats ---------- */
  const tagCount = new Map<string, number>();
  for (const a of resultsBase) {
    for (const t of a.tags ?? []) {
      const k = normalizeTag(t);
      if (!k) continue;
      tagCount.set(k, (tagCount.get(k) ?? 0) + 1);
    }
  }

  const results =
    selected.length === 0
      ? resultsBase
      : resultsBase.filter((a) =>
          selected.every((t) => (a.tags ?? []).includes(t))
        );

  const availableTagCount = new Map<string, number>();
  for (const a of results) {
    for (const t of a.tags ?? []) {
      const k = normalizeTag(t);
      if (!k) continue;
      availableTagCount.set(k, (availableTagCount.get(k) ?? 0) + 1);
    }
  }

  const sortedTags = Array.from(
    (selected.length ? availableTagCount : tagCount).entries()
  )
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  const tagsToShow = showAllTags ? sortedTags : sortedTags.slice(0, 12);

  return (
    <section className="space-y-14">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Articles, séries et archives
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Articles</h1>
        <p className="mt-3 text-[15px] leading-7 text-neutral-700 dark:text-neutral-300">
          Le plus utile pour comprendre ce que je fais aujourd&apos;hui se trouve dans les
          textes récents. Les articles plus anciens restent accessibles parce qu&apos;ils
          montrent un travail construit dans la durée, que je réécris progressivement sans
          l&apos;effacer.
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Commencer ici
            </div>
            <h2 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Trois portes d&apos;entrée selon ce que tu veux comprendre
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Si tu arrives ici comme recruteur, partenaire, client potentiel ou simple
              lecteur curieux, inutile de tout lire dans l&apos;ordre.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href={latestArticle ? `/articles/${latestArticle.slug}` : "#travail-recent"}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/20 p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition"
          >
            <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Le travail récent
            </div>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              Une sélection courte, volontairement diverse, pour voir comment je travaille
              aujourd&apos;hui sur la posture, le cadrage, la relation et la décision.
            </p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              À privilégier si tu veux aller droit au plus représentatif, sans dérouler tout
              l&apos;historique.
            </p>
          </Link>

          <Link
            href={postureSeries?.start?.slug ? `/articles/${postureSeries.start.slug}` : "#retrospectives"}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/20 p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition"
          >
            <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              La logique de fond
            </div>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              Les séries permettent de suivre une mécanique dans le temps : une posture, un
              cadre, une progression, une manière de décider.
            </p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              À lire si tu veux comprendre une méthode, pas seulement un article isolé.
            </p>
          </Link>

          <Link
            href="/articles/archives"
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/20 p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition"
          >
            <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Le temps long
            </div>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              Les archives gardent visibles les textes plus anciens, les premières versions,
              les bifurcations et les changements de ton.
            </p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Utile si tu veux voir que ce site ne s&apos;est pas construit en quelques mois.
            </p>
          </Link>
        </div>
      </section>

      {recentArticles.length > 0 ? (
        <section
          id="travail-recent"
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Travail récent
              </div>
              <h2 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Six textes repères pour comprendre ce que je fais aujourd&apos;hui
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Pas les six plus récents : six entrées volontairement différentes pour voir
                la posture, le process, la décision, le collectif, la relation et le travail
                de clarification.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentArticles.map(({ article, label }) => (
              <ArticlePreviewCard key={article.slug} article={article} eyebrow={label} />
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="retrospectives"
        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8"
      >
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Séries à suivre
          </div>
          <h2 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Pour entrer dans une logique de fond, pas seulement dans un article
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Ces séries servent de points d&apos;entrée éditoriaux. Elles permettent de
            comprendre une ligne de travail, une mécanique ou une bifurcation importante.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {seriesCards.map((s) => {
            const startHref = s.start?.slug ? `/articles/${s.start.slug}` : null;

            return (
              <div
                key={s.slug}
                className="group overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/20"
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
                        <div className="h-56 w-full bg-neutral-900/10 dark:bg-neutral-900/30" />
                      )}
                    </div>
                  </Link>
                ) : (
                  <div>
                    {s.covers.length ? (
                      <Mosaic covers={s.covers} />
                    ) : (
                      <div className="h-56 w-full bg-neutral-900/10 dark:bg-neutral-900/30" />
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Série • {s.items.length} article{s.items.length > 1 ? "s" : ""}
                  </div>

                  <h3 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {s.title}
                  </h3>

                  {(s.teaserBenefit || s.teaserForWhom || s.summary || s.description) ? (
                    <div className="mt-3 space-y-1 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
                      <p>{s.teaserBenefit ?? s.summary ?? s.description}</p>
                      {s.teaserForWhom ? <p>{s.teaserForWhom}</p> : null}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {startHref ? (
                      <Link
                        href={startHref}
                        className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
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

      {/* ======================
          FILTRES
      ====================== */}
      <section
        id="filtres"
        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Filtres
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Si tu arrives avec une question précise, tu peux entrer par thème.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {sortedTags.length > 12 ? (
              showAllTags ? (
                <Link
                  scroll={false}
                  href={hrefFor(selected, false)}
                  className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
                >
                  Voir moins
                </Link>
              ) : (
                <Link
                  scroll={false}
                  href={hrefFor(selected, true)}
                  className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
                >
                  Voir plus ({sortedTags.length - 12})
                </Link>
              )
            ) : null}

            {selected.length > 0 && (
              <Link
                scroll={false}
                href={hrefFor([], showAllTags)}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-900 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950/50"
              >
                Réinitialiser
              </Link>
            )}
          </div>
        </div>

        <ArticlesFilters tagsToShow={tagsToShow} selected={selected} showAllTags={showAllTags} />
      </section>

      {/* ======================
          RÉSULTATS
      ====================== */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Tout le catalogue
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Du plus récent au plus ancien, avec le temps long conservé volontairement.
            </p>
          </div>

          <div className="text-xs text-neutral-500">
            {results.length} article{results.length > 1 ? "s" : ""}
          </div>
        </div>

        {results.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            Aucun article trouvé.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((article) => {
              const futureLabel = !isPublishedParis(article.date ?? null, now);

              return (
                <div key={article.slug} className="space-y-2">
                  <ArticlePreviewCard article={article} futureLabel={futureLabel} />
                  {futureLabel ? (
                    <div className="px-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {(() => {
                        const d = daysUntilParis(article.date ?? null, now);
                        if (typeof d === "number" && d > 0) return `J-${d}`;
                        return article.date ?? "";
                      })()}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex justify-center pt-4">
        <Link
          href="/articles/archives"
          className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          Explorer le temps long →
        </Link>
      </section>
    </section>
  );
}
