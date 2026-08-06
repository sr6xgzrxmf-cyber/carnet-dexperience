import type { Metadata } from "next";
import TrackedLink from "@/components/TrackedLink";
import styles from "./offer.module.css";

export const metadata: Metadata = {
  title: "Comment je peux aider",
  description:
    "Un accompagnement pour clarifier une situation complexe, transmettre un cadre et rendre les usages réellement adoptables.",
};

const situations = [
  "Un rôle évolue, mais sa transmission reste implicite et fragile.",
  "Une expertise existe, mais ne circule plus naturellement.",
  "Un nouvel usage est maîtrisé techniquement, sans s’ancrer dans le quotidien.",
  "Une montée en compétences crée davantage de confusion que de clarté.",
  "Une trajectoire professionnelle mérite d’être relue sans être justifiée ni vendue.",
  "Une organisation cherche à relier intention, méthode et terrain sans perdre son sens.",
];

const deliverables = [
  {
    title: "Une situation nommée",
    text: "Les faits, les attentes, les tensions et les limites deviennent visibles et partageables.",
  },
  {
    title: "Un cadre transmissible",
    text: "Une trame, une fiche, un message, un support ou une séquence qui ne dépend plus d’explications informelles.",
  },
  {
    title: "Une suite praticable",
    text: "Des décisions et des actions suffisamment simples pour être tenues, observées puis ajustées sur le terrain.",
  },
];

const formats = [
  {
    title: "Échange de cadrage",
    text: "Poser le contexte, préciser ce qui est attendu et vérifier simplement si je suis la bonne personne pour vous aider.",
    outcome: "Une prochaine étape claire",
  },
  {
    title: "Diagnostic de situation",
    text: "Écouter les personnes concernées, lire les supports utiles et distinguer les faits, les frictions et les décisions à prendre.",
    outcome: "Une lecture partagée de la situation",
  },
  {
    title: "Atelier de clarification",
    text: "Travailler ensemble sur un rôle, une méthode ou un usage pour lui donner une forme compréhensible et transmissible.",
    outcome: "Un cadre, une trame ou un support utilisable",
  },
  {
    title: "Accompagnement à l’adoption",
    text: "Observer ce qui se passe dans le travail réel, ajuster ce qui résiste et consolider progressivement les nouveaux repères.",
    outcome: "Un usage qui tient sans alourdir le quotidien",
  },
];

