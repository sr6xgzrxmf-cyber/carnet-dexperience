"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";

type Provider = {
  id: number;
  name: string;
  logoPath: string | null;
  displayPriority: number;
};

type Movie = {
  id: number;
  title: string;
  originalTitle: string;
  releaseDate: string;
  posterPath: string | null;
  overview: string;
  voteAverage: number;
};

type MovieLite = Pick<Movie, "id" | "title" | "releaseDate" | "posterPath">;

const STORAGE = {
  selectedProviders: "swipe-films:selected-providers:v1",
  watchlist: "swipe-films:watchlist:v1",
  seen: "swipe-films:seen:v1",
  skipped: "swipe-films:skipped:v1",
};

const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w500";

const SWIPE_X_PX = 90;
const SWIPE_Y_PX = 120;
const ANIM_MS = 180;

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function uniqNumbers(values: unknown[]): number[] {
  const out: number[] = [];
  for (const value of values) {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) continue;
    if (!out.includes(num)) out.push(num);
  }
  return out;
}

function movieToLite(movie: Movie): MovieLite {
  return {
    id: movie.id,
    title: movie.title,
    releaseDate: movie.releaseDate,
    posterPath: movie.posterPath,
  };
}

function yearFromDate(date: string | null | undefined) {
  if (!date) return null;
  const year = date.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

type SwipeDirection = "left" | "right" | "down";

export default function SwipeFilmsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [providersExpanded, setProvidersExpanded] = useState(false);

  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);

  const [watchlist, setWatchlist] = useState<MovieLite[]>([]);
  const [seen, setSeen] = useState<number[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);

  const [queue, setQueue] = useState<Movie[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [moviesError, setMoviesError] = useState<string | null>(null);

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [outDir, setOutDir] = useState<SwipeDirection | null>(null);

  const currentMovie = queue[0] ?? null;

  const swipedIds = useMemo(() => {
    const set = new Set<number>();
    for (const m of watchlist) set.add(m.id);
    for (const id of seen) set.add(id);
    for (const id of skipped) set.add(id);
    return set;
  }, [watchlist, seen, skipped]);

  useEffect(() => {
    setQueue((prev) => prev.filter((m) => !swipedIds.has(m.id)));
  }, [swipedIds]);

  useEffect(() => {
    setHydrated(true);

    const storedProviders = safeParseJSON<unknown[]>(
      window.localStorage.getItem(STORAGE.selectedProviders),
      []
    );
    setSelectedProviders(uniqNumbers(storedProviders));

    const storedWatchlist = safeParseJSON<MovieLite[]>(
      window.localStorage.getItem(STORAGE.watchlist),
      []
    );
    setWatchlist(Array.isArray(storedWatchlist) ? storedWatchlist : []);

    const storedSeen = safeParseJSON<unknown[]>(
      window.localStorage.getItem(STORAGE.seen),
      []
    );
    setSeen(uniqNumbers(storedSeen));

    const storedSkipped = safeParseJSON<unknown[]>(
      window.localStorage.getItem(STORAGE.skipped),
      []
    );
    setSkipped(uniqNumbers(storedSkipped));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE.selectedProviders,
      JSON.stringify(selectedProviders)
    );
  }, [hydrated, selectedProviders]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.watchlist, JSON.stringify(watchlist));
  }, [hydrated, watchlist]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.seen, JSON.stringify(seen));
  }, [hydrated, seen]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.skipped, JSON.stringify(skipped));
  }, [hydrated, skipped]);

  async function loadProviders() {
    setProvidersError(null);
    try {
      const res = await fetch("/api/movies/providers?region=FR&language=fr-FR");
      const data = (await res.json()) as
        | { region: string; providers: Provider[] }
        | { error: string; details?: unknown };
      if (!res.ok) {
        const message =
          "error" in data && data.error ? data.error : "Impossible de charger les plateformes.";
        setProvidersError(message);
        setProviders([]);
        return;
      }
      const providers = "providers" in data && Array.isArray(data.providers) ? data.providers : [];
      setProviders(providers);
    } catch {
      setProvidersError("Impossible de charger les plateformes.");
      setProviders([]);
    }
  }

  useEffect(() => {
    void loadProviders();
  }, []);

  function resetFeed() {
    setQueue([]);
    setNextPage(1);
    setTotalPages(null);
    setMoviesError(null);
    setDrag({ x: 0, y: 0, active: false });
    setOutDir(null);
  }

  useEffect(() => {
    if (!hydrated) return;
    resetFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, selectedProviders.join(",")]);

  async function loadMoreMovies() {
    if (isLoadingMovies) return;
    if (totalPages != null && nextPage > totalPages) return;

    setIsLoadingMovies(true);
    setMoviesError(null);
    try {
      const params = new URLSearchParams();
      params.set("region", "FR");
      params.set("language", "fr-FR");
      params.set("page", String(nextPage));
      if (selectedProviders.length > 0) {
        params.set("providers", selectedProviders.join(","));
      }

      const res = await fetch(`/api/movies/discover?${params.toString()}`);
      const data = (await res.json()) as
        | { results: Movie[]; totalPages: number }
        | { error: string; details?: unknown };

      if (!res.ok) {
        const message =
          "error" in data && data.error ? data.error : "Impossible de charger des films.";
        setMoviesError(message);
        return;
      }

      const results = Array.isArray((data as { results: Movie[] }).results)
        ? (data as { results: Movie[] }).results
        : [];
      const incoming = results.filter((m) => !swipedIds.has(m.id));

      setQueue((prev) => {
        const seenIdsLocal = new Set(prev.map((m) => m.id));
        const uniqueIncoming = incoming.filter((m) => !seenIdsLocal.has(m.id));
        return [...prev, ...uniqueIncoming];
      });

      setTotalPages((data as { totalPages: number }).totalPages ?? null);
      setNextPage((p) => p + 1);
    } catch {
      setMoviesError("Impossible de charger des films.");
    } finally {
      setIsLoadingMovies(false);
    }
  }

  useEffect(() => {
    if (!hydrated) return;
    if (queue.length >= 5) return;
    if (isLoadingMovies) return;
    void loadMoreMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, queue.length, isLoadingMovies, selectedProviders.join(",")]);

  function commitSwipe(direction: SwipeDirection, movie: Movie) {
    if (direction === "right") {
      const lite = movieToLite(movie);
      setWatchlist((prev) =>
        prev.some((m) => m.id === lite.id) ? prev : [lite, ...prev]
      );
      return;
    }
    if (direction === "down") {
      setSeen((prev) => (prev.includes(movie.id) ? prev : [movie.id, ...prev]));
      return;
    }
    setSkipped((prev) =>
      prev.includes(movie.id) ? prev : [movie.id, ...prev]
    );
  }

  function swipe(direction: SwipeDirection) {
    if (!currentMovie) return;

    setOutDir(direction);
    window.setTimeout(() => {
      commitSwipe(direction, currentMovie);
      setQueue((prev) => prev.slice(1));
      setDrag({ x: 0, y: 0, active: false });
      setOutDir(null);
    }, ANIM_MS);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!currentMovie) return;
    if (outDir) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current) return;
    if (!drag.active) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setDrag({ x: dx, y: dy, active: true });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    startRef.current = null;

    if (dx > SWIPE_X_PX) return swipe("right");
    if (dx < -SWIPE_X_PX) return swipe("left");
    if (dy > SWIPE_Y_PX) return swipe("down");

    setDrag({ x: 0, y: 0, active: false });
  }

  const cardTransform = useMemo(() => {
    if (!currentMovie) return "translate3d(0px,0px,0) rotate(0deg)";

    if (outDir === "right") return "translate3d(420px,-40px,0) rotate(18deg)";
    if (outDir === "left") return "translate3d(-420px,-40px,0) rotate(-18deg)";
    if (outDir === "down") return "translate3d(0px,560px,0) rotate(0deg)";

    const rotate = Math.max(-12, Math.min(12, drag.x / 20));
    return `translate3d(${drag.x}px,${drag.y}px,0) rotate(${rotate}deg)`;
  }, [currentMovie, drag.x, drag.y, outDir]);

  const cardTransition = outDir
    ? `transform ${ANIM_MS}ms ease`
    : drag.active
      ? "none"
      : "transform 220ms ease";

  const providersToShow = useMemo(() => {
    const list = providers ?? [];
    const sorted = [...list].sort((a, b) => a.displayPriority - b.displayPriority);
    return providersExpanded ? sorted : sorted.slice(0, 14);
  }, [providers, providersExpanded]);

  const titleYear = currentMovie
    ? [currentMovie.title, yearFromDate(currentMovie.releaseDate)].filter(Boolean).join(" · ")
    : null;

  return (
    <section className="mx-auto w-full max-w-4xl">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Swipe films (prototype)</h1>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Sélectionne tes plateformes, puis swipe&nbsp;: droite = <strong>à voir</strong>, bas ={" "}
          <strong>déjà vu</strong>, gauche = <strong>non</strong>.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <span>
            Watchlist&nbsp;: <strong className="text-neutral-900 dark:text-neutral-100">{watchlist.length}</strong>
          </span>
          <span>
            Déjà vu&nbsp;: <strong className="text-neutral-900 dark:text-neutral-100">{seen.length}</strong>
          </span>
          <span>
            Non&nbsp;: <strong className="text-neutral-900 dark:text-neutral-100">{skipped.length}</strong>
          </span>
          <Link href="/outils/swipe-films/ce-soir" className="underline underline-offset-4">
            Ce soir →
          </Link>
        </div>
      </header>

      <section className="mb-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">Plateformes (France)</h2>
          <button
            type="button"
            className="text-xs text-neutral-600 dark:text-neutral-400 underline underline-offset-4"
            onClick={() => setSelectedProviders([])}
          >
            Tout décocher
          </button>
        </div>

        {providersError ? (
          <p className="mt-3 text-xs text-red-700 dark:text-red-300">{providersError}</p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {providersToShow.map((p) => {
            const checked = selectedProviders.includes(p.id);
            return (
              <label
                key={p.id}
                className={[
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
                  checked
                    ? "border-neutral-900/30 dark:border-neutral-100/30 bg-neutral-900/5 dark:bg-neutral-100/5"
                    : "border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/20",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="accent-neutral-900 dark:accent-neutral-100"
                  checked={checked}
                  onChange={(e) => {
                    setSelectedProviders((prev) => {
                      if (e.target.checked) return prev.includes(p.id) ? prev : [...prev, p.id];
                      return prev.filter((id) => id !== p.id);
                    });
                  }}
                />
                <span className="truncate">{p.name}</span>
              </label>
            );
          })}
        </div>

        {(providers?.length ?? 0) > 14 ? (
          <div className="mt-3">
            <button
              type="button"
              className="text-xs text-neutral-600 dark:text-neutral-400 underline underline-offset-4"
              onClick={() => setProvidersExpanded((v) => !v)}
            >
              {providersExpanded ? "Voir moins" : "Voir plus"}
            </button>
          </div>
        ) : null}

        <p className="mt-4 text-[11px] text-neutral-600 dark:text-neutral-400">
          Astuce&nbsp;: si tu ne coches rien, le feed n’est pas filtré par plateforme.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 items-start">
        <div className="space-y-3">
          <div className="relative mx-auto w-full max-w-[360px]">
            <div
              className="select-none touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                startRef.current = null;
                setDrag({ x: 0, y: 0, active: false });
              }}
            >
              <div
                className="rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm"
                style={{
                  transform: cardTransform,
                  transition: cardTransition,
                }}
              >
                {currentMovie?.posterPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${TMDB_POSTER_BASE}${currentMovie.posterPath}`}
                    alt={currentMovie.title}
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                    <div className="text-center px-6">
                      <div className="text-sm font-semibold">{currentMovie?.title ?? "…"}</div>
                      <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        Pas d’affiche disponible
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="text-sm font-semibold">{titleYear ?? "Chargement…"}</div>
                  {currentMovie?.overview ? (
                    <p className="mt-2 text-xs text-neutral-700 dark:text-neutral-300 line-clamp-4">
                      {currentMovie.overview}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[360px] grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => swipe("left")}
              disabled={!currentMovie || !!outDir}
              className="rounded-xl border border-red-200 dark:border-red-900/50 bg-white/60 dark:bg-neutral-950/30 px-3 py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-60"
            >
              Non
            </button>
            <button
              type="button"
              onClick={() => swipe("down")}
              disabled={!currentMovie || !!outDir}
              className="rounded-xl border border-sky-200 dark:border-sky-900/50 bg-white/60 dark:bg-neutral-950/30 px-3 py-2 text-xs font-medium hover:bg-sky-50 dark:hover:bg-sky-950/30 disabled:opacity-60"
            >
              Déjà vu
            </button>
            <button
              type="button"
              onClick={() => swipe("right")}
              disabled={!currentMovie || !!outDir}
              className="rounded-xl border border-green-200 dark:border-green-900/50 bg-white/60 dark:bg-neutral-950/30 px-3 py-2 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-950/30 disabled:opacity-60"
            >
              À voir
            </button>
          </div>

          {moviesError ? (
            <p className="mx-auto w-full max-w-[360px] text-xs text-red-700 dark:text-red-300">
              {moviesError}
            </p>
          ) : null}

          <div className="mx-auto w-full max-w-[360px] flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => {
                resetFeed();
              }}
            >
              Recharger le feed
            </button>
            <span>{isLoadingMovies ? "Chargement…" : queue.length > 0 ? `${queue.length} en file` : "—"}</span>
          </div>
        </div>

        <aside className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 p-4 sm:p-5">
          <h2 className="text-sm font-semibold">Watchlist</h2>
          {watchlist.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-700 dark:text-neutral-300">
              Swipe à droite pour ajouter des films.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {watchlist.slice(0, 8).map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {m.title}
                      {yearFromDate(m.releaseDate) ? (
                        <span className="text-neutral-500"> · {yearFromDate(m.releaseDate)}</span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] text-neutral-600 dark:text-neutral-400 underline underline-offset-4"
                    onClick={() => {
                      setWatchlist((prev) => prev.filter((x) => x.id !== m.id));
                    }}
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          )}

          {watchlist.length > 0 ? (
            <div className="mt-4">
              <Link
                href="/outils/swipe-films/ce-soir"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/40 px-4 py-2 text-xs font-medium hover:border-neutral-400 dark:hover:border-neutral-600 transition"
              >
                Choisir pour ce soir →
              </Link>
            </div>
          ) : null}

          <p className="mt-5 text-[11px] text-neutral-600 dark:text-neutral-400">
            Prototype&nbsp;: données <span className="font-medium">TMDB</span>. MVP à usage personnel / non‑commercial.
          </p>
        </aside>
      </section>
    </section>
  );
}
