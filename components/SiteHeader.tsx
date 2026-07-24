"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "@/components/MobileNav";

export default function SiteHeader() {
  const pathname = usePathname();

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
    { href: "/atelier", label: "Comment je peux aider", active: isAccompagnement },
    { href: "/contact", label: "Contact", active: isContact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-[#f5f3ee]/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 print:hidden">
      <div className="site-container flex min-h-[72px] items-center gap-6">
        <Link
          href="/"
          className="font-[var(--font-lora)] text-xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-neutral-100"
        >
          Carnet d’expérience
        </Link>

        <nav className="ml-auto hidden items-center gap-x-7 whitespace-nowrap text-sm md:flex">
              {pathname === "/" ? (
                <span className={activeClass} aria-current="page">Accueil</span>
              ) : (
                <Link href="/" className={linkClass}>Accueil</Link>
              )}
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
                  Comment je peux aider
                </span>
              ) : (
                <Link href="/atelier" className={linkClass}>
                  Comment je peux aider
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

        <div className="ml-auto md:hidden">
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}
