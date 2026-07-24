import Link from "next/link";
import type { Metadata } from "next";
import { getAllArticles, isPublishedDate, type ArticleItem } from "@/lib/articles";
import { getAllSeriesCatalog } from "@/lib/series-catalog";
import styles from "@/app/editorial.module.css";

export const metadata: Metadata = {
  title: "Archives des articles",
  description:
    "Tous les articles, du plus récent au plus ancien, pour conserver le temps long du travail et ses premières versions.",
};

type ArticleMeta = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  source?: string;
  series?: { name?: string; slug?: string; order?: number };
};

function getItemMeta(item: ArticleItem): ArticleMeta {
  const meta = item?.meta ?? {};
  const rawDate = meta?.date;
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
    meta?.series && typeof meta.series === "object"
      ? (meta.series as { name?: unknown; slug?: unknown; order?: unknown })
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
          order: Number.isFinite(seriesOrder) ? seriesOrder : undefined,
        }
      : undefined;

  return {
    slug: item?.slug ?? "",
    title: meta?.title ?? "",
    date,
    excerpt: meta?.excerpt ?? "",
    source: meta?.source ?? "Carnet d’expérience",
    series,
  };
}

export default async function ArticlesArchivesPage(props: {
  searchParams?: Promise<{ series?: string }>;
}) {
  const searchParams = await props.searchParams;
  const selectedSeries = searchParams?.series ?? null;

  const raw = await getAllArticles();
  const allItems = (raw ?? []).map(getItemMeta).filter((article) => article.slug);
  let items = [...allItems].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? "")
  );

  if (selectedSeries) {
    items = items.filter((article) => article.series?.slug === selectedSeries);
  }

  const usedSeriesSlugs = new Set(
    allItems
      .map((article) => article.series?.slug)
      .filter((value): value is string => typeof value === "string" && value.length > 0)
  );

  const uniqueSeries = getAllSeriesCatalog()
    .filter((series) => usedSeriesSlugs.has(series.slug))
    .sort((a, b) => a.title.localeCompare(b.title, "fr"));

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Link href="/articles" className={styles.backLink}>
          <span aria-hidden>←</span>
          <span>Retour aux articles</span>
        </Link>
        <div className={styles.pageHeaderSplit} style={{ marginTop: 34 }}>
          <div>
            <p className={styles.eyebrow}>Le temps long</p>
            <h1 className={styles.title}>Archives</h1>
          </div>
          <p className={styles.headerNote}>
            Les textes anciens restent visibles volontairement. Ils montrent les
            premières versions, les bifurcations et l’évolution d’une ligne de
            travail qui ne s’est pas construite en quelques mois.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.catalogHeader}>
          <div>
            <p className={styles.eyebrow}>Filtrer par série</p>
            <div className={styles.tags}>
              <Link
                href="/articles/archives"
                className={`${styles.tag} ${
                  selectedSeries === null ? "border-neutral-900 bg-neutral-900 text-white" : ""
                }`}
              >
                Toutes les séries
              </Link>
              {uniqueSeries.map((series) => (
                <Link
                  key={series.slug}
                  href={`/articles/archives?series=${series.slug}`}
                  className={`${styles.tag} ${
                    selectedSeries === series.slug
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : ""
                  }`}
                >
                  {series.title}
                </Link>
              ))}
            </div>
          </div>
          <div className={styles.count}>
            {items.length} article{items.length !== 1 ? "s" : ""}
          </div>
        </div>

        <ul className={styles.archiveList}>
          {items.map((article) => {
            const published = isPublishedDate(article.date, new Date());
            return (
              <li key={article.slug} className={styles.archiveItem}>
                <Link
                  href={`/articles/${article.slug}`}
                  className={styles.archiveLink}
                >
                  <span className={styles.archiveDate}>{article.date}</span>
                  <span className={styles.archiveTitle}>
                    {article.title}
                    {!published ? <small className={styles.tag}>À paraître</small> : null}
                  </span>
                  <span className={styles.archiveSeries}>
                    {article.series?.name ?? ""}
                    {article.series?.order !== undefined
                      ? ` · ${article.series.order + 1}`
                      : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
