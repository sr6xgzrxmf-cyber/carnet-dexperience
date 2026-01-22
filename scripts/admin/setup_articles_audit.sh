#!/usr/bin/env bash
set -euo pipefail

echo "🧱 Creating audit admin page + API…"
mkdir -p app/admin/controle
mkdir -p app/api/articles/audit

# -----------------------------
# app/api/articles/audit/route.ts
# -----------------------------
cat > app/api/articles/audit/route.ts <<'TS'
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const IS_LOCAL =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL;

type Series = { name?: unknown; slug?: unknown; order?: unknown };

function fileExistsPublic(publicPath: string) {
  // publicPath like "/images/articles/xxx.jpg"
  if (!publicPath.startsWith("/")) return false;
  const abs = path.join(PUBLIC_DIR, publicPath);
  return fs.existsSync(abs);
}

function normalizeDate(v: any): string | null {
  if (v == null) return null;
  const s = String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function guessCover(slug: string) {
  // Heuristique simple : /images/articles/<slug>.jpg
  // (tu peux changer .jpg -> .webp si tu standardises)
  return `/images/articles/${slug}.jpg`;
}

function extractBriefFromMarkdown(md: string) {
  // Sans IA : on prend un extrait "utilisable" (premiers paragraphes, sans markdown lourd)
  const cleaned = md
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
    .replace(/\[[^\]]*\]\(([^)]+)\)/g, "") // links (remove)
    .replace(/[`*_>#-]/g, " ") // basic md chars
    .replace(/\s+/g, " ")
    .trim();

  // ~280 chars de “brief”
  return cleaned.slice(0, 280);
}

function extractLinkedFiles(md: string) {
  // On remonte des liens qui ressemblent à des assets locaux :
  // - /files/...
  // - /docs/...
  // - /downloads/...
  // - /images/...
  const links: string[] = [];
  const re = /$begin:math:display$[^$end:math:display$]*\]$begin:math:text$([^)]+)$end:math:text$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    const href = m[1].trim();
    if (
      href.startsWith("/files/") ||
      href.startsWith("/docs/") ||
      href.startsWith("/downloads/") ||
      href.startsWith("/images/")
    ) {
      links.push(href);
    }
  }
  // dédoublonnage
  return Array.from(new Set(links));
}

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
    const { data, content } = matter(raw);

    const series = (data.series ?? null) as Series | null;

    const date = normalizeDate((data as any).date);
    const title = String((data as any).title ?? slug);

    const cover = (data as any).cover != null ? String((data as any).cover) : null;
    const coverExpected = guessCover(slug);
    const coverOk = cover ? fileExistsPublic(cover) : false;
    const coverExpectedOk = fileExistsPublic(coverExpected);

    const tags = Array.isArray((data as any).tags)
      ? (data as any).tags.map((t: any) => String(t))
      : [];

    const excerpt = (data as any).excerpt != null ? String((data as any).excerpt) : null;

    const linked = extractLinkedFiles(content ?? "");
    const linkedChecks = linked.map((href) => ({
      href,
      exists: fileExistsPublic(href),
    }));

    const brief = excerpt?.trim()
      ? excerpt.trim()
      : extractBriefFromMarkdown(content ?? "");

    // Brief DA (heuristique)
    const da = [
      `Titre: ${title}`,
      date ? `Date: ${date}` : `Date: (manquante)`,
      series?.slug ? `Série: ${String(series.slug)}${series?.order != null ? ` (order ${String(series.order)})` : ""}` : "Série: hors-série",
      tags.length ? `Tags: ${tags.join(", ")}` : "Tags: (aucun)",
      `Brief: ${brief || "(vide)"}`,
    ].join("\n");

    const problems: string[] = [];
    if (!date) problems.push("date manquante ou invalide");
    if (!cover) problems.push("cover manquante");
    if (cover && !coverOk) problems.push("cover référencée mais fichier introuvable");
    if (!cover && coverExpectedOk) problems.push("cover manquante (mais un fichier attendu existe)");
    if (!cover && !coverExpectedOk) problems.push("cover manquante (et aucun fichier attendu trouvé)");

    const missingLinked = linkedChecks.filter((x) => !x.exists);
    if (missingLinked.length) problems.push(`${missingLinked.length} fichier(s) lié(s) manquant(s)`);

    return {
      slug,
      title,
      date,
      seriesName: series?.name ? String(series.name) : null,
      seriesSlug: series?.slug ? String(series.slug) : null,
      seriesOrder:
        typeof series?.order === "number"
          ? series.order
          : series?.order != null
            ? Number(series.order)
            : null,
      tags,
      excerpt,
      cover,
      coverOk,
      coverExpected,
      coverExpectedOk,
      linked: linkedChecks,
      brief,
      da,
      problems,
    };
  });

  // tri : problèmes d’abord, puis date
  items.sort((a, b) => {
    const pa = a.problems.length;
    const pb = b.problems.length;
    if (pa !== pb) return pb - pa;
    return String(a.date ?? "").localeCompare(String(b.date ?? ""));
  });

  return NextResponse.json({ items });
}
TS

# -----------------------------
# app/admin/controle/page.tsx
# -----------------------------
cat > app/admin/controle/page.tsx <<'TSX'
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
TSX

echo "✅ Done."
echo ""
echo "Next:"
echo "  git add app/api/articles/audit app/admin/controle/page.tsx"
echo "  git commit -m \"Add local editorial audit admin\""
echo "  git push"
