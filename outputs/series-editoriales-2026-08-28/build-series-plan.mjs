import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/laurent/carnet-dexperience/outputs/series-editoriales-2026-08-28";

const series = [
  [
    "1",
    "Former à l'IA sans former à l'outil",
    "7",
    "La série prioritaire : former au jugement, à la vérification et à la responsabilité, pas à une liste de commandes.",
    "Évite les actualités IA et les listes de prompts."
  ],
  [
    "2",
    "Le travail invisible du retail",
    "6",
    "Rendre visible ce qui fait la qualité d'une interaction client, au-delà de la transaction.",
    "Complète 'Vendre et servir en retail' avec des scènes plus incarnées."
  ],
  [
    "3",
    "Les scènes de management",
    "6",
    "Partir de situations brèves et concrètes pour montrer ce que le manager rend possible.",
    "Ne pas refaire une théorie des styles de management."
  ],
  [
    "4",
    "Ce que les outils ne décident pas",
    "5",
    "Montrer où s'arrête la recommandation d'un outil et où commence la responsabilité humaine.",
    "Garder l'IA comme un exemple parmi d'autres."
  ],
  [
    "5",
    "Faire apprendre dans le travail",
    "6",
    "Faire de l'apprentissage une pratique quotidienne, entre deux situations réelles.",
    "Se distinguer de 'Former des adultes' : ici, le terrain avant la salle."
  ],
  [
    "6",
    "Apprendre l'IA en la rendant claire",
    "6",
    "Mettre en avant les fiches de synthèse comme preuves d'un apprentissage qui trie, relie et rend transmissible.",
    "Publier des enseignements personnels, pas reproduire les supports de cours."
  ]
];

