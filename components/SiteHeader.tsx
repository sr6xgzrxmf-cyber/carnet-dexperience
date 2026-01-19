"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "@/components/MobileNav";

export default function SiteHeader() {
  const pathname = usePathname();

  // ⛔️ Pas de header sur la home
  if (pathname === "/") return null;

  const isParcours = pathname === "/parcours" || pathname.startsWith("/parcours/");
  const isArticles = pathname === "/articles" || pathname.startsWith("/articles/");
  const isAccompagnement = pathname === "/atelier" || pathname.startsWith("/atelier/");
  const isContact = pathname === "/contact" || pathname.startsWith("/contact/");

  const activeClass = "font-semibold text-neutral-900/70 dark:text-neutral-100/80";
  const linkClass = "text-neutral-600 dark:text-neutral-400 hover:underline underline-offset-4";

  const items = [
    { href: "/", label: "Accueil", active: false },
    { href: "/parcours", label: "Parcours", active: isParcours },
    { href: "/articles", label: "Articles", active: isArticles },
    { href: "/atelier", label: "Accompagnement", active: isAccompagnement },
    { href: "/contact", label: "Contact", active: isContact },
  ];

  return (
    <header className="border-b border-neutral-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/70 backdrop-blur sticky top-0 z-40">
      <div className="site-container pt-4 pb-3">
        <div className="flex items-center gap-4">
          {/* gauche : burger (mobile) + nav (desktop) */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <MobileNav items={items} />
            </div>

            <nav className="hidden md:flex items-center gap-x-6 text-sm whitespace-nowrap">
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
          </div>

          {/* mobile : titre à droite */}
<div className="md:hidden ml-auto text-right text-lg font-semibold whitespace-nowrap text-neutral-900 dark:text-neutral-100">
  Carnet d’expérience
</div>

          {/* desktop : titre à droite */}
          <div className="hidden md:block ml-auto text-lg font-semibold whitespace-nowrap text-neutral-900 dark:text-neutral-100">
            Carnet d’expérience
          </div>
        </div>
      </div>
    </header>
  );
}