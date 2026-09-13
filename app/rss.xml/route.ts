import { getPublishedArticles } from "@/lib/articles";
import { normalizeArticleDate } from "@/lib/article-date";

const SITE_URL = "https://www.carnetdexperience.fr";
const FEED_TITLE = "Carnet d’expérience — Laurent Guyonnet";
const FEED_DESCRIPTION =
  "Laurent Guyonnet. Parcours, articles et situations de terrain pour clarifier, transmettre et rendre adoptables des sujets complexes.";
const MAX_ITEMS = 50;

export const revalidate = 300;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(isoDate: string | null): string {
  const date = isoDate ? new Date(`${isoDate}T12:00:00Z`) : new Date();
  return date.toUTCString();
}

export function GET() {
  const articles = getPublishedArticles().slice(0, MAX_ITEMS);

  const items = articles
    .map((article) => {
      const url = `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`;
      const pubDate = toRfc822(normalizeArticleDate(article.meta.date));

      return `    <item>
      <title>${escapeXml(article.meta.title ?? "")}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.meta.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
