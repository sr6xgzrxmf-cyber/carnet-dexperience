import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const data = JSON.parse(await fs.readFile("/tmp/carnet_articles_map.json", "utf8"));
const outDir = "/Users/laurent/carnet-dexperience/outputs/01a05798-5711-7ac1-93aa-232f24b67032";
const today = "2026-08-31";

const candidateDefs = [
  ["Le jour où j’ai arrêté de chercher des mécènes", "Faire vivre un projet en construisant son écosystème", "Réalisation", "Projet et transversalité", "Transformer une recherche de financement en réseau de relais", "Structurer, coordonner, reformuler, relancer", "Salle pleine, relais presse, CSE, ambassadeurs et partenaires", "Très forte", "Préciser votre rôle, les indicateurs, les livrables et la part collective"],
  ["Le moment où j’ai compris que mon discours ne fonctionnait pas", "Quitter son argumentaire pour écouter les contraintes de l’autre", "Micro-récit", "Communication et partenariat", "Un discours préparé ne rencontre pas le besoin réel", "Écouter, diagnostiquer, reformuler, adapter", "Changement de conversation et découverte du véritable critère de décision", "Forte", "Confirmer le contexte réel et ce qui s’est passé après l’échange"],
  ["Quand un partenaire dit non… et que ça devient une opportunité", "Transformer un refus financier en relais concret", "Micro-récit", "Partenariat", "Un refus semble fermer la relation", "Lire les signaux, rebondir, proposer une autre forme de valeur", "Relais interne, contenus prêts à diffuser, circulation du projet", "Forte", "Identifier le partenaire, les supports produits et les effets mesurables"],
  ["Construire un partenariat sans devenir commercial", "Adapter le langage sans déformer le projet", "Micro-récit", "Partenariat et valeurs", "La recherche d’acceptabilité menace l’identité du projet", "Traduire, poser des limites, négocier, tenir une intention", "Projet resté reconnaissable et relation clarifiée", "Forte", "Préciser l’issue du rendez-vous et les décisions prises"],
  ["La vente que je n’ai pas voulu conclure", "Réduire une vente immédiate pour sécuriser l’adoption", "Étude de cas", "Commerce et transformation digitale", "Une commande d’équipement précède la réflexion sur l’usage", "Diagnostiquer, conseiller, accompagner le changement", "Déploiement progressif centré sur l’usage", "Forte mais recomposée", "Distinguer les faits réels des éléments recomposés et documenter le résultat"],
  ["Déménager, une équipe sans en être le manager", "Faire coopérer sans autorité hiérarchique", "Micro-récit", "Management informel", "Une équipe hétérogène doit atteindre un objectif commun", "Observer, répartir, ajuster, rassurer, coordonner", "Entraide spontanée, tensions contenues, objectif atteint", "Forte et personnelle", "Ajouter un ou deux moments précis et les choix que vous avez faits"],
  ["Apprendre à bâtir un média, pas un site", "Transformer un site en système éditorial durable", "Réalisation", "Digital et éditorial", "Un site fonctionnel ne produit pas encore une pensée structurée", "Concevoir, apprendre, structurer, éditorialiser", "Carnet d’expérience et son architecture de contenus", "Forte", "Inventorier les décisions techniques, éditoriales et les évolutions visibles"],
  ["Les choix que j’ai faits (et ceux que j’ai refusés)", "Protéger la cohérence d’un média par des renoncements explicites", "Réalisation", "Éditorial", "L’accumulation de fonctionnalités brouille l’intention", "Prioriser, arbitrer, poser un cadre, écrire", "Un média public, ouvert et centré sur l’utilité", "Forte", "Nommer les alternatives réellement étudiées et leurs conséquences"],
  ["De la fatigue à la méthode", "Transformer une fatigue récurrente en méthode de travail", "Méthode issue du terrain", "Organisation", "La répétition des mêmes efforts devient épuisante", "Observer, formaliser, standardiser, simplifier", "Une méthode réutilisable", "À confirmer", "Retrouver la situation d’origine, le support créé et le gain constaté"],
  ["Quand un parcours devient pilotable", "Passer d’un inventaire d’expériences à un système de décision", "Réalisation personnelle", "Positionnement professionnel", "Un parcours riche reste difficile à lire et à orienter", "Cartographier, hiérarchiser, relier, décider", "Un parcours structuré et des axes de développement", "À approfondir", "Identifier les documents, décisions et changements concrets produits"],
  ["Comment faire reconnaître un rôle transversal sans passer par l’organigramme", "Rendre visible une contribution transversale", "Problématique centrale", "Organisation et management", "Un rôle utile demeure invisible car ses effets sont diffus", "Clarifier, relier, documenter, délimiter", "Effets attendus : décisions plus lisibles et coordination plus fluide", "Conceptuelle", "Trouver 2 ou 3 situations professionnelles où vous avez tenu ce rôle"],
  ["Améliorer un process sans conflit : audit léger et check-list", "Traiter une erreur répétée comme un problème de système", "Méthode", "Organisation et opérations", "Les erreurs récurrentes détériorent la relation entre deux pôles", "Auditer, écouter l’aval, co-construire, tester", "Check-list partagée et baisse attendue des retours", "Cas pédagogique", "Identifier une situation vécue comparable et ses résultats réels"],
  ["Fiche outil : le prototype 30 jours", "Sortir d’un débat en organisant un test réversible", "Outil", "Décision et transformation", "Une idée reste bloquée dans les discussions", "Cadrer, expérimenter, mesurer, décider", "Fiche d’expérimentation réutilisable", "Outil existant", "Retrouver une utilisation réelle ou prévoir un premier terrain d’essai"],
  ["Quand l’équipe se transforme en brigade : création collaborative d’un site de formation interne", "Transformer les savoirs dispersés en mémoire de travail", "Projet possible", "Formation professionnelle", "Les savoirs utiles restent informels et dépendants des personnes", "Cadrer, éditer, coordonner, transmettre", "Site ou université interne co-construite", "Conceptuelle", "Confirmer si ce dispositif correspond à une réalisation vécue"],
  ["Une formation réussie commence quand le formateur devient inutile", "Concevoir la transmission pour rendre autonome", "Principe de réalisation", "Formation professionnelle", "La formation entretient parfois une dépendance au formateur", "Concevoir, accompagner, évaluer, rendre autonome", "Autonomie observable après la formation", "À confirmer", "Choisir une formation réelle et documenter le transfert vers le terrain"],
];

