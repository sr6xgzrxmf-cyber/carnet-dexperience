---
title: "Journal de formation, mois 3 : changer de registre sans repartir de zéro"
date: "2026-10-06"
excerpt: "Ce mois-ci, j'ai terminé le bloc Data et RGPD avant de passer à Python. Le sujet a changé d'un coup. Ma façon d'apprendre aussi, mais pas comme je l'aurais cru."
cover: "/images/articles/15-journal-de-formation-mois-3.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "journal"
  - "Python"
  - "RGPD"
  - "apprentissage"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 15
---
Troisième point mensuel. Même format : ce qui s'est débloqué, ce qui
résiste, ce que je change.

Mais le mois, lui, n'a pas gardé le même format. J'ai terminé le bloc
consacré aux données et à leur encadrement — loi REEN, cartographie des
traitements, registre RGPD, veille législative, Privacy by Design — puis
j'ai ouvert un environnement Python.

Le changement a été plus brutal que ne le laisse penser le programme.
Un jour, je suivais un flux de données pour savoir qui le collecte, sur
quelle base légale, pendant combien de temps et avec quelles mesures de
sécurité. Le suivant, on m'expliquait ce qu'est une variable.

On pourrait croire que j'ai changé de sujet. J'ai surtout changé de
place. Dans le premier bloc, j'observais le système depuis le projet et
ses obligations. Dans le second, je suis descendu jusqu'à l'instruction
qui le fait fonctionner.

## Le moment le plus dur

Python, je ne le découvrais pas. Je l'avais pratiqué sur le tas, bien
avant cette formation, en cherchant et en modifiant jusqu'à ce que ça
tourne.

Les premiers modules m'ont donc paru trop simples. Et c'est précisément
là qu'était la difficulté : résister au « je sais déjà », au moment
exact où le cours commençait à me servir. Car les définitions sont
arrivées, et avec elles une gêne que je n'attendais pas. Des gestes que
je faisais correctement depuis longtemps, je n'aurais pas su les
expliquer à quelqu'un avec les bons mots.

Le plus dur n'a pas été d'apprendre. Ça a été d'accepter de réapprendre
ce que je croyais savoir. J'y reviens en détail dans le prochain
épisode.

## Ce qui s'est débloqué

**Le RGPD a cessé d'être un dossier posé à côté du projet.** Les fiches
18 à 22 ont fini par former une chaîne continue. La cartographie décrit
le trajet de la donnée. Le registre explique pourquoi elle circule, qui
la reçoit et combien de temps elle reste. La veille rappelle que ce
cadre bouge. Le Privacy by Design impose enfin de traduire ces exigences
dans l'architecture, avant le déploiement et non après.

Pris séparément, chacun de ces éléments peut ressembler à une obligation
documentaire. Mis bout à bout, ils racontent autre chose : une décision
sur la donnée doit pouvoir être suivie depuis la finalité déclarée
jusqu'au stockage, au modèle, à l'export et à la suppression.

C'est le prolongement direct de ce qui s'était débloqué le mois dernier
sur la provenance. Savoir d'où vient une donnée ne suffit pas. Il faut
aussi savoir pourquoi on l'a, ce qu'on en fait, qui peut la voir et
comment elle disparaît.

**Python m'a montré la différence entre comprendre une règle et la faire
tenir dans un mécanisme.** La minimisation est un principe. Refuser une
colonne inutile avant de charger un fichier est un geste. La durée de
conservation est une règle. Écrire un traitement qui distingue les
données actives de celles à supprimer est un mécanisme. Le contrôle
d'accès est une exigence. Gérer ce qu'une fonction accepte, renvoie ou
refuse en est une traduction possible.

Je n'ai pas construit ce système ce mois-ci. J'ai appris les briques les
plus élémentaires : variables, types, conditions, boucles, fonctions,
classes, modules, bibliothèques. Mais pour la première fois, je voyais
où les obligations étudiées la semaine précédente finiraient par se
loger.

**Le code est devenu lisible, et pas seulement utilisable.** C'est une
différence importante. Je savais déjà écrire du code qui fonctionne. Je
commence à pouvoir le lire comme quelqu'un d'autre le lirait : repérer
ses paramètres, distinguer `return` de `print()`, suivre une condition
et comprendre pourquoi une liste de valeurs doit avoir la même longueur
que le DataFrame auquel on l'ajoute.

Pendant des années, du code Python était pour moi un bloc qu'il fallait
faire fonctionner. Il commence à devenir une suite de décisions que je
peux interroger — et justifier.

## Le moment le plus satisfaisant

Le moment le plus satisfaisant a été le plus simple à regarder : un
DataFrame affiché correctement après plusieurs semaines passées à
parler de données de manière abstraite.

Un petit tableau de clients. Quelques colonnes. Filtrer les achats
supérieurs à 200, calculer un âge moyen, créer une nouvelle colonne en
appliquant une hausse de 20 %, puis enregistrer le résultat en CSV ou en
JSON.

Rien de spectaculaire. Justement.

Pour la première fois du mois, les mots lus dans les fiches précédentes
étaient devenus des objets manipulables. Une catégorie avait un type. Un
filtre retirait réellement des lignes. Une transformation créait une
colonne. Un format de sortie changeait la manière dont les données
pourraient être reprises ailleurs.

Le résultat tenait en quelques lignes de code, mais il reliait une grande
partie du parcours : structure des données, règles de transformation,
formats de fichiers, réutilisation et contrôle du résultat.

La satisfaction n'est pas venue d'avoir écrit beaucoup. Elle est venue
du fait que je pouvais modifier une valeur, relancer la cellule et voir
immédiatement la conséquence. Après des textes réglementaires où une
erreur peut rester invisible jusqu'à un audit ou un incident, cette
boucle courte — écrire, exécuter, observer, corriger — a quelque chose
de très concret.

