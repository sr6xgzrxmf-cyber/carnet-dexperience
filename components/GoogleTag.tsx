"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { TRACKING_CHOICE_KEY } from "@/components/AnalyticsJourneyTracker";

const GOOGLE_TAG_ID = "GT-M6PMJVNZ";

export default function GoogleTag() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    function check() {
      setConsented(localStorage.getItem(TRACKING_CHOICE_KEY) === "accepted");
    }
    check();
    window.addEventListener("cde-tracking-consent", check);
    return () => window.removeEventListener("cde-tracking-consent", check);
  }, []);

  if (!consented) return null;

  return (
    <>
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
