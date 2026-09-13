import Link from "next/link";
import type { Metadata } from "next";
import { getAllSeriesWithEpisodes } from "@/lib/series-pages";
import { formatReadingTime } from "@/lib/reading-time";
import styles from "@/app/editorial-system.module.css";

export const metadata: Metadata = {
  title: "Les séries",
  description:
    "Les séries du carnet : des lignes de travail suivies sur plusieurs articles, à lire dans l’ordre pour comprendre une mécanique de bout en bout.",
  alternates: { canonical: "https://www.carnetdexperience.fr/series" },
};

export const revalidate = 300;

const allowFuture =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

export default function SeriesIndexPage() {
  const entries = getAllSeriesWithEpisodes({ includeFuture: allowFuture }).sort(
    (a, b) => b.episodes.length - a.episodes.length,
  );

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Link href="/articles" className={styles.backLink}>
          <span aria-hidden>←</span>
          <span>Retour aux articles</span>
        </Link>

        <div className={styles.pageHeaderSplit} style={{ marginTop: 34 }}>
          <div>
            <p className={styles.eyebrow}>Lire dans l’ordre</p>
            <h1 className={styles.title}>Les séries</h1>
          </div>
          <p className={styles.headerNote}>
            Certains sujets ne tiennent pas dans un seul texte. Ces séries suivent une
            ligne de travail sur plusieurs articles : on peut les prendre en cours de
            route, mais elles se lisent mieux dans l’ordre.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.grid3}>
          {entries.map(({ series, episodes, readingMinutes }) => {
            const reading = formatReadingTime(readingMinutes);

            return (
              <Link key={series.slug} href={`/series/${series.slug}`} className={styles.card}>
                <p className={styles.cardEyebrow}>
                  {episodes.length} épisode{episodes.length > 1 ? "s" : ""}
                  {reading ? ` · ${reading}` : ""}
                </p>
                <h2 className={styles.cardTitle}>{series.title}</h2>
                {series.description ? (
                  <p className={styles.cardCopy}>{series.description}</p>
                ) : null}
                <span className={styles.cardLink}>
                  Voir la série <span aria-hidden>→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
