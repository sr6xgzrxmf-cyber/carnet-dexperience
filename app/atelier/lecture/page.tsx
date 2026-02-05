// app/atelier/lecture/page.tsx
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

export const metadata: Metadata = {
  title: "Mon accompagnement — lecture continue",
  description: "Lecture continue des épisodes de la série Atelier de posture.",
};

function normalizeCoverSrc(cover: unknown): string | null {
  if (typeof cover !== "string" || !cover.trim()) return null;
  const s = cover.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
}

function anchorFromSlug(slug: string) {
  return `s-${slug}`;
}

function getSeries(meta: ArticleMeta | undefined) {
  return meta?.series ?? null;
}

function getSeriesSlug(meta: ArticleMeta | undefined): string | null {
  const s = getSeries(meta);
  return typeof s?.slug === "string" ? s.slug : null;
}

function getSeriesOrder(meta: ArticleMeta | undefined): number | string | null {
  return getSeries(meta)?.order ?? null;
}

/* ---------- Interludes (order décimal) ---------- */
function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return NaN;
}

function isInterlude(order: unknown) {
  const n = toNumber(order);
  return Number.isFinite(n) && !Number.isInteger(n);
}

function orderLabel(order: unknown) {
  const n = toNumber(order);
  if (!Number.isFinite(n)) return "";
  return Number.isInteger(n) ? String(n).padStart(2, "0") : "↳";
}

function orderValue(order: unknown) {
  const n = toNumber(order);
  return Number.isFinite(n) ? n : 9999;
}

/* ---------- J-x (UTC, robuste) ---------- */
function startOfDayUTC(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function daysUntil(date: unknown): number | null {
  const ts = toTimestamp(date);
  if (!ts) return null;

  const todayUTC = startOfDayUTC(new Date());
  const targetUTC = startOfDayUTC(new Date(ts));

  return Math.round((targetUTC - todayUTC) / (24 * 60 * 60 * 1000));
}

export default async function AtelierLecturePage() {
  // En dev: on inclut les futurs pour prévisualiser "À paraître"
  // En prod: on n'inclut pas les futurs
  const includeFuture = process.env.NODE_ENV !== "production";

  const raw = await getAllArticles({ includeFuture });

  const series = (raw ?? [])
    .filter((it) => getSeriesSlug(it?.meta) === "atelier-de-posture")
    .sort(
      (a, b) =>
        orderValue(getSeriesOrder(a?.meta)) - orderValue(getSeriesOrder(b?.meta))
    );

  const rendered = await Promise.all(
    series.map(async (it: ArticleItem) => ({
      slug: it.slug,
      meta: it.meta,
      anchor: anchorFromSlug(it.slug),
      coverSrc: normalizeCoverSrc(it.meta?.cover),
      html: await markdownToHtml(it.content ?? ""),
    }))
  );

  return (
    <section>
      <div className="mx-auto max-w-3xl" id="top">
        {/* Header page */}
        <header className="mb-10 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition"
            aria-label="Retour à l’accueil"
          >
            <span aria-hidden className="text-base leading-none">
              ←
            </span>
            <span>Retour</span>
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight">
            Mon accompagnement
          </h1>

          <p className="text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
            Lecture continue des épisodes de la série <strong>Atelier de posture</strong>.
          </p>

          {/* Sommaire */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-5">
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Sommaire
            </div>

            <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              {rendered.map((it) => {
                const inter = isInterlude(getSeriesOrder(it.meta));
                const isFuture = includeFuture && !isPublishedDate(it.meta?.date);

                const baseLink =
                  "underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-neutral-500 dark:hover:decoration-neutral-500";
                const futureLink = "decoration-red-300 dark:decoration-red-500/50";

                return (
                  <li
                    key={it.slug}
                    className={[
                      inter
                        ? "rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 px-3 py-2"
                        : "",
                      isFuture ? "text-red-700 dark:text-red-400" : "",
                    ].join(" ")}
                  >
                    <a
                      className={[baseLink, isFuture ? futureLink : ""].join(" ")}
                      href={`#${it.anchor}`}
                    >
                      {orderLabel(getSeriesOrder(it.meta))}{" "}
                      <span className="text-neutral-500 dark:text-neutral-500">
                        —
                      </span>{" "}
                      {it.meta?.title ?? it.slug}
                    </a>
                    {inter ? (
                      <span className="ml-2 inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 px-2 py-0.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                        Interlude
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </header>

        {/* Articles enchaînés */}
        <div className="space-y-14">
          {rendered.map((it) => {
            const inter = isInterlude(getSeriesOrder(it.meta));
            const isFuture = includeFuture && !isPublishedDate(it.meta?.date);

            return (
              <article
                key={it.slug}
                id={it.anchor}
                className={[
                  "scroll-mt-24",
                  inter
                    ? "rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8 shadow-sm"
                    : "",
                ].join(" ")}
              >
                {/* Header article */}
                <header className="space-y-4">
                  <div className="text-sm text-neutral-700 dark:text-neutral-300">
                    {inter ? (
                      <div className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Interlude
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                      {/* Localhost: badge À paraître + J-x. Sinon: date normale */}
                      {isFuture ? (
                        <>
                          <span className="inline-flex items-center rounded-full border border-red-200 dark:border-red-400/40 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 font-medium text-red-700 dark:text-red-400 text-[11px]">
                            À paraître
                          </span>
                          {(() => {
                            const d = daysUntil(it.meta?.date);
                            return typeof d === "number" && d > 0 ? (
                              <span className="text-neutral-400 dark:text-neutral-500 text-[12px]">
                                J-{d}
                              </span>
                            ) : null;
                          })()}
                        </>
                      ) : it.meta?.date ? (
                        <span>{String(it.meta.date)}</span>
                      ) : null}

                      <span className="text-neutral-600 dark:text-neutral-400">
                        •
                      </span>

                      <Link
                        href={`/articles/${it.slug}`}
                        className="text-neutral-600 dark:text-neutral-400 hover:underline"
                      >
                        Voir la page de l’article
                      </Link>

                      {inter ? (
                        <>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            •
                          </span>
                          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 px-2 py-0.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                            Interlude
                          </span>
                        </>
                      ) : null}
                    </div>

                    {it.meta?.excerpt ? (
                      <p className="mt-3 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
                        {it.meta.excerpt}
                      </p>
                    ) : null}
                  </div>

                  <h2
                    className={
                      inter
                        ? "text-2xl font-semibold tracking-tight"
                        : "text-3xl font-semibold tracking-tight"
                    }
                  >
                    {it.meta?.title ?? it.slug}
                  </h2>

                  {Array.isArray(it.meta?.tags) && it.meta.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {it.meta.tags.map((t: string) => (
                        <span
                          key={`${it.slug}-${t}`}
                          className="rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300 bg-white/50 dark:bg-neutral-950/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </header>

                {/* Cover : pas d'image si interlude */}
                {it.coverSrc && !inter ? (
                  <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/30">
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={it.coverSrc}
                        alt={it.meta?.title ?? ""}
                        fill
                        priority={orderValue(getSeriesOrder(it.meta)) === 0}
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover"
                        unoptimized
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
                  dangerouslySetInnerHTML={{ __html: it.html }}
                />

                {/* séparateur fin d’article */}
                <div className="mt-14 border-t border-neutral-200 dark:border-neutral-800 pt-6">
                  <a
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline"
                    href="#top"
                  >
                    Remonter ↑
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
