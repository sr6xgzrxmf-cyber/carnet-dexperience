import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/articles";
import { normalizeArticleDate } from "@/lib/article-date";
import { formatReadingTime } from "@/lib/reading-time";
import styles from "@/app/editorial-system.module.css";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

function formatDate(input?: unknown): string {
  const iso = normalizeArticleDate(input);
  if (!iso) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export default function NotFound() {
  const latest = getPublishedArticles().slice(0, 4);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderSplit}>
          <div>
            <p className={styles.eyebrow}>Erreur 404</p>
            <h1 className={styles.title}>Cette page n’existe pas (ou plus)</h1>
          </div>
          <p className={styles.headerNote}>
            Le lien est peut-être ancien, ou l’adresse comporte une coquille. Le carnet,
            lui, est toujours là : voici par où reprendre.
          </p>
        </div>

        <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/articles" className={`${styles.button} ${styles.buttonPrimary}`}>
            Parcourir les articles
          </Link>
          <Link href="/series" className={`${styles.button} ${styles.buttonSecondary}`}>
            Voir les séries
          </Link>
        </div>
      </header>

      {latest.length ? (
        <section className={styles.section}>
          <div className={styles.catalogHeader}>
            <div>
              <p className={styles.eyebrow}>En attendant</p>
            </div>
          </div>

          <ul className={styles.archiveList}>
            {latest.map((item) => {
              const reading = formatReadingTime(item.readingMinutes);

              return (
                <li key={item.slug} className={styles.archiveItem}>
                  <Link href={`/articles/${item.slug}`} className={styles.archiveLink}>
                    <span className={styles.archiveDate}>{formatDate(item.meta.date)}</span>
                    <span className={styles.archiveTitle}>{item.meta.title}</span>
                    <span className={styles.archiveSeries}>{reading ?? ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
