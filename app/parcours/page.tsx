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
          apprentissages. <br /> Cliquez sur le titre du métier pour découvrir cette expérience en détail.
        </p>
      </header>

      <ol className="mt-10 space-y-6 border-l border-neutral-200 dark:border-neutral-800 pl-6">
        {items.map((item) => (
          <li key={item.slug} className="relative">
            <span className="absolute -left-[30px] top-2 h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950" />

            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  href={`/parcours/${item.slug}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {item.meta.title}
                </Link>

                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {formatRange(item.meta.start, item.meta.end)}
                </span>
              </div>

              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                <div>
                  {item.meta.company ?? ""}
                  {item.meta.location ? ` — ${item.meta.location}` : ""}
                </div>

                {item.meta.role ? (
                  <div className="mt-1 text-neutral-600 dark:text-neutral-400">
                    {item.meta.role}
                  </div>
                ) : null}
              </div>

              {Array.isArray(item.meta.highlights) &&
              item.meta.highlights.length > 0 ? (
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