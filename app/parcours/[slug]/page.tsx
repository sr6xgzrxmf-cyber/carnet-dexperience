import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllParcours, getParcoursBySlug, markdownToHtml } from "@/lib/parcours";

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
  params: { slug: string };
}) {
  const item = getParcoursBySlug(params.slug);
  if (!item) return notFound();

  const contentHtml = await markdownToHtml(item.content);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8">
        <Link href="/parcours" className="text-sm text-neutral-600 hover:underline">
          ← Retour au parcours
        </Link>
      </div>

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{item.meta.title}</h1>

        <p className="text-sm text-neutral-700">
          {formatRange(item.meta.start, item.meta.end)}
          {item.meta.company ? ` • ${item.meta.company}` : ""}
          {item.meta.location ? ` — ${item.meta.location}` : ""}
          {item.meta.role ? ` • ${item.meta.role}` : ""}
        </p>

        {Array.isArray(item.meta.tags) && item.meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {item.meta.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      <article
        className="prose prose-neutral mt-10 max-w-none text-[14px] leading-[1.55]"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  );
}
