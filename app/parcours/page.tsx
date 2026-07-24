import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllParcours } from "@/lib/parcours";
import styles from "@/app/editorial.module.css";

export const metadata: Metadata = {
  title: "Parcours professionnel",
  description:
    "Une trajectoire construite au contact du terrain : expérience client, management, formation et transmission.",
};

function formatRange(start?: string, end?: string) {
  if (!start && !end) return "";
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} → ${end}`;
}

export default function ParcoursPage() {
  const items = getAllParcours().filter((item) => item.meta.type !== "formation");

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderSplit}>
          <div>
            <p className={styles.eyebrow}>Expérience · management · transmission</p>
            <h1 className={styles.title}>Un parcours construit dans le réel</h1>
          </div>
          <p className={styles.headerNote}>
            Plus de quinze ans à relier intention, méthode et terrain. Chaque
            expérience a précisé la même ligne de travail&nbsp;: clarifier ce qui se
            joue, transmettre ce qui compte et rendre l’action praticable.
          </p>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="trajectoire">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>La trajectoire</p>
            <h2 id="trajectoire" className={styles.sectionTitle}>
              Des contextes différents, une même attention au passage à l’action
            </h2>
          </div>
          <p className={styles.sectionCopy}>
            Ouvrez une expérience pour retrouver son contexte, les responsabilités
            exercées et les apprentissages qui nourrissent aujourd’hui ma pratique.
          </p>
        </div>

        <ol className={styles.timeline}>
          {items.map((item) => (
            <li key={item.slug} className={styles.timelineItem}>
              <div aria-hidden>
                {item.meta.logo ? (
                  <Image
                    src={item.meta.logo}
                    alt=""
                    width={66}
                    height={66}
                    className={styles.timelineLogo}
                    unoptimized
                  />
                ) : null}
              </div>

              <Link href={`/parcours/${item.slug}`} className={styles.timelineCard}>
                <div className={styles.timelineTopline}>
                  <h3 className={styles.timelineTitle}>{item.meta.title}</h3>
                  <span className={styles.timelineDate}>
                    {formatRange(item.meta.start, item.meta.end)}
                  </span>
                </div>

                {item.meta.company || item.meta.location ? (
                  <p className={styles.timelineContext}>
                    {item.meta.company ?? ""}
                    {item.meta.location ? ` — ${item.meta.location}` : ""}
                  </p>
                ) : null}

                {item.meta.role ? (
                  <p className={styles.timelineRole}>{item.meta.role}</p>
                ) : null}

                {Array.isArray(item.meta.highlights) && item.meta.highlights.length > 0 ? (
                  <ul className={styles.timelineHighlights}>
                    {item.meta.highlights.slice(0, 3).map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.cta}>
        <h2>Les expériences prennent leur sens dans ce qu’elles permettent de transmettre.</h2>
        <p>
          Le parcours de formation complète cette trajectoire et rend visibles les
          cadres qui ont structuré ma manière de travailler.
        </p>
        <Link
          href="/parcours/formation"
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          Voir la formation <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}
