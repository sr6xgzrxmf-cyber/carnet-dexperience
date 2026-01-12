import Link from "next/link";
import { getAllParcours } from "@/lib/parcours";

function formatRange(start?: string, end?: string) {
  if (!start && !end) return "";
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} → ${end}`;
}

export default function ParcoursPage() {
  const items = getAllParcours().filter((it) => it.meta.type !== "formation");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Parcours</h1>
        <p className="text-neutral-700">
          Une timeline chronologique&nbsp;: expériences, rôles, contextes, apprentissages.
        </p>
      </header>

      <ol className="mt-10 space-y-6 border-l border-neutral-200 pl-6">
        {items.map((item) => (
          <li key={item.slug} className="relative">
            <span className="absolute -left-[30px] top-2 h-3 w-3 rounded-full border border-neutral-300 bg-white" />

            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  href={`/parcours/${item.slug}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {item.meta.title}
                </Link>
                <span className="text-sm text-neutral-600">
                  {formatRange(item.meta.start, item.meta.end)}
                </span>
              </div>

              <p className="text-sm text-neutral-700">
                {(item.meta.company ?? "")}
                {item.meta.location ? ` — ${item.meta.location}` : ""}
                {item.meta.role ? ` • ${item.meta.role}` : ""}
              </p>

              {Array.isArray(item.meta.highlights) && item.meta.highlights.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-[14px] leading-[1.55] text-neutral-900">
                  {item.meta.highlights.slice(0, 3).map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold">Formation</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Accessible sur une page dédiée (on la fait juste après si tu veux).
        </p>
      </div>
    </main>
  );
}
