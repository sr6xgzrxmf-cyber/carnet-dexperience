import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import {
  getAllArticles,
  getArticleBySlug,
  isPublishedDate,
  markdownToHtml,
  type ArticleItem,
} from "@/lib/articles";
import GiscusComments from "@/components/GiscusComments";
import ShareBar from "@/components/ShareBar";
import type { Metadata } from "next";
import { formatTagLabel } from "@/lib/editorial-labels";
import styles from "@/app/editorial.module.css";

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await getAllArticles({ includeFuture: true });
  return (all ?? []).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const item = getArticleBySlug(resolvedParams.slug, { includeFuture: true });
  if (!item) return {};
  const published = isPublishedDate(item.meta?.date, new Date());

  return {
    title: item.meta?.title ?? resolvedParams.slug,
    description:
      typeof item.meta?.excerpt === "string" && item.meta.excerpt.trim()
        ? item.meta.excerpt.trim()
        : undefined,
    robots: published ? { index: true, follow: true } : { index: false, follow: false },
  };
}

function formatDate(
  date?: string | number | Date | { date?: unknown; value?: unknown }
) {
  if (!date) return "";
  if (typeof date === "string") return date;
  if (typeof date === "number") return new Date(date).toISOString().slice(0, 10);
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  if (typeof date === "object") {
    const obj = date as { date?: unknown; value?: unknown };
    if (typeof obj.date === "string") return obj.date;
    if (typeof obj.value === "string") return obj.value;
  }
  return "";
}

function getSeriesInfo(item: ArticleItem): {
  slug?: string;
  title?: string;
  order?: number;
} {
  const series = item?.meta?.series as
    | { slug?: unknown; title?: unknown; name?: unknown; order?: unknown }
    | undefined;

  return {
    slug: typeof series?.slug === "string" ? series.slug : undefined,
    title:
      typeof series?.title === "string"
        ? series.title
        : typeof series?.name === "string"
          ? series.name
          : undefined,
    order:
      typeof series?.order === "number"
        ? series.order
        : typeof series?.order === "string"
          ? Number(series.order)
          : undefined,
  };
}

function asDateValue(date: unknown): number {
  if (typeof date !== "string") return 0;
  const timestamp = Date.parse(date);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getSlug(item: ArticleItem): string {
  return item?.slug ?? "";
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getArticleBySlug(slug, { includeFuture: true });
  if (!item) return notFound();

  const isFuture = !isPublishedDate(item.meta?.date, new Date());
  const contentHtml = await markdownToHtml(item.content);
  const siteUrl = "https://www.carnetdexperience.fr";

  function toAbsoluteUrl(url?: string) {
    if (!url) return undefined;
    const value = String(url).trim();
    if (!value) return undefined;
    if (/^https?:\/\//i.test(value)) return value;
    return `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`;
  }

  const coverUrl = toAbsoluteUrl(item.meta?.cover);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteUrl}/articles/${slug}#article`,
    headline: item.meta?.title ?? slug,
    description: item.meta?.excerpt ?? "",
    datePublished: item.meta?.date ? String(item.meta.date) : undefined,
    dateModified: item.meta?.date ? String(item.meta.date) : undefined,
    mainEntityOfPage: `${siteUrl}/articles/${slug}`,
    author: { "@id": `${siteUrl}/#laurent-guyonnet` },
    publisher: { "@id": `${siteUrl}/#website` },
    image: coverUrl ? [coverUrl] : undefined,
  };

  const allItems = (await getAllArticles({ includeFuture: true })) ?? [];
  const current = allItems.find((candidate) => getSlug(candidate) === slug) ?? item;
  const currentSeries = getSeriesInfo(current);
  let prev: ArticleItem | null = null;
  let next: ArticleItem | null = null;

  if (currentSeries.slug && Number.isFinite(currentSeries.order)) {
    const seriesItems = allItems
      .filter((candidate) => getSeriesInfo(candidate).slug === currentSeries.slug)
      .filter((candidate) => Number.isFinite(getSeriesInfo(candidate).order))
      .sort((a, b) => getSeriesInfo(a).order! - getSeriesInfo(b).order!);
    const index = seriesItems.findIndex((candidate) => getSlug(candidate) === slug);
    prev = index > 0 ? seriesItems[index - 1] : null;
    next =
      index >= 0 && index < seriesItems.length - 1 ? seriesItems[index + 1] : null;
  }

  if (!prev && !next) {
    const sorted = [...allItems].sort(
      (a, b) => asDateValue(a.meta?.date) - asDateValue(b.meta?.date)
    );
    const index = sorted.findIndex((candidate) => getSlug(candidate) === slug);
    prev = index > 0 ? sorted[index - 1] : null;
    next = index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null;
  }

  return (
    <article className={`${styles.page} ${styles.reading}`}>
      <Script
        id={`jsonld-article-${slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <header className={styles.readingHeader}>
        <Link href="/articles" className={styles.backLink}>
          <span aria-hidden>←</span>
          <span>Retour aux articles</span>
        </Link>

        <p className={styles.eyebrow} style={{ marginTop: 34 }}>
          {currentSeries.title ? `${currentSeries.title} · ` : ""}
          {item.meta.date ? formatDate(item.meta.date) : "Carnet d’expérience"}
        </p>
        <h1 className={styles.titleCompact}>{item.meta.title}</h1>

        {item.meta.excerpt ? (
          <p className={styles.lead}>{item.meta.excerpt}</p>
        ) : null}

        <div className={styles.readingMeta}>
          {item.meta.source ? <span>{item.meta.source}</span> : null}
          {isFuture ? <span className={styles.tag}>À paraître</span> : null}
        </div>

        {item.meta.impact && (item.meta.impact.text || item.meta.impact.example) ? (
          <div className={styles.impact}>
            <p className={styles.cardEyebrow}>Impact · mise en pratique</p>
            {item.meta.impact.text ? (
              <p className={styles.cardCopy}>{item.meta.impact.text}</p>
            ) : null}
            {item.meta.impact.example ? (
              <p className={styles.cardCopy}>Exemple&nbsp;: {item.meta.impact.example}</p>
            ) : null}
          </div>
        ) : null}

        {Array.isArray(item.meta.tags) && item.meta.tags.length > 0 ? (
          <div className={styles.tags}>
            {item.meta.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/articles?tag=${encodeURIComponent(tag)}`}
                aria-label={`Voir les articles sur ${formatTagLabel(tag)}`}
                className={styles.tag}
              >
                {formatTagLabel(tag)}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {item.meta.cover ? (
        <div className={styles.cover}>
          <Image
            src={item.meta.cover}
            alt={item.meta.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 780px"
          />
        </div>
      ) : null}

      <div
        className={styles.prose}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <nav className={styles.readingNav} aria-label="Articles précédent et suivant">
        {prev ? (
          <Link href={`/articles/${getSlug(prev)}`} className={styles.textLink}>
            ← Précédent
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/articles/${getSlug(next)}`} className={styles.textLink}>
            Suivant →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <ShareBar title={item.meta.title} />

      <div className="mt-14 border-t border-[var(--line)] pt-10">
        <GiscusComments />
      </div>

      <footer className="mt-14 border-t border-[var(--line)] pt-8">
        <Link href="/articles" className={styles.textLink}>
          ← Revenir à la liste des articles
        </Link>
      </footer>
    </article>
  );
}
