"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();

  // ⛔️ Pas de header sur la home
  if (pathname === "/") return null;

  const isParcours =
    pathname === "/parcours" || pathname.startsWith("/parcours/");
  const isArticles =
    pathname === "/articles" || pathname.startsWith("/articles/");
  const isAccompagnement =
    pathname === "/atelier" || pathname.startsWith("/atelier/");
  const isContact =
    pathname === "/contact" || pathname.startsWith("/contact/");

  // ✅ Actif en gris (pas noir)
  const activeClass =
    "font-semibold text-neutral-300 dark:text-neutral-300";
  const linkClass =
    "text-neutral-600 dark:text-neutral-400 hover:underline underline-offset-4";

  return (
    <header className="border-b border-neutral-200/70 dark:border-neutral-800">
      <div className="site-container pt-5 pb-3">
        <div className="flex items-center justify-between gap-6">
          {/* Navigation à gauche */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/" className={linkClass}>
              Accueil
            </Link>

            {isParcours ? (
              <span className={activeClass} aria-current="page">
                Parcours
              </span>
            ) : (
              <Link href="/parcours" className={linkClass}>
                Parcours
              </Link>
            )}

            {isArticles ? (
              <span className={activeClass} aria-current="page">
                Articles
              </span>
            ) : (
              <Link href="/articles" className={linkClass}>
                Articles
              </Link>
            )}

            {isAccompagnement ? (
              <span className={activeClass} aria-current="page">
                Accompagnement
              </span>
            ) : (
              <Link href="/atelier" className={linkClass}>
                Accompagnement
              </Link>
            )}

            {isContact ? (
              <span className={activeClass} aria-current="page">
                Contact
              </span>
            ) : (
              <Link href="/contact" className={linkClass}>
                Contact
              </Link>
            )}
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