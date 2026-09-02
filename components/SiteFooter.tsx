import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-[#fbfaf7] py-14 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="site-container grid gap-10 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <Link
            href="/"
            className="font-[var(--font-lora)] text-xl font-semibold tracking-[-0.03em]"
          >
            Carnet d’expérience
          </Link>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Le lien entre stratégie et terrain.
          </p>
        </div>

        <nav className="grid content-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Link href="/parcours">Parcours</Link>
          <Link href="/articles">Articles</Link>
          <Link href="/atelier">Accompagnement</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <p className="m-0 text-sm text-neutral-500 sm:text-right dark:text-neutral-500">
          © 2026 Laurent Guyonnet
          <br />
          Tous droits réservés.
        </p>

        <nav
          aria-label="Informations légales"
          className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500 sm:col-span-3"
        >
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </nav>
      </div>
    </footer>
  );
}