const articles = [
  ["Former à l'IA sans former à l'outil", "01", "Avant le premier prompt, il y a une question de travail", "Définir le problème, le destinataire et le niveau de preuve attendu.", "Une équipe demande à l'IA de 'faire un compte rendu' sans savoir ce qui doit servir à décider.", "Le problème n'est pas le prompt : c'est le travail non clarifié."],
  ["Former à l'IA sans former à l'outil", "02", "Une réponse convaincante n'est pas encore une réponse fiable", "Apprendre à repérer ce qu'il faut vérifier avant de réutiliser une production.", "Un participant reprend une synthèse IA qui invente une date, mais personne ne la contrôle.", "La fluidité ne remplace pas la preuve."],
  ["Former à l'IA sans former à l'outil", "03", "Ce que l'IA rend plus rapide, elle ne le rend pas forcément plus juste", "Distinguer gain de temps, gain de qualité et déplacement du travail.", "Une préparation d'atelier est produite très vite, puis demande une heure de correction silencieuse.", "Mesurer le travail complet, pas seulement la première sortie."],
  ["Former à l'IA sans former à l'outil", "04", "Pourquoi apprendre des prompts ne suffit pas", "Former à l'intention, au contexte et à l'itération plutôt qu'à des recettes figées.", "Deux personnes utilisent le même prompt, mais l'une obtient un résultat exploitable car elle sait le recadrer.", "La compétence est dans le dialogue critique, pas dans la formule magique."],
  ["Former à l'IA sans former à l'outil", "05", "Le bon moment pour ne pas utiliser l'IA", "Identifier les situations où l'outil affaiblit l'écoute, la confidentialité ou la responsabilité.", "Un entretien délicat est résumé automatiquement alors que la formulation et la relation exigent un regard humain.", "Savoir renoncer est une compétence professionnelle."],
  ["Former à l'IA sans former à l'outil", "06", "Former une équipe à vérifier sans la paralyser", "Créer un contrôle proportionné au risque, sans transformer chaque usage en procédure lourde.", "L'équipe hésite à utiliser l'outil car elle croit devoir tout contrôler comme un document juridique.", "Un bon cadre rend l'usage plus sûr et plus vivant."],
  ["Former à l'IA sans former à l'outil", "07", "Après l'outil, le jugement reste le métier", "Conclure sur la nouvelle valeur professionnelle : trier, choisir, assumer.", "Un client arrive déjà informé par une IA ; le spécialiste l'aide à choisir dans son contexte réel.", "La valeur se déplace de l'information vers le discernement."],

  ["Le travail invisible du retail", "01", "Le client ne voit pas la préparation d'une bonne interaction", "Montrer les micro-décisions qui rendent une rencontre fluide.", "Avant une démonstration, une spécialiste choisit ce qu'elle ne montrera pas pour ne pas noyer la personne.", "Servir, c'est souvent simplifier avant même de parler."],
  ["Le travail invisible du retail", "02", "Une démonstration n'est pas une visite guidée", "Passer de l'inventaire des fonctions à une expérience reliée à un besoin.", "Un client venu voir un produit repart avec une réponse à son usage, pas avec une liste de caractéristiques.", "Le bon niveau de détail dépend de la situation."],
  ["Le travail invisible du retail", "03", "Le passage de relais qui évite de faire recommencer le client", "Faire de la transmission entre spécialistes un acte de service.", "Une cliente explique déjà son problème une seconde fois car le premier échange n'a rien laissé de clair.", "La continuité est une promesse client."],
  ["Le travail invisible du retail", "04", "Quand le trafic monte, ce qu'il faut continuer à protéger", "Identifier les gestes relationnels non négociables sous pression.", "Un samedi chargé pousse l'équipe à aller vite ; un accueil clair évite pourtant plus de friction qu'il n'en crée.", "La vitesse sans repère coûte du temps plus tard."],
  ["Le travail invisible du retail", "05", "Lire une hésitation sans lui inventer une histoire", "Observer, questionner, puis laisser une marge de décision au client.", "Un client regarde plusieurs fois le même produit sans formuler son doute.", "L'écoute commence par une hypothèse modeste."],
  ["Le travail invisible du retail", "06", "Ce que le client retient quand il oublie les détails", "Comprendre pourquoi la sensation d'avoir été compris dure plus qu'un argumentaire.", "Après une interaction, le client se souvient d'une phrase simple qui a rendu son choix possible.", "La qualité du service se joue aussi dans la mémoire de la relation."],

  ["Les scènes de management", "01", "Le briefing qui ne crée aucune action", "Transformer une information descendante en décision praticable.", "L'équipe écoute les priorités du jour, mais personne ne sait ce qui change dans son premier échange client.", "Un briefing utile prépare une action, pas seulement une journée."],
  ["Les scènes de management", "02", "Recadrer sans réduire quelqu'un à son erreur", "Faire d'un écart un sujet de progression et non une étiquette.", "Un spécialiste fiable se trompe sous pression ; le manager doit traiter le fait sans briser la confiance.", "La précision protège davantage que la sévérité."],
  ["Les scènes de management", "03", "L'expert qui ne veut pas devenir manager", "Reconnaître qu'une évolution professionnelle n'est pas toujours hiérarchique.", "Une personne excellente sur le terrain refuse un poste qui l'éloignerait de son métier.", "Faire grandir ne signifie pas faire monter."],
  ["Les scènes de management", "04", "Dire ce qui ne sera pas fait", "Rendre un renoncement explicite quand les ressources ne suivent pas.", "L'été, le trafic reste soutenu alors que plusieurs spécialistes sont absents.", "Une priorité n'existe que si une autre chose peut attendre."],
  ["Les scènes de management", "05", "Quand donner de l'autonomie ne suffit pas", "Articuler marge de manoeuvre, cap commun et responsabilité.", "Chaque personne adapte son approche ; l'expérience client devient pourtant incohérente.", "L'autonomie a besoin d'un cadre lisible."],
  ["Les scènes de management", "06", "La conversation que le manager ne doit pas reporter", "Traiter un sujet dès qu'il est assez clair, avant qu'il devienne une histoire collective.", "Une tension légère entre deux personnes se transforme en évitement quotidien.", "Intervenir tôt n'est pas dramatiser."],

  ["Ce que les outils ne décident pas", "01", "Un tableau de bord ne choisit pas une priorité", "Faire la différence entre signal, interprétation et décision.", "Les chiffres indiquent un retard, mais ne disent pas quelle activité doit être déplacée.", "La donnée éclaire ; elle n'arbitre pas."],
  ["Ce que les outils ne décident pas", "02", "Une procédure ne remplace pas le jugement", "Savoir quand appliquer la règle et quand la situation demande une adaptation.", "Une exception client ne rentre dans aucune case prévue.", "Le cadre sert à penser, pas à cesser de penser."],
  ["Ce que les outils ne décident pas", "03", "Quand les chiffres disent vrai mais ne suffisent pas", "Relier les indicateurs à ce que vivent les personnes sur le terrain.", "Le temps d'attente baisse, mais les clients repartent avec moins de clarté.", "Une mesure juste peut raconter une histoire incomplète."],
  ["Ce que les outils ne décident pas", "04", "La recommandation n'assume pas les conséquences", "Rappeler qui porte réellement une décision quand un outil propose une option.", "Une IA suggère une réponse client plausible, mais le manager en assume l'impact relationnel.", "Déléguer une tâche n'est pas déléguer la responsabilité."],
  ["Ce que les outils ne décident pas", "05", "Le dernier geste reste humain", "Conclure sur la place du discernement dans un environnement outillé.", "Deux choix sont possibles ; aucun outil ne peut décider ce que l'équipe veut protéger.", "Le jugement est le point où une promesse devient un acte."],

  ["Faire apprendre dans le travail", "01", "Une erreur peut devenir un matériau d'équipe", "Installer une manière non humiliante de regarder ce qui n'a pas fonctionné.", "Après une interaction ratée, un spécialiste partage ce qu'il ferait différemment.", "L'erreur devient utile quand elle peut circuler."],
  ["Faire apprendre dans le travail", "02", "Apprendre entre deux interactions client", "Créer des formats courts qui respectent le rythme du terrain.", "Une astuce de démonstration est testée à deux, puis reprise le jour même.", "La répétition proche de l'action fixe mieux qu'une explication isolée."],
  ["Faire apprendre dans le travail", "03", "Pourquoi observer vaut parfois mieux qu'un module", "Faire de l'observation ciblée un support de progrès.", "Un nouveau spécialiste regarde une interaction avec une question précise en tête.", "Voir ce qu'il faut regarder transforme l'observation en apprentissage."],
  ["Faire apprendre dans le travail", "04", "Le collègue relais n'est pas un formateur miniature", "Donner aux relais un rôle réaliste : faire émerger, pas tout transmettre.", "Une personne ressource est sollicitée sans cesse et finit par ne plus avoir de temps pour son propre travail.", "Un relais efficace crée de l'autonomie autour de lui."],
  ["Faire apprendre dans le travail", "05", "Le retour qui aide à réessayer", "Faire un feedback qui ouvre une nouvelle tentative plutôt qu'un jugement final.", "Après une démonstration, le manager isole un geste à garder et un geste à tester autrement.", "Un bon retour donne une prise pour l'action suivante."],
  ["Faire apprendre dans le travail", "06", "Quand la formation quitte la salle", "Conclure sur les conditions qui font durer une compétence.", "Un atelier réussi disparaît en une semaine faute de reprise, de pair et de situation d'essai.", "La formation commence vraiment quand le travail la reprend."],

  ["Apprendre l'IA en la rendant claire", "01", "Après le cours, le vrai travail commence", "Montrer que faire une fiche oblige à trier, hiérarchiser et vérifier ce que l'on croyait avoir compris.", "Après une journée dense, le cours semble clair ; le lendemain, il faut réussir à l'expliquer en une page.", "Comprendre commence quand on peut reformuler."],
  ["Apprendre l'IA en la rendant claire", "02", "Faire un diagramme pour ne pas seulement retenir des mots", "Expliquer comment une représentation visuelle rend un flux et ses zones floues enfin discutables.", "Une notion technique devient plus claire quand ses étapes sont posées, reliées et confrontées aux questions qu'elles soulèvent.", "Un schéma n'est pas une décoration : c'est un outil de compréhension."],
  ["Apprendre l'IA en la rendant claire", "03", "Comprendre le machine learning sans réciter sa définition", "Passer du vocabulaire à la question pratique : ce que fait réellement un modèle et où se situe son incertitude.", "La fiche confronte la définition du cours à une question simple : que peut-on attendre d'un modèle dans une situation réelle ?", "Une notion est acquise quand elle aide à mieux poser une question."],
  ["Apprendre l'IA en la rendant claire", "04", "RAG et LLM : ce que la réponse ne montre pas toujours", "Rendre visible ce qui se joue derrière une réponse fluide : sources, contexte, sélection et vérification.", "Une réponse paraît très assurée ; la fiche oblige à demander d'où viennent les éléments et ce qui manque encore.", "La qualité d'une réponse dépend aussi de ce qu'elle permet de vérifier."],
  ["Apprendre l'IA en la rendant claire", "05", "Les architectures de deep learning : chercher une carte plutôt qu'un catalogue", "Raconter la recherche d'une structure lisible pour un sujet technique et dense.", "Devant une succession d'architectures, la fiche cherche les liens, les différences et les usages plutôt que l'exhaustivité.", "Une carte utile ne montre pas tout : elle aide à s'orienter."],
  ["Apprendre l'IA en la rendant claire", "06", "Ce que mes fiches disent de ma façon de former", "Faire le lien entre cette pratique d'étude et le métier de formateur : rendre un contenu complexe utilisable par quelqu'un d'autre.", "En relisant les fiches après plusieurs cours, un même geste apparaît : enlever le bruit pour dégager des points d'appui.", "Transmettre, c'est organiser la complexité sans la trahir."]
];

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Vue d'ensemble");
const plan = workbook.worksheets.add("Plans d'articles");

