"use client";

import { useEffect, useRef, useState } from "react";

type Step = { who: string; title: string; path: string; text: string };

// La visite guidée : chaque étape ouvre l'écran correspondant du WordPress de démonstration.
const STEPS: Step[] = [
  {
    who: "Bénévole",
    title: "Le mail de bienvenue",
    path: "/",
    text: "Après l’entretien d’accueil, le bénévole envoie aux participants retenus un mail type, préparé une fois pour toutes : lien de la page d’inscription, mot de passe et lien d’abonnement à l’agenda de la session.",
  },
  {
    who: "Participant",
    title: "La fiche d’inscription",
    path: "/inscription-session-189/",
    text: "La page n’apparaît ni dans le menu ni dans Google. Tapez le mot de passe Relais189 : la fiche s’ouvre, avec le premier exercice « L’art de se présenter » et les cases de consentement. Vous pouvez l’envoyer pour de vrai.",
  },
  {
    who: "Bénévole",
    title: "Les fiches côté bénévole",
    path: "/wp-admin/admin.php?page=fluent_forms&route=entries&form_id=3",
    text: "Chaque fiche arrive dans l’administration du site, jamais sur le site public. Le bénévole les consulte, les filtre, puis les exporte en tableur avec « Exporter » pour les coller dans la liste réseau.",
  },
  {
    who: "Participant",
    title: "Le pitch final",
    path: "/pitch-final-session-189/",
    text: "À la dernière séance, chacun dépose la version aboutie de son pitch (même mot de passe). Seule cette version peut paraître dans la newsletter, et seulement si la case est cochée.",
  },
  {
    who: "Ancien participant",
    title: "Donnez-nous de vos nouvelles",
    path: "/reseau/donnez-nous-de-vos-nouvelles/",
    text: "Les anciens donnent leurs nouvelles en deux minutes. Leurs réponses mettent à jour la liste réseau et nourrissent le numéro suivant de la newsletter.",
  },
  {
    who: "Bénévole",
    title: "L’article d’un bénévole",
    path: "/wp-admin/edit.php?post_status=pending&post_type=post",
    text: "Michel a un compte « Contributeur » : il écrit son article, qui reste en attente jusqu’à ce qu’un responsable le relise et le publie.",
  },
  {
    who: "Binôme newsletter",
    title: "La newsletter n° 0",
    path: "/wp-admin/admin.php?page=mailpoet-newsletter-editor&id=1",
    text: "Le numéro reprend les pitchs finaux acceptés, les nouvelles des anciens et l’article du bénévole, aux couleurs du site. On le modifie en glissant des blocs, puis on l’envoie.",
  },
  {
    who: "Binôme newsletter",
    title: "Les abonnés",
    path: "/wp-admin/admin.php?page=mailpoet-subscribers",
    text: "Seuls ceux qui ont coché la case reçoivent la newsletter. Les anciens s’abonnent eux-mêmes depuis la page « Recevoir la newsletter », et se désabonnent en un clic.",
  },
];

type PlaygroundClient = { isReady(): Promise<void>; goTo(path: string): Promise<void> };

const PLAYGROUND = "https://playground.wordpress.net";

function blueprint(setupCode: string) {
  return {
    landingPage: "/visite-guidee/",
    preferredVersions: { php: "8.2", wp: "latest" },
    features: { networking: true },
    login: true,
    steps: [
      { step: "installTheme", themeData: { resource: "wordpress.org/themes", slug: "generatepress" } },
      { step: "installPlugin", pluginData: { resource: "wordpress.org/plugins", slug: "fluentform" } },
      { step: "installPlugin", pluginData: { resource: "wordpress.org/plugins", slug: "mailpoet" } },
      // Après les extensions, pour que leurs traductions françaises soient téléchargées aussi.
      { step: "setSiteLanguage", language: "fr_FR" },
      { step: "writeFile", path: "/wordpress/relais-setup.php", data: setupCode },
      { step: "runPHP", code: "<?php require '/wordpress/relais-setup.php';" },
    ],
  };
}

