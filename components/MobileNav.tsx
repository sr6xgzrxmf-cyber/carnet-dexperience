"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Item = {
  href: string;
  label: string;
  active?: boolean;
};

export default function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // évite les soucis SSR/hydration : on ne portal qu'après montage
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const trigger = triggerRef.current;
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
      trigger?.focus();
    };
  }, [open]);

  function keepFocusInside(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-300 bg-white/40 px-4 text-sm text-neutral-900 hover:bg-white/70 dark:border-neutral-700 dark:bg-neutral-950/40 dark:text-neutral-100 dark:hover:bg-neutral-900/60"
      >
        Menu
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[9999]">
              {/* overlay */}
              <button
                type="button"
                aria-label="Fermer le menu"
                tabIndex={-1}
                className="absolute inset-0 bg-black/30"
                onClick={() => setOpen(false)}
              />

              {/* panneau */}
              <div
                id="mobile-navigation"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-navigation-title"
                onKeyDown={keepFocusInside}
                className="absolute left-0 top-0 h-full w-[80%] max-w-xs bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <div
                    id="mobile-navigation-title"
                    className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                  >
                    Carnet d’expérience
                  </div>

                  <button
                    ref={closeButtonRef}
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
