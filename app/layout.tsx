import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
          // Base visuelle
          "bg-white dark:bg-neutral-950",
          "text-neutral-900 dark:text-neutral-100",
          // Typo globale (base)
          "text-[15px] leading-[1.6]",
          "antialiased",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}