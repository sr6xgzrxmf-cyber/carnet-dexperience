---
title: "Le jour où ma matrice de décision a refusé de s'additionner"
date: "2026-08-21"
excerpt: "Je remplissais tranquillement une grille de comparaison quand j'ai réalisé que je m'apprêtais à donner des points à une solution pour ses défauts."
cover: "/images/articles/05-le-jour-ou-ma-matrice-a-refuse-de-sadditionner.png"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "IA"
  - "décision"
  - "scoring"
  - "méthode"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 5
---
## Ce que je croyais

Que le scoring multicritères servait à rendre une décision rationnelle.

Le principe est séduisant et je l'ai avalé sans réserve : on liste les critères, on leur donne un poids, on note chaque option, on somme, la meilleure gagne. Fini les réunions où chacun défend son intuition. On a un chiffre.

Mon cours le présente exactement comme ça, avec un exemple : le choix d'un modèle pour de l'imagerie médicale.

| Critère | Poids | CNN | RNN | Régression logistique |
|---|---|---|---|---|
| Précision | 50 % | 9 | 8 | 6 |
| Temps de traitement | 25 % | 7 | 6 | 9 |
| Coût | 15 % | 5 | 7 | 8 |
| Déploiement | 10 % | 6 | 7 | 8 |
| **Score** | | **7,6** | **7,3** | **7,3** |

Le CNN gagne. Démonstration terminée, notion acquise, module suivant.

### Quatre mots pour lire la suite

- **Critère** — une dimension sur laquelle on compare les options : le coût, la précision, la rapidité.
- **Pondération** — le poids donné à chaque critère selon son importance. L'ensemble fait 100 %.
- **Moyenne pondérée** — le calcul final : chaque note multipliée par son poids, le tout additionné.
- **Critère éliminatoire** — une exigence sans laquelle une option est inutilisable, quels que soient ses autres mérites.

## Ce qui m'a fait buter

Le module s'accompagne d'une étude de cas : comparer trois outils pour un système de surveillance d'entrepôt par caméras, sur six critères dont le coût et la latence.

Je remplissais la grille tranquillement. Facilité d'intégration : moyenne, haute, faible. Précision : haute, haute, moyenne. Coût : faible, moyen, élevé.

Et au moment de convertir ça en notes pour faire la somme, je me suis arrêté.

Sur la précision, « haute » vaut une bonne note. Sur le coût, « élevé » vaut… quoi ? Si je mets 9 parce que c'est élevé, je récompense la solution la plus chère. Si je mets 3, je viens d'inverser silencieusement l'échelle sur cette ligne, sans que rien dans le tableau ne le signale.

J'ai relu la matrice du cours. Même problème, invisible parce que les notes y sont déjà données. Le coût y est noté 5 pour le CNN et 8 pour la régression logistique — donc l'échelle a bien été inversée, mais nulle part le support ne dit qu'il faut le faire, ni pourquoi.

On ne peut pas additionner des critères qui ne pointent pas dans le même sens. C'est élémentaire, ce n'est écrit nulle part, et je suis prêt à parier que beaucoup de matrices qui circulent en entreprise portent cette erreur — parce qu'elle est invisible : le tableau a l'air propre, les chiffres s'additionnent, le résultat est faux.

## Ce que j'ai trouvé en creusant

Une fois lancé, j'ai refait le calcul du cours à la main. Par acquit de conscience.

Il tombe juste : 7,6 pour le CNN. Et pour les deux autres, 7,25 — c'est-à-dire **exactement le même score**.

Le RNN et la régression logistique ont des profils opposés : l'un est meilleur en précision, l'autre en rapidité et en coût. Ils arrivent au même total. Ce n'est pas un bug, c'est le fonctionnement normal d'une moyenne pondérée : elle écrase les profils. Deux options radicalement différentes peuvent produire le même chiffre, et le tableau affiche « équivalent » alors que choisir entre les deux engage des architectures, des compétences et des budgets sans rapport.

