// app/atelier/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllArticles, markdownToHtml, isPublishedDate, toTimestamp } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Atelier de posture",
  description: "Lecture continue des épisodes de la série Atelier de posture.",
};

function normalizeCoverSrc(cover: unknown): string | null {
  if (typeof cover !== "string" || !cover.trim()) return null;
  return cover.startsWith("/") ? cover : `/${cover}`;
}

function anchorFromSlug(slug: string) {
  return `s-${slug}`;
}

/* ---------- Interludes (order décimal) ---------- */
function toNumber(v: any): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return NaN;
}

function isInterlude(order: any) {
  const n = toNumber(order);
  return Number.isFinite(n) && !Number.isInteger(n);
}

function orderLabel(order: any) {
  const n = toNumber(order);
  if (!Number.isFinite(n)) return "";
  return Number.isInteger(n) ? String(n).padStart(2, "0") : "↳";
}

function orderValue(order: any) {
  const n = toNumber(order);
  return Number.isFinite(n) ? n : 9999;
}

/* ---------- J-x (UTC, robuste) ---------- */
function startOfDayUTC(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function daysUntil(date: any): number | null {
  const ts = toTimestamp(date);
  if (!ts) return null;

  const todayUTC = startOfDayUTC(new Date());
  const targetUTC = startOfDayUTC(new Date(ts));

  return Math.round((targetUTC - todayUTC) / (24 * 60 * 60 * 1000));
}

/* (Optionnel) si tu veux encore insérer un bloc "outil" sans passer par un interlude-article */
function ToolBox() {
  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Outil — La fiche de clarification
      </div>

      <p className="mt-3 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
        Une fiche courte pour passer du flou à une prochaine action : faits, tension, décision, puis message à envoyer.
        Zéro blabla, que du praticable.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/downloads/fiche-atelier-de-posture.pdf"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-900 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950/50"
        >
          Télécharger le PDF
        </Link>

        <Link
          href="/atelier/fiche"
          className="text-sm text-neutral-700 underline underline-offset-4 dark:text-neutral-300"
        >
          Répondre en ligne (et recevoir ton récap)
        </Link>

        <span className="text-xs text-neutral-500">
          Discret, utile, sans inscription forcée.
        </span>
      </div>
    </section>
  );
}

export default async function AtelierPage() {
  // ✅ En local: on inclut les futurs pour prévisualiser "À paraître"
  // ✅ Sur Vercel (preview/prod): on n'inclut pas les futurs
  const isLocalhost = !process.env.VERCEL_ENV;

  const raw = await getAllArticles({ includeFuture: isLocalhost });

  const series = (raw ?? [])
    .filter((it) => it?.meta?.series?.slug === "atelier-de-posture")
    .sort(
      (a, b) =>
        orderValue(a?.meta?.series?.order) - orderValue(b?.meta?.series?.order)
    );

  const rendered = await Promise.all(
    series.map(async (it) => ({
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
            href="/articles"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition"
            aria-label="Retour à la liste des articles"
          >
            <span aria-hidden className="text-base leading-none">←</span>
            <span>Retour</span>
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight">Atelier de posture</h1>

          <p className="text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
            Lecture continue de la série, dans l’ordre. Sommaire puis textes complets.
          </p>

          {/* Sommaire */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-5">
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Sommaire
            </div>

            <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              {rendered.map((it) => {
                const inter = isInterlude(it.meta?.series?.order);
                const isFuture = isLocalhost && !isPublishedDate(it.meta?.date);

                return (
                  <li
                    key={it.slug}
                    className={[
                      inter ? "pl-5 opacity-90" : "",
                      isFuture ? "text-red-700 dark:text-red-400" : "",
                    ].join(" ")}
                  >
                    <a
                      className={[
                        "underline underline-offset-4",
                        isFuture ? "decoration-red-300 dark:decoration-red-500/50" : "",
                      ].join(" ")}
                      href={`#${it.anchor}`}
                    >
                      {orderLabel(it.meta?.series?.order)} — {it.meta?.title ?? it.slug}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </header>

        {/* Articles enchaînés */}
        <div className="space-y-14">
          {rendered.map((it) => {
            const inter = isInterlude(it.meta?.series?.order);
            const isFuture = isLocalhost && !isPublishedDate(it.meta?.date);

            return (
              <article key={it.slug} id={it.anchor} className="scroll-mt-24">
                {/* Header article */}
                <header className="space-y-4">
                  <div className="text-sm text-neutral-700 dark:text-neutral-300">
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
                      ) : (
                        it.meta?.date ? <span>{String(it.meta.date)}</span> : null
                      )}

                      <span className="text-neutral-600 dark:text-neutral-400">•</span>
                      <Link
                        href={`/articles/${it.slug}`}
                        className="text-neutral-600 dark:text-neutral-400 hover:underline"
                      >
                        Voir la page de l’article
                      </Link>
                    </div>

                    {it.meta?.excerpt ? (
                      <p className="mt-3 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
                        {it.meta.excerpt}
                      </p>
                    ) : null}
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight">
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
                        priority={orderValue(it.meta?.series?.order) === 0}
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