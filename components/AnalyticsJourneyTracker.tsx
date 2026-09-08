"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SESSION_KEY = "cde_analytics_session";
const ORIGIN_KEY = "cde_analytics_origin";

function getSessionId() {
  let value = sessionStorage.getItem(SESSION_KEY);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

function send(body: Record<string, unknown>) {
  void fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify(body),
  });
}

export default function AnalyticsJourneyTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const params = new URLSearchParams(window.location.search);
    const origin = sessionStorage.getItem(ORIGIN_KEY) ?? document.referrer;
    if (!sessionStorage.getItem(ORIGIN_KEY)) sessionStorage.setItem(ORIGIN_KEY, origin);
    send({ eventType: "page_view", sessionId: getSessionId(), path: pathname, referrer: origin,
      utmSource: params.get("utm_source"), utmMedium: params.get("utm_medium"), utmCampaign: params.get("utm_campaign") });
  }, [pathname]);

  useEffect(() => {
    function trackClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || window.location.pathname.startsWith("/admin")) return;
      const target = new URL(link.href, window.location.href);
      send({ eventType: target.origin === window.location.origin ? "internal_click" : "outbound_click",
        sessionId: getSessionId(), path: window.location.pathname,
        metadata: { destination: target.origin === window.location.origin ? target.pathname : target.href } });
    }
    document.addEventListener("click", trackClick, true);
    return () => document.removeEventListener("click", trackClick, true);
  }, []);

  return null;
}
