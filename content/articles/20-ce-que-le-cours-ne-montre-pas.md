---
title: "Ce que le cours ne montre pas"
date: "2026-11-10"
excerpt: "Le cours me donne un cadre et des mots. Ses exercices restent pourtant très loin de la complexité réelle. Ce n'est pas une accusation : c'est la limite normale d'une formation."
cover: "/images/articles/20-ce-que-le-cours-ne-montre-pas.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "formation"
  - "limites"
  - "Pandas"
  - "LLM"
  - "lucidité"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 20
---
Alice, Bob et Charlie ont un âge, une ville et parfois un montant
d'achat.

Ils apparaissent dans plusieurs exercices Python. On les range dans un
dictionnaire, on transforme ce dictionnaire en DataFrame, on filtre les
lignes, on calcule une moyenne, on ajoute une colonne, puis on enregistre
le résultat en CSV ou en JSON.

Les données sont propres. Les listes ont la même longueur. Les noms de
colonnes ne changent pas. Le fichier se trouve là où le cours dit qu'il
se trouve. Aucun âge ne manque. Aucun montant n'est écrit avec une
virgule dans une ligne et un point dans la suivante.

L'exercice fait exactement ce qu'il doit faire : il isole une opération
pour qu'elle devienne visible.

Il montre aussi, involontairement, tout ce que le cours ne peut pas
montrer.

## Un exercice trop simple

J'avais déjà rencontré des problèmes plus encombrants que le tableau
d'Alice, Bob et Charlie.

Pas forcément plus savants. Plus réels.

Un fichier qui n'a pas le format attendu. Une image qu'il faut
transformer sans perdre ce qui compte. Un outil qui fonctionne dans un
environnement et pas dans un autre. Une solution proposée par un LLM qui
semble plausible, puis casse au moment où elle rencontre le système
réel.

Face à ces situations, l'exercice de cinq lignes peut donner une
impression étrange. Je sais déjà que `df.head()` affiche le début d'un
tableau. Ce que j'aimerais comprendre, c'est ce qu'il faut faire quand
le tableau ne ressemble plus à celui du support.

La tentation serait de conclure que le cours reste en surface et qu'il
n'apporte pas assez.

Ce serait vrai et injuste à la fois.

## Ce que le cours apporte réellement

Les fiches 29 et 30 donnent un cadre pour utiliser les LLM en
programmation : générer, expliquer, corriger, documenter, mais aussi
vérifier les erreurs, la sécurité et les limites. La fiche 36 distingue
module, package et bibliothèque, puis introduit NumPy et Pandas. Les
fiches 37 à 39 montrent le DataFrame, le filtrage, l'agrégation et les
formats CSV et JSON.

Pris séparément, rien de tout cela ne construit une application robuste.
Ensemble, ces notions forment une carte.

Je sais maintenant nommer les briques, lire le chemin d'une donnée et
identifier l'endroit où une transformation se produit. Je peux
distinguer une structure tabulaire d'une structure hiérarchique. Je peux
demander à un LLM d'expliquer une ligne plutôt que de lui déléguer tout
le programme. Je peux reconnaître qu'une erreur vient peut-être du type
de donnée, de la longueur d'une colonne ou de l'environnement.

Le cours ne me donne pas la puissance. Il me donne des points d'appui.

## Ce que le cours ne peut pas apporter

Il ne peut pas accumuler l'expérience à ma place.

Un support peut expliquer que la liste ajoutée à un DataFrame doit avoir
la même longueur que le nombre de lignes. Il ne peut pas me faire
rencontrer toutes les formes que prendront les données manquantes dans
un vrai fichier.

Il peut montrer `read_csv()`. Il ne peut pas prévoir les encodages, les
séparateurs, les en-têtes doublés, les colonnes déplacées, les dates
ambiguës et les fichiers incomplets que produisent les organisations.

Il peut montrer comment appeler un LLM. Il ne peut pas donner le jugement
qui permet de repérer une réponse élégante mais inadaptée au contexte.

Il peut faire créer un DataFrame de cinq personnes. Il ne peut pas
reproduire dans un exercice court la pression d'une donnée personnelle,
d'un résultat attendu par un métier, d'une dépendance externe et d'un
délai réel.

Ces limites ne sont pas un défaut caché du programme. Elles sont la
condition qui permet d'enseigner progressivement.

