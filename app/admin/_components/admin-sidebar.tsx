"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

const items: Item[] = [
  { href: "/admin", label: "Accueil" },
  { href: "/admin/controle", label: "Contrôle éditorial" },
  { href: "/admin/series", label: "Séries" },
  { href: "/admin/calendrier", label: "Calendrier" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-6 h-[calc(100vh-3rem)]">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15">
        <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Admin
          </div>
          <div className="mt-0.5 text-xs text-neutral-500">
            Carnet d’expérience
          </div>
        </div>

        <nav className="p-2">
          {items.map((it) => {
            const active = isActive(pathname, it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={[
                  "block rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-neutral-900/5 dark:bg-white/10 text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-900/5 dark:hover:bg-white/10",
                ].join(" ")}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 dark:border-neutral-800 p-2">
          <Link
            href="/"
            className="block rounded-xl px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-900/5 dark:hover:bg-white/10"
          >
            ← Retour au site
          </Link>
        </div>
      </div>
    </aside>
  );
}
