import type { Metadata } from "next";
import styles from "@/app/editorial-system.module.css";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales relatives au site Carnet d’expérience.",
};

export default function MentionsLegalesPage() {
  return (
    <article className={`${styles.page} ${styles.reading}`}>
      <header className={styles.readingHeader}>
        <p className={styles.eyebrow}>Informations légales</p>
        <h1 className={styles.titleCompact}>Mentions légales</h1>
        <p className={styles.readingMeta}>Dernière mise à jour : 24 juillet 2026</p>
      </header>

      <div className={styles.prose}>
        <div className={styles.impact}>
          <strong>Nature du site</strong>
          <p>
            Carnet d’expérience est, à ce jour, un site personnel et éditorial
            publié à titre non professionnel. Il ne permet ni achat, ni paiement,
            ni conclusion automatique d’une prestation en ligne.
          </p>
        </div>

        <h2>Éditeur du site</h2>
        <p>
          Carnet d’expérience est édité à titre personnel par Laurent Guyonnet.
          <br />
          Courriel :{" "}
          <a href="mailto:laurent.guyonnet.pro@gmail.com">
            laurent.guyonnet.pro@gmail.com
          </a>
        </p>
        <p>Directeur de la publication : Laurent Guyonnet.</p>
        <p>
          Ces mentions seront actualisées si le site devient le support d’une
          activité professionnelle immatriculée ou d’une offre contractuelle en
          ligne.
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133,
          Covina, CA 91723, États-Unis.
          <br />
          Site :{" "}
          <a href="https://vercel.com/" target="_blank" rel="noreferrer">
            vercel.com
          </a>
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          Sauf mention contraire, les textes, contenus éditoriaux et éléments
          originaux publiés sur Carnet d’expérience sont protégés par le droit
          d’auteur. Toute reproduction ou adaptation substantielle nécessite
          une autorisation préalable.
        </p>

        <h2>Responsabilité</h2>
        <p>
          Les contenus partagent des retours d’expérience et des cadres de
          réflexion. Ils ne constituent pas un conseil juridique, financier ou
          médical et doivent être appréciés au regard de chaque situation.
        </p>
      </div>
    </article>
  );
}
