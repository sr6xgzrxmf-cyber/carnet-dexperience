"use client";

import { useEffect, useRef, useState } from "react";

export default function GiscusComments() {
  const embedRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled || !embedRef.current) return;
    if (embedRef.current.hasChildNodes()) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    script.setAttribute("data-repo", "sr6xgzrxmf-cyber/carnet-dexperience");
    script.setAttribute("data-repo-id", "R_kgDOQ4QhsA");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOQ4QhsM4C05jR");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "fr");

    embedRef.current.appendChild(script);
  }, [enabled]);

  return (
    <section className="mt-16" aria-label="Commentaires">
      {!enabled ? (
        <div className="border border-[var(--line)] bg-[var(--paper-bright)] p-6">
          <p className="m-0 text-sm text-[var(--muted)]">
            Les commentaires sont hébergés par Giscus et GitHub. Ils ne sont
            chargés qu’à votre demande.
          </p>
          <button
            type="button"
            onClick={() => setEnabled(true)}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-5 text-sm font-semibold"
          >
            Afficher les commentaires
          </button>
        </div>
      ) : null}
      <div ref={embedRef} aria-live="polite" />
    </section>
  );
}