// Le blueprint passe dans l'URL en base64 : en JSON brut, les « % » du script cassent le décodage.
function toBase64(text: string) {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export default function Demo({ setupCode }: { setupCode: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const client = useRef<PlaygroundClient | null>(null);
  const started = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [active, setActive] = useState(0);
  const [slow, setSlow] = useState(false);

  // WordPress Playground fait tourner WordPress dans le navigateur : rien n'est envoyé ni conservé.
  useEffect(() => {
    if (started.current || !frame.current) return;
    started.current = true;
    const iframe = frame.current;
    // Chrome qui bloque le stockage tiers empêche le démarrage intégré : on propose alors un onglet dédié.
    window.setTimeout(() => setSlow(true), 90_000);
    (async () => {
      const url = `${PLAYGROUND}/client/index.js`;
      const { startPlaygroundWeb } = await import(/* webpackIgnore: true */ url);
      const instance: PlaygroundClient = await startPlaygroundWeb({ iframe, remoteUrl: `${PLAYGROUND}/remote.html`, blueprint: blueprint(setupCode) });
      await instance.isReady();
      client.current = instance;
      setStatus("ready");
    })().catch(() => setStatus("error"));
  }, [setupCode]);

  const open = (index: number) => {
    setActive(index);
    client.current?.goTo(STEPS[index].path).catch(() => undefined);
  };
  const step = STEPS[active];

  return (
    <div className="mt-6">
      {/* Les étapes au-dessus : le WordPress garde toute la largeur et son affichage d'ordinateur. */}
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => open(index)}
              disabled={status !== "ready"}
              aria-current={index === active ? "step" : undefined}
              className={`flex items-baseline gap-2 rounded-full border px-3 py-1.5 text-sm disabled:cursor-wait disabled:opacity-60 ${
                index === active
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              }`}
            >
              <span className="font-mono text-xs opacity-60">{index + 1}</span>
              <span className="font-semibold">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="mt-4 grid gap-4 rounded-2xl border border-neutral-200 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] dark:border-neutral-800">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">{step.who}</p>
          <h2 className="mt-1 font-semibold">{step.title}</h2>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{step.text}</p>
          <p className="mt-3 text-xs text-neutral-500">
            Personnes et réponses fictives. Rien n’est conservé : à chaque ouverture, le WordPress se réinstalle. Extensions gratuites :
            GeneratePress (le thème du site actuel), Fluent Forms et MailPoet.
          </p>
        </div>
        {active === 0 ? (
          <div className="rounded-xl bg-neutral-100 p-3 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
            <p className="font-semibold">Objet : Bienvenue dans la session 189</p>
            <p className="mt-2">Bonjour Sabrina,</p>
            <p className="mt-2">
              Bienvenue dans la session 189 ! Avant la première séance du lundi 2 novembre, merci de remplir votre fiche
              d’inscription : <span className="underline">[lien]</span>. Mot de passe : Relais189. Vous y trouverez aussi le premier
              exercice, « L’art de se présenter ».
            </p>
            <p className="mt-2">
              Pour ajouter toutes les séances à votre agenda en un clic : <span className="underline">[lien de l’agenda]</span>.
            </p>
          </div>
        ) : null}
      </section>

      <div ref={stage} className="relative mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-800">
          <span>WordPress de démonstration · relaisemploilyon.fr (copie)</span>
          <button type="button" onClick={() => stage.current?.requestFullscreen?.()} className="font-semibold underline underline-offset-4">
            Plein écran
          </button>
        </div>
        <iframe ref={frame} title="WordPress de démonstration du Relais Emploi Lyon" className="h-[78vh] min-h-[560px] w-full bg-white" style={{ colorScheme: "light" }} />
        {status !== "ready" ? (
          <div className="absolute inset-0 top-[33px] flex flex-col items-center justify-center gap-2 bg-white/95 p-6 text-center text-neutral-700">
            {status === "loading" ? (
              <>
                <p className="font-semibold">Installation du WordPress de démonstration…</p>
                <p className="text-sm">Thème, formulaires, newsletter et données fictives : comptez environ une minute.</p>
              </>
            ) : (
              <>
                <p className="font-semibold">La démonstration n’a pas pu démarrer.</p>
                <button type="button" onClick={() => window.location.reload()} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold">
                  Réessayer
                </button>
              </>
            )}
            {slow || status === "error" ? (
              <div className="mt-4 max-w-md text-sm">
                <p>Toujours rien ? Certains navigateurs bloquent le WordPress intégré à la page.</p>
                <a
                  href={`${PLAYGROUND}/#${toBase64(JSON.stringify(blueprint(setupCode)))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-full bg-neutral-900 px-4 py-2 font-semibold text-white"
                >
                  Ouvrir la démonstration dans un nouvel onglet
                </a>
                <p className="mt-2 text-xs text-neutral-500">Le même WordPress, sur le site de WordPress Playground : suivez les étapes ci-dessus avec le menu du site.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
