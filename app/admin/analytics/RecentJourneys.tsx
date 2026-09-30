import Image from "next/image";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

type JourneyEvent = {
  id: string;
  createdAt: Date;
  eventType: string;
  kind: string;
  path: string;
  source: string | null;
  sessionId: string | null;
  metadata: unknown;
};

type PageVisit = {
  path: string;
  at: Date;
  seconds: number | null;
  scroll: number | null;
  download: string | null;
};

export type Session = {
  id: string;
  visitorId: string | null;
  start: Date;
  source: string;
  browser: string;
  device: string;
  city: string | null;
  pages: PageVisit[];
};

const STATIC_PAGES: Record<string, string> = {
  "/": "Accueil",
  "/articles": "Tous les articles",
  "/articles/archives": "Archives des articles",
  "/parcours": "Parcours",
  "/atelier": "Accompagnement",
  "/contact": "Contact",
  "/badge": "Badge",
  "/series": "Séries",
  "/situations-d-intervention": "Situations d’intervention",
  "/projets/jardin-partage": "Le Jardin Partagé",
  "/projets/jardin-partage/login": "Le Jardin Partagé · connexion",
};

// Couleurs et initiales des provenances les plus courantes.
const SOURCE_STYLES: Record<string, { mark: string; className: string }> = {
  LinkedIn: { mark: "in", className: "bg-[#0a66c2] text-white" },
  Google: { mark: "G", className: "bg-white text-[#4285f4] ring-1 ring-neutral-200" },
  Bing: { mark: "b", className: "bg-[#008373] text-white" },
  DuckDuckGo: { mark: "D", className: "bg-[#de5833] text-white" },
  Instagram: { mark: "ig", className: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white" },
  Facebook: { mark: "f", className: "bg-[#1877f2] text-white" },
  ChatGPT: { mark: "AI", className: "bg-[#10a37f] text-white" },
  Perplexity: { mark: "AI", className: "bg-[#20808d] text-white" },
  Claude: { mark: "AI", className: "bg-[#d97757] text-white" },
  "Le Jardin Partagé": { mark: "JP", className: "bg-[#0E664E] text-white" },
  "Accès direct": { mark: "→", className: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200" },
};

function meta(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function str(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

// Une session qui démarre depuis le site lui-même (onglet rouvert) compte comme un accès direct.
function sourceLabel(source: string | null) {
  if (!source || /carnet-?dexperience|localhost|127\.0\.0\.1/i.test(source)) return "Accès direct";
  if (source === "jardin-partage") return "Le Jardin Partagé";
  return source;
}

function cityLabel(value: unknown) {
  const city = str(value);
  if (!city) return null;
  try {
    return decodeURIComponent(city);
  } catch {
    return city;
  }
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);
    return rest ? `${minutes} min ${String(rest).padStart(2, "0")}` : `${minutes} min`;
  }
  const hours = Math.floor(seconds / 3600);
  return `${hours} h ${String(Math.round((seconds % 3600) / 60)).padStart(2, "0")}`;
}

const formatStart = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

// Regroupe les événements par session et rattache chaque temps de lecture
// à la page qu'il mesure.
export function buildSessions(events: JourneyEvent[], ownVisitors: Set<string>, showOwn: boolean) {
  const sessions = new Map<string, Session>();
  const ordered = [...events].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  for (const event of ordered) {
    if (!event.sessionId) continue;
    const data = meta(event.metadata);
    const visitorId = str(data.visitorId);
    if (!showOwn && visitorId && ownVisitors.has(visitorId)) continue;

    let session = sessions.get(event.sessionId);
    if (!session) {
      if (event.eventType !== "page_view") continue;
      session = {
        id: event.sessionId,
        visitorId,
        start: event.createdAt,
        source: sourceLabel(event.source),
        browser: str(data.browser) ?? "Navigateur inconnu",
        device: str(data.device) ?? "",
        city: cityLabel(data.city),
        pages: [],
      };
      sessions.set(event.sessionId, session);
    }

    if (event.eventType === "page_view") {
      const last = session.pages.at(-1);
      // Une même page revue juste après (rechargement, retour sur l'onglet)
      // reste sur la même ligne : ses temps de lecture s'additionnent.
      if (last && last.path === event.path) continue;
      session.pages.push({ path: event.path, at: event.createdAt, seconds: null, scroll: null, download: null });
    } else if (event.eventType === "engagement") {
      const page = [...session.pages].reverse().find((item) => item.path === event.path) ?? session.pages.at(-1);
      if (page) {
        page.seconds = (page.seconds ?? 0) + (num(data.durationSeconds) ?? 0);
        page.scroll = Math.max(page.scroll ?? 0, num(data.maxScrollPercent) ?? 0);
      }
    } else if (event.eventType === "download") {
      const page = session.pages.at(-1);
      if (page) page.download = str(data.destination) ?? event.path;
    }
  }

  return [...sessions.values()].sort((a, b) => b.start.getTime() - a.start.getTime());
}

function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_STYLES[source] ?? {
    mark: source.slice(0, 1).toUpperCase(),
    className: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  };
  return (
    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style.className}`} aria-hidden>
      {style.mark}
    </span>
  );
}

export default function RecentJourneys({
  sessions,
  showOwn,
  hiddenCount,
}: {
  sessions: Session[];
  showOwn: boolean;
  hiddenCount: number;
}) {
  const articles = new Map(
    getAllArticles({ includeFuture: true }).map((article) => [
      `/articles/${article.slug}`,
      { title: article.meta.title ?? article.slug, cover: typeof article.meta.cover === "string" ? article.meta.cover : null },
    ])
  );
  const describe = (pagePath: string) =>
    articles.get(pagePath) ?? { title: STATIC_PAGES[pagePath] ?? pagePath, cover: null };

  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-semibold">Parcours récents</h2>
        <Link
          href={showOwn ? "/admin/analytics" : "/admin/analytics?moi=1"}
          className="text-xs font-medium text-neutral-600 underline underline-offset-4 dark:text-neutral-400"
        >
          {showOwn
            ? "Masquer mes propres visites"
            : `Mes propres visites sont masquées${hiddenCount ? ` (${hiddenCount})` : ""} · les afficher`}
        </Link>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {sessions.map((session) => {
          const totalSeconds = session.pages.reduce((sum, page) => sum + (page.seconds ?? 0), 0);
          return (
            <article key={session.id} className="rounded-xl bg-neutral-100/70 p-4 dark:bg-neutral-900/60">
              <header className="flex items-center gap-3">
                <SourceBadge source={session.source} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {formatStart.format(session.start)} · depuis {session.source}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {[session.browser, session.device, session.city].filter(Boolean).join(" · ")}
                    {" · "}
                    {session.pages.length} page{session.pages.length > 1 ? "s" : ""}
                    {totalSeconds ? ` · ${formatDuration(totalSeconds)}` : ""}
                  </p>
                </div>
              </header>

              <ol className="mt-4 grid gap-2">
                {session.pages.slice(0, 8).map((page, index) => {
                  const info = describe(page.path);
                  return (
                    <li key={`${page.path}-${index}`} className="flex items-center gap-3 rounded-lg bg-white p-2 dark:bg-neutral-950">
                      {info.cover ? (
                        <Image src={info.cover} alt="" width={64} height={40} className="h-10 w-16 shrink-0 rounded-md object-cover" />
                      ) : (
                        <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-neutral-200 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {index + 1}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" title={page.path}>{info.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                          {page.seconds !== null ? <span>{formatDuration(page.seconds)}</span> : <span>durée inconnue</span>}
                          {page.scroll !== null ? (
                            <>
                              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800" aria-hidden>
                                <span className="block h-full rounded-full bg-neutral-700 dark:bg-neutral-300" style={{ width: `${Math.min(page.scroll, 100)}%` }} />
                              </span>
                              <span>lue à {Math.round(page.scroll)} %</span>
                            </>
                          ) : null}
                          {page.download ? <span>· a téléchargé un fichier</span> : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
                {session.pages.length > 8 ? (
                  <li className="text-xs text-neutral-500">+ {session.pages.length - 8} autre(s) page(s)</li>
                ) : null}
              </ol>
            </article>
          );
        })}
        {!sessions.length ? <p className="text-sm text-neutral-500">Aucun parcours humain enregistré pour le moment.</p> : null}
      </div>
    </section>
  );
}