export default function AtelierPage() {
  return (
    <div className={styles.page}>
      <section className={styles.offerHero}>
        <div>
          <p className={styles.eyebrow}>Comment je peux aider</p>
          <h1>Faire passer une intention claire dans la réalité du travail.</h1>
        </div>
        <div className={styles.offerHeroCopy}>
          <p>
            J’interviens quand les compétences et la volonté sont présentes,
            mais qu’un rôle, une méthode ou un usage reste difficile à
            transmettre et à tenir dans la durée.
          </p>
          <div className={styles.actions}>
            <TrackedLink
              className={`${styles.button} ${styles.buttonPrimary}`}
              href="/contact"
              eventName="offer_contact_clicked"
              eventData={{ placement: "hero" }}
            >
              Décrire votre situation <span aria-hidden>↗</span>
            </TrackedLink>
            <TrackedLink
              className={`${styles.button} ${styles.buttonSecondary}`}
              href="/atelier/etudes-de-cas"
              eventName="case_studies_opened"
              eventData={{ placement: "offer_hero" }}
            >
              Voir trois cas concrets
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Dans le travail réel</p>
            <h2>Des situations documentées, pas des promesses abstraites</h2>
          </div>
          <p>
            Trois expériences montrent comment une intention devient un cadre,
            puis une pratique utilisable par les personnes concernées.
          </p>
        </div>

        <div className={styles.casePreviewGrid}>
          <article>
            <span>01</span>
            <h3>Faire adopter une nouveauté</h3>
            <p>Relier contenus d’apprentissage, ateliers équipes et observation des usages clients.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Rendre un process sensible au terrain</h3>
            <p>Transformer les demandes clients en signal utilisable par les opérations.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Faire vivre un projet pédagogique</h3>
            <p>Réunir enseignants, institution et usages réels autour d’une expérience observable.</p>
          </article>
        </div>

        <TrackedLink
          className={styles.casePreviewLink}
          href="/atelier/etudes-de-cas"
          eventName="case_studies_opened"
          eventData={{ placement: "offer_body" }}
        >
          Lire les trois études de cas <span aria-hidden>→</span>
        </TrackedLink>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Les signaux</p>
            <h2>Vous n’avez pas forcément un problème à résoudre.</h2>
          </div>
          <p>
            Vous avez peut-être un décalage à rendre visible avant qu’il ne
            devienne une tension, une fatigue ou un échec d’adoption.
          </p>
        </div>
        <div className={styles.situationList}>
          {situations.map((situation, index) => (
            <article key={situation}>
              <span>0{index + 1}</span>
              <p>{situation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.fullBleed} ${styles.formatSection}`}>
        <div className={styles.fullBleedInner}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Les formats d’intervention</p>
              <h2>Un cadre proportionné à ce que la situation demande.</h2>
            </div>
            <p>
              Il n’y a pas de dispositif imposé. Le format, le rythme et le
              nombre de séances sont définis après le premier échange, puis
              formulés clairement avant de commencer.
            </p>
          </div>

          <div className={styles.formatGrid}>
            {formats.map((format, index) => (
              <article key={format.title}>
                <span className={styles.formatNumber}>0{index + 1}</span>
                <h3>{format.title}</h3>
                <p>{format.text}</p>
                <strong>{format.outcome}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.fullBleed} ${styles.inkSection}`}>
        <div className={styles.fullBleedInner}>
          <div className={styles.approachLayout}>
            <div>
              <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>L’approche</p>
              <h2>Comprendre avant de produire. Produire pour pouvoir agir.</h2>
            </div>
            <div className={styles.approachSteps}>
              <article>
                <span>01</span>
                <h3>Cadrer l’échange</h3>
                <p>Nous partons d’une situation réelle : ce qui se passe, ce qui est attendu, ce qui résiste et ce qui ne doit plus rester implicite.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Clarifier la mécanique</h3>
                <p>Nous séparons les faits, les tensions, les décisions et les responsabilités pour retrouver une lecture utile de la situation.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Donner une forme à la décision</h3>
                <p>Le travail produit une trace concrète : cadre, trame, formulation, support de transmission ou plan d’action.</p>
              </article>
              <article>
                <span>04</span>
                <h3>Observer et ajuster</h3>
                <p>Nous regardons l’effet produit dans le réel et ajustons sans alourdir le dispositif ni créer de dépendance.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Ce que le travail rend possible</p>
            <h2>Une sortie concrète, lisible et tenable</h2>
          </div>
          <p>
            Le format dépend de la situation. Le résultat attendu reste le
            même : rendre l’action plus claire sans simplifier le réel à
            l’excès.
          </p>
        </div>
        <div className={styles.deliverableGrid}>
          {deliverables.map((item) => (
            <article key={item.title}>
              <span className={styles.check} aria-hidden>✓</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.fullBleed} ${styles.softSection}`}>
        <div className={styles.fullBleedInner}>
          <div className={styles.fitLayout}>
            <div>
              <p className={styles.eyebrow}>Le bon cadre</p>
              <h2>Cet accompagnement est utile si…</h2>
            </div>
            <div>
              <ul className={styles.fitList}>
                <li><span aria-hidden>✓</span>Vous voulez clarifier sans désigner un coupable.</li>
                <li><span aria-hidden>✓</span>Vous êtes prêt à partir des faits et du travail réel.</li>
                <li><span aria-hidden>✓</span>Vous cherchez un cadre utilisable, pas une recette universelle.</li>
              </ul>
              <p className={styles.fitNote}>
                Le premier échange sert à vérifier si la situation relève bien
                de mon champ d’intervention. S’il existe une voie plus adaptée,
                je vous le dirai simplement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <p className={styles.eyebrow}>Première étape</p>
        <h2>Décrivez ce qui devrait être clair, mais ne tient pas encore.</h2>
        <p>
          Quelques lignes suffisent : la situation, ce qui résiste et ce que
          vous aimeriez rendre possible. Nous verrons ensuite quel format est le
          plus juste.
        </p>
        <TrackedLink
          className={`${styles.button} ${styles.buttonLight}`}
          href="/contact"
          eventName="offer_contact_clicked"
          eventData={{ placement: "closing" }}
        >
          Écrire à Laurent <span aria-hidden>→</span>
        </TrackedLink>
      </section>
    </div>
  );
}
