import Link from "next/link";
import ContactButton from "@/components/ContactButton";

export default function HomePage() {
  return (
    <section className="w-full pt-10 sm:pt-14">
      {/* HERO */}
      <div className="mx-auto w-full max-w-3xl">
        <header className="grid grid-cols-1 md:grid-cols-[1fr_210px] gap-10 md:gap-8 items-start md:items-start">
        {/* TEXTE ET BOUTONS */}
        <div className="space-y-5 text-center md:text-left">
          <h1 className="text-4xl font-semibold tracking-tight">
            Carnet d'expérience
          </h1>

          <div className="max-w-xl space-y-3 mx-auto md:mx-0">
            <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              Exigence, simplicité&nbsp;: une méthode orientée action et résultats.
            </p>

            <p className="text-xl font-medium leading-snug text-neutral-900 dark:text-neutral-100">
              Je fais le lien entre stratégie&nbsp;et&nbsp;terrain.
            </p>
          </div>

          <div className="mt-4 w-full max-w-xl mx-auto md:mx-0">
            <div className="flex flex-nowrap justify-center md:justify-start gap-2">
              <Link
                href="/parcours"
                className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs md:text-sm font-medium text-center whitespace-nowrap hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
              >
                Voir le parcours
              </Link>

              <Link
                href="/articles"
                className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs md:text-sm font-medium text-center whitespace-nowrap hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
              >
                Lire les articles
              </Link>

              <ContactButton
                label="Me contacter"
                className="rounded-xl bg-neutral-900 dark:bg-neutral-100 px-3 py-2 text-xs md:text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 border-0 whitespace-nowrap"
              />
            </div>
          </div>
        </div>

        {/* PHOTO */}
        <div className="flex justify-center md:justify-end md:-mt-16">
          <div className="w-full max-w-[210px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src="/images/laurent-portrait.png"
                alt="Laurent Guyonnet"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <p className="mt-2 text-center text-[11px] text-neutral-500">
              Laurent Guyonnet
            </p>
          </div>
        </div>
        </header>
      </div>

      {/* CONTENU */}
      <section className="mt-12 text-[14px] leading-[1.55] text-neutral-900 dark:text-neutral-100">
        <div className="mx-auto space-y-8 max-w-3xl">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Bienvenue</h2>


            <p className="text-neutral-800 dark:text-neutral-200">
              <strong>Carnet d'expérience</strong> est un espace personnel et
              professionnel. Il prolonge mon CV en donnant accès à ce qui n'y tient
              pas&nbsp;: le contexte, les décisions, les méthodes, les doutes et
              les apprentissages qui accompagnent toute trajectoire réelle.
            </p>
            <p className="text-neutral-800 dark:text-neutral-200">
              J'y documente mon parcours, mes expériences et mes réflexions sur la
              formation, le management, l'adoption des outils et la manière dont
              les organisations fonctionnent — ou dysfonctionnent — au quotidien.
            </p>

            <p className="text-neutral-800 dark:text-neutral-200"> 
J’interviens quand il faut clarifier, transmettre ou faire adopter des usages complexes — sans simplifier à l’excès.
            </p>


          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Un fil rouge</h2>
            <p className="text-neutral-800 dark:text-neutral-200">
              Depuis plus de quinze ans, mon travail consiste à transformer des
              intentions en réalité. Qu'il s'agisse de lancer un produit, de
              former des équipes, de déployer une méthode ou d'accompagner des
              personnes, la question reste la même&nbsp;: comment faire passer une
              vision du papier au terrain&nbsp;?
            </p>
            <p className="text-neutral-800 dark:text-neutral-200">
              Ce carnet est né de ce besoin de garder une trace de ce que j'ai vu,
              compris et expérimenté en chemin.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Ce que vous trouverez ici</h2>
            <ul className="list-disc space-y-1 pl-5 text-neutral-800 dark:text-neutral-200">
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Un parcours
                </strong>{" "}
                — raconté, pas résumé.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Des articles
                </strong>{" "}
                — issus du terrain, de la formation, du management et de
                l'expérience client.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Une méthode de travail
                </strong>{" "}
                — fondée sur l'exigence, la simplicité et la mesure de l'impact.
              </li>
            </ul>
            <p className="text-neutral-800 dark:text-neutral-200">
              Rien n'est ici théorique. Tout est ancré dans des situations vécues,
              des collectifs réels et des décisions prises dans des contextes
              concrets.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Pourquoi lire ce carnet</h2>
            <p className="text-neutral-800 dark:text-neutral-200">
              Si vous travaillez dans une organisation, si vous formez, managez,
              déployez ou accompagnez, vous reconnaîtrez sans doute beaucoup de
              choses ici.
            </p>
            <p className="text-neutral-800 dark:text-neutral-200">
              Ce carnet ne donne pas de recettes. Il partage des cadres, des
              observations et des manières de faire qui aident à mieux comprendre
              ce qui se joue entre la stratégie et le terrain.
            </p>
<p className="mt-8 text-right text-xs text-neutral-500 dark:text-neutral-500">
  <Link
    href="/situations-d-intervention"
    className="hover:underline"
  >
    → Voir les situations dans lesquelles j’interviens
  </Link>
</p>
</div>


          <div className="space-y-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/50 dark:bg-neutral-950/30">
            <h2 className="text-xl font-semibold">Et après</h2>
            <p className="text-neutral-800 dark:text-neutral-200">
              Vous pouvez lire mon parcours, parcourir les articles, ou m'écrire
              si vous souhaitez échanger, questionner ou travailler ensemble.
            </p>

            <div className="pt-2 w-full max-w-xl">
              <div className="flex flex-wrap md:flex-nowrap gap-3">
                <Link
                  href="/parcours"
                  className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-center whitespace-nowrap hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
                >
                  Parcours
                </Link>

                <Link
                  href="/articles"
                  className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-center whitespace-nowrap hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
                >
                  Articles
                </Link>

                <ContactButton
                  label="Contact"
                  className="rounded-xl bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 border-0 whitespace-nowrap"
                />
              </div>
            </div>
          </div>

          <footer className="mt-14 border-t border-neutral-200 dark:border-neutral-800 pt-8 text-sm text-neutral-600 dark:text-neutral-400">
            <p>
              © {new Date().getFullYear()} Carnet d'expérience — Tous droits réservés.
            </p>
          </footer>
        </div>
      </section>
    </section>
  );
}