for (const sheet of [summary, plan]) sheet.showGridLines = false;

summary.getRange("A1:E1").merge();
summary.getRange("A1").values = [["Pistes de nouvelles séries éditoriales"]];
summary.getRange("A2:E2").merge();
summary.getRange("A2").values = [["Carnet d'expérience · proposition de développement après Les triangles d'arbitrage"]];
summary.getRange("A4:E4").values = [["Priorité", "Série", "Volume", "Promesse éditoriale", "Point de vigilance"]];
summary.getRange(`A5:E${4 + series.length}`).values = series;
summary.getRange("A12:E12").merge();
summary.getRange("A12").values = [["Total proposé : 36 articles. Commencer par la série IA, puis choisir la suivante à partir des situations dont tu te souviens le plus nettement."]];

plan.getRange("A1:F1").merge();
plan.getRange("A1").values = [["Développement article par article"]];
plan.getRange("A2:F2").merge();
plan.getRange("A2").values = [["Chaque ligne peut devenir un article de fond : scène, tension, éclairage, prise de recul et question finale."]];
plan.getRange("A4:F4").values = [["Série", "Ordre", "Titre de travail", "Ce que l'article développe", "Scène ou situation possible", "Idée à laisser au lecteur"]];
plan.getRange(`A5:F${4 + articles.length}`).values = articles;

