import Image from "next/image";
import Link from "next/link";
import styles from "./home.module.css";

const situations = [
  {
    number: "01",
    title: "Un rôle évolue, mais reste implicite",
    text: "Les responsabilités ont changé. Les attentes, les limites et les relais n’ont jamais été réellement posés.",
  },
  {
    number: "02",
    title: "Une expertise ne circule plus",
    text: "Le savoir existe, mais sa transmission dépend encore de quelques personnes ou de situations informelles.",
  },
  {
    number: "03",
    title: "Un usage ne s’ancre pas",
    text: "L’outil ou la méthode est compris techniquement, sans devenir un réflexe durable dans le travail quotidien.",
  },
];

const method = [
  {
    title: "Clarifier",
    text: "Nommer les faits, les attentes et le véritable point de friction, sans ajouter une couche de complexité.",
  },
  {
    title: "Transmettre",
    text: "Transformer ce qui a été compris en cadre lisible, partageable et utilisable par les personnes concernées.",
  },
  {
    title: "Faire adopter",
    text: "Relier le cadre au travail réel, observer ce qui résiste et ajuster jusqu’à ce que l’usage tienne.",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Parcours · transmission · adoption</p>
          <h1>
            Clarifier.
            <br />
            Transmettre.
            <br />
            <span>Faire adopter.</span>
          </h1>
          <p className={styles.heroLead}>
            J’aide les professionnels et les équipes à transformer un sujet
            complexe en cadre clair, transmissible et praticable sur le terrain.
          </p>
          <p className={styles.heroNote}>
            J’interviens lorsque la vision existe, mais que le passage à la
            réalité reste fragile, implicite ou difficile à tenir dans la durée.
          </p>
          <div className={styles.heroActions}>
            <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/atelier">
              Comment je peux aider <span aria-hidden>→</span>
            </Link>
            <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/parcours">
              Voir mon parcours <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>

        <div className={styles.portraitWrap} aria-label="Laurent Guyonnet">
          <div className={styles.portraitRule} aria-hidden />
          <Image
            className={styles.portrait}
            src="/images/laurent-portrait-cropped.png"
            alt="Laurent Guyonnet"
            width={1900}
            height={2200}
            priority
            sizes="(max-width: 900px) 90vw, 460px"
          />
          <p className={styles.portraitCaption}>
            <strong>Laurent Guyonnet</strong>
            <span>Le lien entre stratégie et terrain</span>
          </p>
        </div>
      </section>

      <section className={styles.signalBand}>
        <div className={styles.signalGrid}>
          <p>Plus de quinze ans d’expérience</p>
          <p>Formation · management · expérience client</p>
          <p>Des cadres légers, reliés au travail réel</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Comment je peux aider</p>
            <h2>Quand l’intention ne devient pas encore une réalité durable</h2>
          </div>
          <p>
            Ce ne sont pas toujours des problèmes visibles. Ce sont souvent des
            décalages qui finissent par coûter du temps, de l’énergie et de la
            confiance.
          </p>
        </div>

        <div className={styles.situationGrid}>
          {situations.map((situation) => (
            <article className={styles.situationCard} key={situation.number}>
              <span>{situation.number}</span>
              <h3>{situation.title}</h3>
              <p>{situation.text}</p>
            </article>
          ))}
        </div>

        <Link className={styles.textLink} href="/atelier">
          Voir toutes les situations et l’accompagnement <span aria-hidden>→</span>
        </Link>
      </section>

      <section className={`${styles.fullBleed} ${styles.softSection}`}>
        <div className={styles.fullBleedInner}>
          <div className={styles.methodLayout}>
            <div className={styles.methodIntro}>
              <p className={styles.eyebrow}>Une méthode simple</p>
              <h2>Du flou à un cadre qui tient dans le réel</h2>
              <p>
                Je ne viens pas ajouter une méthode hors sol. Je rends visible ce
                qui se joue, puis nous construisons la forme la plus utile pour
                agir et transmettre.
              </p>
            </div>
            <ol className={styles.methodList}>
              {method.map((step, index) => (
                <li key={step.title}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.evidenceLayout}`}>
        <div className={styles.evidenceCopy}>
          <p className={styles.eyebrow}>Un parcours, pas une posture déclarative</p>
          <h2>Le travail est documenté, pas seulement raconté</h2>
          <p>
            Les articles, les expériences et les situations de terrain rendent
            visibles les décisions, les ajustements et les apprentissages
            derrière la méthode.
          </p>
          <Link className={styles.textLink} href="/articles">
            Lire les textes repères <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className={styles.evidenceCard}>
          <p>Ce que vous trouverez ici</p>
          <ul>
            <li><span aria-hidden>✓</span>Un parcours professionnel raconté dans son contexte</li>
            <li><span aria-hidden>✓</span>Des situations réelles et des cadres réutilisables</li>
            <li><span aria-hidden>✓</span>Une approche exigeante, simple et sans recette magique</li>
          </ul>
        </div>
      </section>

      <section className={styles.closing}>
        <p className={styles.eyebrow}>Un sujet à clarifier ?</p>
        <h2>Un premier échange suffit parfois à remettre l’essentiel en ordre.</h2>
        <p>
          Décrivez la situation, ce qui résiste aujourd’hui et ce que vous
          aimeriez rendre plus clair ou plus praticable.
        </p>
        <Link className={`${styles.button} ${styles.buttonLight}`} href="/contact">
          Parler de votre situation <span aria-hidden>↗</span>
        </Link>
      </section>
    </div>
  );
}
