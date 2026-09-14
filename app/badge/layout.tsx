import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Mon badge",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function BadgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
