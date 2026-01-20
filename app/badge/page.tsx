"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

const URL = "https://www.carnetdexperience.fr";

function usePrefersDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const apply = () => setDark(!!mq.matches);
    apply();
    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    // @ts-expect-error older Safari
    mq.addListener(apply);
    // @ts-expect-error older Safari
    return () => mq.removeListener(apply);
  }, []);
  return dark;
}

export default function BadgePage() {
  const prefersDark = usePrefersDark();

  const colors = useMemo(() => {
    return prefersDark
      ? { bg: "#0b0b0c", fg: "#ffffff" }
      : { bg: "#ffffff", fg: "#0b0b0c" };
  }, [prefersDark]);

  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const raw = await QRCode.toString(URL, {
        type: "svg",
        margin: 1,
        width: 1024,
        color: { dark: colors.fg, light: colors.bg },
        errorCorrectionLevel: "M",
      });

      // Important : on enlève width/height pour que le SVG devienne 100% responsive
      const responsive = raw
        .replace(/width="[^"]*"/, "")
        .replace(/height="[^"]*"/, "");

      if (!cancelled) setSvg(responsive);
    })();

    return () => {
      cancelled = true;
    };
  }, [colors]);

  return (
    <main
      className="w-full"
      style={{
        background: colors.bg,
        color: colors.fg,
        // On prend la hauteur visible iPhone sans se faire manger par les barres
        minHeight: "100svh",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
        paddingTop: "12px",
      }}
    >
      <div className="mx-auto w-full max-w-[520px] px-4">
        <div className="text-center mb-3">
          <p className="text-xs opacity-80">Scanne pour ouvrir</p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight">
            Carnet d’expérience
          </h1>
        </div>

        {/* Zone QR : toujours carré + jamais trop grand */}
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: "min(92vw, 420px)",
          }}
        >
          <div
            className="rounded-3xl p-3"
            style={{
              background: prefersDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.03)",
              border: prefersDark
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: colors.bg,
                // carré parfait, et le contenu s’adapte
                aspectRatio: "1 / 1",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                }}
                // SVG inline
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>

          {/* Force le SVG à remplir le carré */}
          <style jsx>{`
            :global(svg) {
              width: 100% !important;
              height: 100% !important;
              display: block;
            }
          `}</style>
        </div>

        <p className="mt-3 text-xs opacity-70 text-center">
          {URL.replace("https://", "")}
        </p>
      </div>
    </main>
  );
}