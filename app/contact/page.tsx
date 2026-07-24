import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import styles from "@/app/editorial-system.module.css";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mbddjpnq";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Un premier échange pour clarifier une situation, une transition ou un besoin d’accompagnement.",
};

const usefulDetails = [
  "Le contexte en quelques lignes",
  "Ce qui résiste ou reste flou aujourd’hui",
  "Ce que vous aimeriez rendre plus clair ou plus praticable",
];

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderSplit}>
          <div>
            <p className={styles.eyebrow}>Un sujet à clarifier ?</p>
            <h1 className={styles.title}>Parlons de votre situation</h1>
          </div>
          <p className={styles.headerNote}>
            Il n’est pas nécessaire d’avoir déjà formulé une demande parfaite.
            Décrivez simplement le contexte et le point qui résiste&nbsp;: un premier
            échange permet souvent de remettre l’essentiel en ordre.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.grid2}>
          <div className={styles.softSurface}>
            <p className={styles.eyebrow}>Pour commencer</p>
            <h2 className={styles.sectionTitle}>Quelques repères suffisent</h2>
            <p className={styles.sectionCopy} style={{ marginTop: 20 }}>
              Vous pouvez rester bref. Ce premier message sert à comprendre si je
              suis la bonne personne et à préparer un échange utile.
            </p>
            <ul className={styles.timelineHighlights} style={{ marginTop: 28 }}>
              {usefulDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>

          <ContactForm action={FORMSPREE_ENDPOINT} showEmailButton={false} />
        </div>
      </section>
    </div>
  );
}
