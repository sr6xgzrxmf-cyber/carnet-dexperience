"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

const BASE = "https://www.carnetdexperience.fr/";

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

type BadgeState = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  context: string;
};

const STORAGE_KEY = "cde_badge_state_v1";

function buildUrl(s: BadgeState) {
  const params = new URLSearchParams();
  params.set("utm_source", s.utm_source);
  params.set("utm_medium", s.utm_medium);
  params.set("utm_campaign", s.utm_campaign);

  const ctx = s.context.trim();
  if (ctx) params.set("context", ctx);

  return `${BASE}?${params.toString()}`;
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

  const [state, setState] = useState<BadgeState>({
    utm_source: "badge",
    utm_medium: "qr",
    utm_campaign: "rencontre",
    context: "",
  });

  // ✅ NOUVEAU : mode présentation (QR seul)
  const [present, setPresent] = useState(false);

  // La zone de la barre de statut/encoche n'est pas repeinte par le contenu
  // de la page : sans ceci, Safari y affiche la couleur de <meta
  // name="theme-color"> par défaut au lieu du noir du mode présentation.
  useEffect(() => {
    const tags = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    );
    if (!tags.length) return;

    if (present) {
      const previous = tags.map((tag) => tag.getAttribute("content"));
      tags.forEach((tag) => tag.setAttribute("content", "#000000"));
      return () => {
        tags.forEach((tag, index) => {
          const value = previous[index];
          if (value) tag.setAttribute("content", value);
        });
      };
    }
  }, [present]);

  // Filet de sécurité : si le calque plein écran ne recouvre pas parfaitement
  // la zone de l'encoche/barre de statut sur certains iPhone, ce qui apparaît
  // en dessous doit déjà être noir plutôt que le fond crème du site.
  useEffect(() => {
    if (!present) return;

    const { style } = document.documentElement;
    const previousHtmlBg = style.backgroundColor;
    const previousBodyBg = document.body.style.backgroundColor;

    style.backgroundColor = "#000";
    document.body.style.backgroundColor = "#000";

    return () => {
      style.backgroundColor = previousHtmlBg;
      document.body.style.backgroundColor = previousBodyBg;
    };
  }, [present]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<BadgeState>;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) => ({
        utm_source: parsed.utm_source ?? prev.utm_source,
        utm_medium: parsed.utm_medium ?? prev.utm_medium,
        utm_campaign: parsed.utm_campaign ?? prev.utm_campaign,
        context: parsed.context ?? prev.context,
      }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const url = useMemo(() => buildUrl(state), [state]);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const raw = await QRCode.toString(url, {
        type: "svg",
        margin: 1,
        width: 1024,
        color: { dark: colors.fg, light: colors.bg },
        errorCorrectionLevel: "M",
      });

      const responsive = raw
        .replace(/width="[^"]*"/, "")
        .replace(/height="[^"]*"/, "");

      if (!cancelled) setSvg(responsive);
    })();

    return () => {
      cancelled = true;
    };
  }, [url, colors]);

  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

// MODE PRÉSENTATION — overlay type Photos.app
if (present) {
  return (
    <div
      onDoubleClick={() => setPresent(false)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        backgroundColor: "#000",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        touchAction: "manipulation",
      }}
    >
      <div
        style={{
          width: "min(90vw, 90vh)",
          aspectRatio: "1 / 1",
          background: "#fff",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{ width: "100%", height: "100%" }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <p
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        Double-tapez pour revenir
      </p>

      <style jsx>{`
        :global(svg) {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
      `}</style>
    </div>
  );
}



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

        {/* FORMULAIRE */}
        <div
          className="rounded-2xl p-3 mb-3"
          style={{
            background: prefersDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.03)",
            border: prefersDark
              ? "1px solid rgba(255,255,255,0.10)"
              : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="grid gap-2">
            <label className="text-xs opacity-80">
              Contexte (ex: techfest_grenoble)
              <input
                value={state.context}
                onChange={(e) =>
                  setState((s) => ({ ...s, context: e.target.value }))
                }
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
                style={{
                  background: prefersDark ? "rgba(255,255,255,0.08)" : "#fff",
                  color: colors.fg,
                  border: prefersDark
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid rgba(0,0,0,0.08)",
                }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
              />
            </label>

            <label className="text-xs opacity-80">
              Campagne (utm_campaign)
              <input
                value={state.utm_campaign}
                onChange={(e) =>
                  setState((s) => ({ ...s, utm_campaign: e.target.value }))
                }
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
                style={{
                  background: prefersDark ? "rgba(255,255,255,0.08)" : "#fff",
                  color: colors.fg,
                  border: prefersDark
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid rgba(0,0,0,0.08)",
                }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
              />
            </label>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={copyUrl}
                className="rounded-xl px-3 py-2 text-sm font-medium"
                style={{
                  background: copied
                    ? "rgba(120,132,119,0.25)"
                    : prefersDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.06)",
                  border: copied
                    ? "1px solid rgba(120,132,119,0.5)"
                    : prefersDark
                      ? "1px solid rgba(255,255,255,0.14)"
                      : "1px solid rgba(0,0,0,0.10)",
                  transition: "background 150ms ease, border-color 150ms ease",
                }}
              >
                {copied ? "Copié ✓" : "Copier l’URL"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setState((s) => ({ ...s, context: "", utm_campaign: "rencontre" }))
                }
                className="rounded-xl px-3 py-2 text-sm"
                style={{
                  background: "transparent",
                  border: prefersDark
                    ? "1px solid rgba(255,255,255,0.14)"
                    : "1px solid rgba(0,0,0,0.10)",
                  opacity: 0.9,
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* QR (tap pour basculer en mode présentation) */}
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
              onDoubleClick={() => setPresent(true)}
              role="button"
              aria-label="Afficher le QR code en plein écran"
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

        <p className="mt-3 text-xs opacity-70 text-center break-words">
          {url.replace("https://", "")}
        </p>

        <p className="mt-2 text-[11px] opacity-60 text-center">
          Double-tapez le QR pour l’afficher en plein écran.
        </p>
      </div>
    </main>
  );
}
