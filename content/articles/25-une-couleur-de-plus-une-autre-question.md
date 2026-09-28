---
title: "Une couleur de plus, une autre question"
date: "2026-12-15"
excerpt: "Avec une couleur par jour, le même nuage de points ne raconte plus seulement une relation globale. Il révèle des groupes — et le risque de découper jusqu'à ne plus rien voir."
cover: "/images/articles/25-une-couleur-de-plus-une-autre-question.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "Seaborn"
  - "segmentation"
  - "analyse"
  - "retail"
  - "décision"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 25
---
Le premier nuage de points montrait une relation simple : plus le montant
de la facture augmentait, plus le pourboire avait tendance à augmenter.

Puis une seule option a changé la lecture : `hue="day"`.

Seaborn a coloré les points selon le jour de la semaine. Les données n'ont
pas changé. La relation globale non plus. Pourtant, une nouvelle question
est apparue : cette relation est-elle la même le jeudi, le vendredi, le
samedi et le dimanche ?

Une couleur de plus, une autre analyse.

## Ce que la moyenne globale mélange

Une tendance calculée sur l'ensemble des données suppose implicitement
que les observations appartiennent à une même population comparable.

Dans la réalité, elles peuvent venir de contextes différents. En magasin,
un samedi ne ressemble pas toujours à un mardi : trafic, disponibilité
des équipes, profils des visiteurs, motifs d'achat et pression temporelle
peuvent changer.

Une moyenne globale peut alors mélanger plusieurs mécanismes. Segmenter
par jour, par rayon ou par type de demande ne crée pas ces différences.
Cela permet de vérifier si elles existent.

Je pratiquais déjà ce découpage dans le travail sans employer le mot
« dimension ». On regarde les résultats par jour, par équipe, par famille
de produits ou par période. Le paramètre `hue` rend ce geste visible dans
le graphique : une variable catégorielle devient une couleur.

## Le moment où l'analyse change de sens

Imaginons une relation globale positive entre trafic et ventes. Une fois
les jours distingués, on peut découvrir que la progression vient surtout
du samedi, tandis que la semaine reste stable. La décision n'est plus la
même.

Sans segmentation, on pourrait chercher une action valable tous les
jours. Avec elle, on examine plutôt ce qui distingue le samedi : planning,
type de clientèle, disponibilité produit ou nature des projets.

Le graphique ne donne toujours pas la cause. Il empêche simplement une
moyenne de faire passer un contexte particulier pour une règle générale.

La fiche 44 utilise le jeu de données `tips` : montant de facture,
pourboire, jour, statut fumeur et autres catégories. Le nuage de points
coloré ajoute une troisième dimension sans quitter la page. Le box plot
par jour permet ensuite de comparer médiane, quartiles et valeurs
extrêmes.

La couleur devient une hypothèse de travail.

## Segmenter pour décider

Une segmentation utile correspond à une action possible.

Si le samedi se comporte différemment, on peut revoir l'organisation du
samedi. Si un rayon connaît une dispersion particulière, on peut observer
son contexte. Si un type de demande produit davantage d'attente, on peut
adapter le parcours concerné.

Découper les données n'a d'intérêt que si le découpage aide à comprendre
ou à agir.

Cette exigence protège aussi contre une lecture trop rapide. Deux groupes
colorés peuvent sembler différents simplement parce qu'ils contiennent
peu de points, couvrent des périodes différentes ou concentrent quelques
valeurs extrêmes. La visualisation ouvre une question ; elle ne valide pas
à elle seule la réponse.

## Le piège de la segmentation

On peut toujours découper davantage.

Par jour, puis par tranche horaire, puis par rayon, puis par type de client,
puis par vendeur. Chaque filtre produit une histoire plus spécifique et
un nombre d'observations plus faible.

À force de chercher le segment qui confirme une intuition, on finit par
trouver une différence due au hasard. À force de personnaliser, on peut
aussi perdre la vue d'ensemble et rendre la décision impossible.

Le bon niveau de segmentation équilibre trois questions :

- Le groupe correspond-il à une différence réelle de contexte ?
- Contient-il assez d'observations pour être interprété avec prudence ?
- Une décision différente serait-elle possible pour ce groupe ?

Si la réponse est non, la couleur supplémentaire risque d'ajouter du
bruit plutôt que de la compréhension.

## De la couleur à la responsabilité

La couleur attire l'œil avant que le lecteur examine les valeurs. Elle
peut rendre une différence évidente, mais aussi exagérer des catégories
arbitraires ou suggérer une hiérarchie inexistante.

Il faut donc expliquer ce qu'elle encode, conserver une palette lisible
et limiter le nombre de groupes. Une légende confuse annule le bénéfice
de la segmentation.

Comme pour tout graphique, le choix visuel est un choix de communication.
Avec `hue="day"`, je ne me contente pas d'embellir les points : je propose
au lecteur de considérer le jour comme une variable importante.

Cette proposition doit rester discutable.

## Ce que je retiens

La moyenne globale répond à une question générale. La segmentation teste
si cette réponse tient dans plusieurs contextes.

Elle est particulièrement utile quand l'expérience terrain suggère que
les conditions changent : samedi contre semaine, lancement contre régime
normal, petite équipe contre grande, activité planifiée contre urgence.

Mais le terrain doit aussi résister à la tentation de découper jusqu'à
retrouver exactement l'histoire qu'il espérait.

Une couleur de plus peut révéler une structure cachée. Elle peut aussi
fabriquer un récit. La différence se joue dans la question, le volume de
données et la possibilité de vérifier.

## Rattachement au référentiel

Cet épisode relève du **bloc 2 du titre RNCP40875**. La fiche 44 utilise
Seaborn pour construire un nuage de points segmenté par jour et un box
plot comparant les distributions. Elle montre comment une dimension
catégorielle enrichit l'analyse tout en exigeant une interprétation
prudente.

------------------------------------------------------------------------

*Prochain épisode : à suivre.*
