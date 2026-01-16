// app/articles/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";
import { featuredSeriesList } from "@/content/editorial";

type SearchParams = {
  tag?: string | string[];
  tags?: string | string[];
  showTags?: string; // "all"
};

type ArticleMeta = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  cover?: string | null;
  source?: string;
  tags?: string[];
  series?: { name?: string; slug?: string; order?: number };
};

function asArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap((x) => String(x).split(","));
  return String(v).split(",");
}

function normalizeTag(t: string) {
  return t.trim();
}

function normalizeCoverSrc(cover: unknown): string | null {
  if (typeof cover !== "string" || !cover.trim()) return null;
  return cover.startsWith("/") ? cover : `/${cover}`;
}

function getItemMeta(item: any): ArticleMeta {
  const m = item?.meta ?? item ?? {};
  return {
    slug: item?.slug ?? m?.slug ?? "",
    title: m?.title ?? "",
    date: m?.date ?? "",
    excerpt: m?.excerpt ?? "",
    cover: m?.cover ?? m?.image ?? m?.hero ?? null,
    source: m?.source ?? "Carnet d’expérience",
    tags: Array.isArray(m?.tags) ? m.tags : [],
    series: m?.series ?? undefined,
  };
}

/* ---------- Mosaic (covers séries) ---------- */
function Mosaic({ covers }: { covers: string[] }) {
  const c = covers.slice(0, 5);
  const count = c.length;

  const gridClass =
    count <= 2 ? "grid-cols-2" : count === 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="relative h-56 w-full overflow-hidden">
      <div className={`grid h-full w-full ${gridClass} gap-[2px] bg-black/30`}>
        {c.map((src, idx) => {
          const spanForFive =
            count === 5 && idx === 4 ? "row-span-2 col-span-1" : "";
          return (
            <div
              key={`${src}-${idx}`}
              className={`relative overflow-hidden ${spanForFive}`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                unoptimized
              />
            </div>
          );
        })}
      </div>

      {/* voile + vignettage premium */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
    </div>
  );
}

function hrefFor(nextTags: string[], showAllTags: boolean) {
  const params = new URLSearchParams();
  nextTags.forEach((t) => params.append("tag", t));
  if (showAllTags) params.set("showTags", "all");
  return `/articles${params.toString() ? `?${params.toString()}` : ""}`;
}

export default async function ArticlesHubPage(props: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const sp =
    props.searchParams instanceof Promise
      ? await props.searchParams
      : props.searchParams;

  const showAllTags = sp?.showTags === "all";
  const selected = [...asArray(sp?.tag), ...asArray(sp?.tags)]
    .map(normalizeTag)
    .filter(Boolean);

  const raw = await getAllArticles();
  const all = (raw ?? []).map(getItemMeta).filter((a) => a.slug);

  /* ---------- Séries (Par où commencer) ---------- */
  const seriesCards = featuredSeriesList.map((s) => {
    const items = all
      .filter((a) => a.series?.slug === s.slug)
      .sort((a, b) => (a.series?.order ?? 9999) - (b.series?.order ?? 9999));

    const start =
      items.find((a) => (a.series?.order ?? 9999) === 0) ?? items[0];
    const covers = items
      .map((a) => normalizeCoverSrc(a.cover))
      .filter(Boolean) as string[];

    return { ...s, items, start, covers };
  });

  /* ---------- Filtres & résultats ---------- */
  const tagCount = new Map<string, number>();
  for (const a of all) {
    for (const t of a.tags ?? []) {
      const k = normalizeTag(t);
      if (!k) continue;
      tagCount.set(k, (tagCount.get(k) ?? 0) + 1);
    }
  }

  const results =
    selected.length === 0
      ? all
      : all.filter((a) => selected.every((t) => (a.tags ?? []).includes(t)));

  const availableTagCount = new Map<string, number>();
  for (const a of results) {
    for (const t of a.tags ?? []) {
      const k = normalizeTag(t);
      if (!k) continue;
      availableTagCount.set(k, (availableTagCount.get(k) ?? 0) + 1);
    }
  }

  const sortedTags = Array.from(
    (selected.length ? availableTagCount : tagCount).entries()
  )
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  const tagsToShow = showAllTags ? sortedTags : sortedTags.slice(0, 12);

  return (
    <section>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Articles</h1>
        <p className="mt-3 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
          Entrer par une rétrospective, ou explorer par thèmes.
        </p>
      </header>

      <div className="space-y-14">

{/* ======================
    RÉTROSPECTIVES
====================== */}
<section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
    Rétrospectives
  </h2>

  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
    {seriesCards.map((s) => {
      const startHref = s.start?.slug ? `/articles/${s.start.slug}` : null;

      return (
        <div
          key={s.slug}
          className="group overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/20"
        >
          {startHref ? (
            <Link
              href={startHref}
              aria-label={`Commencer la série : ${s.title}`}
              className="block"
            >
              {s.covers.length ? (
                <div className="transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                  <Mosaic covers={s.covers} />
                </div>
              ) : (
                <div className="h-56 w-full bg-neutral-900/10 dark:bg-neutral-900/30 transition-transform duration-300 ease-out group-hover:scale-[1.02]" />
              )}
            </Link>
          ) : s.covers.length ? (
            <Mosaic covers={s.covers} />
          ) : (
            <div className="h-56 w-full bg-neutral-900/10 dark:bg-neutral-900/30" />
          )}

          <div className="p-6">
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Série • {s.items.length} article{s.items.length > 1 ? "s" : ""}
            </div>

            <h3 className="mt-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {s.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {s.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {startHref ? (
                <Link
                  href={startHref}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/40 px-4 py-2 text-sm text-neutral-900 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950/60"
                >
                  Commencer
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                  Commencer
                </span>
              )}

              <div className="text-xs text-neutral-500">
                Départ :{" "}
                <span className="text-neutral-700 dark:text-neutral-300">
                  {s.start?.title ?? "—"}
                </span>
              </div>
            </div>

            {s.items.length ? (
              <ul className="mt-5 space-y-2 text-sm">
                {s.items.slice(0, 5).map((a) => (
                  <li
                    key={a.slug}
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="text-neutral-500">
                      {(a.series?.order ?? 0).toString().padStart(2, "0")}
                    </span>
                    <span className="text-neutral-500"> – </span>
                    <span>{a.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-neutral-500">
                Aucun article trouvé pour cette série (vérifie `series.slug` dans le YAML).
              </p>
            )}
          </div>
        </div>
      );
    })}
  </div>
</section>


        {/* ======================
            FILTRES
        ====================== */}
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Filtres
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Filtrer les articles par thèmes.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {sortedTags.length > 12 ? (
                showAllTags ? (
                  <Link
                    scroll={false}
                    href={hrefFor(selected, false)}
                    className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
                  >
                    Voir moins
                  </Link>
                ) : (
                  <Link
                    scroll={false}
                    href={hrefFor(selected, true)}
                    className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
                  >
                    Voir plus ({sortedTags.length - 12})
                  </Link>
                )
              ) : null}

              {selected.length > 0 && (
                <Link
                  scroll={false}
                  href={hrefFor([], showAllTags)}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-900 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950/50"
                >
                  Réinitialiser
                </Link>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {tagsToShow.map(({ tag, count }) => {
              const active = selected.includes(tag);
              const next = active ? selected.filter((t) => t !== tag) : [...selected, tag];

              return (
                <Link
                  scroll={false}
                  key={tag}
                  href={hrefFor(next, showAllTags)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs transition",
                    active
                      ? "border-neutral-900/15 dark:border-white/15 bg-neutral-900/5 dark:bg-white/10 text-neutral-900 dark:text-neutral-100"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-950/50",
                  ].join(" ")}
                >
                  {tag} <span className="text-neutral-500">({count})</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ======================
            RÉSULTATS
        ====================== */}
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Résultats
            </h2>

            <div className="text-xs text-neutral-500">
              {results.length} article{results.length > 1 ? "s" : ""}
            </div>
          </div>

          {results.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
              Aucun article trouvé.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((a) => {
                const coverSrc = normalizeCoverSrc(a.cover);
                return (
                  <Link
                    key={a.slug}
                    href={`/articles/${a.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/20"
                  >
                    {coverSrc ? (
                      <div className="relative h-56 w-full overflow-hidden">
                        <Image
                          src={coverSrc}
                          alt={a.title}
                          fill
                          className="object-cover opacity-90 transition group-hover:opacity-100"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      </div>
                    ) : (
                      <div className="h-56 w-full bg-neutral-900/10 dark:bg-neutral-900/30" />
                    )}

                    <div className="p-6">
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {a.date} — {a.source}
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {a.title}
                      </h3>

                      {a.excerpt ? (
                        <p className="mt-2 text-sm italic text-neutral-700 dark:text-neutral-300 line-clamp-3">
                          {a.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ======================
            ARCHIVES COMPLÈTES
        ====================== */}
        <section className="flex justify-center pt-4">
          <Link
            href="/articles/archives"
            className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            Parcourir toutes les archives →
          </Link>
        </section>
      </div>
    </section>
  );
}