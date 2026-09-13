import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import TrackedLink from "@/components/TrackedLink";
import styles from "./home.module.css";
import { getArticleBySlug, getPublishedArticles, type ArticleMeta } from "@/lib/articles";
import { normalizeArticleDate } from "@/lib/article-date";
import { readHomeHighlights } from "@/lib/home-highlights";
import PortfolioLoop from "./PortfolioLoop";

function formatArticleDate(date: ArticleMeta["date"]): string | null {
  const iso = normalizeArticleDate(date);
  if (!iso) return null;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

function normalizeCoverSrc(cover: unknown): string | null {
  if (typeof cover !== "string" || !cover.trim()) return null;
  const s = cover.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
}

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
    title: "Rendre visible ce qui se joue",
    text: "Nommer les faits, les attentes et le véritable point de friction, sans ajouter une couche de complexité.",
  },
  {
    title: "Donner une forme partageable",
    text: "Transformer ce qui a été compris en cadre lisible, partageable et utilisable par les personnes concernées.",
  },
  {
    title: "Installer l’usage dans la durée",
    text: "Relier le cadre au travail réel, observer ce qui résiste et ajuster jusqu’à ce que l’usage tienne.",
  },
];

const portfolioVisuals = [
  "/images/articles/2026-02-02-ce-que-la-direction-entend-vraiment.jpg",
  "/images/articles/2026-03-17-devenir-facilitateur-le-leadership-discret.jpg",
  "/images/articles/2026-05-15-comprendre-comment-une-organisation-ecoute.jpg",
];

