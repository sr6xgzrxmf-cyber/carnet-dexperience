import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles"; // ajuste le chemin si besoin

const SITE_URL = "https://www.carnetdexperience.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/articles`, lastModified: new Date() },
    { url: `${SITE_URL}/parcours`, lastModified: new Date() },
    { url: `${SITE_URL}/contact`, lastModified: new Date() },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${encodeURIComponent(a.slug)}`,
    // si tu as une date au format YYYY-MM-DD, c’est nickel :
    lastModified: a.meta?.date ? new Date(String(a.meta.date)) : new Date(),
  }));

  return [...staticRoutes, ...articleRoutes];
}