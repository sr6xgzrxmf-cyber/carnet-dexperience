"use client";

import { useEffect, useMemo, useState } from "react";

type Payload = { featuredSeriesList: string[] };

function isLocalHost() {
  if (typeof window === "undefined") return true;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

export default function AdminRetrospectivesPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const local = useMemo(() => isLocalHost(), []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/retrospectives", { cache: "no-store" });
        if (!r.ok) throw new Error(`API error ${r.status}`);
        const ct = r.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await r.text();
          throw new Error(`Non-JSON response: ${text.slice(0, 120)}`);
        }
        const data = (await r.json()) as Payload;
        setList(Array.isArray(data?.featuredSeriesList) ? data.featuredSeriesList : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    setList(next);
  }

  function add() {
    const slug = prompt("Slug de la série (ex: vendre-et-servir-en-retail) ?");
    if (!slug) return;
    const s = slug.trim();
    if (!s) return;
    if (list.includes(s)) return;
    setList([...list, s]);
  }

  function remove(i: number) {
    const next = [...list];
    next.splice(i, 1);
    setList(next);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/retrospectives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredSeriesList: list }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Erreur sauvegarde");
      setList(data.featuredSeriesList ?? list);
      setMsg("✅ Sauvegardé");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Erreur"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
        Admin — Rétrospectives (homepage Articles)
      </h1>

      <div style={{ opacity: 0.75, marginBottom: 16 }}>
        Source: <code>content/retrospectives.json</code> — Local only pour l’écriture.
      </div>

      {!local && (
        <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,0,0,0.06)", border: "1px solid rgba(255,0,0,0.12)", marginBottom: 16 }}>
          ⚠️ Tu n’es pas en localhost : la sauvegarde est bloquée (normal).
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={add} disabled={loading} style={btn()}>
          + Ajouter une série
        </button>
        <button onClick={save} disabled={saving || loading || !local} style={btn()}>
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
        {msg && <span style={{ alignSelf: "center", opacity: 0.85 }}>{msg}</span>}
      </div>

      {loading ? (
        <div>Chargement…</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {list.map((slug, i) => (
            <div
              key={`${slug}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 10,
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ opacity: 0.55, width: 24, textAlign: "right" }}>{i + 1}</span>
                <code style={{ fontWeight: 700 }}>{slug}</code>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => move(i, -1)} style={miniBtn()}>↑</button>
                <button onClick={() => move(i, 1)} style={miniBtn()}>↓</button>
                <button onClick={() => remove(i)} style={dangerBtn()}>Retirer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function btn(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "rgba(0,0,0,0.04)",
    cursor: "pointer",
    fontWeight: 700,
  };
}

function miniBtn(): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "rgba(0,0,0,0.03)",
    cursor: "pointer",
    fontWeight: 700,
  };
}

function dangerBtn(): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,0,0,0.25)",
    background: "rgba(255,0,0,0.06)",
    cursor: "pointer",
    fontWeight: 800,
  };
}
