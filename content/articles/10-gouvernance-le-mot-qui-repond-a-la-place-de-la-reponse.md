---
title: "« Gouvernance » : le mot qui répond à la place de la réponse"
date: "2026-09-08"
excerpt: "Mon cours explique qu'un data lake mal géré devient un marécage, et que la parade est une gouvernance proactive. J'ai voulu savoir ce que ça voulait dire concrètement. Ça m'a pris trois jours."
cover: "/images/articles/10-gouvernance-le-mot-qui-repond-a-la-place-de-la-reponse.png"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "données"
  - "gouvernance"
  - "data lake"
  - "vocabulaire"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 10
---
## Ce que je croyais

Que j'avais compris la mise en garde.

Le module sur le stockage présente les data lakes : des réservoirs qui
conservent les données dans leur format brut, sans transformation
préalable, tous formats acceptés, coût faible, scalabilité forte.
Excellent pour explorer et pour entraîner des modèles.

Puis vient la limite, et elle est formulée avec un mot imagé qui
accroche : **le risque de data swamp**, le marécage de données. Des
données non gérées peuvent rendre le data lake inutilisable. Et la
parade tient en une ligne : *une gouvernance proactive et des outils
adaptés sont essentiels*.

J'ai trouvé ça très bien vu. L'image est parlante, l'avertissement est
juste, et la réponse est donnée. Case cochée.

### Trois mots pour lire la suite

-   **Data lake** --- un stockage qui accepte les données telles
    quelles, sans les transformer ni leur imposer de structure à
    l'entrée.
-   **Schema-on-read** --- le principe qui va avec : on ne décide de la
    structure qu'au moment de lire, pas au moment d'écrire. C'est ce qui
    rend le lac si accueillant, et si difficile à relire.
-   **Catalogue de données** --- un inventaire de ce que contient le
    stockage : quoi, d'où, depuis quand, sous quelle forme.

## Ce qui m'a fait buter

Je préparais l'auto-évaluation de ma fiche. Une question par notion
importante, réponse masquée. Sur les data lakes, j'ai écrit : « Quel est
le risque principal d'un data lake, et comment l'éviter ? »

Réponse : « Le data swamp. On l'évite par une gouvernance proactive. »

Je me suis relu et j'ai reconnu la sensation. Exactement celle du mot «
token », six semaines plus tôt : une phrase qui passe à la lecture, qui
a l'air d'une réponse, et qui ne m'apprendrait rien si je la lisais chez
quelqu'un d'autre.

Alors j'ai fait le test que je me suis imposé depuis : **est-ce que je
peux l'expliquer à quelqu'un qui ne connaît pas le domaine, sans
employer un autre mot de jargon ?**

« Gouvernance proactive ». Première tentative : *c'est le fait de bien
gérer les données*. Ce n'est pas une définition, c'est le mot avec un
synonyme.

Deuxième tentative : *ce sont des règles sur les données*. Quelles
règles, décidées par qui, appliquées quand, et vérifiées comment ?

Je ne savais répondre à aucune des quatre.

Et cette fois-ci, contrairement à « token », le problème ne venait pas
de moi. Le cours n'en dit pas un mot de plus. « Gouvernance proactive et
outils adaptés » est tout ce qu'il y a. C'est une réponse qui a la forme
d'une réponse.

## Comment j'ai cherché

J'ai pris le problème par le mécanisme, comme pour le token : plutôt que
de chercher ce qu'est la gouvernance, chercher **ce qui, précisément,
transforme un lac en marécage**. Si je comprends la panne, je devrais
pouvoir déduire la parade.

**Ce qui fabrique le marécage.** Le lac accepte tout, sans
transformation, à faible coût. Ces trois propriétés sont vendues comme
des avantages, et ce sont les trois causes.

Comme il accepte tout, personne ne se pose la question de la structure à
l'entrée. Comme il ne transforme rien, chaque équipe dépose son format.
Comme le stockage coûte peu, rien n'incite à supprimer quoi que ce soit.
Résultat au bout de deux ans : un stockage qui contient tout, dont
personne ne sait ce qu'il contient.

Le marécage n'est pas seulement un accident improbable. C'est une dérive
naturelle si aucune discipline n'est mise en place. C'est même la
contrepartie exacte de ce qui fait la valeur de l'outil --- et le cours,
qui liste les avantages d'un côté et les limites de l'autre, ne dit
jamais que ce sont les mêmes propriétés vues deux fois.

