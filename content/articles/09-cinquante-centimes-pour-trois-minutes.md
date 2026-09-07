---
title: "0,50 dollar pour trois minutes"
date: "2026-09-04"
excerpt: "Mon cours donne un tarif, une méthode de contrôle qualité et un avertissement sur les biais. Mis bout à bout, ces trois éléments décrivent autre chose que ce que le mot « plateforme » laisse entendre."
cover: "/images/articles/09-cinquante-centimes-pour-trois-minutes.png"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "IA"
  - "crowdsourcing"
  - "annotation"
  - "biais"
  - "éthique"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 9
---
## Ce que je croyais

Que le crowdsourcing était une solution d'approvisionnement.

Le module le présente comme ça, et l'argumentaire est solide. Vous avez
besoin de 10 000 e-mails classés en « spam » et « non spam » pour
entraîner un modèle. Vous n'allez pas le faire vous-même. Vous passez
par une plateforme, vous décrivez la tâche, des milliers de
contributeurs la réalisent, vous récupérez vos annotations en quelques
jours pour un coût très inférieur à celui d'une équipe dédiée.

Trois plateformes citées, Amazon Mechanical Turk en tête. Quatre étapes
de mise en œuvre. Une liste d'avantages, une liste d'inconvénients.
C'est clair et c'est complet.

J'ai coché. Besoin d'annotations, réponse : plateforme.

### Quatre mots pour lire la suite

-   **Annotation** --- l'étiquette qu'un humain pose sur une donnée pour
    qu'un modèle puisse apprendre : « ceci est un spam », « il y a un
    visage sur cette image ».
-   **Micro-tâche** --- une unité de travail fragmentée à l'extrême,
    conçue pour être exécutée en une à trois minutes sans contexte ni
    formation.
-   **Question piège** --- une tâche dont on connaît la réponse, glissée
    dans le lot pour vérifier que le contributeur est attentif.
-   **Vérité terrain** --- les annotations de référence qui servent
    d'étalon au modèle. Il ne pourra jamais être meilleur qu'elles.

## Ce qui m'a fait buter

Le cours donne une consigne de rémunération : viser un tarif horaire
équitable, minimum 10 à 15 dollars de l'heure, soit environ 0,50 dollar
pour une tâche de trois minutes.

Je l'ai lue comme une bonne nouvelle --- le support pense à l'éthique,
tant mieux --- et je suis passé à la suite. C'est en revenant en
arrière, deux pages plus loin, que les morceaux se sont assemblés.

Parce que la page suivante explique comment garantir la qualité des
réponses. Trois mécanismes : insérer des questions pièges pour vérifier
l'attention, faire réaliser la même tâche par plusieurs personnes et
comparer, filtrer les contributeurs à plus de 95 % de taux
d'approbation.

Et la page d'après, dans les inconvénients : les contributeurs de MTurk
sont majoritairement situés aux États-Unis et en Inde, ce qui pose un
problème de représentativité.

Trois informations, trois pages, trois listes différentes. Prises
séparément, chacune est raisonnable. Mises bout à bout, elles décrivent
une situation précise : des gens payés à la pièce, à un tarif où trois
minutes valent cinquante centimes, notés en permanence, filtrés sur un
score, et dont la répartition géographique peut aussi être liée aux
conditions économiques de ce marché, dont le tarif fait partie.

Le mot « plateforme » recouvre tout ça. Il évoque un outil. C'est un
marché du travail.

Ce qui m'a arrêté n'est pas l'indignation --- je ne suis pas en position
de faire la leçon, et je n'ai pas d'alternative à proposer. C'est de
m'apercevoir que j'avais lu trois fois la même réalité sous trois angles
différents sans jamais la reconstituer, parce que le support ne la
reconstitue pas non plus.

## Comment j'ai cherché

J'ai essayé de traiter la question comme un problème de projet plutôt
que comme un problème de conscience. Qu'est-ce que ça change,
concrètement, sur le résultat ?

**Le biais géographique n'est pas une question morale, c'est une
question technique.** Et j'en avais déjà l'exemple sous les yeux, dans
une autre fiche.

Le cas du prototype de recrutement d'Amazon, abandonné après que des
biais défavorables aux femmes ont été identifiés : le système avait été
entraîné sur des CV historiques provenant d'un secteur très
majoritairement masculin. Le mécanisme est enseigné comme un cas d'école
de non-équité.

Or c'est exactement le même mécanisme. Si la population qui annote n'est
pas représentative de la population sur laquelle le modèle sera utilisé,
alors les jugements portés dans les annotations ne le sont pas non plus.
Sur du spam, ça peut passer. Sur de la modération de contenu, sur de
l'analyse de sentiment, sur tout ce qui touche à des jugements
culturels, non : ce qui est perçu comme agressif, ironique ou déplacé
n'est pas universel.

