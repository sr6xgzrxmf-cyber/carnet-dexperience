import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Mon badge",
  robots: { index: false, follow: false },
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
