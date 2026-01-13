import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";
import ContactButton from "@/components/ContactButton";

function formatDate(date?: string) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${d}/${m}/${y}`;
}

export default function ArticlesPage() {
  const items = getAllArticles();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-neutral-900 dark:text-neutral-100">
      {/* Navigation */}
      <nav className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
        <Link href="/" className="hover:underline">
          ← Accueil
        </Link>

        <Link href="/parcours" className="hover:underline">
          Parcours
        </Link>

        <ContactButton
          label="Contact"
          className="hover:underline text-sm text-neutral-600 dark:text-neutral-400"
        />
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Articles</h1>
        <p className="text-neutral-700 dark:text-neutral-300">
          Notes de terrain, pédagogie, méthodes et retours d’expérience.
        </p>
      </header>

      {/* Grille responsive */}
      <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => {
          const href = `/articles/${a.slug}`;
          const cover = a.meta.cover?.trim();

          return (
            <Link
              key={a.slug}
              href={href}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white/50 transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950/30 dark:hover:border-neutral-600"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] w-full border-b border-neutral-200 dark:border-neutral-800">
                {cover ? (
                  <Image
                    src={cover}
                    alt={a.meta.title ?? a.slug}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune image
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {a.meta.date && <span>{formatDate(a.meta.date)}</span>}
                  {a.meta.source && <span>• {a.meta.source}</span>}
                </div>

                <h2 className="mt-2 text-base font-semibold leading-snug tracking-tight">
                  {a.meta.title ?? a.slug}
                </h2>

                {a.meta.excerpt ? (
                  <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                    {a.meta.excerpt}
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Ouvrir l’article
                  </p>
                )}

                {Array.isArray(a.meta.tags) && a.meta.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {a.meta.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-neutral-200 bg-white/40 px-3 py-1 text-[11px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-neutral-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}