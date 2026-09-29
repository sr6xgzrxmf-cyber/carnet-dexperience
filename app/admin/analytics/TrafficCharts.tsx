import type { Session } from "./RecentJourneys";

// Graphiques des 30 derniers jours, rendus en SVG côté serveur.
// Une série par graphique : pas de légende, le titre la nomme. Survol : infobulle native.

const DAYS = 30;
const dayKey = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });
const dayLabel = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short" });
const dayLong = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" });

type Day = { key: string; date: Date; value: number };

function lastDays(now: Date): Day[] {
  return Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(now.getTime() - (DAYS - 1 - index) * 24 * 60 * 60 * 1000);
    return { key: dayKey.format(date), date, value: 0 };
  });
}

function countByDay(dates: Date[], now: Date) {
  const days = lastDays(now);
  const byKey = new Map(days.map((day) => [day.key, day]));
  for (const date of dates) {
    const day = byKey.get(dayKey.format(date));
    if (day) day.value += 1;
  }
  return days;
}

// Échelle « ronde » pour l'axe : 1, 2, 5, 10, 20, 50…
function niceMax(value: number) {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((candidate) => candidate * power >= value) ?? 10;
  return step * power;
}

// Colonne arrondie en haut (4px), carrée sur la ligne de base.
function columnPath(x: number, y: number, width: number, height: number) {
  const r = Math.min(4, height, width / 2);
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`;
}

function DailyColumns({ days, unit, colorClass }: { days: Day[]; unit: [string, string]; colorClass: string }) {
  const width = 640;
  const height = 180;
  const left = 32;
  const bottom = 24;
  const top = 10;
  const plotWidth = width - left;
  const plotHeight = height - top - bottom;
  const band = plotWidth / days.length;
  const barWidth = Math.min(14, band - 4);
  const max = niceMax(Math.max(...days.map((day) => day.value)));
  const y = (value: number) => top + plotHeight - (value / max) * plotHeight;
  const plural = (value: number) => `${value} ${value > 1 ? unit[1] : unit[0]}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full" role="img" aria-label={`Colonnes par jour sur ${DAYS} jours`}>
      {[0, max / 2, max].map((tick) => (
        <g key={tick}>
          <line x1={left} x2={width} y1={y(tick)} y2={y(tick)} className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth={1} />
          <text x={left - 6} y={y(tick) + 4} textAnchor="end" className="fill-neutral-500 text-[11px]">{tick}</text>
        </g>
      ))}
      {days.map((day, index) => {
        const x = left + index * band + (band - barWidth) / 2;
        const barHeight = (day.value / max) * plotHeight;
        return (
          <g key={day.key} className="group">
            <title>{`${dayLong.format(day.date)} : ${plural(day.value)}`}</title>
            <rect x={left + index * band} y={top} width={band} height={plotHeight} className="fill-transparent group-hover:fill-neutral-100 dark:group-hover:fill-neutral-900" />
            {day.value > 0 ? <path d={columnPath(x, y(day.value), barWidth, barHeight)} className={colorClass} /> : null}
            {index % 7 === DAYS % 7 - 1 || index === days.length - 1 ? (
              <text
                x={index === days.length - 1 ? width : left + index * band + band / 2}
                y={height - 6}
                textAnchor={index === days.length - 1 ? "end" : "middle"}
                className="fill-neutral-500 text-[11px]"
              >
                {dayLabel.format(day.date)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function ChartCard({ title, total, note, children }: { title: string; total: string; note: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs text-neutral-500">{note}</span>
      </div>
      <strong className="mt-2 block text-3xl">{total}</strong>
      {children}
    </section>
  );
}

function DataTable({ days, label }: { days: Day[]; label: string }) {
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-xs text-neutral-500">Voir les données</summary>
      <table className="mt-2 w-full text-left text-xs">
        <thead className="text-neutral-500"><tr><th className="py-1">Jour</th><th className="py-1 text-right">{label}</th></tr></thead>
        <tbody>
          {[...days].reverse().map((day) => (
            <tr key={day.key} className="border-t border-neutral-200 dark:border-neutral-800">
              <td className="py-1">{dayLong.format(day.date)}</td>
              <td className="py-1 text-right tabular-nums">{day.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export default function TrafficCharts({
  sessions,
  aiVisitDates,
  showOwn,
}: {
  sessions: Session[];
  aiVisitDates: Date[];
  showOwn: boolean;
}) {
  const now = new Date();
  const humanDays = countByDay(sessions.map((session) => session.start), now);
  const aiDays = countByDay(aiVisitDates, now);
  const humanTotal = humanDays.reduce((sum, day) => sum + day.value, 0);
  const aiTotal = aiDays.reduce((sum, day) => sum + day.value, 0);

  const sources = [...sessions.reduce((map, session) => map.set(session.source, (map.get(session.source) ?? 0) + 1), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1]);
  const topSources = sources.slice(0, 7);
  const otherCount = sources.slice(7).reduce((sum, [, count]) => sum + count, 0);
  if (otherCount) topSources.push(["Autres", otherCount]);
  const sourceMax = Math.max(1, ...topSources.map(([, count]) => count));

  return (
    <div className="mt-8 grid gap-4 xl:grid-cols-2">
      <ChartCard
        title="Visites humaines par jour"
        total={`${humanTotal} visite${humanTotal > 1 ? "s" : ""}`}
        note={showOwn ? "30 jours · mes visites incluses" : "30 jours · hors mes propres visites"}
      >
        <DailyColumns days={humanDays} unit={["visite", "visites"]} colorClass="fill-[#2a78d6] dark:fill-[#3987e5]" />
        <DataTable days={humanDays} label="Visites" />
      </ChartCard>

      <ChartCard title="Passages de robots IA par jour" total={`${aiTotal} passage${aiTotal > 1 ? "s" : ""}`} note="30 jours · ChatGPT, Claude, Perplexity…">
        <DailyColumns days={aiDays} unit={["passage", "passages"]} colorClass="fill-[#4a3aa7] dark:fill-[#9085e9]" />
        <DataTable days={aiDays} label="Passages" />
      </ChartCard>

      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 xl:col-span-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">D’où viennent les visiteurs</h2>
          <span className="text-xs text-neutral-500">30 jours · visites humaines par provenance</span>
        </div>
        <ul className="mt-4 grid gap-2">
          {topSources.map(([source, count]) => (
            <li key={source} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-3 text-sm" title={`${source} : ${count} visite${count > 1 ? "s" : ""}`}>
              <span className="truncate">{source}</span>
              <span className="h-3.5 rounded-r bg-neutral-100 dark:bg-neutral-900">
                <span className="block h-full rounded-r bg-[#2a78d6] dark:bg-[#3987e5]" style={{ width: `${(count / sourceMax) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums text-neutral-600 dark:text-neutral-400">{count}</span>
            </li>
          ))}
          {!topSources.length ? <li className="text-sm text-neutral-500">Aucune visite pour le moment.</li> : null}
        </ul>
      </section>
    </div>
  );
}
