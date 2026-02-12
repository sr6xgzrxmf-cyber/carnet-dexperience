import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { tmdbGet, TmdbError } from "@/lib/tmdb";

type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

type ProvidersResponse = {
  results: Provider[];
};

function ensureProductionEnabled() {
  if (process.env.NODE_ENV !== "production") return null;
  if (process.env.ENABLE_PUBLIC_TMDB_PROXY === "true") return null;
  return NextResponse.json(
    { error: "TMDB proxy disabled in production. Set ENABLE_PUBLIC_TMDB_PROXY=true to enable." },
    { status: 403 }
  );
}

export async function GET(req: NextRequest) {
  const guard = ensureProductionEnabled();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const region = (searchParams.get("region") || "FR").toUpperCase();
  const language = searchParams.get("language") || "fr-FR";

  try {
    const data = await tmdbGet<ProvidersResponse>(
      "/watch/providers/movie",
      { watch_region: region, language },
      { next: { revalidate: 60 * 60 * 24 } }
    );

    const providers = (data.results ?? [])
      .map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path,
        displayPriority: p.display_priority,
      }))
      .sort((a, b) => a.displayPriority - b.displayPriority);

    return NextResponse.json({ region, providers });
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

