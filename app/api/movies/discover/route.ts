import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { tmdbGet, TmdbError } from "@/lib/tmdb";

type DiscoverMovie = {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
};

type DiscoverResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: DiscoverMovie[];
};

function ensureProductionEnabled() {
  if (process.env.NODE_ENV !== "production") return null;
  if (process.env.ENABLE_PUBLIC_TMDB_PROXY === "true") return null;
  return NextResponse.json(
    { error: "TMDB proxy disabled in production. Set ENABLE_PUBLIC_TMDB_PROXY=true to enable." },
    { status: 403 }
  );
}

function parseProviders(raw: string | null): string | null {
  if (!raw) return null;
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => /^\d+$/.test(s));
  if (ids.length === 0) return null;
  return ids.join("|");
}

export async function GET(req: NextRequest) {
  const guard = ensureProductionEnabled();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const region = (searchParams.get("region") || "FR").toUpperCase();
  const language = searchParams.get("language") || "fr-FR";
  const providers = parseProviders(searchParams.get("providers"));
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);

  const params: Record<string, unknown> = {
    language,
    sort_by: "popularity.desc",
    include_adult: false,
    include_video: false,
    page,
    watch_region: region,
    with_watch_monetization_types: "flatrate",
  };

  if (providers) {
    params.with_watch_providers = providers;
  }

  try {
    const data = await tmdbGet<DiscoverResponse>("/discover/movie", params, {
      next: { revalidate: 60 * 60 },
    });

    const results = (data.results ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      originalTitle: m.original_title,
      releaseDate: m.release_date,
      posterPath: m.poster_path,
      overview: m.overview,
      voteAverage: m.vote_average,
    }));

    return NextResponse.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results,
    });
  } catch (error) {
    if (error instanceof TmdbError) {
      return NextResponse.json(
        { error: error.message, status: error.status, details: error.details },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

