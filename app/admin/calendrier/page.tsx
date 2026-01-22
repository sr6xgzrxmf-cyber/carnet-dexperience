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
  seriesName: string | null;
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
       ? `[${it.seriesName ?? it.seriesSlug}] ${it.title}${it.seriesOrder != null ? ` — ${it.seriesOrder}` : ""}`
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
