const THEME_RULES = [
  {
    name: "Management & leadership",
    tags: ["management", "management-de-proximite", "leadership", "influence"],
  },
  {
    name: "Formation & pédagogie",
    tags: [
      "formation",
      "apprentissage",
      "pedagogie",
      "andragogie",
      "developpement-des-competences",
    ],
  },
  {
    name: "Posture professionnelle",
    tags: [
      "posture-professionnelle",
      "posture professionnelle",
      "posture",
      "posture commerciale",
      "credibilite",
      "responsabilite",
      "ethique",
      "attention",
    ],
  },
  {
    name: "Organisation & transformation",
    tags: [
      "organisation",
      "transformation",
      "adaptation",
      "innovation",
      "engagement",
      "alignement",
      "ecosysteme",
    ],
  },
  {
    name: "Communication & relations",
    tags: [
      "communication",
      "relation",
      "relation-client",
      "experience-client",
      "feedback",
      "ecoute",
      "discours",
      "interpretation",
      "projection",
      "signaux-relationnels",
      "silence",
      "refus",
      "rebond",
    ],
  },
  {
    name: "Décision & pilotage",
    tags: [
      "prise-de-decision",
      "decision",
      "pilotage",
      "signaux-faibles",
      "incertitude",
    ],
  },
  {
    name: "Vente & partenariat",
    tags: [
      "retail",
      "vente",
      "conseil",
      "partenariat",
      "mecenat",
      "reseau",
    ],
  },
  {
    name: "Stratégie & terrain",
    tags: ["strategie", "gouvernance", "terrain", "traduction"],
  },
  {
    name: "Culture & numérique",
    tags: ["intelligence artificielle", "valeurs", "concert"],
  },
] as const;

export const ARTICLE_THEMES = THEME_RULES.map((theme) => theme.name);

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("fr-FR");
}

export function getArticleThemes(tags: unknown): string[] {
  const normalizedTags = new Set(
    (Array.isArray(tags) ? tags : [])
      .map((tag) => normalize(String(tag)))
      .filter(Boolean)
  );

  const themes = THEME_RULES.filter((theme) =>
    theme.tags.some((tag) => normalizedTags.has(tag))
  ).map((theme) => theme.name);

  return themes.length > 0 ? themes : ["Regards sur le travail"];
}

