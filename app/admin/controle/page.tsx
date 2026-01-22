"use client";

import { useEffect, useMemo, useState } from "react";

type Linked = { href: string; exists: boolean };

type Item = {
  slug: string;
  title: string;
  date: string | null;
  seriesName: string | null;
  seriesSlug: string | null;
  seriesOrder: number | null;
  tags: string[];
  excerpt: string | null;
  cover: string | null;
  coverOk: boolean;
  coverExpected: string;
  coverExpectedOk: boolean;
  linked: Linked[];
  brief: string;
  da: string;
  problems: string[];
};

function isLocalHost() {
  if (typeof window === "undefined") return true;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

export default function ControleEditorialPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [onlyProblems, setOnlyProblems] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);

  async function refresh() {
    const res = await fetch("/api/articles/audit");
    if (!res.ok) return;
    const json = await res.json();
    setItems(json.items ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  const local = isLocalHost();

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((it) => {
      if (onlyProblems && it.problems.length === 0) return false;
      if (!qq) return true;
      return (
        it.slug.toLowerCase().includes(qq) ||
        it.title.toLowerCase().includes(qq) ||
        (it.seriesSlug ?? "").toLowerCase().includes(qq) ||
        (it.seriesName ?? "").toLowerCase().includes(qq) ||
        (it.tags ?? []).join(" ").toLowerCase().includes(qq)
      );
    });
  }, [items, q, onlyProblems]);

  return (
    <div style={{ padding: 24 }}>
      {!local && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 12,
            background: "rgba(255, 193, 7, 0.15)",
            border: "1px solid rgba(255, 193, 7, 0.35)",
          }}
        >
          <strong>Outil éditorial local.</strong> Ce contrôle lit les fichiers du disque : il n’est pas fait pour la production.
        </div>
      )}

      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Contrôle éditorial</h1>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Covers, séries, dates, fichiers liés, brief DA.</div>
        </div>

        <button
          onClick={() => refresh()}
          style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", background: "white" }}
        >
          Rafraîchir
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (titre, slug, série, tags)…"
          style={{ flex: 1, padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}
        />
        <label style={{ display: "flex", gap: 8, alignItems: "center", userSelect: "none" }}>
          <input type="checkbox" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} />
          Problèmes seulement
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 16, alignItems: "start" }}>
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 14,
            overflow: "hidden",
            background: "white",
          }}
        >
          <div style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.08)", fontWeight: 700 }}>
            Articles ({filtered.length})
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Date</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Titre</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Série</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Cover</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Liens</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Problèmes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const missingLinks = it.linked.filter((l) => !l.exists).length;
                  const coverStatus = it.cover
                    ? it.coverOk
                      ? "OK"
                      : "introuvable"
                    : it.coverExpectedOk
                      ? "manquante (fichier existe)"
                      : "manquante";

                  return (
                    <tr
                      key={it.slug}
                      onClick={() => setSelected(it)}
                      style={{
                        cursor: "pointer",
                        background: selected?.slug === it.slug ? "rgba(0,0,0,0.04)" : "transparent",
                      }}
                    >
                      <td style={{ padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>
                        {it.date ?? "—"}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div style={{ fontWeight: 650 }}>{it.title}</div>
                        <div style={{ opacity: 0.6, fontSize: 12 }}>{it.slug}</div>
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {it.seriesSlug ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{it.seriesName ?? it.seriesSlug}</div>
                            <div style={{ opacity: 0.7, fontSize: 12 }}>
                              {it.seriesSlug}
                              {it.seriesOrder != null ? ` — ${it.seriesOrder}` : ""}
                            </div>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.7 }}>Hors série</span>
                        )}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {coverStatus}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {it.linked.length ? (
                          <span>{missingLinks ? `${missingLinks} manquant(s)` : "OK"}</span>
                        ) : (
                          <span style={{ opacity: 0.7 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {it.problems.length ? it.problems.join(" · ") : <span style={{ opacity: 0.7 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <aside
            style={{
              position: "sticky",
              top: 16,
              alignSelf: "start",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              padding: 14,
              background: "white",
              maxHeight: "85vh",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 800 }}>{selected.title}</div>
              <button
                onClick={() => setSelected(null)}
                style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)", background: "white" }}
              >
                Fermer
              </button>
            </div>

            <div style={{ opacity: 0.7, marginTop: 4, marginBottom: 12 }}>{selected.slug}</div>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Cover</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Référencée : <code>{selected.cover ?? "—"}</code>
                  <br />
                  Attendue : <code>{selected.coverExpected}</code>
                </div>
                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  {selected.cover
                    ? selected.coverOk
                      ? "✅ Fichier présent"
                      : "❌ Fichier introuvable"
                    : selected.coverExpectedOk
                      ? "⚠️ Cover manquante (mais un fichier attendu existe)"
                      : "⚠️ Cover manquante"}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700 }}>Fichiers liés</div>
                {selected.linked.length ? (
                  <div style={{ display: "grid", gap: 6, marginTop: 6, fontSize: 13 }}>
                    {selected.linked.map((l) => (
                      <div key={l.href} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <code style={{ wordBreak: "break-all" }}>{l.href}</code>
                        <span>{l.exists ? "✅" : "❌"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ opacity: 0.7, marginTop: 6 }}>Aucun lien d’asset détecté.</div>
                )}
              </div>

              <div>
                <div style={{ fontWeight: 700 }}>Brief (pour la DA)</div>
                <div style={{ fontSize: 13, marginTop: 6, opacity: 0.85 }}>{selected.brief || "—"}</div>

                <button
                  onClick={() => navigator.clipboard.writeText(selected.da)}
                  style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", background: "rgba(0,0,0,0.04)" }}
                >
                  Copier le brief DA
                </button>
              </div>

              {selected.problems.length > 0 && (
                <div style={{ padding: 10, borderRadius: 12, background: "rgba(255,0,0,0.06)", border: "1px solid rgba(255,0,0,0.12)" }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>À corriger</div>
                  <div style={{ fontSize: 13 }}>{selected.problems.join(" · ")}</div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
