"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MovieLite = {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string | null;
};

const STORAGE_WATCHLIST = "swipe-films:watchlist:v1";
const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w500";

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function yearFromDate(date: string | null | undefined) {
  if (!date) return null;
  const year = date.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

export default function CeSoirPage() {
  const [hydrated, setHydrated] = useState(false);
  const [watchlist, setWatchlist] = useState<MovieLite[]>([]);
  const [pickId, setPickId] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    const stored = safeParseJSON<MovieLite[]>(
      window.localStorage.getItem(STORAGE_WATCHLIST),
      []
    );
    setWatchlist(Array.isArray(stored) ? stored : []);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_WATCHLIST, JSON.stringify(watchlist));
  }, [hydrated, watchlist]);

  const pick = useMemo(() => {
    if (!pickId) return null;
    return watchlist.find((m) => m.id === pickId) ?? null;
  }, [watchlist, pickId]);

  function chooseRandom() {
    if (watchlist.length === 0) return;
    const idx = Math.floor(Math.random() * watchlist.length);
    setPickId(watchlist[idx]?.id ?? null);
  }

  return (
    <section className="mx-auto w-full max-w-4xl">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Ce soir</h1>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Un choix aléatoire dans ta watchlist.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <Link href="/outils/swipe-films" className="underline underline-offset-4">
            ← Retour au swipe
          </Link>
          <span>
            Watchlist&nbsp;:{" "}
            <strong className="text-neutral-900 dark:text-neutral-100">{watchlist.length}</strong>
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 items-start">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={chooseRandom}
              disabled={watchlist.length === 0}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/40 px-4 py-2 text-xs font-medium hover:border-neutral-400 dark:hover:border-neutral-600 transition disabled:opacity-60"
            >
              Choisir un film
            </button>
            <button
              type="button"
              onClick={() => setPickId(null)}
              disabled={!pick}
              className="text-xs text-neutral-600 dark:text-neutral-400 underline underline-offset-4 disabled:opacity-60"
            >
              Effacer le choix
            </button>
            <button
              type="button"
              onClick={() => {
                setPickId(null);
                setWatchlist([]);
              }}
              disabled={watchlist.length === 0}
              className="ml-auto text-xs text-neutral-600 dark:text-neutral-400 underline underline-offset-4 disabled:opacity-60"
            >
              Vider la watchlist
            </button>
          </div>

          {pick ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-start">
              <div className="w-full max-w-[220px] sm:max-w-none">
                {pick.posterPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${TMDB_POSTER_BASE}${pick.posterPath}`}
                    alt={pick.title}
                    className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 object-cover aspect-[2/3]"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 aspect-[2/3] flex items-center justify-center">
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      Pas d’affiche
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  {pick.title}
                  {yearFromDate(pick.releaseDate) ? (
                    <span className="text-neutral-500"> · {yearFromDate(pick.releaseDate)}</span>
                  ) : null}
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    className="text-xs underline underline-offset-4 text-neutral-600 dark:text-neutral-400"
                    onClick={() => chooseRandom()}
                  >
                    Re-tirer au sort
                  </button>
                  <button
                    type="button"
                    className="text-xs underline underline-offset-4 text-neutral-600 dark:text-neutral-400"
                    onClick={() => {
                      setWatchlist((prev) => prev.filter((m) => m.id !== pick.id));
                      setPickId(null);
                    }}
                  >
                    Retirer de la watchlist
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-xs text-neutral-700 dark:text-neutral-300">
              {watchlist.length === 0
                ? "Ta watchlist est vide."
                : "Clique sur “Choisir un film” pour tirer au sort."}
            </p>
          )}
        </div>

        <aside className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/30 p-4 sm:p-5">
          <h2 className="text-sm font-semibold">Dans ta watchlist</h2>
          {watchlist.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-700 dark:text-neutral-300">
              Ajoute des films depuis la page swipe.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {watchlist.map((m) => (
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
                      setPickId((prev) => (prev === m.id ? null : prev));
                    }}
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </section>
  );
}
