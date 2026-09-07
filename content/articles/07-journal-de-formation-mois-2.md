---
title: "Journal de formation, mois 2 : ce qui s'est débloqué, ce qui résiste"
date: "2026-08-28"
excerpt: "Deuxième point mensuel. Trois des quatre choses que j'avais notées comme opaques le mois dernier n'ont pas bougé. La quatrième a bougé autrement que prévu."
cover: "/images/articles/07-journal-de-formation-mois-2.png"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "formation"
  - "journal"
  - "apprentissage"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 7
---
Deuxième point mensuel. Même format : ce qui s'est débloqué, ce qui
résiste, ce que je change.

L'exercice a pris un sens que je n'avais pas anticipé en écrivant le
premier. Il ne s'agit plus seulement de noter où j'en suis, mais de
relire ce que j'avais noté il y a un mois et de vérifier honnêtement.
C'est plus inconfortable que de tenir un journal ordinaire, parce qu'il
y a une trace en face de laquelle se placer.

Sur les quatre points que j'avais listés comme résistants le mois
dernier, un a avancé, un a avancé de travers, et deux n'ont pas bougé du
tout. Je commence par ceux-là, parce que c'est la partie que je tiens le
plus à écrire.

## Ce qui n'a pas bougé

**Le passage du prototype au déploiement.** Rien. Le mois a porté sur la
collecte et le stockage des données, donc sur ce qui vient avant, pas
après. J'ai gagné du vocabulaire sur l'amont et strictement rien sur
l'aval.

Je note quand même une chose : j'avais écrit que « c'est exactement là
que se joue le métier que je prépare ». Un mois plus tard, cette phrase
me semble toujours vraie, et le fait qu'aucun module ne l'ait abordée
commence à me préoccuper sérieusement. Il faudra que je regarde le plan
des étapes suivantes plutôt que d'attendre.

**Le règlement européen sur l'IA.** Rien non plus. Je m'étais donné une
question précise pour attaquer --- où tombe une détection d'intrusion en
entrepôt dans la classification par risque ? --- et je ne l'ai pas
ouverte. Le mois a été chargé côté modules, et ce sujet n'avait pas
d'échéance ; il est passé après le reste, comme passent toujours les
choses sans échéance.

C'est précisément à ça que sert ce journal. Sans la trace écrite du mois
dernier, je ne saurais même plus que je l'avais prévu.

## Ce qui a avancé de travers

**Le chiffrage.** J'avais écrit que je savais nommer les indicateurs ---
coût d'acquisition, valeur à vie, seuil de rentabilité --- mais que je
serais incapable d'en produire une estimation défendable.

Le mois m'a donné beaucoup de matière sur les coûts : le prix au token,
dont j'avais déjà fait un article ; le coût de stockage selon les
formats et la compression ; l'arbitrage entre un format rapide en
écriture et un format efficace en lecture ; le coût d'une campagne
d'annotation.

Sur le papier, j'ai progressé. En pratique, je me suis rendu compte
d'une chose gênante en essayant de faire le chiffrage complet que je
m'étais promis : **je connais maintenant plus de lignes de coût, et je
ne sais toujours pas en remplir une seule.**

Combien coûte le stockage d'un téraoctet chez un fournisseur cloud ? Je
ne sais pas. Combien de requêtes par jour fait un système RAG
d'entreprise de taille moyenne ? Aucune idée. Quel est le coût horaire
chargé d'un agent de sécurité, chiffre dont j'avais besoin dans mon
article sur les métriques ? J'ai mis un ordre de grandeur en le
signalant comme tel.

J'ai donc amélioré la structure de mon estimation sans améliorer son
contenu. C'est un progrès réel, simplement pas celui que j'annonçais :
savoir quelles cases remplir n'est pas savoir les remplir. Cela dit, une
structure juste avec des valeurs approximatives peut être corrigée avec
quelqu'un qui connaît le terrain, alors qu'une structure fausse remplie
de chiffres précis donne facilement une illusion de maîtrise. J'ai
peut-être pris les deux dans le bon ordre.

Le seul remède que je vois est celui que j'avais déjà écrit et pas
appliqué : faire relire par quelqu'un dont c'est le métier. Il n'y a pas
de raccourci documentaire à ça.

## Ce qui s'est débloqué

**La provenance comme sujet central.** C'est le vrai apport du mois, et
il n'a pas de module à son nom.

En travaillant sur trois sujets qui n'ont rien à voir --- le scraping,
les data lakes, la structuration d'une base ---, je suis tombé trois
fois sur la même question sous des habits différents. D'où vient cette
donnée, quand a-t-elle été produite, par quel moyen, qui répond d'elle ?

Sur le scraping, c'est un CSV à deux colonnes qui ne dit pas de quelle
page il sort. Sur les data lakes, c'est le passage au marécage, qui
survient précisément quand plus personne ne sait répondre à « d'où vient
ce fichier ». Sur le RAG du mois dernier, c'étaient les métadonnées d'un
fragment, sans lesquelles on ne peut ni citer sa source ni savoir qu'un
document est périmé.

