---
title: "J'ai voulu réutiliser la phrase « 85 % de précision »"
date: "2026-08-25"
excerpt: "Mon cours en fait un modèle de communication des résultats. En essayant de l'appliquer à mon propre cas, je me suis aperçu que je ne savais pas quoi mettre à la place des mots."
cover: "/images/articles/06-jai-voulu-reutiliser-la-phrase-85-pourcent.png"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "IA"
  - "métriques"
  - "évaluation"
  - "méthode"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 6
---
## Ce que je croyais

Que 85 %, c'était un bon score.

Mon support de cours propose une formulation type pour présenter des résultats à un comité :

> l'algorithme a atteint une précision de 85 % sur l'ensemble de validation, avec des recommandations pour affiner le modèle afin d'augmenter ce score.

C'est donné comme un modèle de communication réussie : un chiffre, un contexte, une perspective d'amélioration. Je l'ai lue sans broncher. Elle a l'air complète.

### Cinq mots pour lire la suite

- **Exactitude** — la part de prédictions correctes sur l'ensemble des cas.
- **Précision** — parmi les cas que le modèle a signalés, la part qui l'est à juste titre.
- **Rappel** — parmi les cas réellement à détecter, la part que le modèle a trouvée.
- **Faux positif / faux négatif** — une alerte déclenchée pour rien, et un cas réel passé inaperçu. Les deux erreurs possibles, et elles n'ont pas le même coût.
- **Seuil** — le niveau de certitude à partir duquel le modèle déclenche une alerte. C'est un réglage, et c'est quelqu'un qui le choisit.

## Ce qui m'a fait buter

En travaillant sur l'étude de cas du module — un système de détection d'intrusion en entrepôt —, j'ai voulu rédiger ma section « résultats » en reprenant la formulation du cours.

J'ai écrit : *le modèle atteint une précision de…* et je me suis arrêté sur le mot « précision ».

Précision de quoi, exactement ? Est-ce que je parle de la part d'alertes justifiées, ou de la part de prédictions correctes en général ? Ce ne sont pas les mêmes chiffres, et sur un système de détection d'intrusion, ce ne sont surtout pas les mêmes enjeux.

Je suis retourné au support. Le contexte montre clairement qu'il désigne la part globale de prédictions correctes, c'est-à-dire l'exactitude. Le mot employé est celui d'une autre métrique.

La confusion est tellement répandue qu'elle passe inaperçue. Elle m'était passée dessus sans accrocher.

Et une fois cette première question posée, trois autres sont arrivées, que je n'avais jamais eu l'idée de poser.

## Les quatre questions

**1. Précision de quoi ?**

Les trois métriques ne répondent pas à la même question, et le choix dépend entièrement de ce que coûte chaque type d'erreur. Sur un dépistage médical, on veut du rappel : mieux vaut convoquer inutilement que laisser passer un cas. Sur une modération automatique de contenus, on veut de la précision : supprimer à tort une publication légitime a un coût politique immédiat.

L'exactitude, elle, mélange les deux et masque les deux.

**2. Comparé à quoi ?**

C'est l'omission qui m'a le plus frappé, parce qu'elle est presque toujours là.

85 %, c'est bien ou c'est mal ? Impossible à dire. Si l'événement à détecter représente 10 % des cas, un modèle qui répond systématiquement « non » atteint 90 % d'exactitude sans rien détecter du tout. Il ferait mieux que le vôtre, en étant parfaitement inutile.

C'est le piège des classes déséquilibrées, et il concerne exactement les cas d'usage cités dans mes cours : intrusion, fraude, panne. L'événement intéressant y est rare par définition, donc l'exactitude globale y est structurellement flatteuse.

Deux points de comparaison minimums, avant toute annonce : que donne un modèle trivial qui prédit toujours la classe majoritaire, et que donne le dispositif déjà en place — la règle métier, l'ancien système, l'agent humain ?

**3. Mesuré comment ?**

« Sur l'ensemble de validation. » Or le jeu de validation sert à régler le modèle : on y compare des variantes, on y ajuste des paramètres. À force de le consulter, on s'y adapte.

