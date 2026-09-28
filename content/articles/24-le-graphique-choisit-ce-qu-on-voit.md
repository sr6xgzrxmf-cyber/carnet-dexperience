---
title: "Le graphique choisit ce qu'on voit"
date: "2026-12-08"
excerpt: "Histogramme, camembert, barres ou courbe : aucune forme n'est neutre. Choisir un graphique, c'est déjà choisir la question que la direction verra."
cover: "/images/articles/24-le-graphique-choisit-ce-qu-on-voit.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "visualisation"
  - "reporting"
  - "Matplotlib"
  - "communication"
  - "direction"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 24
---
Un graphique donne l'impression de montrer les données telles qu'elles
sont.

Il fait exactement l'inverse : il choisit une forme, un ordre, une
échelle et une comparaison. Il rend certaines choses immédiatement
visibles et en cache d'autres.

Choisir un graphique, c'est déjà argumenter.

## La même donnée, plusieurs histoires

Une courbe répond naturellement à une question d'évolution : quand la
valeur monte-t-elle, baisse-t-elle, change-t-elle de rythme ?

Un diagramme en barres facilite la comparaison entre catégories.

Un histogramme montre comment une variable numérique se distribue dans
des intervalles.

Un camembert insiste sur la part de chaque catégorie dans un tout.

Ces formes ne sont pas interchangeables. Représenter les ventes mensuelles
par un camembert fait disparaître le mouvement du temps. Utiliser une
courbe pour comparer des catégories sans ordre suggère une continuité qui
n'existe pas. Multiplier les parts d'un camembert rend les différences
presque illisibles alors qu'un diagramme en barres permettrait de les
comparer immédiatement.

Le graphique ne ment pas forcément. Il peut simplement poser la mauvaise
question avec beaucoup d'assurance.

## Le reporting mal compris

J'ai déjà produit et lu des graphiques destinés à la direction sans
formaliser la règle de choix. Comme beaucoup, je partais souvent de ce
qui était disponible dans l'outil ou de la forme habituelle du reporting.

Le risque apparaît quand le lecteur comprend autre chose que ce que
l'auteur voulait montrer. Une couleur attire l'attention sur une catégorie
secondaire. Une échelle écrasée fait paraître stable une variation
importante. Une courbe sans contexte transforme un événement ponctuel en
tendance.

La fiche 41 ne présente pas seulement quatre graphiques. Elle associe
chacun à une question : distribution, dispersion, relation ou évolution.
La fiche 43 montre comment les produire avec Matplotlib. La vraie décision
vient avant la commande : qu'est-ce que le lecteur doit pouvoir comparer ?

## Remonter une photo stratégique

Dans « [Du chaos au clair : comment remonter une photo stratégique](/articles/2026-02-24-remonter-une-photo-strategique) »,
j'écrivais que tout tracer ne signifie pas tout montrer. Le reporting
doit permettre un arbitrage, pas transférer le tri à la direction.

La visualisation prolonge exactement ce geste. Le graphique est une photo
stratégique : il sélectionne une lecture dans une matière plus large.

Cette sélection n'est pas une trahison si elle reste explicite et si les
données complètes demeurent disponibles. Elle devient trompeuse lorsque
la forme masque les limites de ce qu'elle montre.

Un graphique utile devrait permettre de répondre en quelques secondes à
une question formulée. S'il exige d'abord de deviner ce que l'auteur a
voulu dire, il a déplacé le travail au lieu de le simplifier.

## Ce que la direction entend vraiment

Dans « [Ce que la direction entend vraiment](/articles/2026-02-02-ce-que-la-direction-entend-vraiment) », je
distinguais l'expérience vécue de la lecture nécessaire à l'arbitrage.

Un graphique opère cette traduction. Il peut relier une difficulté à une
période, une catégorie ou un écart. Il peut transformer « la situation se
dégrade » en évolution visible et discutable.

Mais la direction ne voit que ce qui entre dans le cadre. Si je choisis
la moyenne sans dispersion, une courbe globale sans segmentation ou une
période trop courte, je fabrique la matière de la décision autant que je
la transmets.

La responsabilité n'est donc pas seulement de produire un graphique
exact. Elle est de choisir une représentation loyale à la question.

## Une règle de choix

Avant d'ouvrir Matplotlib, je peux poser quatre questions :

- Est-ce que je veux montrer une évolution, une comparaison, une
  distribution ou une relation ?
- Qu'est-ce que la forme choisie rendra moins visible ?
- L'échelle, l'ordre et les couleurs peuvent-ils modifier l'impression ?
- Quelle décision ou quelle discussion ce graphique doit-il permettre ?

Le titre devrait ensuite exprimer la lecture attendue sans dicter une
conclusion que les données ne soutiennent pas. Les axes et les unités
doivent permettre de vérifier. La source et le périmètre doivent rester
accessibles.

La visualisation n'est pas la dernière couche du reporting. C'est une
partie du raisonnement et de sa responsabilité.

## Rattachement au référentiel

Cet épisode relève du **bloc 2 du titre RNCP40875**. Les fiches 41 et 42
associent chaque graphique à une fonction analytique ; la fiche 43 met en
œuvre histogrammes, nuages de points et courbes avec Matplotlib. Le choix
de représentation conditionne la qualité de la communication vers les
décideurs.

------------------------------------------------------------------------

*Prochain épisode : une couleur de plus, une autre question.*