const titleFormat = {
  fill: "#1E2A24",
  font: { bold: true, color: "#FFFFFF", size: 18, name: "Aptos Display" },
  horizontalAlignment: "left",
  verticalAlignment: "center"
};
const subtitleFormat = {
  fill: "#E7EEE8",
  font: { italic: true, color: "#425246", size: 10, name: "Aptos" },
  verticalAlignment: "center",
  wrapText: true
};
const headerFormat = {
  fill: "#70806F",
  font: { bold: true, color: "#FFFFFF", size: 10, name: "Aptos" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
  wrapText: true
};

summary.getRange("A1:E1").format = titleFormat;
summary.getRange("A1:E1").format.rowHeight = 30;
summary.getRange("A2:E2").format = subtitleFormat;
summary.getRange("A2:E2").format.rowHeight = 28;
summary.getRange("A4:E4").format = headerFormat;
summary.getRange("A4:E4").format.rowHeight = 28;
summary.getRange(`A5:E${4 + series.length}`).format = {
  verticalAlignment: "top",
  wrapText: true,
  font: { size: 10, name: "Aptos", color: "#263129" },
  borders: { insideHorizontal: { style: "thin", color: "#D9E1DA" }, bottom: { style: "thin", color: "#D9E1DA" } }
};
summary.getRange("A5:A10").format = { fill: "#F1F5F1", font: { bold: true, color: "#395142", size: 10, name: "Aptos" }, horizontalAlignment: "center", verticalAlignment: "top" };
summary.getRange("C5:C10").format = { fill: "#F8F3E9", font: { bold: true, color: "#745B2C", size: 10, name: "Aptos" }, horizontalAlignment: "center", verticalAlignment: "top" };
summary.getRange("A12:E12").format = { fill: "#F8F3E9", font: { italic: true, color: "#5B4B2A", size: 10, name: "Aptos" }, wrapText: true, verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#D9C99C" } };
summary.getRange("A12:E12").format.rowHeight = 34;
summary.getRange("A1:A12").format.columnWidth = 11;
summary.getRange("B1:B12").format.columnWidth = 33;
summary.getRange("C1:C12").format.columnWidth = 11;
summary.getRange("D1:D12").format.columnWidth = 56;
summary.getRange("E1:E12").format.columnWidth = 48;
summary.getRange("A5:E10").format.rowHeight = 46;
summary.freezePanes.freezeRows(4);

plan.getRange("A1:F1").format = titleFormat;
plan.getRange("A1:F1").format.rowHeight = 30;
plan.getRange("A2:F2").format = subtitleFormat;
plan.getRange("A2:F2").format.rowHeight = 28;
plan.getRange("A4:F4").format = headerFormat;
plan.getRange("A4:F4").format.rowHeight = 32;
plan.getRange(`A5:F${4 + articles.length}`).format = {
  verticalAlignment: "top",
  wrapText: true,
  font: { size: 10, name: "Aptos", color: "#263129" },
  borders: { insideHorizontal: { style: "thin", color: "#D9E1DA" }, bottom: { style: "thin", color: "#D9E1DA" } }
};
plan.getRange(`A5:A${4 + articles.length}`).format = { fill: "#F1F5F1", font: { bold: true, color: "#395142", size: 10, name: "Aptos" }, verticalAlignment: "top", wrapText: true };
plan.getRange(`B5:B${4 + articles.length}`).format = { fill: "#F8F3E9", font: { bold: true, color: "#745B2C", size: 10, name: "Aptos" }, horizontalAlignment: "center", verticalAlignment: "top" };
plan.getRange("A1:A34").format.columnWidth = 30;
plan.getRange("B1:B34").format.columnWidth = 9;
plan.getRange("C1:C34").format.columnWidth = 42;
plan.getRange("D1:D34").format.columnWidth = 48;
plan.getRange("E1:E34").format.columnWidth = 55;
plan.getRange("F1:F34").format.columnWidth = 42;
plan.getRange(`A5:F${4 + articles.length}`).format.rowHeight = 62;
plan.freezePanes.freezeRows(4);

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/nouvelles-series-editoriales.xlsx`);

const check = await workbook.inspect({ kind: "table", range: "Plans d'articles!A1:F12", include: "values,formulas", tableMaxRows: 12, tableMaxCols: 6 });
console.log(check.ndjson);
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 50 }, summary: "formula error scan" });
console.log(errors.ndjson);
const preview = await workbook.render({ sheetName: "Plans d'articles", range: "A1:F12", scale: 1.2, format: "png" });
await fs.writeFile(`${outputDir}/preview.png`, new Uint8Array(await preview.arrayBuffer()));