const wb = Workbook.create();
const overview = wb.worksheets.add("Vue d'ensemble");
const candidates = wb.worksheets.add("Tuiles candidates");
const inventory = wb.worksheets.add("Inventaire articles");
const guide = wb.worksheets.add("Guide de lecture");

const navy = "#252854", teal = "#11BFA5", paper = "#F7F7F3", ink = "#20222A", pale = "#E9F7F3", amber = "#F4E6C7", rose = "#F2DEDE", gray = "#6B6E78";
for (const s of [overview,candidates,inventory,guide]) s.showGridLines = false;

// Inventory first so summary formulas have a source.
const invHeaders = ["Date", "Statut", "Titre", "Série", "Tags", "Niveau de preuve", "Score", "Compétences suggérées", "Problématiques", "Environnements", "Types de réalisation", "Extrait", "URL"];
const invRows = data.articles.map(a => [new Date(`${a.date}T00:00:00`), a.date > today ? "Programmé" : "Publié", a.title, a.series, a.tags, a.evidence, a.candidateScore, a.competences, a.problematiques, a.environnements, a.realisations, a.excerpt, a.url]);
inventory.getRangeByIndexes(0,0,1,invHeaders.length).values=[invHeaders];
inventory.getRangeByIndexes(1,0,invRows.length,invHeaders.length).values=invRows;
const invTable=inventory.tables.add(`A1:M${invRows.length+1}`,true,"InventaireArticles"); invTable.style="TableStyleMedium2"; invTable.showFilterButton=true;
inventory.freezePanes.freezeRows(1); inventory.freezePanes.freezeColumns(3);
inventory.getRange(`A2:A${invRows.length+1}`).format.numberFormat="yyyy-mm-dd";
inventory.getRange(`A1:M${invRows.length+1}`).format.font={name:"Aptos",size:10,color:ink};
inventory.getRange("A1:M1").format={fill:navy,font:{bold:true,color:"#FFFFFF",size:10},rowHeight:30,verticalAlignment:"center"};
const invWidths=[12,12,43,25,28,34,8,45,45,32,34,54,48]; invWidths.forEach((w,i)=>inventory.getRangeByIndexes(0,i,invRows.length+1,1).format.columnWidth=w);
inventory.getRange(`C2:M${invRows.length+1}`).format.wrapText=true; inventory.getRange(`A2:M${invRows.length+1}`).format.rowHeight=46;
inventory.getRange(`G2:G${invRows.length+1}`).conditionalFormats.add("colorScale",{colors:[rose,amber,pale],thresholds:["min","50%","max"]});

