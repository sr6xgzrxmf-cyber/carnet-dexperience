import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

function getItemMeta(item: any) {
  const m = item?.meta ?? item ?? {};
  return {
    slug: item?.slug ?? m?.slug,
    title: m?.title ?? "",
    date: m?.date ?? "",
    excerpt: m?.excerpt ?? "",
  };
}

export default async function ActionsArchivesPage() {
  const raw = await getAllArticles();
  const items = (raw ?? []).map(getItemMeta).filter((a) => a.slug);

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-white dark:bg-neutral-950/15 p-6 sm:p-8">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Archives</h2>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Liste complète, classée par date (du plus récent au plus ancien).
      </p>

      <ul className="mt-6 space-y-5">
        {items.map((a) => (
          <li key={a.slug} className="text-sm">
            <Link href={`/articles/${a.slug}`} className="block hover:underline">
              <div className="text-neutral-200">
                <span className="text-neutral-500">{a.date}</span>
                <span className="text-neutral-600"> – </span>
                <span className="font-medium">{a.title}</span>
              </div>
              {a.excerpt ? (
                <div className="mt-1 italic text-neutral-600 dark:text-neutral-400">{a.excerpt}</div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
