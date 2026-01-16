import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";

type SearchParams = {
  tag?: string | string[];
  tags?: string | string[];
  showTags?: string; // "all"
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

function getItemMeta(item: any) {
  const m = item?.meta ?? item ?? {};
  return {
    slug: item?.slug ?? m?.slug,
    title: m?.title ?? "",
    date: m?.date ?? "",
    excerpt: m?.excerpt ?? "",
    tags: Array.isArray(m?.tags) ? m.tags : [],
    cover:
      m?.cover ??
      m?.image ??
      m?.hero ??
      item?.cover ??
      item?.image ??
      item?.hero ??
      null,
    source: m?.source ?? item?.source ?? "Carnet d’expérience",
  };
}

export default async function FiltresEtArchivesPage(props: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const sp =
    props.searchParams instanceof Promise
      ? await props.searchParams
      : props.searchParams;

  const selected = [...asArray(sp?.tag), ...asArray(sp?.tags)]
    .map(normalizeTag)
    .filter(Boolean);

  const showAllTags = sp?.showTags === "all";

  const raw = await getAllArticles();
  const allArticles = (raw ?? []).map(getItemMeta).filter((a) => a.slug);

  /* -------------------------
     Filtres
  ------------------------- */

  const tagCount = new Map<string, number>();
  for (const a of allArticles) {
    for (const t of a.tags ?? []) {
      const k = normalizeTag(t);
      if (!k) continue;
      tagCount.set(k, (tagCount.get(k) ?? 0) + 1);
    }
  }

  const results =
    selected.length === 0
      ? allArticles
      : allArticles.filter((a) =>
          selected.every((t) => (a.tags ?? []).includes(t))
        );

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

  function hrefFor(nextTags: string[], nextShowAll = showAllTags) {
    const params = new URLSearchParams();
    nextTags.forEach((t) => params.append("tag", t));
    if (nextShowAll) params.set("showTags", "all");
    return `/actions/filtres-et-archives${
      params.toString() ? `?${params.toString()}` : ""
    }`;
  }

  const tagsToShow = showAllTags ? sortedTags : sortedTags.slice(0, 12);
  const remainingCount = Math.max(0, sortedTags.length - 12);

  return (
    <div className="space-y-14">
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
              Filtrer les articles par thèmes, puis parcourir l’ensemble.
            </p>
          </div>

          {selected.length > 0 ? (
            <Link
              href={hrefFor([], showAllTags)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-900 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950/50"
            >
              Réinitialiser
            </Link>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tagsToShow.map(({ tag, count }) => {
            const active = selected.includes(tag);
            const next = active
              ? selected.filter((t) => t !== tag)
              : [...selected, tag];

            return (
              <Link
                key={tag}
                href={hrefFor(next, showAllTags)}
                className={[
                  "rounded-full border px-3 py-1 text-xs transition",
                  active
                    ? "border-white/15 bg-white/10 text-neutral-900 dark:text-neutral-100"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-950/50",
                ].join(" ")}
              >
                {tag} <span className="text-neutral-500">({count})</span>
              </Link>
            );
          })}
        </div>

        {sortedTags.length > 12 ? (
          <div className="mt-4">
            {showAllTags ? (
              <Link
                href={hrefFor(selected, false)}
                className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
              >
                Voir moins
              </Link>
            ) : (
              <Link
                href={hrefFor(selected, true)}
                className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
              >
                Voir plus ({remainingCount})
              </Link>
            )}
          </div>
        ) : null}
      </section>

      {/* ======================
          RÉSULTATS
      ====================== */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Résultats
        </h2>

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
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    </div>
                  ) : null}

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
          ARCHIVES
      ====================== */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Archives
        </h2>
        <ul className="mt-6 space-y-5">
          {allArticles.map((a) => (
            <li key={a.slug} className="text-sm">
              <Link href={`/articles/${a.slug}`} className="block hover:underline">
                <div className="text-neutral-900 dark:text-neutral-100">
                  <span className="text-neutral-500">{a.date}</span>
                  <span className="text-neutral-600"> – </span>
                  <span className="font-medium">{a.title}</span>
                </div>
                {a.excerpt ? (
                  <div className="mt-1 italic text-neutral-600 dark:text-neutral-400">
                    {a.excerpt}
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}