Trois modules, trois vocabulaires, un seul problème. Et aucun des trois
supports ne fait le lien avec les deux autres.

**Où se logent les manques.** C'est le corollaire, et c'est ma
trouvaille méthodologique du mois.

Je cherchais jusqu'ici les trous à l'intérieur des modules : la notion
pas assez développée, l'exemple absent. Je me suis aperçu que mes
supports sont en réalité assez complets pris un par un. Ce qui manque
est presque toujours **entre deux modules** --- une conséquence du
premier sur le second, que personne ne signale parce que personne n'a
les deux en tête au même moment.

Le module RAG exige des métadonnées ; le module scraping produit un
fichier qui n'en a pas. Le module sur la normalisation montre pourquoi
on sépare certaines données pour préserver leur cohérence ; celui sur
l'entrepôt montre des structures davantage orientées vers l'analyse. Les
deux répondent à des usages différents, sans que le support nomme
vraiment cet arbitrage. Le module éthique présente le cas du prototype
de recrutement d'Amazon ; le module crowdsourcing signale que les
annotateurs sont concentrés dans certaines zones géographiques, sans
montrer qu'ils posent une question commune : qui produit les données, et
quelle population ces données représentent-elles réellement ?

Aucun de ces trois écarts n'est une erreur. Ce sont des effets du
découpage en modules, et c'est structurel : un plan de formation est
séquentiel, la réalité ne l'est pas.

Ça change ma façon de réviser. Je ne cherche plus seulement à comprendre
chaque fiche, je pose mes fiches côte à côte et je cherche les
contradictions. C'est d'ailleurs comme ça que le gabarit m'avait servi
la première fois, il y a deux mois --- sauf qu'à l'époque je cherchais
des cases vides, et que je cherche maintenant des cases qui se
contredisent.

**Une question par défaut qui marche à tous les coups.** Je l'ai vue
fonctionner trois fois, sur des sujets sans rapport, et je crois pouvoir
l'énoncer comme règle : devant un mécanisme que je récite sans
comprendre, ne pas chercher ce qu'il fait, mais **chercher la contrainte
qu'il lève ou la panne qu'il évite**.

Ça avait débloqué l'auto-attention le mois dernier --- qu'est-ce qui,
dans un réseau récurrent, force le traitement pas à pas ? Ça a débloqué
le token --- pourquoi découper ainsi plutôt qu'en lettres ou en mots ?
Et ça a débloqué le mot « gouvernance » ce mois-ci --- qu'est-ce qui,
précisément, transforme un lac en marécage ?

C'est la même opération à chaque fois. Je la sortais au coup par coup,
je vais la sortir en premier désormais.

## Ce que je change pour le mois prochain

-   **Le règlement IA, avec un créneau réservé.** Deux heures posées
    dans l'agenda, la classification par risque, et la question de la
    détection d'intrusion en entrepôt. La bonne intention n'a pas suffi
    deux fois de suite ; je change de méthode plutôt que de motivation.
-   **Trouver quelqu'un pour le chiffrage.** Pas lire davantage :
    demander. Une personne qui a déjà budgété un projet de données, une
    heure de conversation, et je saurai plus que trois semaines de
    recherche.
-   **Les vingt questions de référence.** Toujours pas faites. Je les
    redescends à dix, sur une base documentaire de cinq PDF que j'ai
    déjà. Un objectif atteignable vaut mieux qu'un objectif juste.
-   **Relire mes fiches par paires**, au lieu de les relire une par une.
    Deux fiches de modules différents côte à côte, à la recherche de ce
    que l'une implique pour l'autre. C'est ce qui m'a le plus appris ce
    mois-ci, autant en faire une méthode.

## Ce que je remarque en relisant

Les deux points que je n'ai pas touchés --- le déploiement et la
conformité --- sont les mêmes que le mois dernier. Ce sont aussi les
deux seuls qui n'appartiennent à aucun module que j'ai suivi.

Vu comme ça, ce n'est pas très étonnant. Une formation à temps partiel
avec un rythme de modules soutenu laisse peu de place à ce qui n'est pas
au programme, et j'ai plutôt bien tenu ce qui l'était. Mais je préfère
l'écrire pour ce que c'est : un arbitrage, pas un oubli. J'ai choisi
l'avancement sur l'approfondissement, et c'était sans doute le bon choix
ce mois-ci.

Ce que je retiens, c'est surtout qu'un sujet hors programme ne se traite
pas dans les interstices. Il faut lui donner un créneau comme au reste,
sinon il attend. C'est pour ça que j'ai mis des heures en face du
règlement IA plutôt qu'une bonne intention --- on verra le mois prochain
si ça suffit.

## Rattachement au référentiel

Ce mois a porté sur le socle data du **bloc 2 du titre RNCP40875** :
collecte, stockage et structuration des données. Les questions de
provenance et de traçabilité irriguent l'ensemble du bloc. Les deux
points qui résistent --- déploiement et conformité --- relèvent
respectivement de **BC2.5**, sur l'automatisation d'une solution, et du
volet réglementaire du bloc.

------------------------------------------------------------------------

*Prochain épisode : ce qui entre dans la base, et qui l'a validé.*
