"use client";

import { useState } from "react";
import { TRACKING_CHOICE_KEY } from "@/components/AnalyticsJourneyTracker";

export default function TrackingPreferences() {
  const [message, setMessage] = useState("");
  function reset() {
    localStorage.removeItem(TRACKING_CHOICE_KEY);
    localStorage.removeItem("cde_analytics_visitor");
    sessionStorage.removeItem("cde_analytics_session");
    sessionStorage.removeItem("cde_analytics_origin");
    setMessage("Votre choix a été effacé. La demande réapparaîtra à votre prochaine page.");
  }
  return <div><button type="button" onClick={reset} className="rounded-full border border-current px-4 py-2 text-sm font-semibold">Modifier mon choix de mesure d’audience</button>{message ? <p className="mt-2 text-sm">{message}</p> : null}</div>;
}
