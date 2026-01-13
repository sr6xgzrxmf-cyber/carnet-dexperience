"use client";

import { useMemo, useState } from "react";

type ShareBarProps = {
  title: string;
  className?: string;
};

export default function ShareBar({ title, className }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback minimal
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, url: window.location.href });
    } catch {
      // user cancelled → no-op
    }
  }

  const xUrl = useMemo(() => {
    const u = typeof window === "undefined" ? "" : window.location.href;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(u)}`;
  }, [title]);

  const linkedInUrl = useMemo(() => {
    const u = typeof window === "undefined" ? "" : window.location.href;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      u
    )}`;
  }, []);

  return (
    <div
      className={[
        "mt-10 flex flex-wrap items-center gap-2",
        className ?? "",
      ].join(" ")}
    >
      {"share" in navigator ? (
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