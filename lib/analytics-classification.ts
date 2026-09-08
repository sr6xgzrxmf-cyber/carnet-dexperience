const AI_BOTS: Array<[RegExp, string]> = [
  [/OAI-SearchBot/i, "OpenAI Search"],
  [/ChatGPT-User/i, "ChatGPT (lecture demandée)"],
  [/GPTBot/i, "OpenAI GPTBot"],
  [/Claude-SearchBot/i, "Claude Search"],
  [/Claude-User/i, "Claude (lecture demandée)"],
  [/ClaudeBot|anthropic-ai/i, "Anthropic ClaudeBot"],
  [/Google-Extended/i, "Google Extended"],
  [/PerplexityBot|Perplexity-User/i, "Perplexity"],
  [/Applebot-Extended/i, "Applebot Extended"],
  [/Bytespider/i, "ByteDance Bytespider"],
  [/CCBot/i, "Common Crawl"],
  [/cohere-ai/i, "Cohere"],
  [/meta-externalagent/i, "Meta External Agent"],
];

export function identifyAiBot(userAgent: string | null) {
  if (!userAgent) return null;
  const match = AI_BOTS.find(([pattern]) => pattern.test(userAgent));
  return match?.[1] ?? null;
}

export function identifyAiReferral(referrer: string | null, utmSource: string | null) {
  const value = `${referrer ?? ""} ${utmSource ?? ""}`.toLowerCase();
  if (value.includes("chatgpt")) return "ChatGPT";
  if (value.includes("perplexity")) return "Perplexity";
  if (value.includes("claude.ai")) return "Claude";
  if (value.includes("copilot.microsoft")) return "Microsoft Copilot";
  if (value.includes("gemini.google")) return "Google Gemini";
  return null;
}

export function identifyTrafficSource(referrer: string | null, utmSource: string | null) {
  if (utmSource) return utmSource.slice(0, 255);
  if (!referrer) return "Accès direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "google.com" || host.endsWith(".google.com") || host.startsWith("google.")) return "Google";
    if (host === "bing.com" || host.endsWith(".bing.com")) return "Bing";
    if (host === "duckduckgo.com") return "DuckDuckGo";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "l.facebook.com") return "Facebook";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "LinkedIn";
    return host || "Accès direct";
  } catch {
    return "Autre site";
  }
}

export function describeUserAgent(userAgent: string | null) {
  const ua = userAgent ?? "";
  const browser = /Edg\//i.test(ua) ? "Edge"
    : /OPR\//i.test(ua) ? "Opera"
    : /CriOS\//i.test(ua) ? "Chrome iOS"
    : /FxiOS\//i.test(ua) ? "Firefox iOS"
    : /Chrome\//i.test(ua) ? "Chrome"
    : /Firefox\//i.test(ua) ? "Firefox"
    : /Safari\//i.test(ua) ? "Safari" : "Autre";
  const os = /iPhone|iPad|iPod/i.test(ua) ? "iOS/iPadOS"
    : /Android/i.test(ua) ? "Android"
    : /Windows NT/i.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/i.test(ua) ? "macOS"
    : /Linux/i.test(ua) ? "Linux" : "Autre";
  const device = /iPad|Tablet/i.test(ua) ? "Tablette"
    : /Mobile|iPhone|iPod|Android/i.test(ua) ? "Mobile" : "Ordinateur";
  return { browser, os, device };
}
