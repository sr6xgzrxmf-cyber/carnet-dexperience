import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { markdownToHtml } from "@/lib/parcours";
import fs from "fs";
import path from "path";
import styles from "@/app/editorial-system.module.css";

export const metadata: Metadata = {
  title: "Situations d’intervention",
  description:
    "Les moments où j’interviens pour clarifier une situation, transmettre un cadre et rendre des usages complexes adoptables.",
};

function stripFrontMatter(markdown: string) {
  return markdown.replace(/^---\s*[\s\S]*?\s*---\s*/m, "");
}

export default async function SituationsInterventionPage() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "situations-d-intervention",
    "page.md"
  );

  if (!fs.existsSync(filePath)) return notFound();

  const raw = fs.readFileSync(filePath, "utf8");
  const contentHtml = await markdownToHtml(stripFrontMatter(raw));

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderSplit}>
          <div>
            <p className={styles.eyebrow}>Le passage entre intention et réalité</p>
            <h1 className={styles.title}>Situations d’intervention</h1>
          </div>
          <p className={styles.headerNote}>
            J’interviens lorsque la direction est comprise, mais que sa traduction
            dans les rôles, les usages ou le travail quotidien reste fragile.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <article
          className={`${styles.prose} ${styles.reading}`}
          style={{ marginTop: 0 }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </section>

      <section className={styles.cta}>
        <h2>Une situation vous semble familière&nbsp;?</h2>
        <p>
          Nous pouvons commencer par la décrire simplement, sans présumer de la
          solution. Je vous dirai clairement si et comment je peux être utile.
        </p>
        <Link href="/contact" className={styles.button}>
          Parler de votre situation <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}
