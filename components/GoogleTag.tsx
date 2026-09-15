"use client";

import Script from "next/script";
import { useEffect } from "react";
import { TRACKING_CHOICE_KEY } from "@/components/AnalyticsJourneyTracker";

const GOOGLE_TAG_ID = "GT-M6PMJVNZ";

function updateConsent() {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  const granted = localStorage.getItem(TRACKING_CHOICE_KEY) === "accepted";
  w.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

export default function GoogleTag() {
  useEffect(() => {
    updateConsent();
    window.addEventListener("cde-tracking-consent", updateConsent);
    return () => window.removeEventListener("cde-tracking-consent", updateConsent);
  }, []);

  return (
    <>
      <Script id="google-consent-default" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_TAG_ID}');`}
      </Script>
    </>
  );
}
