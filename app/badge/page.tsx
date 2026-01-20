"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

const URL =
  "https://www.carnetdexperience.fr/?utm_source=badge&utm_medium=qr&utm_campaign=rencontre";

function usePrefersDark() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => setDark(mq.matches);
    apply();

    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return dark;
}

export default function BadgePage() {
  const prefersDark = usePrefersDark();

  const colors = useMemo(
    () =>
      prefersDark
        ? { bg: "#0b0b0c", fg: "#ffffff" }
        : { bg: "#ffffff", fg: "#0b0b0c" },
    [prefersDark]
  );

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

      // rendre le SVG 100% responsive (pas de width/height fixes)
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

        <div className="mx-auto w-full" style={{ maxWidth: "min(92vw, 420px)" }}>
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
                aspectRatio: "1 / 1",
              }}
            >
              <div
                style={{ width: "100%", height: "100%" }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>

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