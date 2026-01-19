import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "Carnet d’expérience — Laurent Guyonnet",
    template: "%s — Laurent Guyonnet",
  },
  description:
    "Laurent Guyonnet. Innovation, pédagogie et déploiement terrain. Carnet d’expérience : parcours, articles et retours de terrain.",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  );
}