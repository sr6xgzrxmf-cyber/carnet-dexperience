import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
  description: "Carnet d’expérience — parcours, articles, méthodes et retours de terrain.",
  verification: {
    google: "pqYX0KqYycbGy3Bhid-rjOcJsUvGZ2cEgkk0y29iVWw" // ← colle la valeur exacte ici
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JZFMYF98BZ"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JZFMYF98BZ');
          `}
        </Script>
      </head>

      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "bg-white dark:bg-neutral-950",
          "text-neutral-900 dark:text-neutral-100",
          "text-[15px] leading-[1.6]",
          "antialiased",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}