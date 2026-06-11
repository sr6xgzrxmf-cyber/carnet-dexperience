// content/editorial.ts
import retrospectives from "./retrospectives.json";

export const featuredSeriesList: string[] = retrospectives.featuredSeriesList ?? [];
export const featuredSeriesSummaries: Record<string, string> =
  retrospectives.featuredSeriesSummaries ?? {};
export const featuredSeriesTeasers: Record<
  string,
  { benefit?: string; forWhom?: string }
> = retrospectives.featuredSeriesTeasers ?? {};

export type FeaturedWorkArticle = {
  slug: string;
  label: string;
};

export const featuredWorkArticles: FeaturedWorkArticle[] = [
  {
    slug: "2026-02-17-hygiene-de-langage",
    label: "Posture",
  },
  {
    slug: "2026-04-30-ameliorer-un-process-sans-conflit",
    label: "Process",
  },
  {
    slug: "2026-05-18-construire-un-partenariat-sans-devenir-commercial",
    label: "Partenariat",
  },
  {
    slug: "2026-02-24-remonter-une-photo-strategique",
    label: "Pilotage",
  },
  {
    slug: "2026-03-31-recollectiviser-sans-conflit",
    label: "Collectif",
  },
  {
    slug: "2026-03-05-aider-a-decider-responsabilite",
    label: "Décision",
  },
];
