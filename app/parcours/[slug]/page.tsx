import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllParcours,
  getParcoursBySlug,
  markdownToHtml,
} from "@/lib/parcours";
import styles from "@/app/editorial-system.module.css";

export function generateStaticParams() {
  return getAllParcours()
    .filter((item) => item.meta.type !== "formation")
    .map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const item = getParcoursBySlug(resolvedParams.slug);
  if (!item) return {};

  const description = [
    item.meta.role,
    item.meta.company,
    item.meta.location,
    formatRange(item.meta.start, item.meta.end),
  ]
    .filter(Boolean)
    .join(" — ");

  return {
    title: item.meta.title ?? resolvedParams.slug,
    description: description || "Détail d’une expérience du parcours de Laurent Guyonnet.",
  };
}

function formatRange(start?: string, end?: string) {
  if (!start && !end) return "";
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} → ${end}`;
}

export default async function ParcoursDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getParcoursBySlug(slug);
  if (!item) return notFound();

  const contentHtml = await markdownToHtml(item.content);

  return (
    <article className={`${styles.page} ${styles.reading}`}>
      <header className={styles.readingHeader}>
        <Link href="/parcours" className={styles.backLink}>
          <span aria-hidden>←</span>
          <span>Retour au parcours</span>
        </Link>

        <p className={styles.eyebrow} style={{ marginTop: 34 }}>
          {formatRange(item.meta.start, item.meta.end)}
        </p>
        <h1 className={styles.titleCompact}>{item.meta.title}</h1>

        <div className={styles.readingMeta}>
          {item.meta.company ? <strong>{item.meta.company}</strong> : null}
          {item.meta.location ? ` — ${item.meta.location}` : ""}
          {item.meta.role ? <p>{item.meta.role}</p> : null}
        </div>

        {Array.isArray(item.meta.tags) && item.meta.tags.length > 0 ? (
          <div className={styles.tags}>
            {item.meta.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div
        className={styles.prose}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <footer className={styles.readingNav}>
        <Link href="/parcours" className={styles.textLink}>
          ← Revenir à la trajectoire
        </Link>
        <Link href="/contact" className={`${styles.button} ${styles.buttonPrimary}`}>
          Échanger sur un besoin <span aria-hidden>→</span>
        </Link>
      </footer>
    </article>
  );
}
