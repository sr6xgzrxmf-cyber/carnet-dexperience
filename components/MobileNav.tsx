"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Item = {
  href: string;
  label: string;
  active?: boolean;
};

export default function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // évite les soucis SSR/hydration : on ne portal qu'après montage
  useEffect(() => {
    setMounted(true);
  }, []);

  // fermeture ESC + lock scroll
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[9999]">
              {/* overlay */}
              <button
                aria-label="Fermer le menu"
                className="absolute inset-0 bg-black/30"
                onClick={() => setOpen(false)}
              />

              {/* panneau */}
              <div className="absolute left-0 top-0 h-full w-[80%] max-w-xs bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Carnet d’expérience
                  </div>

                  <button
                    type="button"
                    aria-label="Fermer"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <nav className="mt-6 grid gap-1 text-[15px]">
                  {items.map((it) =>
                    it.active ? (
                      <span
                        key={it.href}
                        aria-current="page"
                        className="rounded-xl px-3 py-2 font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900"
                      >
                        {it.label}
                      </span>
                    ) : (
                      <Link
                        key={it.href}
                        href={it.href}
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-2 text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
                      >
                        {it.label}
                      </Link>
                    )
                  )}
                </nav>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}