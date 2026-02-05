// content/editorial.ts
import retrospectives from "./retrospectives.json";

export const featuredSeriesList: string[] = retrospectives.featuredSeriesList ?? [];
export const featuredSeriesSummaries: Record<string, string> =
  retrospectives.featuredSeriesSummaries ?? {};
