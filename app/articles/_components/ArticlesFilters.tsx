"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatTagLabel } from "@/lib/editorial-labels";
import styles from "@/app/editorial.module.css";

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
  const searchParamsString = searchParams.toString();

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
  }, [pathname, searchParamsString]);

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
              styles.tag,
              active
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "hover:border-neutral-500",
            ].join(" ")}
          >
            {formatTagLabel(tag)} <span className="text-neutral-500">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