La formation enseigne le cas Amazon dans le module éthique et le biais
MTurk dans le module crowdsourcing. Elle ne dit jamais que le second
produit le premier.

**Le tarif fabrique la qualité.** C'est le lien que je n'avais pas vu et
qui m'a le plus intéressé, parce qu'il retourne complètement la logique.

Le cours présente les contrôles qualité comme une réponse à un problème
donné : les contributeurs sont parfois peu attentifs, donc on met des
questions pièges. Mais si une tâche rapporte cinquante centimes, la
seule stratégie économiquement rationnelle pour le contributeur est
d'aller vite. Aller vite n'est pas nécessairement un défaut de caractère
: une rémunération à la tâche peut créer une incitation à privilégier la
vitesse, parfois au détriment de l'attention.

Autrement dit, les questions pièges peuvent notamment compenser un
risque auquel le mode de rémunération contribue. On paie peu, donc on
obtient de la vitesse, donc il faut des mécanismes pour rattraper la
qualité perdue. Le cours conseille d'ailleurs de rémunérer correctement
pour « motiver les participants et améliorer la qualité » --- il dit
donc bien que les deux sont liés. Il ne va simplement pas jusqu'à en
tirer la conclusion : payer davantage est aussi un dispositif de
qualité, au même titre qu'une question piège, et probablement plus
efficace.

**La vérité terrain est un plafond.** C'est la formulation qui a fini de
déplacer les choses pour moi.

Un modèle supervisé apprend à reproduire les annotations qu'on lui
donne. Il ne peut donc pas être plus juste qu'elles. Si une part des
étiquettes est fausse parce que les annotations sont bruitées ou
réalisées trop vite, ce bruit dégrade le signal sur lequel le modèle
apprend. Certaines méthodes peuvent en atténuer les effets, mais
améliorer ensuite le modèle ne remplace pas une vérité terrain de
qualité. On peut alors passer beaucoup de temps à optimiser un système
dont une partie de la limite se trouve déjà dans les données
d'entraînement.

Ça rejoint ce que j'écrivais sur la métrique à 85 % : on discute
beaucoup du modèle et très peu de ce sur quoi il a été entraîné.

## Ce que ça change

**Une ligne de budget que je ne voyais pas.** L'annotation apparaissait
dans ma tête comme un coût de sous-traitance à minimiser. Je la vois
maintenant comme un investissement dans le plafond de performance. Mieux
rémunérer une campagne d'annotation augmente son coût immédiat, mais
peut aussi améliorer les conditions dans lesquelles la vérité terrain
est produite. Ce n'est donc pas seulement une dépense de sous-traitance
: c'est un arbitrage possible sur la qualité de tout ce qui vient après.
C'est un arbitrage de chef de projet, et il ne se pose jamais en ces
termes dans les supports.

**Trois questions avant de lancer une campagne.** Qui sont les
annotateurs, et ressemblent-ils aux gens sur qui le modèle sera utilisé
? Quel tarif horaire réel, une fois la durée mesurée sur des tâches
tests plutôt qu'estimée ? Et quel taux d'accord entre annotateurs sur un
même lot --- parce que si deux personnes ne sont pas d'accord entre
elles, la tâche est mal définie, et ce n'est pas leur faute.

**Une prudence sur ce que je viens d'écrire.** Je n'ai pas d'expérience
de terrain sur ces plateformes. Je ne sais pas si les tarifs cités sont
représentatifs, ni si les pratiques ont évolué. Ce que je décris ici,
c'est ce que la lecture croisée de mon propre support de cours donne à
voir. Si quelqu'un qui a fait tourner de vraies campagnes lit ça et me
corrige, je republierai.

Ce qui reste, indépendamment des chiffres : un jeu de données n'est
jamais une matière première neutre. C'est le produit d'un travail,
réalisé par des gens, dans des conditions, et ces conditions se
retrouvent dans le modèle. Je n'aurais pas su le formuler il y a un
mois.

## Rattachement au référentiel

Cet épisode relève du **sous-bloc BC2.1 --- De l'idée au projet IA :
détecter les opportunités et construire la démarche**, dans le bloc 2 du
titre **RNCP40875** : le budget d'annotation et le choix des conditions
de collecte sont des décisions de cadrage. Il croise **BC2.6**, sur le
test et l'optimisation, puisque la qualité de la vérité terrain fixe le
plafond de toute optimisation ultérieure.

------------------------------------------------------------------------

*Prochain épisode : un mot que mon cours emploie comme une solution ---
« gouvernance ».*
