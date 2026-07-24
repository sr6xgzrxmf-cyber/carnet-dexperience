import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllParcours } from "@/lib/parcours";
import styles from "@/app/editorial-system.module.css";

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

function startYear(start?: string) {
  const match = start?.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function ExperienceList({
  items,
}: {
  items: ReturnType<typeof getAllParcours>;
}) {
  return (
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
              <h4 className={styles.timelineTitle}>{item.meta.title}</h4>
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
  );
}

export default function ParcoursPage() {
  const items = getAllParcours().filter((item) => item.meta.type !== "formation");
  const phases = [
    {
      number: "01",
      period: "2017 — 2025",
      title: "Transmettre et piloter",
      text: "Faire circuler une intention, accompagner les usages et relier le pilotage opérationnel à l’expérience vécue.",
      tone: styles.phaseSage,
      items: items.filter((item) => startYear(item.meta.start) >= 2017),
    },
    {
      number: "02",
      period: "2007 — 2017",
      title: "Former et relier",
      text: "Construire une pédagogie de terrain, créer des passerelles et rendre une expertise accessible dans des contextes variés.",
      tone: styles.phaseMist,
      items: items.filter((item) => {
        const year = startYear(item.meta.start);
        return year >= 2007 && year < 2017;
      }),
    },
    {
      number: "03",
      period: "2002 — 2006",
      title: "Créer au contact du terrain",
      text: "Apprendre par la production, la relation client, le commerce et les premières responsabilités prises dans l’action.",
      tone: styles.phaseWarm,
      items: items.filter((item) => startYear(item.meta.start) < 2007),
    },
  ];

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

        <div className={styles.phaseStack}>
          {phases.map((phase) => (
            <section
              key={phase.number}
              className={`${styles.phaseBand} ${phase.tone}`}
              aria-labelledby={`phase-${phase.number}`}
            >
              <div className={styles.phaseInner}>
                <header className={styles.phaseHeader}>
                  <div>
                    <p className={styles.phaseIndex}>
                      {phase.number} · {phase.period}
                    </p>
                    <h3 id={`phase-${phase.number}`} className={styles.phaseTitle}>
                      {phase.title}
                    </h3>
                  </div>
                  <p className={styles.phaseCopy}>{phase.text}</p>
                </header>
                <ExperienceList items={phase.items} />
              </div>
            </section>
          ))}
        </div>
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
