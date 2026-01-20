import Link from "next/link";
import { getAllParcours } from "@/lib/parcours";


export const metadata = {
  title: "Parcours",
  description:
    "Timeline chronologique des expériences de Laurent Guyonnet : rôles, contextes et apprentissages.",
};

function formatRange(start?: string, end?: string) {
  if (!start && !end) return "";
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} → ${end}`;
}

export default function ParcoursPage() {
  const items = getAllParcours().filter((it) => it.meta.type !== "formation");

  return (
    <section>
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Parcours</h1>
        <p className="text-neutral-700 dark:text-neutral-300">
          Une timeline chronologique&nbsp;: expériences, rôles, contextes,
          apprentissages. <br />
          Cliquez sur le titre du métier pour découvrir cette expérience en détail.
        </p>
      </header>


<div className="relative mt-10 overflow-visible">
  {/* Ligne globale, alignée au centre de la colonne "points" */}
  <div
    aria-hidden
    className="absolute left-[100px] top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800"
  />

  <ol className="space-y-8 list-none">
    {items.map((item) => (
      <li
        key={item.slug}
        className="grid grid-cols-[72px_24px_1fr] items-start gap-x-4"
      >
        {/* Colonne A — Logo */}
        <div className="relative flex justify-center">
          {item.meta.logo ? (
<img
  src={item.meta.logo}
  alt={item.meta.company ?? "Logo"}
  className="absolute top-[0.9em] h-16 w-16 -translate-y-1/2 object-contain opacity-80 dark:opacity-70"
  loading="lazy"
/>
          ) : (
            <div className="h-16 w-16" />
          )}
        </div>

        {/* Colonne B — Point (plus de ligne locale) */}
        <div className="relative flex justify-center">
          <span className="mt-[0.9em] h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950" />
        </div>

        {/* Colonne C — Contenu */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link
              href={`/parcours/${item.slug}`}
              className="text-lg font-semibold hover:underline"
            >
              {item.meta.title}
            </Link>

            {item.meta.company || item.meta.location ? (
              <span className="text-sm italic text-neutral-600 dark:text-neutral-400">
                {item.meta.company ?? ""}
                {item.meta.location ? ` — ${item.meta.location}` : ""}
              </span>
            ) : null}

            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {formatRange(item.meta.start, item.meta.end)}
            </span>
          </div>

          {item.meta.role ? (
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {item.meta.role}
            </div>
          ) : null}

          {Array.isArray(item.meta.highlights) && item.meta.highlights.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-[14px] leading-[1.55] text-neutral-900 dark:text-neutral-100">
              {item.meta.highlights.slice(0, 3).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </li>
    ))}
  </ol>
</div>

      <Link
        href="/parcours/formation"
        className="mt-12 block rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/50 dark:bg-neutral-950/30 hover:border-neutral-400 dark:hover:border-neutral-600 transition"
      >
        <h2 className="text-lg font-semibold">Formation</h2>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          Voir le parcours de formation et les apprentissages.
        </p>
      </Link>
    </section>
  );
}