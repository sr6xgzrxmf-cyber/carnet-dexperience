import { notFound } from "next/navigation";
import {
  getAllParcours,
  getParcoursBySlug,
  markdownToHtml,
} from "@/lib/parcours";

export function generateStaticParams() {
  return getAllParcours()
    .filter((it) => it.meta.type !== "formation")
    .map((it) => ({ slug: it.slug }));
}

function formatRange(start?: string, end?: string) {
  if (!start && !end) return "";
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} → ${end}`;
}

export default async function ParcoursDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const item = getParcoursBySlug(slug);
  if (!item) return notFound();

  const contentHtml = await markdownToHtml(item.content);

  return (
    <section>
      <div className="mx-auto max-w-3xl">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {item.meta.title}
          </h1>

          <div className="text-sm text-neutral-700 dark:text-neutral-300">
            <div>
              {formatRange(item.meta.start, item.meta.end)}
              {item.meta.company ? ` • ${item.meta.company}` : ""}
              {item.meta.location ? ` — ${item.meta.location}` : ""}
            </div>

            {item.meta.role ? (
              <div className="mt-1 text-neutral-600 dark:text-neutral-400">
                {item.meta.role}
              </div>
            ) : null}
          </div>

          {Array.isArray(item.meta.tags) && item.meta.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {item.meta.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300 bg-white/50 dark:bg-neutral-950/30"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {/* Contenu markdown → HTML */}
        <article
          className="
            mt-10 max-w-none
            text-neutral-900 dark:text-neutral-100

            [&_p]:m-0
            [&_p]:leading-7
            [&_p+_p]:mt-3

            [&_h2+_p]:mt-4

            [&_h2]:mt-10
            [&_h2]:mb-2
            [&_h2]:text-xl
            [&_h2]:font-semibold
            [&_h2]:tracking-tight
            [&_h2]:border-b
            [&_h2]:border-neutral-200
            dark:[&_h2]:border-neutral-800
            [&_h2]:pb-2

            [&_h3]:mt-8
            [&_h3]:mb-2
            [&_h3]:text-lg
            [&_h3]:font-semibold
            [&_h3]:tracking-tight

            [&_ul]:my-0
            [&_ul]:list-disc
            [&_ul]:pl-5
            [&_li]:my-1
            [&_p+_ul]:mt-3
            [&_ul+_p]:mt-3

            [&_hr]:hidden
          "
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </section>
  );
}