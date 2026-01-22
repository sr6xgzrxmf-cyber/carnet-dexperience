export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllSeriesCatalog } from "@/lib/series-catalog";
import { getAllArticlesMetaForSeries } from "@/lib/articles-series";
import { seriesColorClass } from "@/lib/series-ui";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const seriesCatalog = getAllSeriesCatalog();
  return seriesCatalog.map((s) => ({ slug: s.slug }));
}

export default async function AdminSeriesDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = (rawSlug ?? "").trim();

  const seriesCatalog = getAllSeriesCatalog();
  const series = seriesCatalog.find((s) => s.slug === slug);

  const articles = getAllArticlesMetaForSeries()
    .filter((a) => (a.series?.slug ?? "").trim() === slug)
    .sort((a, b) => (a.series?.order ?? 9999) - (b.series?.order ?? 9999));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {series ? (
              <span
                className={`h-3 w-3 rounded-full ${seriesColorClass(series.color)}`}
              />
            ) : null}

            <h1 className="truncate text-2xl font-semibold">
              Série : {(series?.title ?? slug) || "—"}
            </h1>
          </div>

          <p className="mt-1 truncate text-sm text-neutral-600">{slug || "—"}</p>
        </div>

        <Link
          href="/admin/series"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          ← Séries
        </Link>
      </div>

      {!slug ? (
        <p className="mt-6 rounded-xl border p-4 text-sm text-neutral-700">
          Aucun slug de série fourni (slug vide). Si tu vois ça, on a encore un
          souci de routing.
        </p>
      ) : (
        <section className="mt-6 rounded-2xl border p-4">
          <div className="text-sm text-neutral-700">
            {articles.length} article(s) dans cette série (triés par{" "}
            <code>series.order</code>).
          </div>

<ul className="mt-4 space-y-2">
  {articles.map((a) => {
    const orderNum =
      typeof a.series?.order === "number"
        ? a.series.order
        : Number(a.series?.order);

    const isConnexe =
      Number.isFinite(orderNum) && !Number.isInteger(orderNum);

    return (
      <li
        key={a.slug}
        className={[
          "flex items-center justify-between rounded-xl border p-3",
          isConnexe ? "ml-6 bg-neutral-50/60" : "",
        ].join(" ")}
      >
        <div className="min-w-0">
          <div className="truncate text-sm font-medium flex items-center gap-2">
            {isConnexe && (
              <span className="text-neutral-400 select-none">↳</span>
            )}
            <span className={isConnexe ? "italic text-neutral-700" : ""}>
              {a.title}
            </span>
          </div>

          <div className="truncate text-xs text-neutral-600">
            order: {a.series?.order ?? "—"} · date: {a.date ?? "—"} · {a.slug}
          </div>
        </div>

        <div className="shrink-0 text-xs text-neutral-500">
          (édition + drag&drop : prochaine étape)
        </div>
      </li>
    );
  })}
</ul>       </section>
      )}
    </main>
  );
}