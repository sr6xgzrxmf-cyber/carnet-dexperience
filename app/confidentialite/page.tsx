import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/app/editorial-system.module.css";

export const metadata: Metadata = {
  title: "Confidentialité et données personnelles",
  description:
    "Comment les données transmises à Carnet d’expérience sont utilisées, conservées et protégées.",
};

export default function ConfidentialitePage() {
  return (
    <article className={`${styles.page} ${styles.reading}`}>
      <header className={styles.readingHeader}>
        <p className={styles.eyebrow}>Informations et droits</p>
        <h1 className={styles.titleCompact}>Confidentialité et données personnelles</h1>
        <p className={styles.readingMeta}>Dernière mise à jour : 24 juillet 2026</p>
      </header>

      <div className={styles.prose}>
        <p>
          Cette page explique quelles informations sont traitées lorsque vous
          consultez Carnet d’expérience ou utilisez son formulaire de contact.
        </p>

        <h2>Responsable du traitement</h2>
        <p>
          Laurent Guyonnet est responsable des traitements décrits sur cette
          page. Pour toute question ou demande concernant vos données, vous
          pouvez écrire à{" "}
          <a href="mailto:laurent.guyonnet.pro@gmail.com">
            laurent.guyonnet.pro@gmail.com
          </a>
          .
        </p>

        <h2>Formulaire de contact</h2>
        <p>
          Le formulaire recueille votre nom, votre adresse électronique, le
          sujet et le contenu de votre message. Ces informations servent
          uniquement à comprendre votre demande, vous répondre et, si cela est
          pertinent, préparer un échange ou une proposition.
        </p>
        <p>
          Le traitement repose sur votre démarche de prise de contact et sur
          l’intérêt légitime à répondre aux demandes reçues. Lorsque votre
          message concerne une possible prestation, il peut également permettre
          de prendre des mesures précontractuelles à votre demande.
        </p>
        <p>
          Si aucun accompagnement n’est engagé, les informations sont conservées
          au maximum trois ans à compter de leur collecte ou de votre dernier
          contact. En cas de relation contractuelle, certaines données peuvent
          être conservées plus longtemps lorsque la loi l’exige.
        </p>

        <h2>Services techniques utilisés</h2>
        <p>
          Les messages du formulaire sont transmis et stockés par Formspree,
          prestataire technique du formulaire. Le site est hébergé par Vercel.
          Vercel Web Analytics et Speed Insights peuvent produire des mesures
          agrégées de fréquentation et de performance. Ces mesures ne sont pas
          utilisées pour créer des profils publicitaires.
        </p>
        <p>
          Les commentaires proposés sous certains articles reposent sur Giscus
          et GitHub. Ce service externe n’est chargé qu’après une action
          volontaire de votre part.
        </p>

        <h2>Cookies et mesure d’audience</h2>
        <p>
          Carnet d’expérience n’utilise pas de cookies publicitaires. La mesure
          d’audience Vercel fonctionne sans cookie et fournit des données
          agrégées. Les services externes que vous choisissez d’ouvrir, comme
          GitHub pour les commentaires, appliquent leurs propres règles de
          confidentialité.
        </p>

        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l’accès à vos données, leur rectification, leur
          effacement ou la limitation de leur traitement. Selon la situation,
          vous pouvez également vous opposer au traitement.
        </p>
        <p>
          Pour exercer ces droits, écrivez à{" "}
          <a href="mailto:laurent.guyonnet.pro@gmail.com">
            laurent.guyonnet.pro@gmail.com
          </a>
          . Si vous estimez que vos droits ne sont pas respectés après cet
          échange, vous pouvez adresser une réclamation à la{" "}
          <a href="https://www.cnil.fr/" target="_blank" rel="noreferrer">
            Commission nationale de l’informatique et des libertés
          </a>
          .
        </p>

        <h2>Retour au site</h2>
        <p>
          <Link href="/contact">Revenir à la page de contact</Link>
        </p>
      </div>
    </article>
  );
}
