"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { href: string; label: string };

const items: Item[] = [
  { href: "/admin", label: "Accueil" },
  { href: "/admin/controle", label: "Contrôle éditorial" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/series", label: "Séries" },
  { href: "/admin/retrospectives", label: "Rétrospectives" },
  { href: "/admin/mises-en-avant", label: "Mises en avant" },
  { href: "/admin/calendrier", label: "Calendrier" },
  { href: "/admin/historique", label: "Historique" },
  { href: "/admin/analytics", label: "Visiteurs humains et IA" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeItem = items.find((it) => isActive(pathname, it.href));

  return (
    <aside className="md:sticky md:top-6 md:h-[calc(100vh-3rem)]">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15">
        <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Admin
          </div>
          <div className="mt-0.5 text-xs text-neutral-500">
            Carnet d’expérience
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 md:hidden"
          aria-expanded={open}
        >
          {activeItem?.label ?? "Menu"}
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={`${open ? "block" : "hidden"} md:block`}>
          <nav className="border-t border-neutral-200 dark:border-neutral-800 p-2 md:border-t-0">
            {items.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
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
      </div>
    </aside>
  );
}
