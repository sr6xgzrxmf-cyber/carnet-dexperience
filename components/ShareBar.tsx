"use client";

import { useEffect, useMemo, useState } from "react";

type ShareBarProps = {
  title: string;
  className?: string;
};

export default function ShareBar({ title, className }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const url = useMemo(() => {
    if (!mounted) return "";
    return window.location.href;
  }, [mounted]);

  async function copyLink() {
    const link = window.location.href;

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // fallback minimal
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function nativeShare() {
    if (!canNativeShare) return;
    try {
      await (navigator as any).share({ title, url: window.location.href });
    } catch {
      // user cancelled → no-op
    }
  }

  const xUrl = useMemo(() => {
    if (!mounted) return "#";
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(window.location.href)}`;
  }, [mounted, title]);

  const linkedInUrl = useMemo(() => {
    if (!mounted) return "#";
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.href
    )}`;
  }, [mounted]);

  return (
    <div className={["mt-10 flex flex-wrap items-center gap-2", className ?? ""].join(" ")}>
      {/* IMPORTANT: ne pas rendre conditionnellement avant mount → évite hydration mismatch */}
      {mounted && canNativeShare ? (
        <button
          onClick={nativeShare}
          className="rounded-full border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition"
        >
          Partager
        </button>
      ) : null}

      <button
        onClick={copyLink}
        className="rounded-full border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition"
      >
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>

      <a
        href={linkedInUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition"
      >
        LinkedIn
      </a>

      <a
        href={xUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition"
      >
        X
      </a>
    </div>
  );
}