import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Laurent Guyonnet. Parcours, articles et situations de terrain pour clarifier, transmettre et rendre adoptables des sujets complexes.",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
