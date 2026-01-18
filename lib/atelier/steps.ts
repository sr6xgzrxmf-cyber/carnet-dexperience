export const TOTAL_STEPS = 5;

export const STEPS: Array<{
  id: number;
  title: string;
  hint?: string;
  fields: Array<{
    name: string;
    label: string;
    placeholder?: string;
    kind?: "textarea" | "input";
  }>;
}> = [
  {
    id: 1,
    title: "Parcours & présent",
    hint: "5 lignes. Le but : sortir du vague.",
    fields: [
      {
        name: "parcours",
        label: "Ton parcours (résumé)",
        kind: "textarea",
        placeholder:
          "En quelques lignes : d’où tu viens, ce que tu fais, ce qui t’amène ici.",
      },
    ],
  },
  {
    id: 2,
    title: "Expériences préférées",
    hint: "Ce qui t’a vraiment plu (et pourquoi).",
    fields: [
      {
        name: "experiences",
        label: "Tes expériences préférées",
        kind: "textarea",
        placeholder: "Ce que tu as aimé faire, ce qui t’a porté.",
      },
    ],
  },
  {
    id: 3,
    title: "Forces & compétences",
    hint: "Nommer. Sans se raconter.",
    fields: [
      {
        name: "forces",
        label: "Forces reconnues par les autres",
        kind: "textarea",
        placeholder: "Ce qu’on te renvoie souvent.",
      },
      {
        name: "competences",
        label: "Compétences clés",
        kind: "textarea",
        placeholder: "Relationnel, vente, organisation, outils, etc.",
      },
    ],
  },
  {
    id: 4,
    title: "Ce que tu veux pour la suite",
    hint: "Environnement, missions, critères.",
    fields: [
      {
        name: "suite",
        label: "Ce que tu veux",
        kind: "textarea",
        placeholder: "Type de missions, cadre, rythme, contraintes, critères.",
      },
    ],
  },
  {
    id: 5,
    title: "Axes & plan (6 mois)",
    hint: "3 actions. Pas 20.",
    fields: [
      {
        name: "axes",
        label: "Axes de développement",
        kind: "textarea",
        placeholder: "Ce que tu veux renforcer / apprendre.",
      },
      {
        name: "plan",
        label: "Plan d’action (6 mois)",
        kind: "textarea",
        placeholder: "3 actions, avec une première étape concrète.",
      },
    ],
  },
];