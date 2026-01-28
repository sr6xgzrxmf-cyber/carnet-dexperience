"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SCROLL_KEY = "articles:scrollY";

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
  const searchParams = useSearchParams();

  // ✅ Restore scroll after URL/searchParams changes (Safari/prod-proof)
  useEffect(() => {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return;

    const y = Number(raw);
    if (!Number.isFinite(y)) return;

    // next render/layout might shift, so wait a tick
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: "auto" });
    });
  }, [pathname, searchParams.toString()]);

  function go(nextTags: string[], nextShowAll: boolean) {
    // ✅ Save current scroll position BEFORE navigation
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));

    router.replace(hrefFor(pathname, nextTags, nextShowAll), { scroll: false });

    // ✅ Force refresh to ensure server output matches new params in prod
    router.refresh();
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