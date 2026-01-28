"use client";

import { usePathname, useRouter } from "next/navigation";

function hrefFor(pathname: string, nextTags: string[], showAllTags: boolean) {
  const params = new URLSearchParams();
  nextTags.forEach((t) => params.append("tag", t));
  if (showAllTags) params.set("showTags", "all");
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ""}`;
}

export default function ArticlesFilters({
  tagsToShow,
  selected,
  showAllTags,
}: {
  tagsToShow: { tag: string; count: number }[];
  selected: string[];
  showAllTags: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function go(nextTags: string[], nextShowAll: boolean) {
    router.replace(hrefFor(pathname, nextTags, nextShowAll), { scroll: false });
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {tagsToShow.map(({ tag, count }) => {
        const active = selected.includes(tag);
        const next = active ? selected.filter((t) => t !== tag) : [...selected, tag];

        return (
          <button
            type="button"
            key={tag}
            onClick={() => go(next, showAllTags)}
            className={[
              "rounded-full border px-3 py-1 text-xs transition",
              active
                ? "border-neutral-900/15 dark:border-white/15 bg-neutral-900/5 dark:bg-white/10 text-neutral-900 dark:text-neutral-100"
                : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-950/50",
            ].join(" ")}
          >
            {tag} <span className="text-neutral-500">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