Pour voir une opération, il faut retirer du bruit. Mais le bruit retiré
est souvent le travail lui-même.

## L'écart dans les deux sens

Je vois désormais l'écart depuis deux positions.

Quand je bricolais seul, j'avais de la pratique sans carte complète. Je
savais obtenir certains résultats, mais pas toujours expliquer la place
des éléments ni généraliser la solution.

Dans le cours, je peux avoir la carte sans avoir encore parcouru le
terrain correspondant. Je connais le vocabulaire d'une bibliothèque ou
d'un DataFrame sans avoir rencontré assez de cas pour développer une
intuition solide.

La pratique seule produit des raccourcis difficiles à transmettre. La
formation seule peut produire des réponses propres à des problèmes
propres.

La compétence se construit dans la circulation entre les deux.

## Le rôle ambigu des LLM

Les LLM rendent cet écart plus difficile à voir.

Ils peuvent produire en quelques secondes un code plus avancé que celui
du cours. Cela donne accès à une puissance réelle : bibliothèques,
interfaces, automatisations, corrections. Cela peut aussi faire sauter
les étapes où se construit la compréhension.

Un programme généré peut fonctionner au-delà de mon niveau actuel. Le
résultat n'est pas faux. Mais si je ne peux ni l'expliquer, ni le tester,
ni le modifier quand le contexte change, la compétence appartient encore
en grande partie à l'outil.

La fiche 29 recommande de ne jamais copier-coller aveuglément et de
garder un esprit critique. La formule est juste. Le problème est qu'elle
ne dit pas exactement comment reconnaître ce que l'on n'est pas encore
capable de vérifier.

C'est ici que la pratique redevient indispensable : changer une entrée,
provoquer une erreur, retirer une dépendance, tester un cas absent de
l'exemple. La compréhension apparaît quand le code résiste à mes
questions, pas seulement quand il produit la sortie attendue une fois.

## Une formation n'a pas à tout contenir

Attendre d'une formation qu'elle fournisse le cadre, les mots,
l'expérience, la profondeur et tous les cas réels revient à lui demander
de remplacer le travail.

Elle ne le peut pas.

Elle peut choisir une progression, rendre les notions visibles, éviter
certains détours et donner une langue commune. Elle peut aussi signaler
ses limites et montrer les questions qui restent ouvertes.

L'apprenant garde une responsabilité : compléter.

Compléter ne veut pas dire empiler des tutoriels. Cela signifie confronter
les notions à un problème qui résiste, documenter ce qui casse, comparer
plusieurs solutions et demander une relecture quand le niveau de risque
dépasse son expérience.

Le cours fournit un environnement protégé. L'apprentissage continue
quand on remet du contexte, des contraintes et des conséquences.

## Ce que je change

Je vais conserver les exercices simples, mais leur ajouter une deuxième
étape.

Après le cas nominal, introduire volontairement un problème : une valeur
manquante, une colonne au mauvais type, un fichier absent, une liste trop
courte, une donnée inattendue. Puis observer le message, formuler une
hypothèse et corriger sans remplacer tout le code.

Je veux également distinguer trois niveaux dans mes notes :

- ce que je sais expliquer ;
- ce que je sais reproduire dans l'exercice ;
- ce que j'ai déjà vérifié dans une situation moins propre.

Cette distinction empêchera un mot connu de se faire passer pour une
expérience acquise.

Alice, Bob et Charlie resteront utiles. Ils donnent un endroit calme où
voir une opération pour la première fois. Mais ils ne doivent pas devenir
la preuve que je maîtrise les données réelles.

Tout parcours de formation a une limite. La lucidité ne consiste pas à
la reprocher au cours. Elle consiste à savoir où elle se trouve, puis à
organiser ce qui vient après.

## Rattachement au référentiel

Cet épisode relève du **bloc 2 du titre RNCP40875**. Les fiches 29 et 30
portent sur l'usage des LLM et le fonctionnement de ChatGPT ; les fiches
36 à 39 introduisent les bibliothèques de science des données, Pandas,
les DataFrames et les formats CSV et JSON. Elles fournissent les bases
techniques ; leur confrontation à des cas plus complexes reste un travail
d'apprentissage à poursuivre.

------------------------------------------------------------------------

*Prochain épisode : à suivre.*