// Candidates.
const candHeaders=["Priorité","Titre source","Titre proposé pour la tuile","Type","Environnement","Problématique","Compétences à démontrer","Résultat ou preuve déjà évoqué","Maturité","À confirmer pendant l’interview","Décision"];
const candRows=candidateDefs.map((r,i)=>[i+1,...r,"À étudier"]);
candidates.getRangeByIndexes(0,0,1,candHeaders.length).values=[candHeaders]; candidates.getRangeByIndexes(1,0,candRows.length,candHeaders.length).values=candRows;
const candTable=candidates.tables.add(`A1:K${candRows.length+1}`,true,"TuilesCandidates"); candTable.style="TableStyleMedium2"; candTable.showFilterButton=true;
candidates.freezePanes.freezeRows(1); candidates.freezePanes.freezeColumns(3);
candidates.getRange("A1:K1").format={fill:navy,font:{bold:true,color:"#FFFFFF",size:10},rowHeight:34,wrapText:true,verticalAlignment:"center"};
const candWidths=[9,39,39,21,28,42,42,44,20,52,15]; candWidths.forEach((w,i)=>candidates.getRangeByIndexes(0,i,candRows.length+1,1).format.columnWidth=w);
candidates.getRange(`A2:K${candRows.length+1}`).format={font:{name:"Aptos",size:10,color:ink},wrapText:true,rowHeight:72,verticalAlignment:"top"};
candidates.getRange(`I2:I${candRows.length+1}`).conditionalFormats.add("containsText",{text:"Forte",format:{fill:pale,font:{color:"#176B5B",bold:true}}});
candidates.getRange(`I2:I${candRows.length+1}`).conditionalFormats.add("containsText",{text:"Conceptuelle",format:{fill:amber,font:{color:"#735A21"}}});
candidates.getRange(`I2:I${candRows.length+1}`).conditionalFormats.add("containsText",{text:"pédagogique",format:{fill:rose,font:{color:"#792D2D"}}});
candidates.getRange(`K2:K${candRows.length+1}`).dataValidation={rule:{type:"list",values:["À étudier","À retenir","À écarter","À fusionner"]}};

// Overview.
overview.mergeCells("A1:H2"); overview.getRange("A1").values=[["Cartographie éditoriale du portfolio"]]; overview.getRange("A1:H2").format={fill:navy,font:{name:"Georgia",size:24,bold:true,color:"#FFFFFF"},verticalAlignment:"center"};
overview.mergeCells("A3:H3"); overview.getRange("A3").values=[["167 articles relus comme sources possibles de micro-récits, méthodes, preuves et prolongements éditoriaux"]]; overview.getRange("A3:H3").format={fill:navy,font:{size:11,color:"#D9DBF2"},verticalAlignment:"center"};
overview.getRange("A5:B8").values=[["INDICATEUR","VALEUR"],["Articles cartographiés",null],["Tuiles prioritaires proposées",null],["Articles publiés au 31 août 2026",null]];
overview.getRange("B6").formulas=[[`=COUNTA('Inventaire articles'!$C$2:$C$168)`]]; overview.getRange("B7").formulas=[[`=COUNTA('Tuiles candidates'!$B$2:$B$16)`]]; overview.getRange("B8").formulas=[[`=COUNTIF('Inventaire articles'!$B$2:$B$168,"Publié")`]];
overview.getRange("A5:B5").format={fill:teal,font:{bold:true,color:"#FFFFFF"}}; overview.getRange("A6:B8").format={fill:"#FFFFFF",font:{color:ink,size:11},borders:{insideHorizontal:{style:"thin",color:"#DADBE1"}}}; overview.getRange("B6:B8").format.font={bold:true,size:18,color:navy};
const axisSections=[["Compétences dominantes",data.summaries.competences.slice(0,7),"D5"],["Problématiques dominantes",data.summaries.problematiques.slice(0,7),"G5"],["Environnements dominants",data.summaries.environnements.slice(0,7),"A11"],["Types de réalisation",data.summaries.realisations.slice(0,7),"D11"]];
for(const [title,rows,anchor] of axisSections){const cell=overview.getRange(anchor); const r=Number(anchor.match(/\d+/)[0]), c=anchor.charCodeAt(0)-65; overview.getRangeByIndexes(r-1,c,1,2).values=[[title,"Articles"]]; overview.getRangeByIndexes(r-1,c,1,2).format={fill:navy,font:{bold:true,color:"#FFFFFF"}}; overview.getRangeByIndexes(r,c,rows.length,2).values=rows.map(x=>[x.label,x.count]); overview.getRangeByIndexes(r,c,rows.length,2).format={fill:"#FFFFFF",font:{size:10,color:ink},borders:{insideHorizontal:{style:"thin",color:"#E1E2E6"}}};}
overview.mergeCells("G14:H14"); overview.getRange("G14").values=[["Lecture essentielle"]]; overview.getRange("G14:H14").format={fill:teal,font:{bold:true,color:"#FFFFFF"}};
overview.mergeCells("G15:H20"); overview.getRange("G15").values=[["Le fil rouge le plus net est la capacité à apporter de la clarté : rendre un problème lisible, structurer une décision, transmettre un savoir ou faire circuler un projet. Les articles sont riches en réflexion et en méthodes. Pour devenir des preuves professionnelles, beaucoup devront être reliés à une situation vécue, une intervention précise et un résultat observable."]]; overview.getRange("G15:H20").format={fill:pale,font:{size:11,color:ink},wrapText:true,verticalAlignment:"top"};
for(let c=0;c<8;c++) overview.getRangeByIndexes(0,c,20,1).format.columnWidth=[28,14,4,34,12,4,35,22][c];

