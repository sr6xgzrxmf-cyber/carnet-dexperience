// app/articles/archives/page.tsx
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

type ArticleMeta = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  source?: string;
};

function getItemMeta(item: any): ArticleMeta {
  const m = item?.meta ?? item ?? {};
  return {
    slug: item?.slug ?? m?.slug ?? "",
    title: m?.title ?? "",
    date: m?.date ?? "",
    excerpt: m?.excerpt ?? "",
    source: m?.source ?? "Carnet d’expérience",
  };
}

export default async function ArticlesArchivesPage() {
  const raw = await getAllArticles();
  const items = (raw ?? [])
    .map(getItemMeta)
    .filter((a) => a.slug)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <section>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Archives</h1>
        <p className="mt-3 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
          Liste complète, classée par date (du plus récent au plus ancien).
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 p-6 sm:p-8">
        <ul className="space-y-5">
          {items.map((a) => (
            <li key={a.slug} className="text-sm">
              <Link href={`/articles/${a.slug}`} className="block hover:underline">
                <div className="text-neutral-900 dark:text-neutral-100">
                  <span className="text-neutral-500">{a.date}</span>
                  <span className="text-neutral-500"> – </span>
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
    </section>
  );
}