## Ce qui résiste

**Je sais suivre un exemple, pas encore partir d'une page blanche.** Les
exercices proposent les données, le résultat attendu et souvent la
méthode. Dans ce cadre, je peux comprendre et adapter. Devant un besoin
non découpé, je ne sais pas encore spontanément quelles fonctions créer,
où placer une condition ou quand une classe est réellement utile.

**L'environnement reste une partie du problème.** Interpréteur, kernel,
environnement virtuel, terminal, notebook, fichier `.py` : chacun a un
rôle clair sur la fiche. Dans la pratique, une erreur peut venir du code,
du fichier introuvable, de la bibliothèque absente ou du mauvais
environnement sélectionné. Je commence à distinguer ces causes, pas
encore à les diagnostiquer sans tâtonner.

**L'aide d'un LLM accélère et brouille l'apprentissage.** Il peut expliquer
une erreur, commenter une fonction ou proposer une correction en
quelques secondes. Il peut aussi produire une solution que je serais
incapable de reconstruire. Le critère utile n'est donc pas « est-ce que
le code fonctionne ? », mais « est-ce que je peux expliquer chaque
ligne et la modifier sans redemander la solution entière ? ».

**Le déploiement et le chiffrage n'ont toujours pas bougé.** Ils figuraient
déjà dans les journaux précédents. Le mois dernier, je m'étais fixé de
trouver quelqu'un pour relire un chiffrage. Je ne l'ai pas fait. Le
basculement vers Python a absorbé l'attention, et ce qui n'avait pas de
date a glissé. Le passage à Python ne résout rien de ce côté. Il me
rapproche de la fabrication d'un prototype, pas encore de son
fonctionnement durable, de sa supervision ou de son coût réel.

## Ce qui a changé dans ma façon d'apprendre

Je ne cherche plus à conserver le même niveau de confort d'un module au
suivant.

Quand le registre change, je commence par identifier les gestes les plus
petits du nouveau métier. Pour Python : exécuter une cellule, lire un
message d'erreur, vérifier un type, afficher une variable, modifier une
condition. Ce sont des gestes modestes, mais ils réduisent la distance
entre « je reconnais le code » et « je peux agir dessus ».

Je relie aussi chaque notion technique à une décision déjà rencontrée.
Une variable n'est pas seulement une boîte ; c'est une valeur dont il
faut connaître le type et l'usage. Une fonction n'est pas seulement un
bloc réutilisable ; c'est une frontière qui reçoit quelque chose et
promet un résultat. Un DataFrame n'est pas seulement un tableau ; c'est
un ensemble de données sur lequel chaque filtre et chaque colonne ajoutée
doivent pouvoir être justifiés.

Enfin, je garde la méthode des mois précédents : chercher les points de
friction plutôt que les masquer. Une erreur de type, une colonne trop
courte ou un fichier introuvable donnent une information précise. À
condition de ne pas demander immédiatement à un outil de faire disparaître
le message à ma place.

## Ce que je change pour le mois prochain

- **Reprendre un exercice depuis une page blanche.** Pas recopier le
  corrigé : reformuler le besoin, découper les étapes, puis comparer
  seulement à la fin.
- **Tenir un journal d'erreurs.** Pour chaque blocage : le message exact,
  la cause, le test qui l'a confirmée et la correction. L'objectif est de
  reconnaître des familles de pannes, pas de collectionner des solutions.
- **Utiliser le LLM en second.** D'abord expliquer moi-même ce que fait le
  code et formuler une hypothèse ; ensuite demander une contradiction ou
  une autre piste.
- **Faire le lien avec le RGPD sur un petit jeu de données.** Documenter
  les colonnes, leur finalité, leur durée de conservation et les
  transformations appliquées, puis seulement les manipuler avec Pandas.
- **Ne pas perdre les sujets qui résistent.** Le déploiement et le
  chiffrage restent dans la liste. Cette fois avec une échéance : avoir
  identifié avant la fin du mois la personne qui relira un chiffrage.
  Apprendre Python ne doit pas devenir une façon plus technique de les
  repousser.

## Ce que je remarque en relisant

Je pensais que ce mois serait coupé en deux : d'abord la conformité,
ensuite le code. Il forme plutôt une charnière.

Le premier bloc m'a appris à demander ce qu'une organisation a le droit
de faire avec une donnée. Le second commence à m'apprendre ce qu'un
programme lui fait réellement. Entre les deux se trouve précisément le
métier que je vise : être capable de tenir ensemble la finalité, la
règle, le flux et l'implémentation, sans faire semblant d'être expert de
chacun.

Changer de registre en cours de route ne m'a donc pas obligé à repartir
de zéro. Il m'a obligé à reconnaître ce qui était transférable — la
lecture des processus, les questions de responsabilité, le goût des
traces — et ce que je pratiquais déjà sans jamais l'avoir vraiment
appris.

C'est probablement la leçon la plus professionnelle du mois.

## Rattachement au référentiel

Ce mois reste rattaché au **bloc 2 du titre RNCP40875**. Les fiches 18 à
22 couvrent l'encadrement environnemental et réglementaire des projets
numériques et IA : cartographie des traitements, registre, veille,
Privacy by Design et protection des données. Les fiches 23 à 39 ouvrent
la mise en œuvre technique avec Python : environnement de développement,
syntaxe, fonctions, classes, bibliothèques, DataFrames et lecture-écriture
de fichiers CSV et JSON.

La continuité entre les deux tient dans une exigence simple : une
solution IA ne se pilote pas seulement par ce qu'elle promet, mais par
ce que son code fait effectivement aux données.

------------------------------------------------------------------------

*Prochain épisode : j'avais appris Python à l'envers.*
