---
title: "Journal de formation, mois 1 : ce qui s'est débloqué, ce qui résiste"
date: "2026-08-18"
excerpt: "Un point mensuel, avec une partie que je tiens à écrire noir sur blanc : ce que je ne comprends toujours pas."
cover: "/images/articles/04-journal-de-formation-mois-1.png"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "formation"
  - "journal"
  - "apprentissage"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 4
---
Format récurrent : un point par mois. Trois parties fixes — ce qui s'est débloqué, ce qui résiste, ce que je change — et le rattachement au référentiel.

L'intérêt n'est pas de montrer que ça avance. C'est de dater ce que je ne comprends pas. Une incompréhension qu'on ne note pas disparaît sans qu'on sache ce qui lui est arrivé : levée, ou contournée par une formulation qui donne le change. Écrite quelque part, elle devient vérifiable.

C'est aussi la partie la plus inconfortable à publier, et probablement la plus utile à lire.

## Ce qui s'est débloqué

**Le lien entre auto-attention et parallélisation.** Je récitais que le Transformer traite la séquence en parallèle sans voir *pourquoi* c'était possible. Je le prenais comme une propriété donnée.

La bascule s'est faite en posant la question à l'envers : qu'est-ce qui, dans un réseau récurrent, force le traitement pas à pas ? La dépendance à l'étape précédente. Or si chaque élément pondère tous les autres en même temps, cette dépendance disparaît — donc plus rien n'oblige à traiter dans l'ordre.

Et du coup l'encodage positionnel, que je trouvais bizarre et rajouté, devient évident : c'est le prix à payer pour avoir supprimé l'ordre. On l'enlève pour gagner en vitesse, il faut bien le réinjecter autrement.

Ce qui m'a débloqué n'est pas une explication supplémentaire. C'est d'avoir cherché la contrainte que le mécanisme lève, plutôt que ce qu'il fait.

**La différence entre deux typologies de processus.** Le cours en présente une : transformationnel, transactionnel, décisionnel. Elle sert à décider si un processus est cartographiable — les deux premiers oui, le troisième non.

En cherchant à vérifier, j'en ai croisé une autre, omniprésente en entreprise : réalisation, support, pilotage. J'ai d'abord cru que le cours était incomplet, ou que l'une des deux était fausse.

Elles ne répondent pas à la même question. La première demande : ce processus se laisse-t-il modéliser ? La seconde : comment lire l'organisation dans son ensemble ? Ce ne sont pas deux versions concurrentes d'un même classement, mais deux outils qui n'interviennent pas au même moment.

J'ai perdu une soirée sur ce malentendu, et c'est la soirée la plus utile du mois. Depuis, devant deux classifications qui se contredisent, je cherche d'abord à quelle question chacune répond.

**Qu'un canvas n'est pas un résultat.** Dit comme ça, c'est presque une évidence. En pratique, tant que je remplissais les cases pour les remplir, je produisais une description. Une case de canvas est une hypothèse, et la seule question qui compte est : laquelle ferait tomber tout le reste si elle était fausse ?

## Ce qui résiste

Je liste sans arrondir les angles.

**Évaluer un système RAG, concrètement.** Je connais la triade citée par le cours : pertinence de la recherche, fidélité de la réponse au contexte, pertinence de la réponse finale. Je sais la nommer. Je ne sais pas la mesurer. Combien de questions de référence faut-il pour que les chiffres veuillent dire quelque chose ? Qui écrit les bonnes réponses attendues ? La fidélité se note à la main ou automatiquement ? C'est un trou méthodologique et pas conceptuel, ce qui est peut-être pire : je peux en parler sans que ça se voie.

**Le passage du prototype au déploiement.** Tout ce que j'ai vu s'arrête à la maquette qui marche. Ce qui vient après reste flou : la supervision, le coût réel à l'usage, la mise à jour de la base documentaire, ce qui se passe quand le fournisseur change son modèle sous vous. Or c'est exactement là que se joue le métier que je prépare.

**Le chiffrage.** Je sais nommer les indicateurs — coût d'acquisition, valeur à vie, seuil de rentabilité, besoin en fonds de roulement. Je serais incapable d'en produire une estimation défendable sur un projet réel. Il y a une différence entre connaître un ratio et savoir le renseigner, et je suis du mauvais côté.

**Le règlement européen sur l'IA.** Je sais qu'il classe les systèmes par niveau de risque. Devant un projet donné, je ne saurais pas dire dans quelle catégorie il tombe ni quelles obligations en découlent. À traiter sérieusement, d'autant que les cas d'usage cités partout dans mes cours — santé, sécurité, finance — sont précisément ceux qui sont encadrés.

## Ce que je change pour le mois prochain

- **Constituer un jeu de questions de référence** sur une petite base documentaire de test, pour arrêter de parler d'évaluation en théorie. Vingt questions dont je connais la réponse suffiront à commencer.
- **Faire un chiffrage complet** sur un cas fictif mais crédible, infrastructure et coût au token compris, et le faire relire par quelqu'un qui en fait vraiment.
- **Lire le règlement IA** en partant de la classification par risque plutôt que du texte intégral, avec une question précise : où tombe une détection d'intrusion en entrepôt ?
- **Continuer le glossaire.** Une quarantaine de termes repérés, une vingtaine traités. Ceux que je n'arrive pas à définir sans jargon partent dans la liste des articles à écrire — c'est devenu ma file d'attente éditoriale.

## Ce que je remarque en relisant

Les quatre points qui résistent tombent tous du même côté : évaluation, déploiement, chiffrage, conformité. Autrement dit, le passage de la connaissance technique au pilotage réel.

Ce n'est probablement pas un hasard. C'est exactement ce qui sépare une formation technique d'un titre de niveau 7 — et donc, très précisément, ce pour quoi je suis là.

## Rattachement au référentiel

Ce mois a surtout porté sur le **sous-bloc BC2.1 — De l'idée au projet IA : détecter les opportunités et construire la démarche** (c'est là que se situe le module sur les arbitrages), dans le bloc 2 du titre **RNCP40875**. Les incompréhensions sur l'évaluation et le chiffrage anticipent les sous-blocs suivants, jusqu'à BC2.6 sur le test et l'optimisation d'une solution.

---

*Prochain épisode : le jour où ma matrice de décision a refusé de s'additionner.*
