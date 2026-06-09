import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { SpeedInsights } from "@vercel/speed-insights/next";
import DevKeyWarningTrace from "@/components/dev/DevKeyWarningTrace";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carnet d’expérience",
  description:
    "Carnet d’expérience — parcours, articles, méthodes et retours de terrain.",
  verification: {
    google: "pqYX0KqYycbGy3Bhid-rjOcJsUvGZ2cEgkk0y29iVWw",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const siteUrl = "https://www.carnetdexperience.fr";

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Carnet d’expérience",
      inLanguage: "fr-FR",
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#laurent-guyonnet`,
      name: "Laurent Guyonnet",
      url: siteUrl,
      // Mets ici uniquement des URLs publiques solides si tu en as
      // sameAs: ["https://github.com/…", "https://…"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "bg-[var(--background)]",
          "text-[var(--foreground)]",
          "text-[15px] leading-[1.6]",
          "antialiased",
        ].join(" ")}
      >
        <Script
          id="jsonld-site"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />

        <SiteHeader />

        <main className="site-container py-10 sm:py-14">{children}</main>

        <SpeedInsights />

        {process.env.NODE_ENV !== "production" ? <DevKeyWarningTrace /> : null}
      </body>
    </html>
  );
}
