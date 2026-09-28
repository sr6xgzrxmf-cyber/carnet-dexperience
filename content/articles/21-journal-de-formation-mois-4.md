---
title: "Journal de formation, mois 4 : le code commence à parler aux autres"
date: "2026-11-17"
excerpt: "Après Pandas, les statistiques et la visualisation changent le destinataire du travail : il ne suffit plus de manipuler les données, il faut rendre le résultat lisible par quelqu'un d'autre."
cover: "/images/articles/21-journal-de-formation-mois-4.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "journal"
  - "statistiques"
  - "visualisation"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 21
---
Quatrième point mensuel. Même format : ce qui s'est débloqué, ce qui
résiste, ce que je change.

Le mois précédent m'avait fait passer du cadre réglementaire au code.
Celui-ci déplace encore la position : après avoir manipulé les données
avec Pandas, j'ai commencé à les résumer avec des statistiques et à les
représenter avec des graphiques.

Pour la première fois, le code ne produit plus seulement quelque chose
que je vérifie moi-même. Il produit quelque chose que l'on peut montrer
à quelqu'un d'autre.

Ce changement de public modifie tout.

## Ce qui s'est débloqué

**Une donnée transformée n'est pas encore une information.** Filtrer un
DataFrame, ajouter une colonne ou enregistrer un CSV produit un résultat
technique. Pour qu'une autre personne puisse en tirer quelque chose, il
faut encore choisir ce qui résume les données : moyenne, médiane,
dispersion, quartiles, évolution ou relation entre deux variables.

Les fiches 40 à 42 m'ont donné les premières distinctions. La moyenne
indique un centre mais réagit fortement aux valeurs extrêmes. La médiane
partage les observations en deux. L'écart-type dit si les valeurs restent
proches ou s'éloignent fortement de la moyenne. Les quartiles décrivent
la position dans la distribution.

Un tableau ne répond donc pas à une question par lui-même. Il faut choisir
la mesure qui correspond à ce que l'on cherche.

**Le graphique n'arrive pas après l'analyse.** Je le voyais comme une
mise en forme finale : on calcule, puis on embellit. Les fiches 41 à 44
montrent autre chose. Un histogramme révèle une distribution, un box plot
la dispersion et les valeurs extrêmes, un nuage de points une relation,
une courbe une évolution dans le temps.

Choisir le graphique fait déjà partie de l'analyse. Chaque forme rend une
question visible et en laisse d'autres en arrière-plan.

**Le code possède désormais un destinataire.** Avec Matplotlib et
Seaborn, le résultat a un titre, des axes, une légende, des couleurs et
un ordre de lecture. Ces éléments ne sont pas décoratifs. Ils déterminent
ce que le lecteur comprend sans avoir accès au notebook ni au raisonnement
qui a précédé.

## Où en sont les résolutions du mois 3

**Reprendre un exercice depuis une page blanche.** C'est le point qui a
le plus avancé dans la méthode. Les graphiques obligent à repartir de la
question : quelle variable regarder, quelle comparaison construire,
quel type de représentation choisir ? Recopier une commande ne suffit
plus dès que la question change.

**Tenir un journal d'erreurs.** La résolution reste pertinente, mais je
ne peux pas honnêtement la considérer comme installée. Je note mieux les
causes quand je les identifie — mauvais environnement, fichier absent,
longueur incohérente — sans avoir encore constitué le journal régulier
que j'avais annoncé.

**Utiliser le LLM en second.** C'est encore un point de vigilance. La
visualisation rend la tentation plus forte : demander directement « fais
moi un graphique ». Le résultat peut être correct sans que le choix du
graphique le soit. J'essaie donc de formuler d'abord la question que je
veux rendre visible.

**Faire le lien avec le RGPD.** Le lien reste conceptuellement clair :
une visualisation peut révéler des informations, même lorsque les lignes
du tableau ne sont pas montrées. Mais je n'ai pas encore conduit le petit
exercice documenté annoncé le mois dernier.

**Le chiffrage et le déploiement.** Ils résistent toujours. Le mois
dernier, je m'étais donné une échéance : avoir identifié avant la fin du
mois la personne qui relirait un chiffrage. Je ne l'ai pas fait. C'est la
deuxième fois que cette résolution glisse, et une échéance n'a visiblement
pas suffi. Les nouvelles notions améliorent la lecture d'un résultat, pas
encore l'estimation du coût réel ni le passage durable en production.

## Ce qui résiste

**Interpréter sans surinterpréter.** Un nuage de points suggère parfois
une relation. Il ne prouve pas qu'une variable cause l'autre. Une valeur
isolée peut être une erreur, un cas exceptionnel ou le signal le plus
important du jeu de données. Le graphique accélère la perception ; il
peut aussi accélérer une conclusion fausse.

**Choisir le niveau de simplification.** Pour être lisible, une
visualisation retire des détails. Trop peu, elle reste confuse. Trop,
elle raconte une histoire propre qui ne correspond plus à la réalité.
Je retrouve ici le problème de la « photo stratégique » : garder toute
la matière en arrière-plan et ne montrer que ce qui sert la décision,
sans demander au lecteur de faire le tri à ma place.

**Passer du résultat juste au résultat explicable.** Je peux produire une
moyenne ou afficher un graphique. Je dois encore apprendre à expliquer
pourquoi cette mesure et cette représentation sont adaptées, quelles
limites elles ont et ce qu'elles ne permettent pas de conclure.

## Ce que je change pour le mois prochain

- Pour chaque graphique, écrire d'abord la question à laquelle il doit
  répondre.
- Afficher au moins deux mesures quand une moyenne peut masquer la
  distribution : médiane et dispersion, par exemple.
- Conserver le tableau source et les choix de transformation afin que le
  résultat reste vérifiable.
- Reprendre le journal d'erreurs sous une forme minimale : message, cause,
  test et correction.
- Pour le chiffrage, remplacer l'échéance par un geste plus petit :
  écrire cette semaine à une personne précise, même si le chiffrage à
  relire n'est pas encore prêt.
- Demander à une autre personne ce qu'elle comprend d'un graphique avant
  d'expliquer ce que je voulais montrer.

## Ce que je remarque en relisant

Le passage le plus important du mois n'est pas celui du tableau au
graphique. C'est celui de soi-même à un lecteur.

Quand je code pour apprendre, je peux garder une partie du contexte dans
ma tête. Quand je présente un résultat, ce contexte doit devenir visible :
le périmètre, l'unité, la période, la mesure, les exceptions et la question
posée.

Le graphique crée une responsabilité nouvelle. Il donne l'impression de
comprendre plus vite. À moi de vérifier que cette vitesse ne vient pas
d'une simplification trompeuse.

## Rattachement au référentiel

Ce mois relève du **bloc 2 du titre RNCP40875**. Dans le prolongement
de Pandas et des DataFrames (fiches 36 à 39, vues le mois dernier), les
fiches 40 à 44 introduisent les mesures
descriptives et leur visualisation avec Matplotlib et Seaborn. L'enjeu
est désormais de transformer une manipulation correcte en résultat
interprétable et communicable.

------------------------------------------------------------------------

*Prochain épisode : la moyenne m'avait menti.*
