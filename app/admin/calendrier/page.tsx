"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg } from "@fullcalendar/core";

type Item = {
  slug: string;
  title: string;
  date: string | null;
  excerpt: string | null;
  cover: string | null;
  tags: string[];
  seriesName: string | null;
  seriesSlug: string | null;
  seriesOrder: number | null;
};

function colorFromSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 80% 55%)`;
}

const NO_SERIES = {
  label: "Hors série",
  color: "hsl(210 80% 55%)",
};

function isLocalHost() {
  if (typeof window === "undefined") return true;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function parisTodayISO(now: Date = new Date()): string {
  // YYYY-MM-DD en Europe/Paris
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function normalizeISODate(input?: string | null): string | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function isPublishedParis(date: string | null | undefined, now: Date): boolean {
  const d = normalizeISODate(date);
  if (!d) return true; // pas de date => visible
  return d <= parisTodayISO(now);
}

function daysUntilParis(date: string | null | undefined, now: Date): number | null {
  const d = normalizeISODate(date);
  if (!d) return null;

  const today = parisTodayISO(now);

  // Diff en jours sur base YYYY-MM-DD -> Date UTC "neutre" (uniquement pour diff jours, pas pour publication)
  const toUTC = (iso: string) => {
    const [y, m, dd] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, dd);
  };

  return Math.round((toUTC(d) - toUTC(today)) / (24 * 60 * 60 * 1000));
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 1000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(920px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          background: "white",
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.12)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
            <button onClick={onClose} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}>
              Fermer
            </button>
          </div>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

export default function CalendrierArticlesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeSeries, setActiveSeries] = useState<"ALL" | "NONE" | string>("ALL");

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editor fields
  const [fTitle, setFTitle] = useState("");
  const [fDate, setFDate] = useState("");
  const [fExcerpt, setFExcerpt] = useState("");
  const [fCover, setFCover] = useState("");
  const [fTags, setFTags] = useState("");
  const [fSeriesSlug, setFSeriesSlug] = useState<"NONE" | string>("NONE");
  const [fSeriesName, setFSeriesName] = useState("");
  const [fSeriesOrder, setFSeriesOrder] = useState<string>("");

  async function refresh() {
    const res = await fetch("/api/articles/list");
    if (!res.ok) return;
    const json = await res.json();
    setItems(json.items ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  const legend = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; color: string; count: number }>();
    let noSeriesCount = 0;

    for (const it of items) {
      if (!it.seriesSlug) {
        noSeriesCount++;
        continue;
      }
      const slug = it.seriesSlug;
      const name = it.seriesName ?? slug;
      const existing = map.get(slug);
      if (existing) existing.count++;
      else map.set(slug, { name, slug, color: colorFromSlug(slug), count: 1 });
    }

    const series = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    return { series, noSeriesCount };
  }, [items]);

  const visibleItems = useMemo(() => {
    return items.filter((it) => {
      if (activeSeries === "ALL") return true;
      if (activeSeries === "NONE") return !it.seriesSlug;
      return it.seriesSlug === activeSeries;
    });
  }, [items, activeSeries]);

  const events = useMemo(() => {
    return visibleItems
      .filter((it) => !!it.date)
      .map((it) => {
        const isSeries = !!it.seriesSlug;
        const color = isSeries ? colorFromSlug(it.seriesSlug!) : NO_SERIES.color;

        return {
          id: it.slug,
          title: it.title, // ✅ titre seul
          start: it.date!,
          allDay: true,
          backgroundColor: color,
          borderColor: color,
          textColor: "#fff",
        };
      });
  }, [visibleItems]);

  const local = isLocalHost();

  function resetEditor() {
    setSelectedSlug(null);
    setEditorOpen(false);
    setFTitle("");
    setFDate("");
    setFExcerpt("");
    setFCover("");
    setFTags("");
    setFSeriesSlug("NONE");
    setFSeriesName("");
    setFSeriesOrder("");
  }

  async function openEditor(slug: string) {
    setSelectedSlug(slug);
    setEditorOpen(true);

    const it = items.find((x) => x.slug === slug);
    setFTitle(it?.title ?? "");
    setFDate(it?.date ?? "");
    setFExcerpt(it?.excerpt ?? "");
    setFCover(it?.cover ?? "");
    setFTags((it?.tags ?? []).join(", "));
    setFSeriesSlug(it?.seriesSlug ? it.seriesSlug : "NONE");
    setFSeriesName(it?.seriesName ?? "");
    setFSeriesOrder(it?.seriesOrder != null ? String(it.seriesOrder) : "");
  }

  async function saveEditor() {
    if (!selectedSlug) return;

    const tags = fTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const patch: any = {
      title: fTitle.trim(),
      date: fDate.trim() ? fDate.trim() : null,
      excerpt: fExcerpt.trim() ? fExcerpt.trim() : null,
      cover: fCover.trim() ? fCover.trim() : null,
      tags: tags.length ? tags : null,
      series:
        fSeriesSlug === "NONE"
          ? null
          : {
              slug: fSeriesSlug,
              name: fSeriesName.trim() ? fSeriesName.trim() : null,
              order: fSeriesOrder.trim() ? Number(fSeriesOrder.trim()) : null,
            },
    };

    setSaving(true);
    try {
      // 1) Dry-run pour lister les fichiers impactés
      const dry = await fetch("/api/articles/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selectedSlug, patch, dryRun: true }),
      });

      if (!dry.ok) {
        alert("Impossible de préparer les modifications.");
        return;
      }

      const dryJson = await dry.json();
      const updated: string[] = dryJson.updated ?? [];
      const msg =
        updated.length <= 1
          ? "Enregistrer ces modifications ?"
          : `Attention : ${updated.length} fichiers vont être modifiés (renumérotation d'ordre incluse). Continuer ?\n\n- ${updated.join("\n- ")}`;

      const ok = window.confirm(msg);
      if (!ok) return;

      // 2) Apply
      const res = await fetch("/api/articles/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selectedSlug, patch, dryRun: false }),
      });

      if (!res.ok) {
        alert("Échec de l’enregistrement.");
        return;
      }

      await refresh();
      resetEditor();
    } finally {
      setSaving(false);
    }
  }

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
          <strong>Outil éditorial local.</strong> Cette page est un outil de travail : en production, les modifications ne sont pas appliquées.
        </div>
      )}

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Calendrier de publication</h1>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
        {/* Sidebar */}
        <aside
          style={{
            position: "sticky",
            top: 16,
            alignSelf: "start",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 14,
            padding: 14,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Filtres</div>

          <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setActiveSeries("ALL")}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: activeSeries === "ALL" ? "rgba(0,0,0,0.06)" : "white",
              }}
            >
              Tous les articles
            </button>

            <button
              onClick={() => setActiveSeries("NONE")}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: activeSeries === "NONE" ? "rgba(0,0,0,0.06)" : "white",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: 3, background: NO_SERIES.color, display: "inline-block" }} />
              Hors série <span style={{ opacity: 0.7 }}>({legend.noSeriesCount})</span>
            </button>
          </div>

          <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "12px 0" }} />

          <div style={{ fontWeight: 700, marginBottom: 10 }}>Séries</div>
          <div style={{ display: "grid", gap: 8 }}>
            {legend.series.map((s) => (
              <button
                key={s.slug}
                onClick={() => setActiveSeries(s.slug)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: activeSeries === s.slug ? "rgba(0,0,0,0.06)" : "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, display: "inline-block" }} />
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span style={{ marginLeft: "auto", opacity: 0.7 }}>{s.count}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Calendar */}
        <main style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 12, overflowX: "auto" }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
            locale="fr"
            height="auto"
            contentHeight="auto"
            expandRows={true}
            dayMaxEvents={false}
            events={events}
            editable={true}
            eventDrop={async (arg: EventDropArg) => {
              const slug = String(arg.event.id);
              const date = arg.event.startStr.slice(0, 10);

              const res = await fetch("/api/articles/reschedule", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, date }),
              });

              if (!res.ok) {
                arg.revert();
                return;
              }
              refresh();
            }}
            eventClick={(info) => {
              info.jsEvent.preventDefault();
              openEditor(String(info.event.id));
            }}
            eventContent={(arg) => (
              <div style={{ whiteSpace: "normal", lineHeight: 1.15, fontSize: 12 }}>{arg.event.title}</div>
            )}
          />

          <style>{`
            .fc .fc-daygrid-event { white-space: normal !important; }
            .fc .fc-event-title, .fc .fc-event-title-container { white-space: normal !important; }
            .fc .fc-daygrid-day-events { margin-bottom: 8px; }
          `}</style>
        </main>
      </div>

      <Modal
        open={editorOpen}
        title={selectedSlug ? `Éditer — ${selectedSlug}` : "Éditer"}
        onClose={() => resetEditor()}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Titre</label>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)" }} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Date (YYYY-MM-DD)</label>
            <input value={fDate} onChange={(e) => setFDate(e.target.value)} placeholder="2026-01-14" style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)" }} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Excerpt</label>
            <textarea value={fExcerpt} onChange={(e) => setFExcerpt(e.target.value)} rows={3} style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)" }} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Cover</label>
            <input value={fCover} onChange={(e) => setFCover(e.target.value)} placeholder="/images/articles/..." style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)" }} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Tags (séparés par des virgules)</label>
            <input value={fTags} onChange={(e) => setFTags(e.target.value)} placeholder="management, terrain, coaching" style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)" }} />
          </div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 600 }}>Série</label>
              <select value={fSeriesSlug} onChange={(e) => setFSeriesSlug(e.target.value as any)} style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)" }}>
                <option value="NONE">Hors série</option>
                {legend.series.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 600 }}>Order</label>
              <input
                value={fSeriesOrder}
                onChange={(e) => setFSeriesOrder(e.target.value)}
                placeholder="ex: 2"
                disabled={fSeriesSlug === "NONE"}
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)", opacity: fSeriesSlug === "NONE" ? 0.6 : 1 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Nom de série (optionnel)</label>
            <input
              value={fSeriesName}
              onChange={(e) => setFSeriesName(e.target.value)}
              disabled={fSeriesSlug === "NONE"}
              placeholder="ex: Construire Carnet d’expérience"
              style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)", opacity: fSeriesSlug === "NONE" ? 0.6 : 1 }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              onClick={() => resetEditor()}
              disabled={saving}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", background: "white" }}
            >
              Annuler
            </button>
            <button
              onClick={() => saveEditor()}
              disabled={saving}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", background: "rgba(0,0,0,0.06)" }}
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
