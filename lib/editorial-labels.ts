const TAG_LABELS: Record<string, string> = {
  andragogie: "andragogie",
  apprentissage: "apprentissage",
  communication: "communication",
  cv: "CV",
  experience: "expérience",
  "experience-client": "expérience client",
  formation: "formation",
  leadership: "leadership",
  management: "management",
  organisation: "organisation",
  pedagogie: "pédagogie",
  "posture-professionnelle": "posture professionnelle",
  "prise-de-decision": "prise de décision",
  responsabilite: "responsabilité",
  "situations-reelles": "situations réelles",
  transmission: "transmission",
  vente: "vente",
};

export function formatTagLabel(tag: string): string {
  const normalized = tag.trim();
  if (!normalized) return "";

  return TAG_LABELS[normalized] ?? normalized.replace(/-/g, " ");
}
