export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
<header className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
  {/* Colonne texte */}
  <div className="space-y-5">
    <h1 className="text-4xl font-semibold tracking-tight">
      Carnet d’expérience
    </h1>

    <div className="max-w-md space-y-3">
      <p className="text-lg text-neutral-700 leading-relaxed">
        Exigence, simplicité&nbsp;: une méthode orientée action et résultats.
      </p>

<p className="text-xl font-medium leading-snug">
  Je fais le lien entre stratégie&nbsp;et&nbsp;terrain.
</p>
    </div>

    <div className="flex flex-wrap md:flex-nowrap gap-3 pt-2">
      <a
        href="/parcours"
        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 whitespace-nowrap"
      >
        Voir le parcours
      </a>
      <a
        href="/articles"
        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 whitespace-nowrap"
      >
        Lire les articles
      </a>
      <a
        href="/contact"
        className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 whitespace-nowrap"
      >
        Me contacter
      </a>
    </div>
  </div>

  {/* Colonne image */}
  <div className="flex justify-center md:justify-end">
    <div className="relative w-56 aspect-[3/4] rounded-full bg-white shadow-lg overflow-hidden flex items-end justify-center">
      <img
        src="/images/laurent-portrait.png"
        alt="Laurent Guyonnet"
        className="w-full h-full object-cover object-top"
      />
    </div>
  </div>
</header>

      {/* Body */}
      <section className="mt-12 space-y-8 text-[14px] leading-[1.55] text-neutral-900">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Bienvenue</h2>
          <p>
            <strong>Carnet d’expérience</strong> est un espace personnel et
            professionnel. Il prolonge mon CV en donnant accès à ce qui n’y tient
            pas&nbsp;: le contexte, les décisions, les méthodes, les doutes et
            les apprentissages qui accompagnent toute trajectoire réelle.
          </p>
          <p>
            J’y documente mon parcours, mes expériences et mes réflexions sur la
            formation, le management, l’adoption des outils et la manière dont
            les organisations fonctionnent — ou dysfonctionnent — au quotidien.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Un fil rouge</h2>
          <p>
            Depuis plus de quinze ans, mon travail consiste à transformer des
            intentions en réalité. Qu’il s’agisse de lancer un produit, de
            former des équipes, de déployer une méthode ou d’accompagner des
            personnes, la question reste la même&nbsp;: comment faire passer une
            vision du papier au terrain&nbsp;?
          </p>
          <p>
            Ce carnet est né de ce besoin de garder une trace de ce que j’ai vu,
            compris et expérimenté en chemin.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Ce que vous trouverez ici</h2>
          <ul className="list-disc space-y-1 pl-5 text-neutral-800">
            <li>
              <strong>Un parcours</strong> — raconté, pas résumé.
            </li>
            <li>
              <strong>Des articles</strong> — issus du terrain, de la formation,
              du management et de l’expérience client.
            </li>
            <li>
              <strong>Une méthode de travail</strong> — fondée sur l’exigence,
              la simplicité et la mesure de l’impact.
            </li>
          </ul>
          <p>
            Rien n’est ici théorique. Tout est ancré dans des situations vécues,
            des collectifs réels et des décisions prises dans des contextes
            concrets.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Pourquoi lire ce carnet</h2>
          <p>
            Si vous travaillez dans une organisation, si vous formez, managez,
            déployez ou accompagnez, vous reconnaîtrez sans doute beaucoup de
            choses ici.
          </p>
          <p>
            Ce carnet ne donne pas de recettes. Il partage des cadres, des
            observations et des manières de faire qui aident à mieux comprendre
            ce qui se joue entre la stratégie et le terrain.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold">Et après</h2>
          <p className="text-neutral-800">
            Vous pouvez lire mon parcours, parcourir les articles, ou m’écrire
            si vous souhaitez échanger, questionner ou travailler ensemble.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/parcours"
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Parcours
            </a>
            <a
              href="/articles"
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Articles
            </a>
            <a
              href="/contact"
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Contact
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-14 border-t border-neutral-200 pt-8 text-sm text-neutral-600">
        <p>
          © {new Date().getFullYear()} Carnet d’expérience — Tous droits
          réservés.
        </p>
      </footer>
    </main>
  );
}