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
