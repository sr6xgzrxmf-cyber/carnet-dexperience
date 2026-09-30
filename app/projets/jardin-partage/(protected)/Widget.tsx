"use client";

import { useEffect, useRef, useState } from "react";

// Bordure haute et basse de l’iframe, à ajouter à la hauteur du contenu.
const BORDER = 2;

export default function Widget({ html }: { html: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1200);

  // Le prototype annonce sa hauteur : l'iframe s'y ajuste, sans double barre de défilement.
  useEffect(() => {
    const current = frame.current;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== current?.contentWindow) return;
      const data = event.data as { type?: string; height?: number };
      if (data?.type === "jardin-partage-height" && typeof data.height === "number") setHeight(Math.ceil(data.height) + BORDER);
    };
    // Le prototype a pu se charger avant l'hydratation : on relève sa hauteur une première fois.
    const measure = () => {
      const inner = current?.contentDocument?.body?.getBoundingClientRect().height;
      if (inner) setHeight(Math.ceil(inner) + BORDER);
    };
    window.addEventListener("message", onMessage);
    current?.addEventListener("load", measure);
    measure();
    return () => {
      window.removeEventListener("message", onMessage);
      current?.removeEventListener("load", measure);
    };
  }, []);

  return (
    <iframe
      ref={frame}
      srcDoc={html}
      title="Le Jardin Partagé — prototype"
      className="mt-6 w-full overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
      style={{ height: `${height}px`, colorScheme: "light" }}
    />
  );
}