**Le vrai symptôme.** J'ai cherché à quoi on reconnaît un marécage, et
la formulation qui m'a le plus servi est celle-ci : le lac devient un
marécage quand **plus personne ne sait répondre à « d'où vient ce
fichier »**.

Pas quand il est trop gros. Pas quand il est désordonné. Quand la
provenance s'est perdue. Un fichier dont on ignore la source, la date et
le mode de production ne peut servir ni à décider, ni à entraîner un
modèle qu'on devra défendre.

C'est le même constat que sur mon CSV de scraping, dans l'épisode
précédent, à une autre échelle. Je commence à croire que la provenance
est le sujet central de toute cette étape de formation, alors qu'aucun
module ne porte ce titre.

**Ce que « gouvernance » recouvre, en clair.** Une fois la panne
comprise, j'ai pu remplacer le mot par des choses vérifiables. Cinq,
dans l'ordre où elles me semblent utiles.

Savoir ce qu'il y a dedans : un inventaire tenu à jour, qui liste les
jeux de données, leur source et leur date. Savoir qui répond : un nom
d'humain associé à chaque jeu, quelqu'un à qui poser une question.
Savoir ce qui est fiable : une distinction explicite entre le brut
déposé et le vérifié, parce qu'un lac contient les deux et qu'ils n'ont
pas le même statut. Savoir ce qui périme : une durée de conservation
décidée à l'entrée, sans quoi rien ne sort jamais. Savoir qui peut lire
quoi : des droits d'accès, y compris sur des données brutes qui
contiennent parfois des données personnelles sans que ça se voie.

Ces cinq points peuvent évidemment nécessiter des solutions techniques
pour être appliqués. Mais leur définition est d'abord organisationnelle
: décider ce qu'on conserve, qui en répond, ce qui est considéré comme
fiable et qui peut y accéder. C'est précisément pour cela qu'ils ne
peuvent pas être abandonnés aux seuls choix d'implémentation.

## Ce que ça change

**Un critère pour repérer ce genre de mot.** J'en ai maintenant deux
dans ma liste : « gouvernance » et « proposition de valeur », que
j'avais déjà repéré comme le mot le plus utilisé et le plus vide de mes
supports. Ils ont un point commun, et c'est ça le critère : **ils
clôturent la discussion au lieu de l'ouvrir.**

Quand une réponse rend impossible la question suivante, c'est presque
toujours qu'elle n'a pas répondu. « Une gouvernance proactive est
essentielle » --- on hoche la tête, on passe. Personne ne demande «
laquelle ». Les cinq points ci-dessus, eux, sont discutables un par un,
et c'est exactement ce qu'on veut : une réunion où l'on débat de la
durée de conservation est une réunion utile.

C'est le même effet que j'avais noté sur la métrique à 85 % : le chiffre
simple ferme la discussion, la version détaillée l'ouvre là où elle est
utile. Deux sujets sans rapport, même mécanisme.

**Une reformulation de la question d'auto-évaluation.** Elle est devenue
: « Un data lake accepte tout, ne transforme rien et coûte peu à
stocker. Nommez trois conséquences de ces trois propriétés au bout de
deux ans, et une décision à prendre à l'entrée pour chacune. » C'est
plus long à écrire. C'est la seule version dont la réponse m'apprend
quelque chose.

**Une méthode qui se répète.** C'est la troisième fois que le même geste
débloque quelque chose : ne pas chercher ce qu'un mécanisme fait, mais
chercher **la contrainte qu'il lève ou la panne qu'il évite**. Ça avait
marché sur l'auto-attention, sur le token, ça remarche ici. Je commence
à penser que ce n'est pas une astuce mais la bonne question par défaut.

## Rattachement au référentiel

Cet épisode relève du **sous-bloc BC2.1 --- De l'idée au projet IA :
détecter les opportunités et construire la démarche**, dans le bloc 2 du
titre **RNCP40875** : décider ce qu'on stocke, sous quelles règles et
pour combien de temps est une décision de cadrage, pas un choix
technique. Il touche aussi au socle data du bloc pour la partie droits
d'accès et données personnelles.

------------------------------------------------------------------------

*Prochain épisode : deux techniques que mon cours présente côte à côte,
et qui tirent en sens inverse.*
