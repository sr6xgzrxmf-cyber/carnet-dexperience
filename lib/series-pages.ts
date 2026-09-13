import { getAllArticles, isArticlePublished, type ArticleItem } from "./articles";
import { getAllSeriesCatalog, type SeriesCatalogItem } from "./series-catalog";

export type SeriesEpisode = {
  item: ArticleItem;
  published: boolean;
};

export type SeriesWithEpisodes = {
  series: SeriesCatalogItem;
  episodes: SeriesEpisode[];
  readingMinutes: number;
};

function episodeOrder(item: ArticleItem): number {
  const order = item.meta.series?.order;
  const parsed = typeof order === "string" ? Number(order) : order;
  return Number.isFinite(parsed) ? (parsed as number) : Number.MAX_SAFE_INTEGER;
}

/**
 * Une série sans aucun épisode visible n'a pas de page : elle n'aurait rien à
 * montrer. En dev et en preview on compte aussi les épisodes programmés, comme
 * partout ailleurs sur le site.
 */
export function getAllSeriesWithEpisodes(options?: {
  includeFuture?: boolean;
}): SeriesWithEpisodes[] {
  const includeFuture = options?.includeFuture ?? false;
  const now = new Date();
  const articles = getAllArticles({ includeFuture });

  return getAllSeriesCatalog()
    .map((series) => {
      const episodes = articles
        .filter((item) => item.meta.series?.slug === series.slug)
        .sort((a, b) => episodeOrder(a) - episodeOrder(b))
        .map((item) => ({ item, published: isArticlePublished(item.meta, now) }));

      return {
        series,
        episodes,
        readingMinutes: episodes.reduce(
          (total, episode) => total + episode.item.readingMinutes,
          0,
        ),
      };
    })
    .filter((entry) => entry.episodes.length > 0);
}

export function getSeriesWithEpisodes(
  slug: string,
  options?: { includeFuture?: boolean },
): SeriesWithEpisodes | null {
  return (
    getAllSeriesWithEpisodes(options).find((entry) => entry.series.slug === slug) ?? null
  );
}
