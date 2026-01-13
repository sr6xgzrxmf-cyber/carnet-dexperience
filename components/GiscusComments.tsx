"use client";

import { useEffect, useRef } from "react";

export default function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.hasChildNodes()) return;

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

    ref.current.appendChild(script);
  }, []);

  return <div ref={ref} className="mt-16" />;
}