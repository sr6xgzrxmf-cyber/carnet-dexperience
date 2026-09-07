---
title: "Le mot que je lisais sans jamais buter dessus : token"
date: "2026-08-14"
excerpt: "Il apparaît dix fois dans mes fiches. Je ne l'ai jamais relu deux fois, et c'est précisément le problème."
cover: "/images/articles/03-le-mot-que-je-lisais-sans-buter-dessus-token.png"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "IA"
  - "LLM"
  - "token"
  - "vocabulaire"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 3
---
## Ce que je croyais

Que je savais ce qu'était un token.

Pas au sens où j'aurais pu le définir — je n'avais jamais essayé. Au sens où le mot ne me gênait pas. Je lisais « le Transformer reçoit l'intégralité des tokens de la séquence en parallèle » et la phrase passait. Elle avait un sens global, je comprenais l'idée de traitement simultané, je continuais.

C'est ça, l'illusion. Un mot inconnu vous arrête ; un mot à moitié connu vous laisse passer. Et comme il ne bloque rien, rien ne signale qu'il manque quelque chose.

### Trois mots pour lire la suite

- **Modèle de langage** — un programme entraîné à prédire la suite d'un texte, ce qui lui permet de rédiger, résumer ou répondre.
- **Fenêtre de contexte** — la quantité maximale de texte que le modèle peut prendre en compte dans un même échange. Tout y entre : les consignes, l'historique, les documents fournis, et la réponse à produire.
- **Vocabulaire** — la liste finie des unités que le modèle sait manipuler. Il n'existe rien en dehors.

## Ce qui m'a fait buter

En refaisant mes fiches, je me suis imposé un test bête sur chaque terme technique : est-ce que je peux l'expliquer à quelqu'un qui ne connaît pas le domaine, sans employer un autre mot de jargon ?

Sur « token », ma première tentative a donné : *c'est l'unité que traite le modèle*.

Je l'ai relue et j'ai vu que ce n'était pas une définition. C'est une paraphrase. Elle ne dit ni pourquoi ce découpage existe, ni ce qu'il implique, ni en quoi une unité diffère d'un mot. Quelqu'un qui lirait ça n'aurait rien appris.

Deuxième tentative : *c'est un morceau de mot*. Mieux, mais faux la moitié du temps, puisque beaucoup de mots courants sont un seul token.

Il m'a fallu trois essais. Et pendant ces trois essais, j'ai compris que le mot revenait dix fois dans mes fiches, dans des phrases centrales, sans être défini nulle part — ni par le cours, ni par moi.

## Comment j'ai cherché

J'ai pris le problème par la question que ma paraphrase esquivait : pourquoi découper ainsi, plutôt qu'en lettres ou en mots ?

Les deux options extrêmes sont mauvaises. Lettre par lettre, les séquences deviennent immenses et le modèle passe son temps à recomposer des mots. Mot par mot, il faudrait un vocabulaire gigantesque, et le modèle serait perdu devant le premier terme inconnu — un nom propre, une référence, un néologisme.

Le compromis retenu consiste à découper en fragments fréquents. Un mot courant comme « chat » tient en un token. Un mot rare, technique, ou dans une langue peu représentée dans les données d'entraînement se retrouve fragmenté en plusieurs morceaux. En français, l'ordre de grandeur usuel tourne autour de trois quarts de mot par token, mais c'est très variable.

Définition, troisième essai : **un token est un fragment de texte parmi ceux que le modèle sait reconnaître ; le découpage est un compromis entre la longueur des séquences et la taille du vocabulaire, et il explique pourquoi un mot rare coûte plus cher qu'un mot courant.**

Celle-là, je peux la défendre.

## Ce que ça a changé

Une fois le mot défini, trois choses sont devenues lisibles. Aucune n'est théorique.

**Le prix.** Les modèles se facturent au token, en entrée comme en sortie. Ce que j'avais écrit dans ma fiche sur le RAG — que le système paie les documents qu'il injecte dans le prompt — est devenu littéral : chaque fragment récupéré et collé dans le contexte est facturé. Décider de remonter dix fragments plutôt que trois, c'est tripler le coût de chaque requête. C'est un arbitrage de chef de projet, et je ne l'avais pas vu comme tel.

**La fenêtre de contexte.** Elle se mesure en tokens. « Le modèle accepte 200 000 tokens » veut dire à peu près 150 000 mots, soit un gros roman. Mais cette limite couvre tout, y compris la réponse à produire. Le point de vigilance de ma fiche — « dépassement de la fenêtre de contexte » — était une formule creuse tant que je ne savais pas dans quelle unité on compte. Il est devenu calculable.

**Le fonctionnement même du modèle.** C'est le point qui a déplacé le reste.

« Prédiction du token suivant » n'est pas une formule d'introduction. C'est tout ce que fait un modèle de langage. Il produit un token, l'ajoute à ce qu'il a déjà écrit, recommence. Pas de plan préalable, pas de relecture à la fin.

Quand on a compris ça, on comprend pourquoi une hallucination sort avec exactement la même assurance qu'un fait exact : la mécanique est identique dans les deux cas. Le modèle ne « sait » pas qu'il invente, parce qu'il ne fait rien d'autre que la même opération, à chaque fois.

Ma fiche présentait l'hallucination comme un défaut à corriger. Après ce travail, je la vois comme une conséquence directe du mode de génération. On la réduit en ancrant le modèle sur des sources vérifiables. On ne l'élimine pas.

C'est une phrase que je n'aurais pas su écrire avant, et je n'ai rien appris de neuf pour l'écrire — j'ai juste fini par définir un mot que je lisais depuis six semaines.

## Ce que je fais maintenant

Le test tient en une question, je me la pose sur chaque terme technique avant de valider une fiche : est-ce que je peux l'expliquer sans jargon ? S'il me faut un autre mot du domaine pour y arriver, je n'ai pas compris, j'ai déplacé le problème.

J'ai une quarantaine de termes sur ma liste, une vingtaine traités. Deux méritent le même article, et ils viennent d'ailleurs dans la formation :

- **Processus**, dans les modules de cartographie. Tout le monde l'emploie, personne ne le distingue d'une procédure, et cette confusion a des conséquences très concrètes sur ce qu'on documente.
- **Proposition de valeur**, dans le module stratégie. Le mot le plus utilisé et le plus vide de tous les supports que j'ai lus.

## Rattachement au référentiel

Le vocabulaire des modèles de langage relève du **sous-bloc BC2.4 — Comprendre et personnaliser les modèles d'IA générative**, dans le bloc 2 du titre **RNCP40875**. La dimension coût se rattache au cadrage d'un projet : le prix au token est une ligne de charges variables, et savoir l'estimer fait partie du pilotage — c'est le lien avec le premier sous-bloc, BC2.1, sur la construction de la démarche.

---

*Prochain épisode : premier journal mensuel — ce qui s'est débloqué, et ce qui résiste encore.*
