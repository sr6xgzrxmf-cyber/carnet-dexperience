import type { Metadata } from "next";
import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import styles from "../offer.module.css";

export const metadata: Metadata = {
  title: "Études de cas",
  description:
    "Trois situations réelles où Laurent Guyonnet a relié stratégie, transmission et adoption sur le terrain.",
};

const caseStudies = [
  {
    number: "01",
    eyebrow: "Adoption & transmission · Apple Retail Lyon",
    title: "Faire d’une nouveauté un usage que les équipes savent transmettre",
    situation:
      "Les nouveaux produits, démonstrations et messages devaient circuler entre plusieurs métiers du magasin, puis devenir compréhensibles pour des clients aux usages déjà avancés.",
    actions: [
      "Concevoir des contenus d’apprentissage orientés vers l’usage, pas seulement vers les caractéristiques techniques.",
      "Animer des ateliers de 10 à 30 collaborateurs sur la technique, la vente, les usages et la posture client.",
      "Coordonner la diffusion des pratiques entre les équipes commerciales, créatives, opérationnelles et support.",
      "Utiliser les ateliers clients comme un laboratoire pour observer les réactions et ajuster les messages.",
    ],
    result:
      "Un langage plus clair et plus partagé pour expliquer, montrer et faire vivre les nouveautés. Le dispositif associait la montée en compétence des équipes à l’observation directe des usages : plus de 200 ateliers publics par an, auprès d’environ 1 500 clients.",
    sourceHref: "/parcours/2022-2025-apple-retail-creative-pro-lyon",
    sourceLabel: "Voir l’expérience complète à Lyon",
  },
  {
    number: "02",
    eyebrow: "Process & performance · Apple Retail Lille",
    title: "Transformer les demandes du terrain en signal opérationnel",
    situation:
      "Les bacs de livraison alimentaient les rayons selon les arrivages, tandis que des références très demandées restaient absentes du floor. Les clients exprimaient le besoin, mais le système logistique ne l’entendait pas.",
    actions: [
      "Rendre visible l’écart entre les produits remontés et les demandes réellement formulées par les clients.",
      "Travailler avec le manager des opérations sur deux projets pilotes.",
      "Tester un signalement en temps réel des références manquantes depuis le floor.",
      "Relier ensuite la préparation des bacs aux ventes réelles plutôt qu’aux seuls arrivages.",
    ],
    result:
      "Le terrain est devenu une source d’information pour le backstage. La disponibilité perçue, la fluidité du parcours client et la performance des ventes accessoires se sont améliorées sans ajouter une procédure déconnectée du travail réel.",
    sourceHref: "/parcours/2017-2022-apple-retail-creative-pro-lille",
    sourceLabel: "Voir l’expérience complète à Lille",
  },
  {
    number: "03",
    eyebrow: "Pédagogie & facilitation · Apple Retail Montpellier",
    title: "Faire entrer un projet numérique dans la réalité pédagogique",
    situation:
      "Des enseignants voyaient le potentiel des outils numériques, mais se heurtaient à la refonte des cours, aux procédures et à la difficulté de porter seuls un projet dans un système institutionnel complexe.",
    actions: [
      "Traduire la technologie en projets pédagogiques concrets plutôt qu’en démonstrations commerciales.",
      "Organiser des ateliers où les élèves venaient produire, créer, raconter, filmer et programmer.",
      "Faciliter les échanges entre enseignants, établissements, administration et Apple.",
      "Faire de l’usage observé par les enseignants la preuve principale de la valeur du projet.",
    ],
    result:
      "Les enseignants pouvaient voir leurs élèves engagés, concentrés et actifs avant de décider. Cette confiance construite par l’expérience a permis à des projets d’adoption institutionnels de se concrétiser, parfois à l’échelle de centaines d’équipements.",
    sourceHref: "/parcours/2009-2017-apple-retail-creative-pro-montpellier",
    sourceLabel: "Voir l’expérience complète à Montpellier",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.caseHero}>
        <div>
          <p className={styles.eyebrow}>Études de cas</p>
          <h1>Trois passages du flou à une pratique qui tient.</h1>
        </div>
        <p>
          Ces situations sont issues de mon parcours professionnel. Elles ne
          présentent pas une méthode plaquée après coup : elles montrent comment
          j’ai appris à clarifier, transmettre et faire adopter dans le travail réel.
        </p>
      </header>

      <div className={styles.caseStack}>
        {caseStudies.map((study) => (
          <article key={study.number} className={styles.caseStudy}>
            <div className={styles.caseTitle}>
              <span>{study.number}</span>
              <div>
                <p className={styles.eyebrow}>{study.eyebrow}</p>
                <h2>{study.title}</h2>
              </div>
            </div>

            <div className={styles.caseBody}>
              <section>
                <p className={styles.caseLabel}>La situation</p>
                <p>{study.situation}</p>
              </section>
              <section>
                <p className={styles.caseLabel}>Ce que j’ai mis en place</p>
                <ul>
                  {study.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </section>
              <section className={styles.caseResult}>
                <p className={styles.caseLabel}>Le résultat observé</p>
                <p>{study.result}</p>
              </section>
              <Link className={styles.caseSource} href={study.sourceHref}>
                {study.sourceLabel} <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      <section className={styles.closing}>
        <p className={styles.eyebrow}>Votre situation</p>
        <h2>Le prochain cas n’a pas besoin de ressembler exactement à ceux-ci.</h2>
        <p>
          Décrivez ce qui devrait circuler, se comprendre ou s’adopter plus
          facilement. Le premier échange permettra de nommer le véritable point
          de travail.
        </p>
        <TrackedLink
          className={`${styles.button} ${styles.buttonLight}`}
          href="/contact"
          eventName="case_studies_contact_clicked"
        >
          Parler de votre situation <span aria-hidden>→</span>
        </TrackedLink>
      </section>
    </div>
  );
}

