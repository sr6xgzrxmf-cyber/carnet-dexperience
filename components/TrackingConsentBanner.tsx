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
  return <aside aria-label="Choix de mesure d’audience" className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-neutral-300 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-950">
    <p className="font-semibold">Mesure d’audience anonyme</p>
    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Avec votre accord, ce site distingue les visites pendant 30 jours et mesure les pages lues, la durée, le défilement et les clics. Aucune adresse IP n’est conservée. <Link className="underline" href="/confidentialite">En savoir plus</Link></p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" onClick={() => choose("accepted")} className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">Accepter</button>
      <button type="button" onClick={() => choose("refused")} className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold dark:border-neutral-700">Refuser</button>
    </div>
  </aside>;
}
