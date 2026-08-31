import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/laurent/carnet-dexperience/outputs/triangles-arbitrage";
const outputPath = `${outputDir}/triangles-arbitrage.xlsx`;

const rows = [
  [
    "Prix · qualité · délai",
    "Un client veut une proposition sur mesure, excellente et livrée demain au prix standard. Il faut réduire le périmètre, mobiliser plus de ressources ou décaler la réponse.",
    "L’équipe doit corriger un problème immédiatement, sans dégrader le service ni ajouter d’heures. Le manager arbitre ce qui peut attendre.",
    "Concevoir une formation très qualitative pour la semaine suivante avec un budget limité : il faut choisir entre adaptation fine, temps de conception et ampleur du dispositif.",
    "Des clients qui veulent tout. Piste à préciser : quel élément devait être obtenu vite, avec quel niveau de qualité et quelle limite de disponibilité ?",
  ],
  [
    "Adoption : sens · simplicité · accompagnement",
    "Un commercial présente un nouvel outil CRM. Sans bénéfice concret ni aide au démarrage, les vendeurs reviennent vite à leurs fichiers personnels.",
    "Une nouvelle routine tient si l’équipe comprend le problème résolu, peut commencer simplement et reçoit de l’aide lors des premiers blocages.",
    "Une nouvelle méthode est comprise en salle, mais abandonnée sur le terrain sans accompagnement après la session.",
    "Un outil demandait au spécialiste de poser des questions avant l’interaction, puis de faire scanner un QR code au client pour mieux le connaître. La résistance venait surtout du sentiment de perdre du temps ou de s’exposer à des questions sur les données. Les clients acceptaient davantage lorsque l’équipe savait expliquer clairement l’usage et la protection de ces données.",
  ],
  [
    "Autonomie : comprendre · essayer · réutiliser",
    "Un conseiller apprend une démonstration produit, la teste avec un collègue puis l’adapte à un vrai client.",
    "Un manager explique une procédure, laisse l’équipe la mettre en pratique puis observe si elle sait la mobiliser sans lui.",
    "Un participant comprend un geste, le fait pendant l’atelier, puis le réutilise seul dans son contexte de travail.",
    "Pour produire un effet « waouh », l’équipe partait parfois sur des démonstrations trop complexes. Or, un geste quotidien comme déplacer le curseur en maintenant le doigt sur la barre d’espace pouvait déjà enlever un vrai stress au client. La scène rappelle que l’expertise du spécialiste n’est pas celle du client.",
  ],
  [
    "Positionnement : identité · preuves · lisibilité",
    "Un vendeur expert de tout devient difficile à choisir. Dire à qui il aide, avec quels résultats et comment le comprendre rend son offre mémorisable.",
    "Un manager transversal a beaucoup contribué mais personne ne sait précisément sur quoi le solliciter.",
    "Un formateur peut montrer son expérience, mais doit aussi rendre son approche identifiable et ses résultats vérifiables.",
    "Comment savoir si un animateur a réellement vendu après un atelier ? Entre le questionnaire de reconnaissance, les données de vente et les logs, la preuve existe peut-être. Mais reste la question du temps disponible, des priorités et de l’attente des autres rôles.",
  ],
  [
    "Formation : personnalisation · profondeur · passage à l’échelle",
    "Former un grand réseau de vendeurs avec un accompagnement individuel exige plus de temps, plus de formateurs ou une profondeur réduite.",
    "Un manager veut faire progresser chaque personne tout en assurant les résultats du collectif. Il doit organiser des temps différenciés, pas seulement les promettre.",
    "Une formation très adaptée à chaque participant ne se déploie pas à grande échelle sans architecture, relais ou modules communs.",
    "La contrainte n’était pas d’abord le budget, mais la présence en magasin. Réunir des personnes potentiellement face aux clients impose de choisir un créneau de faible affluence, de privilégier l’individuel ou de concevoir une part d’autonomie.",
  ],
  [
    "Management : autonomie · alignement · responsabilité",
    "Une équipe commerciale est libre de s’adapter aux clients, mais doit respecter une promesse et assumer ses décisions.",
    "Donner de l’autonomie sans cap crée de la dispersion ; imposer le cap sans marge de décision crée de la dépendance.",
    "Les participants gagnent en autonomie quand le cadre est clair et que chacun prend la responsabilité de ses essais.",
    "Le Daily Download pouvait devenir trop précis, voire hors sujet par rapport aux conversations réelles avec les clients. Le cadre interne restait présent, mais l’alignement avec l’usage terrain se perdait.",
  ],
  [
    "Projet : périmètre · ressources · calendrier",
    "Un client demande une offre plus complète sans budget ni délai supplémentaire : le périmètre doit être renégocié.",
    "Une équipe doit livrer plus vite avec le même effectif : le manager rend visible ce qui sera dépriorisé.",
    "Ajouter des cas pratiques, du suivi et des évaluations sans augmenter le temps de conception finit par dégrader le dispositif.",
    "Pendant les périodes estivales, l’effectif diminuait alors que le trafic restait élevé. Le périmètre de ce qui pouvait réellement être fait devait être renégocié avec les ressources présentes et le calendrier.",
  ],
  [
    "Vente : confiance · vitesse · personnalisation",
    "Conclure vite tout en personnalisant fortement suppose déjà une forte confiance. Sans elle, il faut prendre du temps pour comprendre le besoin.",
    "Une équipe sous pression peut aller vite, mais la confiance se dégrade si les décisions semblent arbitraires ou incohérentes selon les personnes.",
    "Adapter une formation en direct renforce l’attention, mais exige une relation de confiance et du temps d’animation.",
    "Des vendeurs à temps partiel pouvaient faire mieux que des experts à 35 heures, pourtant très expérimentés. La méthode avait changé, pas nécessairement eux. Une scène forte sur la remise à jour de ce qui crée la confiance et la personnalisation.",
  ],
  [
    "Innovation : nouveauté · fiabilité · simplicité",
    "Un nouveau produit impressionne, mais s’il est instable ou difficile à expliquer, il ne devient pas un usage.",
    "Lancer une nouvelle routine sans sécuriser les exceptions crée de la résistance.",
    "Un nouvel outil pédagogique peut être stimulant, mais doit rester assez fiable et simple pour ne pas voler l’attention au contenu.",
    "L’arrivée de l’Apple Vision Pro, avec des rendez-vous de trente minutes pour le faire découvrir : innovation forte, mais explication, disponibilité et simplicité du parcours à sécuriser.",
  ],
  [
    "Communication : précision · rapidité · adhésion",
    "Une réponse commerciale très rapide mais trop vague ne rassure pas ; une réponse parfaite qui arrive trop tard ne sert plus.",
    "Un manager doit communiquer vite en situation tendue, sans simplifier au point de perdre la confiance de l’équipe.",
    "Une consigne trop longue perd les participants ; trop courte, elle crée des erreurs. L’enjeu est d’être précis sans bloquer l’action.",
    "Des jeux de rôles beaucoup trop compliqués : la consigne était précise, mais trop lourde pour permettre une appropriation rapide et une vraie adhésion.",
  ],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Triangles");
sheet.showGridLines = false;

sheet.getRange("A1:E1").merge();
sheet.getRange("A1").values = [["Triangles d’arbitrage"]];
sheet.getRange("A2:E2").merge();
sheet.getRange("A2").values = [["Des situations concrètes pour identifier ce qui doit être arbitré plutôt que laissé implicite."]];
sheet.getRange("A3:E3").merge();
sheet.getRange("A3").values = [["Lecture : les exemples sont des situations de travail plausibles ; ils peuvent être adaptés à une expérience précise ou à un futur article."]];

sheet.getRange("A5:E5").values = [["Triangle", "Vente", "Management", "Formation", "Situation Apple Retail à confirmer"]];
sheet.getRange(`A6:E${rows.length + 5}`).values = rows;

sheet.getRange("A1:E1").format = {
  fill: "#173D38",
  font: { bold: true, color: "#FFFFFF", size: 18, name: "Georgia" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
sheet.getRange("A2:E2").format = {
  fill: "#E7F0EB",
  font: { color: "#173D38", size: 11, name: "Aptos" },
  verticalAlignment: "center",
  wrapText: true,
};
sheet.getRange("A3:E3").format = {
  fill: "#F7F4EE",
  font: { italic: true, color: "#5F665F", size: 10, name: "Aptos" },
  verticalAlignment: "center",
  wrapText: true,
};
sheet.getRange("A5:E5").format = {
  fill: "#2D665B",
  font: { bold: true, color: "#FFFFFF", size: 11, name: "Aptos" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "outside", style: "medium", color: "#173D38" },
};
sheet.getRange(`A6:E${rows.length + 5}`).format = {
  font: { color: "#222222", size: 10, name: "Aptos" },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#D8DDD9" },
};
sheet.getRange(`A6:A${rows.length + 5}`).format = {
  fill: "#F1F6F3",
  font: { bold: true, color: "#173D38", size: 10, name: "Aptos" },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#D8DDD9" },
};

sheet.getRange("A:A").format.columnWidth = 31;
sheet.getRange("B:D").format.columnWidth = 36;
sheet.getRange("E:E").format.columnWidth = 59;
sheet.getRange("1:1").format.rowHeight = 31;
sheet.getRange("2:2").format.rowHeight = 28;
sheet.getRange("3:3").format.rowHeight = 32;
sheet.getRange("5:5").format.rowHeight = 27;
sheet.getRange(`6:${rows.length + 5}`).format.rowHeight = 120;
sheet.freezePanes.freezeRows(5);

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const preview = await workbook.render({
  sheetName: "Triangles",
  range: "A1:E15",
  scale: 1.4,
  format: "png",
});
await fs.writeFile(`${outputDir}/triangles-arbitrage-preview.png`, new Uint8Array(await preview.arrayBuffer()));

const inspection = await workbook.inspect({
  kind: "table",
  range: "Triangles!A1:E15",
  include: "values,formulas",
  tableMaxRows: 15,
  tableMaxCols: 5,
});
console.log(inspection.ndjson);