La mesure honnête se fait sur un jeu de test réservé, regardé une seule fois, à la fin. Annoncer un résultat de validation comme performance finale, c'est annoncer sa note d'entraînement plutôt que celle de l'examen.

Deux points liés, que j'ai découverts en cherchant : sur des données temporelles, on entraîne sur le passé et on teste sur le futur, jamais au hasard. Et un écart n'est pas forcément significatif — deux modèles à 84 % et 86 % sur cinq cents exemples ne sont pas départageables.

**4. À quel seuil ?**

Celle-là m'a demandé le plus de temps à comprendre.

Un modèle de classification ne produit pas une décision, il produit une probabilité. C'est quelqu'un qui choisit à partir de quand elle déclenche une alerte. Descendez le seuil : vous détectez plus, vous générez plus de fausses alertes. Montez-le : l'inverse.

Il n'existe donc pas *un* score. Il existe une courbe, et un point sur cette courbe que quelqu'un a retenu, souvent sans le dire.

Et ce choix n'est pas technique. Il demande de chiffrer ce que coûte une fausse alerte et ce que coûte un cas manqué. C'est exactement là qu'un chef de projet apporte ce que le data scientist n'a pas : les coûts métier.

## Ce que j'ai fini par écrire

Voici la version que j'ai mise dans mon étude de cas, à la place de la formulation du cours.

> Au seuil retenu, le modèle détecte 91 % des intrusions réelles avec 1,2 fausse alerte par caméra et par jour, mesuré sur trois mois de vidéo non utilisés pour l'entraînement. La règle de détection de mouvement actuelle détecte 74 % des intrusions avec 8 fausses alertes par jour. Le seuil a été fixé en considérant qu'une fausse alerte coûte environ dix minutes d'agent, soit 5 €, et qu'une intrusion manquée coûte en moyenne 3 000 € — marchandise, immobilisation de la zone, temps d'enquête et déclaration.

C'est plus long, et ça ne tient pas en gros caractères sur un slide. Mais tout y est : la métrique nommée, le point de comparaison, le protocole, le seuil et sa justification.

Le rapport entre les deux coûts est ce qui fixe le seuil. À 5 € contre 3 000 €, on accepte volontiers six cents fausses alertes pour éviter une intrusion : on abaisse donc le seuil et on privilégie le rappel. Si le rapport était inverse, on ferait exactement le contraire. Le réglage technique découle du chiffrage métier, jamais l'inverse.

Ces deux montants sont des ordres de grandeur, à remplacer par les vrais : le coût d'une intrusion se demande au responsable sécurité ou à l'assureur, celui d'une fausse alerte se déduit du coût horaire chargé d'un agent. Deux appels téléphoniques, qui valent plus que trois semaines d'optimisation du modèle.

## Ce que ça change

Surtout ma façon de lire les résultats des autres. Devant un chiffre de performance, j'ai maintenant quatre questions automatiques, et elles suffisent presque toujours à savoir si la personne en face maîtrise son sujet.

Et une observation sur la communication, qui va à l'encontre de mon intuition de départ. Face à « 85 % », un comité n'a rien à dire d'autre que « c'est bien ? ». Face à la version longue, il peut contester le coût de l'intrusion manquée — et c'est exactement le débat qu'il faut avoir. Le chiffre simple ferme la discussion ; la version détaillée l'ouvre là où elle est utile.

Je me suis rendu compte en écrivant tout ça que j'aurais accepté la phrase du cours sans broncher il y a deux mois. C'est peut-être ça, l'effet réel d'une formation : moins savoir des choses nouvelles que ne plus pouvoir lire une vieille phrase de la même façon.

## Rattachement au référentiel

Cet épisode relève du **sous-bloc BC2.6 — Tester et optimiser une solution de relance par IA**, dans le bloc 2 du titre **RNCP40875** : mesurer honnêtement une performance est le préalable de toute optimisation. Il croise BC2.1, puisque bien choisir sa métrique fait partie du cadrage d'un projet.

---

*Prochain épisode : journal du mois 2.*
