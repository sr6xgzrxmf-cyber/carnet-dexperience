import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getAllArticles,
  markdownToHtml,
  isPublishedDate,
  toTimestamp,
  type ArticleItem,
  type ArticleMeta,
} from "@/lib/articles";
import styles from "@/app/editorial-system.module.css";

export const metadata: Metadata = {
  title: "Atelier de posture — lecture continue",
  description:
    "La série Atelier de posture en lecture continue : clarifier, cadrer et transmettre dans les situations de travail.",
};

export const revalidate = 300;

function normalizeCoverSrc(cover: unknown): string | null {
  if (typeof cover !== "string" || !cover.trim()) return null;
  const source = cover.trim();
  if (/^https?:\/\//i.test(source)) return source;
  return source.startsWith("/") ? source : `/${source}`;
}

function anchorFromSlug(slug: string) {
  return `s-${slug}`;
}

function getSeries(meta: ArticleMeta | undefined) {
  return meta?.series ?? null;
}

function getSeriesSlug(meta: ArticleMeta | undefined): string | null {
  const series = getSeries(meta);
  return typeof series?.slug === "string" ? series.slug : null;
}

function getSeriesOrder(meta: ArticleMeta | undefined): number | string | null {
  return getSeries(meta)?.order ?? null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number.NaN;
}

function isInterlude(order: unknown) {
  const value = toNumber(order);
  return Number.isFinite(value) && !Number.isInteger(value);
}

function orderLabel(order: unknown) {
  const value = toNumber(order);
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value).padStart(2, "0") : "↳";
}

function orderValue(order: unknown) {
  const value = toNumber(order);
  return Number.isFinite(value) ? value : 9999;
}

function startOfDayUTC(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function daysUntil(date: unknown): number | null {
  const timestamp = toTimestamp(date);
  if (!timestamp) return null;
  return Math.round(
    (startOfDayUTC(new Date(timestamp)) - startOfDayUTC(new Date())) /
      (24 * 60 * 60 * 1000)
  );
}

export default async function AtelierLecturePage() {
  const includeFuture = process.env.NODE_ENV !== "production";
  const raw = await getAllArticles({ includeFuture });
  const series = (raw ?? [])
    .filter((item) => getSeriesSlug(item?.meta) === "atelier-de-posture")
    .sort(
      (a, b) =>
        orderValue(getSeriesOrder(a?.meta)) - orderValue(getSeriesOrder(b?.meta))
    );

  const rendered = await Promise.all(
    series.map(async (item: ArticleItem) => ({
      slug: item.slug,
      meta: item.meta,
      anchor: anchorFromSlug(item.slug),
      coverSrc: normalizeCoverSrc(item.meta?.cover),
      html: await markdownToHtml(item.content ?? ""),
    }))
  );

  return (
    <div className={styles.page} id="top">
      <header className={styles.pageHeader}>
        <Link href="/atelier" className={styles.backLink}>
          <span aria-hidden>←</span>
          <span>Retour à l’accompagnement</span>
        </Link>
        <div className={styles.pageHeaderSplit} style={{ marginTop: 34 }}>
          <div>
            <p className={styles.eyebrow}>Série · lecture continue</p>
            <h1 className={styles.title}>Atelier de posture</h1>
          </div>
          <p className={styles.headerNote}>
            Une série à lire comme un cheminement&nbsp;: chaque épisode part d’une
            situation de travail et précise une manière de clarifier, cadrer ou
            transmettre sans prendre la place de l’autre.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.softSurface}>
          <p className={styles.eyebrow}>Sommaire</p>
          <ol className={styles.archiveList}>
            {rendered.map((item) => {
              const future = includeFuture && !isPublishedDate(item.meta?.date);
              return (
                <li key={item.slug} className={styles.archiveItem}>
                  <a href={`#${item.anchor}`} className={styles.archiveLink}>
                    <span className={styles.archiveDate}>
                      {orderLabel(getSeriesOrder(item.meta))}
                    </span>
                    <span className={styles.archiveTitle}>
                      {item.meta?.title ?? item.slug}
                    </span>
                    <span className={styles.archiveSeries}>
                      {future ? "À paraître" : String(item.meta?.date ?? "")}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <div className={styles.reading}>
        {rendered.map((item) => {
          const interlude = isInterlude(getSeriesOrder(item.meta));
          const future = includeFuture && !isPublishedDate(item.meta?.date);
          const remainingDays = future ? daysUntil(item.meta?.date) : null;

          return (
            <article
              key={item.slug}
              id={item.anchor}
              className={interlude ? styles.softSurface : ""}
              style={{
                scrollMarginTop: 96,
                marginBottom: 84,
                paddingTop: interlude ? undefined : 36,
                borderTop: interlude ? undefined : "1px solid var(--line)",
              }}
            >
              <header>
                <p className={styles.eyebrow}>
                  {interlude ? "Interlude" : orderLabel(getSeriesOrder(item.meta))}
                  {future
                    ? ` · À paraître${
                        typeof remainingDays === "number" && remainingDays > 0
                          ? ` · J-${remainingDays}`
                          : ""
                      }`
                    : item.meta?.date
                      ? ` · ${String(item.meta.date)}`
                      : ""}
                </p>
                <h2 className={styles.titleCompact}>{item.meta?.title ?? item.slug}</h2>
                {item.meta?.excerpt ? (
                  <p className={styles.lead}>{item.meta.excerpt}</p>
                ) : null}

                {Array.isArray(item.meta?.tags) && item.meta.tags.length > 0 ? (
                  <div className={styles.tags}>
                    {item.meta.tags.map((tag: string) => (
                      <span key={`${item.slug}-${tag}`} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </header>

              {item.coverSrc && !interlude ? (
                <div className={styles.cover}>
                  <Image
                    src={item.coverSrc}
                    alt={item.meta?.title ?? ""}
                    fill
                    priority={orderValue(getSeriesOrder(item.meta)) === 0}
                    sizes="(max-width: 768px) 100vw, 780px"
                    unoptimized
                  />
                </div>
              ) : null}

              <div
                className={styles.prose}
                dangerouslySetInnerHTML={{ __html: item.html }}
              />

              <footer className={styles.readingNav}>
                <Link href={`/articles/${item.slug}`} className={styles.textLink}>
                  Ouvrir l’article
                </Link>
                <a href="#top" className={styles.textLink}>
                  Remonter ↑
                </a>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
