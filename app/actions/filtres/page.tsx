import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";

type SearchParams = { tag?: string | string[]; tags?: string | string[] };

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
    cover: m?.cover ?? m?.image ?? m?.hero ?? item?.cover ?? item?.image ?? item?.hero ?? null,
    source: m?.source ?? item?.source ?? "Carnet d’expérience",
  };
}

export default async function ActionsFiltresPage(props: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const sp = props.searchParams instanceof Promise ? await props.searchParams : props.searchParams;

  // Supporte ?tag=a&tag=b (multi) ET ?tags=a,b
  const selected = [
    ...asArray(sp?.tag),
    ...asArray(sp?.tags),
  ].map(normalizeTag).filter(Boolean);

  const raw = await getAllArticles();
  const allArticles = (raw ?? []).map(getItemMeta).filter((a) => a.slug);

  // Comptage tags global
  const tagCount = new Map<string, number>();
  for (const a of allArticles) {
    for (const t of a.tags ?? []) {
      const k = normalizeTag(t);
      if (!k) continue;
      tagCount.set(k, (tagCount.get(k) ?? 0) + 1);
    }
  }

  // Filtre (ET logique)
  const results = selected.length === 0
    ? allArticles
    : allArticles.filter((a) => selected.every((t) => (a.tags ?? []).includes(t)));

  // Tags restants à proposer (sur les résultats)
  const availableTagCount = new Map<string, number>();
  for (const a of results) {
    for (const t of a.tags ?? []) {
      const k = normalizeTag(t);
      if (!k) continue;
      availableTagCount.set(k, (availableTagCount.get(k) ?? 0) + 1);
    }
  }

  const sortedTags = Array.from((selected.length ? availableTagCount : tagCount).entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  function hrefFor(nextTags: string[]) {
    const params = new URLSearchParams();
    // on utilise tag=... répétable (plus lisible)
    nextTags.forEach((t) => params.append("tag", t));
    return `/actions/filtres${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-white dark:bg-neutral-950/15 p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Filtres</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Clique pour filtrer. Re-clique sur un tag sélectionné pour l’enlever.
            </p>
          </div>

          {selected.length > 0 ? (
            <Link
              href={hrefFor([])}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-white dark:bg-neutral-950/30 px-4 py-2 text-sm text-neutral-200 hover:bg-white dark:bg-neutral-950/50"
            >
              Réinitialiser
            </Link>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {sortedTags.map(({ tag, count }) => {
            const active = selected.includes(tag);
            const next = active ? selected.filter((t) => t !== tag) : [...selected, tag];

            return (
              <Link
                key={tag}
                href={hrefFor(next)}
                className={[
                  "rounded-full border px-3 py-1 text-xs transition",
                  active
                    ? "border-white/15 bg-white/10 text-neutral-900 dark:text-neutral-100"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-white dark:bg-neutral-950/30 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:bg-neutral-950/50",
                ].join(" ")}
              >
                {tag} <span className="text-neutral-500">({count})</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-white dark:bg-neutral-950/15 p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Résultats</h2>
          <div className="text-xs text-neutral-500">
            {results.length} article{results.length > 1 ? "s" : ""}
          </div>
        </div>

        {results.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Aucun article trouvé.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((a) => {
              const coverSrc = normalizeCoverSrc(a.cover);
              return (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-white dark:bg-neutral-950/20"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-56 w-full bg-neutral-900/30" />
                  )}

                  <div className="p-6">
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      {a.date} — {a.source ?? "Laurent Guyonnet — Carnet d’expérience"}
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">{a.title}</h3>

                    {a.excerpt ? (
                      <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 line-clamp-4">
                        {a.excerpt}
                      </p>
                    ) : null}

                    {a.tags?.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {a.tags.slice(0, 6).map((t: string) => (
                          <span
                            key={t}
                            className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-white dark:bg-neutral-950/30 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
