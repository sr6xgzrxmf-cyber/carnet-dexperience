import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getAllArticles,
  getArticleBySlug,
  markdownToHtml,
} from "@/lib/articles";
import GiscusComments from "@/components/GiscusComments";
import ShareBar from "@/components/ShareBar";

export async function generateStaticParams() {
  const all = await getAllArticles();
  return (all ?? []).map((it: any) => ({ slug: it.slug }));
}

function formatDate(date?: string) {
  return date ?? "";
}

function getMeta(item: any) {
  return item?.meta ?? item ?? {};
}

function getSeriesInfo(item: any): { slug?: string; title?: string; order?: number } {
  const m = getMeta(item);
  const s = m?.series;
  return {
    slug: typeof s?.slug === "string" ? s.slug : undefined,
    title: typeof s?.title === "string" ? s.title : undefined,
    order:
      typeof s?.order === "number"
        ? s.order
        : typeof s?.order === "string"
          ? Number(s.order)
          : undefined,
  };
}

function asDateValue(d: any): number {
  if (typeof d !== "string") return 0;
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

function getSlug(item: any): string {
  return item?.slug ?? getMeta(item)?.slug ?? "";
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const item = getArticleBySlug(slug);
  if (!item) return notFound();

  const contentHtml = await markdownToHtml(item.content);

  // =========================
  // A) Série (prev/next par series.order)
  // B) Fallback chrono (prev/next par date)
  // =========================
  const all = await getAllArticles();
  const allItems = all ?? [];

  const current = allItems.find((x: any) => getSlug(x) === slug) ?? item;
  const currentSeries = getSeriesInfo(current);

  let prev: any = null;
  let next: any = null;

  // A) Série
  if (currentSeries.slug && Number.isFinite(currentSeries.order)) {
    const seriesItems = allItems
      .filter((x: any) => getSeriesInfo(x).slug === currentSeries.slug)
      .filter((x: any) => Number.isFinite(getSeriesInfo(x).order))
      .sort(
        (a: any, b: any) => getSeriesInfo(a).order! - getSeriesInfo(b).order!
      );

    const idx = seriesItems.findIndex((x: any) => getSlug(x) === slug);
    prev = idx > 0 ? seriesItems[idx - 1] : null;
    next = idx >= 0 && idx < seriesItems.length - 1 ? seriesItems[idx + 1] : null;
  }

  // B) Fallback chrono si pas de série exploitable
  if (!prev && !next) {
    const sorted = [...allItems].sort(
      (a: any, b: any) =>
        asDateValue(getMeta(b)?.date) - asDateValue(getMeta(a)?.date)
    );
    const idx = sorted.findIndex((x: any) => getSlug(x) === slug);
    prev = idx > 0 ? sorted[idx - 1] : null;
    next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
  }

  return (
    <article>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {item.meta.title}
          </h1>

          <div className="text-sm text-neutral-700 dark:text-neutral-300">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {item.meta.date ? <span>{formatDate(item.meta.date)}</span> : null}
              {item.meta.source ? (
                <span className="text-neutral-600 dark:text-neutral-400">
                  • {item.meta.source}
                </span>
              ) : null}
            </div>

            {item.meta.excerpt ? (
              <p className="mt-3 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
                {item.meta.excerpt}
              </p>
            ) : null}
          </div>

          {Array.isArray(item.meta.tags) && item.meta.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {item.meta.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300 bg-white/50 dark:bg-neutral-950/30"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {/* Cover */}
        {item.meta.cover ? (
          <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/30">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={item.meta.cover}
                alt={item.meta.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        {/* Content */}
        <div
          className="
            mt-10 max-w-none
            text-[14px] leading-7
            text-neutral-900 dark:text-neutral-100

            [&_p]:m-0
            [&_p]:leading-7
            [&_p+_p]:mt-3

            [&_h2]:mt-10
            [&_h2]:mb-2
            [&_h2]:text-xl
            [&_h2]:font-semibold
            [&_h2]:tracking-tight

            [&_h3]:mt-8
            [&_h3]:mb-2
            [&_h3]:text-lg
            [&_h3]:font-semibold
            [&_h3]:tracking-tight

            [&_ul]:my-0
            [&_ul]:list-disc
            [&_ul]:pl-5
            [&_li]:my-1

            [&_ol]:my-0
            [&_ol]:list-decimal
            [&_ol]:pl-5

            [&_p+_ul]:mt-3
            [&_p+_ol]:mt-3
            [&_ul+_p]:mt-3
            [&_ol+_p]:mt-3

            [&_blockquote]:my-6
            [&_blockquote]:border-l-2
            [&_blockquote]:border-neutral-200
            dark:[&_blockquote]:border-neutral-800
            [&_blockquote]:pl-4
            [&_blockquote]:text-neutral-700
            dark:[&_blockquote]:text-neutral-300

            [&_hr]:my-10
            [&_hr]:border-neutral-200
            dark:[&_hr]:border-neutral-800

            [&_a]:underline
            [&_a]:underline-offset-4
            [&_a]:decoration-neutral-300
            dark:[&_a]:decoration-neutral-700
            hover:[&_a]:decoration-neutral-500
            dark:hover:[&_a]:decoration-neutral-500
          "
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Série / Chrono : Précédent / Suivant */}
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-8">
          {prev ? (
            <Link
              href={`/articles/${getSlug(prev)}`}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-white/70 dark:hover:bg-neutral-950/50"
            >
              ← Précédent
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/articles/${getSlug(next)}`}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-white/70 dark:hover:bg-neutral-950/50"
            >
              Suivant →
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Share + Comments */}
        <ShareBar title={item.meta.title} />
        <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-10">
          <GiscusComments />
        </div>

        {/* Footer nav */}
        <footer className="mt-14 border-t border-neutral-200 dark:border-neutral-800 pt-8 text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            <Link href="/articles" className="hover:underline">
              ← Revenir à la liste des articles
            </Link>
          </p>
        </footer>
      </div>
    </article>
  );
}