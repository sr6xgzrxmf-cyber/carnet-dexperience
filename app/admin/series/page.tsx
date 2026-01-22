import Link from "next/link";
import { getAllSeriesCatalog } from "@/lib/series-catalog";
import { getAllArticlesMetaForSeries } from "@/lib/articles-series";
import { seriesColorClass } from "@/lib/series-ui";

export default function AdminSeriesPage() {
  const seriesCatalog = getAllSeriesCatalog();
  const articles = getAllArticlesMetaForSeries();

  const statsFor = (slug: string) => {
    const items = articles
      .filter((a) => (a.series?.slug ?? "").trim() === slug)
      .sort((a, b) => (a.series?.order ?? 9999) - (b.series?.order ?? 9999));

    const total = items.length;
    const published = items.filter((a) => {
      const d = a.date ? new Date(`${a.date}T00:00:00.000Z`) : null;
      return !d || d.getTime() <= Date.now();
    }).length;

    const toPlan = total - published;
    const next = items.find((a) => {
      const d = a.date ? new Date(`${a.date}T00:00:00.000Z`) : null;
      return d && d.getTime() > Date.now();
    });

    return { total, published, toPlan, nextDate: next?.date ?? "—" };
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des séries</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Catalogue de séries (couleur/titre) + état des articles (publiés, à paraître, à planifier).
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          Retour admin
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {seriesCatalog.map((s) => {
          const st = statsFor(s.slug);

          return (
            <Link
              key={s.slug}
              href={`/admin/series/${s.slug}`}  // ✅ IMPORTANT
              className="block rounded-2xl border p-4 hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${seriesColorClass(s.color)}`} />
                    <div className="truncate font-medium">{s.title}</div>
                  </div>
                  <div className="mt-1 truncate text-xs text-neutral-600">{s.slug}</div>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-600">
                    <span>Total : {st.total}</span>
                    <span>Publiés : {st.published}</span>
                    <span>À planifier : {st.toPlan}</span>
                    <span>Prochaine : {st.nextDate}</span>
                    <span>Statut : {s.status}</span>
                  </div>
                </div>

                <div className="shrink-0 text-sm text-neutral-600">
                  Ouvrir →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
