type TmdbFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getAuth() {
  const readAccessToken = process.env.TMDB_API_READ_ACCESS_TOKEN?.trim();
  const apiKey = process.env.TMDB_API_KEY?.trim();

  if (readAccessToken) return { kind: "bearer" as const, token: readAccessToken };
  if (apiKey) return { kind: "api_key" as const, key: apiKey };

  return null;
}

function toStringValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export class TmdbError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
    this.details = details;
  }
}

export async function tmdbGet<T>(
  path: string,
  params: Record<string, unknown> = {},
  options: TmdbFetchOptions = {}
): Promise<T> {
  const auth = getAuth();
  if (!auth) {
    throw new TmdbError(
      "TMDB credentials missing. Set TMDB_API_READ_ACCESS_TOKEN (preferred) or TMDB_API_KEY.",
      500
    );
  }

  const url = new URL(`${TMDB_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`);
  for (const [key, value] of Object.entries(params)) {
    const strValue = toStringValue(value);
    if (strValue != null && strValue !== "") url.searchParams.set(key, strValue);
  }

  const headers: Record<string, string> = {
    accept: "application/json",
    ...(options.headers ?? {}),
  };

  if (auth.kind === "bearer") {
    headers.Authorization = `Bearer ${auth.token}`;
  } else {
    url.searchParams.set("api_key", auth.key);
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      try {
        body = await res.text();
      } catch {}
    }
    throw new TmdbError(`TMDB request failed (${res.status}).`, res.status, body);
  }

  return (await res.json()) as T;
}

