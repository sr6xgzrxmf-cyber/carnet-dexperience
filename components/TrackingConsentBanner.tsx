"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TRACKING_CHOICE_KEY } from "@/components/AnalyticsJourneyTracker";

export default function TrackingConsentBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(!localStorage.getItem(TRACKING_CHOICE_KEY)); }, []);
  if (!visible) return null;
  function choose(value: "accepted" | "refused") {
    localStorage.setItem(TRACKING_CHOICE_KEY, value);
    if (value === "refused") {
      localStorage.removeItem("cde_analytics_visitor");
      sessionStorage.removeItem("cde_analytics_session");
      sessionStorage.removeItem("cde_analytics_origin");
    } else window.dispatchEvent(new Event("cde-tracking-consent"));
    setVisible(false);
  }
  return <aside aria-label="Choix des cookies" className="fixed inset-x-0 bottom-0 z-[100] border-t border-neutral-300 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95">
    <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold">Ce site respecte votre vie privée</p>
        <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">Nous utilisons des technologies de mesure d’audience pour comprendre les visites et améliorer le site. Vos données sont conservées 30 jours et votre adresse IP n’est pas enregistrée. <Link className="whitespace-nowrap underline" href="/confidentialite">Gérer mes choix</Link></p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button type="button" onClick={() => choose("refused")} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700">Tout refuser</button>
        <button type="button" onClick={() => choose("accepted")} className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">Tout accepter</button>
      </div>
    </div>
  </aside>;
}
