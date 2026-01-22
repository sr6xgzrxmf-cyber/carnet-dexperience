#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"

echo "📍 Repo: $ROOT"
if [ ! -f "package.json" ]; then
  echo "❌ package.json introuvable. Lance ce script depuis la racine du repo carnet-dexperience."
  exit 1
fi

echo "📦 Installation des dépendances FullCalendar + gray-matter..."
npm i @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction gray-matter

echo "🧱 Création des dossiers..."
mkdir -p app/api/articles/list
mkdir -p app/api/articles/reschedule
mkdir -p app/admin/calendrier

echo "🧩 Écriture: app/api/articles/list/route.ts"
cat > app/api/articles/list/route.ts <<'TS'
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

type Series = { slug?: unknown; order?: unknown };

export async function GET() {
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
      date: data.date ? String(data.date).slice(0, 10) : null, // YYYY-MM-DD
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

echo "🧩 Écriture: app/api/articles/reschedule/route.ts"
cat > app/api/articles/reschedule/route.ts <<'TS'
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

type Body = { slug: string; date: string };

export async function PATCH(req: Request) {
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

echo "🧩 Écriture: app/admin/calendrier/page.tsx"
cat > app/admin/calendrier/page.tsx <<'TSX'
"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { EventDropArg } from "@fullcalendar/interaction";

type Item = {
  slug: string;
  title: string;
  date: string | null;
  seriesSlug: string | null;
  seriesOrder: number | null;
};

function colorFromSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 70% 55%)`;
}

export default function CalendrierArticlesPage() {
  const [items, setItems] = useState<Item[]>([]);

  async function refresh() {
    const res = await fetch("/api/articles/list");
    const json = await res.json();
    setItems(json.items ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  const events = useMemo(() => {
    return items
      .filter((it) => !!it.date)
      .map((it) => {
        const isSeries = !!it.seriesSlug;
        const label = isSeries
          ? `${it.title}${it.seriesOrder != null ? ` — ${it.seriesOrder}` : ""}`
          : it.title;

        const color = isSeries ? colorFromSlug(it.seriesSlug!) : "hsl(210 80% 55%)";

        return {
          id: it.slug,
          title: label,
          start: it.date!,
          allDay: true,
          backgroundColor: color,
          borderColor: color,
        };
      });
  }, [items]);

  async function onDrop(arg: EventDropArg) {
    const slug = arg.event.id;
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

    await refresh();
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
        Calendrier de publication
      </h1>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable
        eventDrop={onDrop}
        events={events}
        height="auto"
      />
    </div>
  );
}
TSX

echo ""
echo "✅ Terminé."
echo "➡️  Lance: npm run dev"
echo "➡️  Puis ouvre: http://localhost:3000/admin/calendrier"
echo ""
echo "ℹ️  Ce calendrier lit/écrit dans: content/articles/*.md"
echo "   Le drag & drop met à jour uniquement le champ YAML: date:"
