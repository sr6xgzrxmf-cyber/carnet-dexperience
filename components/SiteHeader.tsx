"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ContactButton from "@/components/ContactButton";

export default function SiteHeader() {
  const pathname = usePathname();

  // ⛔️ Pas de header sur la home
  if (pathname === "/") return null;

  const isParcoursRoot = pathname === "/parcours";
  const isArticlesRoot = pathname === "/articles";

  return (
    <header className="border-b border-neutral-200/70 dark:border-neutral-800">
      <div className="site-container pt-5 pb-3">
        <div className="flex items-center justify-between gap-6">
          {/* Navigation à gauche */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/" className="hover:underline">
              Accueil
            </Link>

            {!isParcoursRoot && (
              <Link href="/parcours" className="hover:underline">
                Parcours
              </Link>
            )}

            {!isArticlesRoot && (
              <Link href="/articles" className="hover:underline">
                Articles
              </Link>
            )}

            <ContactButton
              label="Contact"
              className="hover:underline text-sm text-neutral-600 dark:text-neutral-400 bg-transparent border-0 px-0 py-0 rounded-none"
            />
          </nav>

          {/* Signature à droite */}
          <div className="text-lg font-semibold whitespace-nowrap">
            Carnet d’expérience
          </div>
        </div>
      </div>
    </header>
  );
}