import type { MetadataRoute } from "next";

const SITE_URL = "https://www.carnetdexperience.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/outils/",
        "/badge/",
        "/atelier/fiche/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
