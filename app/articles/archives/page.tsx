// app/articles/archives/page.tsx
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ContactButton from "@/components/ContactButton";

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
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
        <Link href="/" className="hover:underline">
          ← Accueil
        </Link>
        <Link href="/articles" className="hover:underline">
          Articles
        </Link>
        <Link href="/parcours" className="hover:underline">
          Parcours
        </Link>
        <ContactButton
          label="Contact"
          className="hover:underline text-sm text-neutral-600 dark:text-neutral-400 bg-transparent border-0 px-0 py-0 rounded-none"
        />
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Archives
        </h1>
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
    </main>
  );
}