Un score unique n'est pas une conclusion. C'est une compression, et comme toute compression, elle perd de l'information.

Deuxième chose, l'écart entre le premier et les suivants : 0,3 point. Sur des notes attribuées à la main, sur une échelle de 1 à 10 dont personne n'a défini les paliers. Que vaut un 7 en temps de traitement ? Le cours ne le dit pas. Deux évaluateurs mettront 6 et 8 sans que l'un ait tort. L'incertitude sur chaque note dépasse largement l'écart final.

Troisième chose, et c'est celle qui m'a fait changer d'avis sur l'outil : **d'où sortent 50, 25, 15 et 10 ?**

Le support ne l'aborde nulle part. Or la précision pèse la moitié du score à elle seule, et le CNN gagne précisément parce qu'il domine sur ce critère. Déplacez le curseur vers le coût et le déploiement, et la régression logistique passe devant.

Autrement dit : celui qui fixe les pondérations prend la décision. Les notes ne font qu'exécuter.

## Comment j'ai cherché mieux

Trois méthodes que je ne connaissais pas et que j'utiliserai désormais.

**L'atelier de pondération.** Chacun répartit 100 points entre les critères, d'abord seul, puis en commun. Ce qui compte n'est pas la moyenne obtenue mais l'écart entre les répartitions individuelles : il révèle des désaccords de priorité que personne n'avait formulés à voix haute. C'est souvent la vraie réunion.

**La comparaison par paires.** Plutôt que de pondérer huit critères d'un coup, on les compare deux à deux : le coût compte-t-il plus que la précision, et combien de fois plus ? Notre jugement est nettement plus fiable sur deux éléments que sur huit, et les poids se déduisent ensuite.

**Le test de sensibilité.** Une fois les poids posés, on les fait varier de dix points, un par un, et on regarde si le classement tient. Ça prend cinq minutes. Soit vous pouvez annoncer « le CNN gagne quelle que soit la pondération raisonnable », et vous êtes inattaquable ; soit le classement bascule, et vous savez que votre décision repose sur un réglage arbitraire. Mieux vaut l'apprendre avant le comité qu'en séance.

J'ai aussi compris une règle que je n'aurais pas devinée : **un critère éliminatoire ne se pondère jamais.** Si l'hébergement des données en Europe est une obligation légale, ce n'est pas un critère qui vaut 15 % : c'est un filtre qu'on applique avant de noter. Le glisser dans la moyenne permet à une option juridiquement interdite de l'emporter grâce à ses bons résultats ailleurs.

## Ce que ça change

Je ne présenterai plus une matrice comme une preuve. C'est un outil d'explicitation : il force à nommer les critères et les priorités, ce qui est déjà considérable dans une réunion où chacun défend son intuition sans la formuler. Mais il n'arbitre pas, il rend l'arbitrage visible.

Concrètement, trois réflexes :

- Trier les exigences avant de noter, en séparant l'éliminatoire du souhaitable.
- Écrire le barème avant d'attribuer les notes — ce que vaut un 3, un 6, un 9, en termes observables.
- Ne jamais présenter un classement sans avoir fait varier les poids.

Et une question à poser systématiquement quand quelqu'un m'apporte une matrice, y compris la mienne : *d'où viennent vos pondérations ?* Je n'aurais pas su y répondre il y a un mois.

## Rattachement au référentiel

Cet épisode relève du **sous-bloc BC2.1 — De l'idée au projet IA : détecter les opportunités et construire la démarche**, dans le bloc 2 du titre **RNCP40875**. C'est le module « Réussir ses arbitrages » qui porte cet exemple. La question de savoir qui fixe les pondérations est au cœur de ce sous-bloc : arbitrer entre des solutions, c'est d'abord rendre explicite ce qui fait pencher la décision.

---

*Prochain épisode : le jour où j'ai voulu réutiliser la phrase « 85 % de précision ».*
