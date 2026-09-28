import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les routes d'administration lisent content/ sur le disque : on s'assure
  // que ces fichiers sont embarqués dans les fonctions déployées sur Vercel.
  outputFileTracingIncludes: {
    "/api/articles/**/*": ["./content/**/*"],
    "/api/admin/**/*": ["./content/**/*"],
    "/admin/**/*": ["./content/**/*"],
  },
};

export default nextConfig;