// Guide.
guide.mergeCells("A1:D2"); guide.getRange("A1").values=[["Comment lire cette cartographie"]]; guide.getRange("A1:D2").format={fill:navy,font:{name:"Georgia",size:22,bold:true,color:"#FFFFFF"},verticalAlignment:"center"};
const guideRows=[
  ["Niveau de preuve","Ce que cela signifie","Usage conseillé","Étape suivante"],
  ["Expérience exploitable","Le texte contient déjà une situation, une action et un effet.","Base directe d’une tuile.","Vérifier les faits et ajouter les preuves."],
  ["Récit personnel à approfondir","Une expérience personnelle est perceptible mais le résultat reste incomplet.","Très bonne piste de micro-récit.","Interview ciblée sur le rôle et les effets."],
  ["Méthode ou outil, contexte à confirmer","Un cadre de travail existe sans terrain d’application suffisamment documenté.","Tuile outil ou méthode.","Trouver un cas d’usage réel."],
  ["Réflexion, expérience à rechercher","L’article démontre une pensée, pas encore une réalisation.","Article lié ou point de départ.","Chercher une situation professionnelle correspondante."],
  ["Cas pédagogique, pas une preuve personnelle","Le cas met en scène Karim ou une situation construite.","Illustration, jamais preuve directe.","Ne pas l’attribuer à Laurent sans confirmation."],
];
guide.getRange("A4:D9").values=guideRows; guide.getRange("A4:D4").format={fill:teal,font:{bold:true,color:"#FFFFFF"},rowHeight:30}; guide.getRange("A5:D9").format={fill:"#FFFFFF",font:{size:11,color:ink},wrapText:true,rowHeight:64,verticalAlignment:"top",borders:{insideHorizontal:{style:"thin",color:"#DADBE1"}}};
guide.mergeCells("A11:D11"); guide.getRange("A11").values=[["Principe de prudence"]]; guide.getRange("A11:D11").format={fill:amber,font:{bold:true,color:ink}};
guide.mergeCells("A12:D14"); guide.getRange("A12").values=[["La présence d’une compétence dans un article signifie que le texte l’aborde ou la met en scène. Elle ne prouve pas automatiquement que Laurent l’a exercée dans une situation professionnelle. La phase d’interview servira précisément à transformer ces hypothèses en récits vérifiables : contexte → problème → intervention → résultat → compétences → preuves."]]; guide.getRange("A12:D14").format={fill:"#FFF9EC",font:{size:11,color:ink},wrapText:true,verticalAlignment:"top"};
[25,48,35,44].forEach((w,i)=>guide.getRangeByIndexes(0,i,14,1).format.columnWidth=w);

await fs.mkdir(outDir,{recursive:true});
const output=await SpreadsheetFile.exportXlsx(wb); await output.save(`${outDir}/cartographie-portfolio-carnet-experience.xlsx`);
for (const [sheetName,range,file] of [["Vue d'ensemble","A1:H20","preview-overview.png"],["Tuiles candidates","A1:K8","preview-candidates.png"],["Inventaire articles","A1:M8","preview-inventory.png"],["Guide de lecture","A1:D14","preview-guide.png"]]) {
  const blob=await wb.render({sheetName,range,scale:1.15,format:"png"}); await fs.writeFile(`${outDir}/${file}`,new Uint8Array(await blob.arrayBuffer()));
}
console.log((await wb.inspect({kind:"table",range:"Vue d'ensemble!A1:H20",include:"values,formulas",tableMaxRows:22,tableMaxCols:10})).ndjson);
console.log((await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"final formula error scan"})).ndjson);
