import type { MetadataRoute } from "next";
import { getAllArticles, toTimestamp } from "@/lib/articles";
import { getAllParcours } from "@/lib/parcours";

const SITE_URL = "https://www.carnetdexperience.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles({ includeFuture: false });
  const parcours = getAllParcours().filter(
    (item) => item.meta.type !== "formation"
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/atelier`, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${SITE_URL}/atelier/etudes-de-cas`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/situations-d-intervention`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${SITE_URL}/parcours`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/articles`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${SITE_URL}/articles/archives`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/atelier/lecture`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.7 },
    {
      url: `${SITE_URL}/confidentialite`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/mentions-legales`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${encodeURIComponent(a.slug)}`,
    lastModified: toTimestamp(a.meta?.date)
      ? new Date(toTimestamp(a.meta?.date))
      : undefined,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const parcoursRoutes: MetadataRoute.Sitemap = parcours.map((item) => ({
    url: `${SITE_URL}/parcours/${encodeURIComponent(item.slug)}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...parcoursRoutes, ...articleRoutes];
}
