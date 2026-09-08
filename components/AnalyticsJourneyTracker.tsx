"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const TRACKING_CHOICE_KEY = "cde_analytics_choice";
const SESSION_KEY = "cde_analytics_session";
const ORIGIN_KEY = "cde_analytics_origin";
const VISITOR_KEY = "cde_analytics_visitor";
const VISITOR_LIFETIME = 30 * 24 * 60 * 60 * 1000;

function hasConsent() { return localStorage.getItem(TRACKING_CHOICE_KEY) === "accepted"; }
function getSessionId() {
  let value = sessionStorage.getItem(SESSION_KEY);
  if (!value) { value = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, value); }
  return value;
}
function getVisitorId() {
  const now = Date.now();
  try {
    const stored = JSON.parse(localStorage.getItem(VISITOR_KEY) ?? "null") as { id?: string; expiresAt?: number } | null;
    if (stored?.id && stored.expiresAt && stored.expiresAt > now) {
      localStorage.setItem(VISITOR_KEY, JSON.stringify({ id: stored.id, expiresAt: now + VISITOR_LIFETIME }));
      return stored.id;
    }
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id, expiresAt: now + VISITOR_LIFETIME }));
    return id;
  } catch { return getSessionId(); }
}
function send(body: Record<string, unknown>) {
  if (!hasConsent()) return;
  void fetch("/api/analytics/collect", { method: "POST", headers: { "content-type": "application/json" }, keepalive: true, body: JSON.stringify(body) });
}
function clientContext() {
  const extendedNavigator = navigator as Navigator & { deviceMemory?: number };
  return { language: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}×${screen.height}`, viewport: `${window.innerWidth}×${window.innerHeight}`,
    colorDepth: screen.colorDepth, touch: navigator.maxTouchPoints > 0,
    deviceMemory: extendedNavigator.deviceMemory ?? null, doNotTrack: navigator.doNotTrack === "1" };
}
function identity() { return { sessionId: getSessionId(), visitorId: getVisitorId() }; }

export default function AnalyticsJourneyTracker() {
  const pathname = usePathname();
  const startTime = useRef(Date.now());
  const activeTime = useRef(0);
  const maxScroll = useRef(0);
  const sentForPath = useRef("");

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    function trackPage() {
      if (!hasConsent()) return;
      const params = new URLSearchParams(window.location.search);
      const origin = sessionStorage.getItem(ORIGIN_KEY) ?? document.referrer;
      if (!sessionStorage.getItem(ORIGIN_KEY)) sessionStorage.setItem(ORIGIN_KEY, origin);
      send({ eventType: "page_view", ...identity(), path: pathname, referrer: origin,
        utmSource: params.get("utm_source"), utmMedium: params.get("utm_medium"), utmCampaign: params.get("utm_campaign"),
        utmContent: params.get("utm_content"), utmTerm: params.get("utm_term"), clickId: params.get("gclid") ?? params.get("fbclid"),
        metadata: clientContext() });
    }
    trackPage();
    window.addEventListener("cde-tracking-consent", trackPage);
    return () => window.removeEventListener("cde-tracking-consent", trackPage);
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    startTime.current = Date.now(); activeTime.current = 0; maxScroll.current = 0; sentForPath.current = "";
    function updateScroll() {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      maxScroll.current = Math.max(maxScroll.current, available <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / available) * 100)));
    }
    function pauseTimer() { if (startTime.current) activeTime.current += Date.now() - startTime.current; startTime.current = 0; }
    function resumeTimer() { if (!startTime.current) startTime.current = Date.now(); }
    function sendEngagement() {
      if (!hasConsent() || sentForPath.current === pathname) return;
      pauseTimer(); sentForPath.current = pathname;
      send({ eventType: "engagement", ...identity(), path: pathname,
        metadata: { durationSeconds: Math.max(1, Math.round(activeTime.current / 1000)), maxScrollPercent: maxScroll.current, ...clientContext() } });
    }
    function onVisibility() { if (document.visibilityState === "hidden") sendEngagement(); else { sentForPath.current = ""; resumeTimer(); } }
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("pagehide", sendEngagement);
    document.addEventListener("visibilitychange", onVisibility);
    updateScroll();
    return () => { sendEngagement(); window.removeEventListener("scroll", updateScroll); window.removeEventListener("pagehide", sendEngagement); document.removeEventListener("visibilitychange", onVisibility); };
  }, [pathname]);

  useEffect(() => {
    function trackClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || window.location.pathname.startsWith("/admin") || !hasConsent()) return;
      const target = new URL(link.href, window.location.href);
      const isDownload = link.hasAttribute("download") || /\.(?:pdf|docx?|xlsx?|zip|mp3|mp4|jpe?g|png|webp)(?:$|\?)/i.test(target.href);
      send({ eventType: isDownload ? "download" : target.origin === window.location.origin ? "internal_click" : "outbound_click",
        ...identity(), path: window.location.pathname,
        metadata: { destination: target.origin === window.location.origin ? target.pathname : target.href, ...clientContext() } });
    }
    document.addEventListener("click", trackClick, true);
    return () => document.removeEventListener("click", trackClick, true);
  }, []);
  return null;
}
