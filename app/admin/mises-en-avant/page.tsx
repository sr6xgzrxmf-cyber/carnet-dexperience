"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Size = "feature" | "tall" | "compact";
type Highlight = { slug: string; label: string; size: Size; active: boolean };
type Article = {
  slug: string;
  title: string;
  date: string | null;
  cover: string | null;
  effectiveStatus: string;
  searchText: string;
};

const sizeLabels: Record<Size, string> = {
  feature: "Grande",
  tall: "Haute",
  compact: "Petite",
};

export default function HighlightsAdminPage() {
  const [items, setItems] = useState<Highlight[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [dragged, setDragged] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/highlights", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Cette administration fonctionne uniquement en local.");
        return res.json();
      })
      .then((data) => {
        setItems(data.items ?? []);
        setArticles(data.articles ?? []);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const articleBySlug = useMemo(
    () => new Map(articles.map((article) => [article.slug, article])),
    [articles]
  );
  const available = articles.filter((article) => !items.some((item) => item.slug === article.slug));
  const searchResults = useMemo(() => {
    const query = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr")
      .trim();
    if (!query) return [];

    return available
      .filter((article) => {
        const searchable = `${article.title} ${article.slug} ${article.date ?? ""} ${article.searchText ?? ""}`
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase("fr");
        return searchable.includes(query);
      })
      .slice(0, 10);
  }, [available, search]);

  function update(index: number, patch: Partial<Highlight>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    setItems((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function add() {
    if (!selected) return;
    const article = articleBySlug.get(selected);
    setItems((current) => [
      ...current,
      { slug: selected, label: article?.effectiveStatus === "scheduled" ? "À paraître" : "Article", size: "compact", active: true },
    ]);
    setSelected("");
    setSearch("");
    setSearchOpen(false);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/highlights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enregistrement impossible");
      setItems(data.items ?? items);
      setMessage("Mises en avant enregistrées.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Accueil · portfolio</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Mises en avant</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            Choisis les articles du rail d’accueil, leur importance et leur ordre. Fais glisser les blocs pour les réorganiser.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" target="_blank" className="rounded-xl border px-4 py-2 text-sm font-medium">
            Prévisualiser l’accueil ↗
          </Link>
          <button onClick={save} disabled={saving || loading} className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/20">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              value={search}
              role="combobox"
              aria-label="Rechercher un article"
              aria-expanded={searchOpen && Boolean(search.trim())}
              aria-controls="highlight-search-results"
              aria-autocomplete="list"
              placeholder="Rechercher un article par titre, date ou mot-clé…"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchOpen(false);
                if (event.key === "Enter" && searchResults.length === 1) {
                  event.preventDefault();
                  setSelected(searchResults[0].slug);
                  setSearch(searchResults[0].title);
                  setSearchOpen(false);
                }
              }}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelected("");
                setSearchOpen(true);
              }}
              className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm"
            />
            {searchOpen && search.trim() ? (
              <div
                id="highlight-search-results"
                role="listbox"
                className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-950"
              >
                {searchResults.length ? searchResults.map((article) => (
                  <button
                    key={article.slug}
                    type="button"
                    role="option"
                    aria-selected={selected === article.slug}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSelected(article.slug);
                      setSearch(article.title);
                      setSearchOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                  >
                    <span className="block text-sm font-medium">{article.title}</span>
                    <span className="mt-1 block text-xs text-neutral-500">{article.date ?? "sans date"} · {article.effectiveStatus}</span>
                  </button>
                )) : (
                  <p className="px-3 py-4 text-sm text-neutral-500">Aucun article trouvé.</p>
                )}
              </div>
            ) : null}
          </div>
          <button onClick={add} disabled={!selected} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Ajouter</button>
        </div>
      </section>

      {message ? <p role="status" className="rounded-xl bg-neutral-900/5 px-4 py-3 text-sm dark:bg-white/10">{message}</p> : null}

      <section className="grid gap-3">
        {loading ? <p>Chargement…</p> : null}
        {!loading && !items.length ? <p className="rounded-2xl border border-dashed p-8 text-center text-neutral-500">Aucune mise en avant.</p> : null}
        {items.map((item, index) => {
          const article = articleBySlug.get(item.slug);
          return (
            <article
              key={item.slug}
              draggable
              onDragStart={() => setDragged(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => { if (dragged !== null) move(dragged, index); setDragged(null); }}
              className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/30 lg:grid-cols-[32px_minmax(220px,1fr)_160px_180px_auto] lg:items-center"
            >
              <span className="cursor-grab text-center text-neutral-400" aria-label="Faire glisser">↕</span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{article?.title ?? item.slug}</p>
                <p className="mt-1 truncate text-xs text-neutral-500">{item.slug} · {article?.date ?? "sans date"} · {article?.effectiveStatus ?? "inconnu"}</p>
              </div>
              <input value={item.label} onChange={(event) => update(index, { label: event.target.value })} aria-label="Libellé" placeholder="Libellé" className="rounded-xl border bg-transparent px-3 py-2 text-sm" />
              <select value={item.size} onChange={(event) => update(index, { size: event.target.value as Size })} aria-label="Taille de la tuile" className="rounded-xl border bg-transparent px-3 py-2 text-sm">
                {(Object.keys(sizeLabels) as Size[]).map((size) => <option key={size} value={size}>{sizeLabels[size]}</option>)}
              </select>
              <div className="flex items-center justify-end gap-3">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.active} onChange={(event) => update(index, { active: event.target.checked })} /> Visible</label>
                <button onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Monter" className="rounded-lg border px-2 py-1 disabled:opacity-30">↑</button>
                <button onClick={() => move(index, index + 1)} disabled={index === items.length - 1} aria-label="Descendre" className="rounded-lg border px-2 py-1 disabled:opacity-30">↓</button>
                <button onClick={() => setItems((current) => current.filter((_, i) => i !== index))} className="rounded-lg border px-2 py-1 text-red-700">Retirer</button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
