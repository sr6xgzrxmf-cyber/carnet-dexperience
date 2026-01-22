#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"

echo "📦 Installing deps…"
npm i gray-matter @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction >/dev/null

echo "🧱 Creating API routes…"
mkdir -p app/api/articles/list app/api/articles/reschedule app/api/articles/detail app/api/articles/update
mkdir -p app/admin/calendrier

# -----------------------------
# app/api/articles/list/route.ts
# -----------------------------
cat > app/api/articles/list/route.ts <<'TS'
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type Series = { name?: unknown; slug?: unknown; order?: unknown };

export async function GET() {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const files = fs.existsSync(ARTICLES_DIR)
    ? fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"))
    : [];

  const items = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, filename), "utf8");
    const { data } = matter(raw);

    const series = (data.series ?? null) as Series | null;

    return {
      slug,
      title: String(data.title ?? slug),
      date: data.date ? String(data.date).slice(0, 10) : null,
      excerpt: data.excerpt ? String(data.excerpt) : null,
      cover: data.cover ? String(data.cover) : null,
      tags: Array.isArray(data.tags) ? data.tags.map((t: any) => String(t)) : [],
      seriesName: series?.name ? String(series.name) : null,
      seriesSlug: series?.slug ? String(series.slug) : null,
      seriesOrder:
        typeof series?.order === "number"
          ? series.order
          : series?.order != null
            ? Number(series.order)
            : null,
    };
  });

  return NextResponse.json({ items });
}
TS

# --------------------------------
# app/api/articles/detail/route.ts
# --------------------------------
cat > app/api/articles/detail/route.ts <<'TS'
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

export async function GET(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);

  return NextResponse.json({
    slug,
    data: parsed.data ?? {},
    contentPreview: (parsed.content ?? "").slice(0, 500),
  });
}
TS

# -----------------------------------
# app/api/articles/update/route.ts
# -----------------------------------
cat > app/api/articles/update/route.ts <<'TS'
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type SeriesPatch =
  | null
  | {
      name?: string | null;
      slug: string;
      order?: number | null;
    };

type UpdateBody = {
  slug: string;
  patch: {
    title?: string;
    date?: string | null;
    excerpt?: string | null;
    cover?: string | null;
    tags?: string[] | null;
    series?: SeriesPatch;
  };
  dryRun?: boolean;
};

function listArticleFiles(): string[] {
  return fs.existsSync(ARTICLES_DIR)
    ? fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"))
    : [];
}

function readArticle(slug: string) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return { filePath, raw, parsed };
}

function writeArticle(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, "utf8");
}

function toNumberOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const body = (await req.json()) as UpdateBody;

  if (!body?.slug || !body?.patch) {
    return NextResponse.json({ error: "Missing slug or patch" }, { status: 400 });
  }

  const slug = body.slug;
  const dryRun = !!body.dryRun;

  const { filePath, parsed } = readArticle(slug);
  const nextData: any = { ...(parsed.data ?? {}) };

  // Apply simple fields
  if (typeof body.patch.title === "string") nextData.title = body.patch.title;

  if (body.patch.date === null) delete nextData.date;
  else if (typeof body.patch.date === "string") nextData.date = body.patch.date;

  if (body.patch.excerpt === null) delete nextData.excerpt;
  else if (typeof body.patch.excerpt === "string") nextData.excerpt = body.patch.excerpt;

  if (body.patch.cover === null) delete nextData.cover;
  else if (typeof body.patch.cover === "string") nextData.cover = body.patch.cover;

  if (body.patch.tags === null) delete nextData.tags;
  else if (Array.isArray(body.patch.tags)) nextData.tags = body.patch.tags;

  const updatedFiles: string[] = [];
  const writes: Array<{ filePath: string; raw: string }> = [];

  // Handle series patch + order collisions
  if (body.patch.series !== undefined) {
    const sp = body.patch.series;

    if (sp === null) {
      delete nextData.series;
    } else {
      const seriesSlug = String(sp.slug);
      const seriesName = sp.name != null ? String(sp.name) : undefined;
      const desiredOrder = toNumberOrNull(sp.order);

      nextData.series = {
        ...(nextData.series ?? {}),
        slug: seriesSlug,
        ...(seriesName ? { name: seriesName } : {}),
        ...(desiredOrder != null ? { order: desiredOrder } : {}),
      };

      if (desiredOrder != null) {
        // Load all items in this series (excluding current)
        const files = listArticleFiles();
        const siblings: Array<{ slug: string; filePath: string; data: any; order: number | null; content: string }> = [];

        for (const f of files) {
          const s = f.replace(/\.md$/, "");
          if (s === slug) continue;
          const fp = path.join(ARTICLES_DIR, f);
          const raw = fs.readFileSync(fp, "utf8");
          const p = matter(raw);
          const d: any = p.data ?? {};
          const ser: any = d.series ?? null;
          const sibSeriesSlug = ser?.slug != null ? String(ser.slug) : null;
          if (sibSeriesSlug !== seriesSlug) continue;

          const ord = toNumberOrNull(ser?.order);
          siblings.push({ slug: s, filePath: fp, data: d, order: ord, content: p.content ?? "" });
        }

        // Bump orders >= desiredOrder (descending to avoid collisions)
        const bump = siblings
          .filter((x) => x.order != null && x.order >= desiredOrder)
          .sort((a, b) => (b.order ?? 0) - (a.order ?? 0));

        for (const sib of bump) {
          const currentOrder = sib.order!;
          const newOrder = currentOrder + 1;

          const sibSeries = { ...(sib.data.series ?? {}) };
          sibSeries.order = newOrder;
          sib.data.series = sibSeries;

          const nextRaw = matter.stringify(sib.content, sib.data);
          writes.push({ filePath: sib.filePath, raw: nextRaw });
          updatedFiles.push(path.relative(process.cwd(), sib.filePath));
        }
      }
    }
  }

  // Write current article (always last)
  const nextRawCurrent = matter.stringify(parsed.content ?? "", nextData);
  writes.push({ filePath, raw: nextRawCurrent });
  updatedFiles.push(path.relative(process.cwd(), filePath));

  // Dedupe
  const seen = new Set<string>();
  const finalWrites = writes.filter((w) => (seen.has(w.filePath) ? false : (seen.add(w.filePath), true)));

  if (!dryRun) {
    for (const w of finalWrites) writeArticle(w.filePath, w.raw);
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    updated: Array.from(new Set(updatedFiles)),
  });
}
TS

# ---------------------------------------
# app/api/articles/reschedule/route.ts
# (kept for drag/drop date changes)
# ---------------------------------------
cat > app/api/articles/reschedule/route.ts <<'TS'
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type Body = { slug: string; date: string };

export async function PATCH(req: Request) {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const body = (await req.json()) as Body;

  if (!body?.slug || !body?.date) {
    return NextResponse.json({ error: "Missing slug or date" }, { status: 400 });
  }

  const filePath = path.join(ARTICLES_DIR, `${body.slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);

  const nextData = { ...parsed.data, date: body.date };
  const nextRaw = matter.stringify(parsed.content, nextData);

  fs.writeFileSync(filePath, nextRaw, "utf8");

  return NextResponse.json({ ok: true });
}
TS

echo "🧩 Updating calendar page…"
cat > app/admin/calendrier/page.tsx <<'TSX'
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
TSX

echo "✅ Done."
echo ""
echo "Next:"
echo "  git add app/api/articles app/admin/calendrier/page.tsx package.json package-lock.json"
echo "  git commit -m \"Improve local calendar editor\""
echo "  git push"
