import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les routes d'administration lisent content/ sur le disque : on s'assure
  // que ces fichiers sont embarqués dans les fonctions déployées sur Vercel.
  outputFileTracingIncludes: {
    "/api/articles/**/*": ["./content/**/*"],
    "/api/admin/**/*": ["./content/**/*"],
    "/admin/**/*": ["./content/**/*"],
    "/projets/jardin-partage/**/*": ["./content/private/**/*"],
  },
  // Liens courts à partager sur LinkedIn : ils mènent à la page visée et
  // étiquettent la visite pour les statistiques.
  async redirects() {
    return [
      {
        source: "/donnees",
        destination: "/series/mes-donnees-a-la-maison?utm_source=LinkedIn&utm_campaign=mes-donnees",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
