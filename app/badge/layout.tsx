import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Mon badge",
  robots: { index: false, follow: false },
  appleWebApp: {
    // Nécessaire pour qu'iOS applique statusBarStyle sur les icônes ajoutées
    // à l'écran d'accueil (mode "Web Clip") — sans ceci, theme-color et
    // viewport-fit=cover n'y ont aucun effet, contrairement à Safari normal.
    capable: true,
    statusBarStyle: "default",
    title: "Mon badge",
  },
  // Next.js ne génère que "mobile-web-app-capable" (sans préfixe) ; iOS a
  // longtemps documenté spécifiquement la variante préfixée "apple-".
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

export default function BadgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
