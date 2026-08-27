"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import styles from "@/app/editorial-system.module.css";

const PAGE_SIZE = 12;

export type CatalogArticle = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  cover?: string | null;
  tags: string[];
  themes: string[];
  seriesTitle?: string;
  seriesOrder?: number;
  seriesLength?: number;
  futureLabel?: boolean;
};

type ArticlesCatalogProps = {
  articles: CatalogArticle[];
  themes: string[];
  initialQuery?: string;
  initialTheme?: string;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR");
}

function normalizeCoverSrc(cover?: string | null): string | null {
  if (!cover?.trim()) return null;
  const value = cover.trim();
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export default function ArticlesCatalog({
  articles,
  themes,
  initialQuery = "",
  initialTheme = "",
}: ArticlesCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [activeTheme, setActiveTheme] = useState(
    themes.includes(initialTheme) ? initialTheme : ""
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return articles.filter((article) => {
      if (activeTheme && !article.themes.includes(activeTheme)) return false;
      if (!normalizedQuery) return true;

      const searchable = normalize(
        [
          article.title,
          article.excerpt,
          article.seriesTitle,
          ...article.tags,
          ...article.themes,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return searchable.includes(normalizedQuery);
    });
  }, [activeTheme, articles, query]);

  const visible = filtered.slice(0, visibleCount);

  function updateUrl(nextTheme: string, nextQuery: string) {
    const params = new URLSearchParams();
    if (nextTheme) params.set("theme", nextTheme);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    const search = params.toString();
    router.replace(`${pathname}${search ? `?${search}` : ""}`, { scroll: false });
  }

  function chooseTheme(theme: string) {
    const nextTheme = activeTheme === theme ? "" : theme;
    setActiveTheme(nextTheme);
    setVisibleCount(PAGE_SIZE);
    updateUrl(nextTheme, query);
    track("articles_theme_selected", { theme: nextTheme || "all" });
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUrl(activeTheme, query);
    track("articles_search_used", {
      queryLength: query.trim().length,
      results: filtered.length,
    });
  }

  function resetFilters() {
    setQuery("");
    setActiveTheme("");
    updateUrl("", "");
    track("articles_filters_reset");
  }

  return (
    <div>
      <div className={styles.catalogControls}>
        <form className={styles.searchForm} role="search" onSubmit={submitSearch}>
          <label className={styles.searchLabel} htmlFor="article-search">
            Rechercher un mot, une situation ou une question
          </label>
          <div className={styles.searchRow}>
            <input
              id="article-search"
              className={styles.searchInput}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Ex. transmission, conflit, décision…"
            />
            <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">
              Rechercher
            </button>
          </div>
        </form>

        <div>
          <p className={styles.filterLabel}>Filtrer par grand thème</p>
          <div className={styles.themeList} aria-label="Thèmes des articles">
            {themes.map((theme) => (
              <button
                key={theme}
                type="button"
                aria-pressed={activeTheme === theme}
                onClick={() => chooseTheme(theme)}
                className={`${styles.tag} ${activeTheme === theme ? styles.tagActive : ""}`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.catalogHeader}>
        <p className={styles.count} aria-live="polite">
          {filtered.length} article{filtered.length > 1 ? "s" : ""}
          {visible.length < filtered.length ? ` · ${visible.length} affichés` : ""}
        </p>
        {query || activeTheme ? (
          <button type="button" className={styles.textLink} onClick={resetFilters}>
            Réinitialiser
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Aucun article ne correspond exactement.</h3>
          <p>Essayez un autre mot ou revenez à l’ensemble des thèmes.</p>
          <button type="button" className={styles.textLink} onClick={resetFilters}>
            Voir tout le catalogue →
          </button>
        </div>
      ) : (
        <div className={styles.grid3}>
          {visible.map((article) => {
            const coverSrc = normalizeCoverSrc(article.cover);

            return (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className={styles.articleCard}
                onClick={() =>
                  track("article_opened_from_catalog", {
                    article: article.slug,
                    theme: activeTheme || "all",
                  })
                }
              >
                {coverSrc ? (
                  <div className={styles.articleImage}>
                    <Image
                      src={coverSrc}
                      alt=""
                      fill
                      sizes="(max-width: 800px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className={styles.articleImage} />
                )}

                <div className={styles.articleBody}>
                  <div className={styles.cardEyebrow}>
                    {article.futureLabel
                      ? "À paraître"
                      : article.seriesTitle && article.seriesOrder !== undefined
                        ? `${article.seriesTitle} · ${article.seriesOrder + 1}/${article.seriesLength ?? "?"}`
                        : article.themes[0] ?? article.date}
                  </div>
                  <h3 className={styles.articleTitle}>{article.title}</h3>
                  {article.excerpt ? (
                    <p className={styles.articleExcerpt}>{article.excerpt}</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {visible.length < filtered.length ? (
        <div className={styles.loadMore}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() => {
              setVisibleCount((count) => count + PAGE_SIZE);
              track("articles_more_loaded", {
                visible: Math.min(visibleCount + PAGE_SIZE, filtered.length),
              });
            }}
          >
            Voir 12 articles supplémentaires
          </button>
        </div>
      ) : null}
    </div>
  );
}