export default function HomePage() {
  const publishedArticles = getPublishedArticles();
  const latestArticles = publishedArticles.slice(0, 5);
  const latestArticle = latestArticles[0] ?? null;
  const remainingArticlesCount = Math.max(
    publishedArticles.length - latestArticles.length,
    0,
  );

  const curatedHighlights = readHomeHighlights().flatMap((highlight) => {
    if (!highlight.active) return [];
    if (latestArticle && highlight.slug === latestArticle.slug) return [];
    const article = getArticleBySlug(highlight.slug, { includeFuture: false });
    if (!article) return [];
    return [{ highlight, article, isLatest: false as const }];
  });

  const highlights = latestArticle
    ? (() => {
        const latestEntry = {
          highlight: {
            slug: latestArticle.slug,
            label: "Dernier article publié",
            size: "feature" as const,
            active: true,
          },
          article: latestArticle,
          isLatest: true as const,
        };
        const middleIndex = Math.floor(curatedHighlights.length / 2);
        return [
          ...curatedHighlights.slice(0, middleIndex),
          latestEntry,
          ...curatedHighlights.slice(middleIndex),
        ];
      })()
    : curatedHighlights;

  const needsVisualAfter = (index: number) => {
    if (highlights[index]?.highlight.size !== "compact") return false;
    if (highlights[index + 1]?.highlight.size === "compact") return false;

    let compactRunLength = 1;
    for (let previous = index - 1; previous >= 0; previous -= 1) {
      if (highlights[previous].highlight.size !== "compact") break;
      compactRunLength += 1;
    }

    return compactRunLength % 2 === 1;
  };

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
            <TrackedLink
              className={`${styles.button} ${styles.buttonPrimary}`}
              href="/atelier"
              eventName="home_offer_clicked"
              eventData={{ placement: "hero" }}
            >
              Comment je peux aider <span aria-hidden>→</span>
            </TrackedLink>
            <TrackedLink
              className={`${styles.button} ${styles.buttonSecondary}`}
              href="/parcours"
              eventName="home_parcours_clicked"
            >
              Voir mon parcours <span aria-hidden>↗</span>
            </TrackedLink>
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

      {highlights.length ? (
        <section className={styles.portfolio} aria-labelledby="portfolio-title">
          <div className={styles.portfolioHeading}>
            <div>
              <p className={styles.eyebrow}>Le travail en situation</p>
              <h2 id="portfolio-title">Des compétences en action</h2>
            </div>
            <p>Faites glisser pour découvrir les articles.</p>
          </div>
          <PortfolioLoop>
            {highlights.map(({ highlight, article, isLatest }, index) => {
              const tileClassName = `${styles.portfolioTile} ${styles[`portfolio_${highlight.size}`]} ${
                isLatest ? styles.portfolioLatest : ""
              }`;
              const tileContent = (
                <>
                  {article.meta.cover ? (
                    <Image
                      src={article.meta.cover}
                      alt=""
                      fill
                      sizes={highlight.size === "feature" ? "(max-width: 700px) 88vw, 620px" : "(max-width: 700px) 76vw, 360px"}
                      className={`${styles.portfolioImage} ${isLatest ? styles.portfolioImageMono : ""}`}
                    />
                  ) : null}
                  {isLatest ? null : (
                    <span className={styles.portfolioShade} aria-hidden />
                  )}
                  <span
                    className={`${styles.portfolioContent} ${
                      isLatest ? styles.portfolioContentLight : ""
                    }`}
                  >
                    <span
                      className={`${styles.portfolioLabel} ${
                        isLatest ? styles.portfolioLabelLatest : ""
                      }`}
                    >
                      {isLatest ? "Dernier article publié" : highlight.label || "Article"}
                    </span>
                    <strong>{article.meta.title}</strong>
                    <span className={styles.portfolioAction}>Lire l’article →</span>
                  </span>
                </>
              );

              return (
                <Fragment key={article.slug}>
                  {isLatest ? (
                    <TrackedLink
                      href={`/articles/${article.slug}`}
                      className={tileClassName}
                      eventName="home_portfolio_latest_clicked"
                      eventData={{ slug: article.slug }}
                    >
                      {tileContent}
                    </TrackedLink>
                  ) : (
                    <Link href={`/articles/${article.slug}`} className={tileClassName}>
                      {tileContent}
                    </Link>
                  )}
                  {needsVisualAfter(index) ? (
                    <div
                      className={`${styles.portfolioTile} ${styles.portfolio_compact} ${styles.portfolioVisual}`}
                      aria-hidden="true"
                    >
                      <Image
                        src={portfolioVisuals[index % portfolioVisuals.length]}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 76vw, 300px"
                        className={styles.portfolioImage}
                      />
                    </div>
                  ) : null}
                </Fragment>
              );
            })}
            <Link
              href="/articles"
              className={`${styles.portfolioTile} ${styles.portfolio_tall} ${styles.portfolioCta}`}
            >
              <span className={styles.portfolioCtaMark} aria-hidden>→</span>
              <span className={styles.portfolioContent}>
                <span className={styles.portfolioLabel}>Tout le carnet</span>
                <strong>Voir tous les articles</strong>
                <span className={styles.portfolioAction}>Explorer les textes et les séries →</span>
              </span>
            </Link>
          </PortfolioLoop>
        </section>
      ) : null}

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

      {latestArticles.length ? (
        <section className={styles.section} aria-labelledby="latest-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Le carnet</p>
              <h2 id="latest-title">Les derniers articles</h2>
            </div>
            <p>Les textes les plus récents, toutes séries confondues.</p>
          </div>

          <div className={styles.latestGrid}>
            {latestArticles.map((article, index) => {
              const date = formatArticleDate(article.meta.date);
              const coverSrc = normalizeCoverSrc(article.meta.cover);
              const isFeatured = index === 0;

              return (
                <TrackedLink
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className={`${styles.latestTile} ${
                    isFeatured ? styles.latestFeature : styles.latestCompact
                  }`}
                  eventName="home_latest_article_clicked"
                  eventData={{ slug: article.slug, position: index + 1 }}
                >
                  {coverSrc ? (
                    <Image
                      src={coverSrc}
                      alt=""
                      fill
                      sizes={
                        isFeatured
                          ? "(max-width: 900px) 100vw, 560px"
                          : "(max-width: 900px) 50vw, 260px"
                      }
                      className={styles.latestImage}
                    />
                  ) : null}
                  <span className={styles.latestShade} aria-hidden />
                  <span className={styles.latestContent}>
                    {date ? (
                      <span className={styles.latestDate}>{date}</span>
                    ) : null}
                    <strong>{article.meta.title}</strong>
                    {isFeatured && article.meta.excerpt ? (
                      <span className={styles.latestExcerpt}>
                        {article.meta.excerpt}
                      </span>
                    ) : null}
                  </span>
                </TrackedLink>
              );
            })}
          </div>

          <TrackedLink
            className={styles.textLink}
            href="/articles"
            eventName="home_latest_view_all_clicked"
          >
            {remainingArticlesCount > 0
              ? `Voir les ${remainingArticlesCount} autres articles`
              : "Voir tous les articles"}{" "}
            <span aria-hidden>→</span>
          </TrackedLink>
        </section>
      ) : null}

      <section className={`${styles.fullBleed} ${styles.softSection}`}>
        <div className={styles.fullBleedInner}>
          <div className={styles.methodLayout}>
            <div className={styles.methodIntro}>
              <p className={styles.eyebrow}>
                Clarifier, transmettre, faire adopter — concrètement
              </p>
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
        <TrackedLink
          className={`${styles.button} ${styles.buttonLight}`}
          href="/contact"
          eventName="home_contact_clicked"
          eventData={{ placement: "closing" }}
        >
          Parler de votre situation <span aria-hidden>↗</span>
        </TrackedLink>
      </section>
    </div>
  );
}
