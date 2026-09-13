import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSeriesWithEpisodes, getSeriesWithEpisodes } from "@/lib/series-pages";
import { normalizeArticleDate } from "@/lib/article-date";
import { formatReadingTime } from "@/lib/reading-time";
import styles from "@/app/editorial-system.module.css";

const siteUrl = "https://www.carnetdexperience.fr";

export const revalidate = 300;

const allowFuture =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

export function generateStaticParams() {
  return getAllSeriesWithEpisodes({ includeFuture: allowFuture }).map((entry) => ({
    slug: entry.series.slug,
  }));
}

function formatDate(input?: unknown): string {
  const iso = normalizeArticleDate(input);
  if (!iso) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getSeriesWithEpisodes(slug, { includeFuture: allowFuture });
  if (!entry) return {};

  const { series, episodes } = entry;
  const description =
    series.description ??
    `Les ${episodes.length} épisodes de la série « ${series.title} », dans l’ordre de lecture.`;
  const cover = episodes.find(({ item }) => item.meta.cover)?.item.meta.cover;

  return {
    title: series.title,
    description,
    alternates: { canonical: `${siteUrl}/series/${series.slug}` },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: `${siteUrl}/series/${series.slug}`,
      title: series.title,
      description,
      images: [
        {
          url: cover ? new URL(cover, siteUrl).toString() : `${siteUrl}/og.png`,
          alt: series.title,
        },
      ],
    },
  };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getSeriesWithEpisodes(slug, { includeFuture: allowFuture });
  if (!entry) return notFound();

  const { series, episodes, readingMinutes } = entry;
  const first = episodes.find((episode) => episode.published) ?? episodes[0];
  const totalReading = formatReadingTime(readingMinutes);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Link href="/series" className={styles.backLink}>
          <span aria-hidden>←</span>
          <span>Toutes les séries</span>
        </Link>

        <div className={styles.pageHeaderSplit} style={{ marginTop: 34 }}>
          <div>
            <p className={styles.eyebrow}>
              Série · {episodes.length} épisode{episodes.length > 1 ? "s" : ""}
              {totalReading ? ` · ${totalReading}` : ""}
            </p>
            <h1 className={styles.title}>{series.title}</h1>
          </div>
          {series.description ? (
            <p className={styles.headerNote}>{series.description}</p>
          ) : null}
        </div>

        {first ? (
          <div style={{ marginTop: 28 }}>
            <Link
              href={`/articles/${first.item.slug}`}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Commencer par le premier épisode
            </Link>
          </div>
        ) : null}
      </header>

      <section className={styles.section}>
        <div className={styles.catalogHeader}>
          <div>
            <p className={styles.eyebrow}>Dans l’ordre de lecture</p>
          </div>
          <div className={styles.count}>
            {episodes.length} article{episodes.length > 1 ? "s" : ""}
          </div>
        </div>

        <ul className={styles.archiveList}>
          {episodes.map(({ item, published }, index) => {
            const reading = formatReadingTime(item.readingMinutes);

            return (
              <li key={item.slug} className={styles.archiveItem}>
                <Link href={`/articles/${item.slug}`} className={styles.archiveLink}>
                  <span className={styles.archiveDate}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.archiveTitle}>
                    {item.meta.title}
                    {!published ? <small className={styles.tag}>À paraître</small> : null}
                  </span>
                  <span className={styles.archiveSeries}>
                    {[formatDate(item.meta.date), reading].filter(Boolean).join(" · ")}
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
