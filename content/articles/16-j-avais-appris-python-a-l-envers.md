---
title: "J'avais appris Python à l'envers"
date: "2026-10-13"
excerpt: "Des scripts Python, une application née d'une irritation, des enfants initiés à Scratch : je pratiquais le code bien avant d'en recevoir le plan. La formation me le donne enfin — après la maison."
cover: "/images/articles/16-j-avais-appris-python-a-l-envers.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "Python"
  - "autodidacte"
  - "théorie"
  - "pratique"
  - "transmission"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 16
---
Avant d'apprendre ce qu'étaient précisément un script, un interpréteur,
une variable, une fonction ou une bibliothèque, j'en avais déjà utilisé.

J'avais écrit des scripts Python pour automatiser de petites tâches. Et
j'avais fabriqué une application, ShotCleanNext, pour répondre à un
besoin très concret : nettoyer mes captures d'écran de tout ce qui
n'était pas l'image elle-même — barres, bordures, morceaux d'interface.
Celle-là est écrite en Swift, pas en Python, et je l'ai construite à
moitié avec une IA. Mais je sais la relire, et les briques y sont les
mêmes : des variables, des fonctions, des conditions, des bibliothèques.

Je n'avais pas commencé par apprendre un langage. J'avais commencé par
le problème. Je cherchais comment faire une étape, puis la suivante.
Quand ça ne fonctionnait pas, je corrigeais. Quand le résultat
ressemblait à ce que j'attendais, j'avançais.

La pratique a donc précédé le plan qui aurait dû permettre de la
construire.

Les fiches 23, 24 et 35 viennent de me donner ce plan. Elles n'ont pas
créé ma première expérience du code. Elles ont posé des noms, des
catégories et des relations sur des gestes que j'avais déjà accomplis
sans toujours savoir les expliquer.

J'avais appris Python à l'envers.

## La maison avant le plan

La métaphore la plus juste est celle d'une maison construite avant de
recevoir les plans. Elle n'est d'ailleurs pas de moi : la fiche 28
l'emploie pour expliquer les classes. La classe est le plan de la
maison ; l'objet, la maison construite à partir de ce plan. Dans mon
cas, l'ordre était simplement inversé.

La maison tient. On peut y entrer. La porte s'ouvre. L'eau arrive au
robinet. Celui qui l'a construite sait quelle planche il a dû recouper,
quel tuyau lui a résisté et à quel endroit il a fallu recommencer trois
fois.

Puis quelqu'un déroule le plan sur la table et lui montre les murs
porteurs, les réseaux, les pièces et les règles de construction.

Ce plan éclaire tout ce qui a déjà été fait. Il explique pourquoi
certaines solutions ont fonctionné, pourquoi d'autres étaient fragiles
et comment reproduire le résultat sans repartir de la première planche.
Mais il ne remplace pas la maison. Et il ne remplace surtout pas le fait
de l'avoir construite.

C'est ce qui m'est arrivé avec Python.

Dans les fiches, j'ai découvert une progression nette. Un **langage**
fournit les règles d'écriture. Un **script** contient une suite
d'instructions. Un **interpréteur** les lit et les exécute. Une
**variable** conserve une valeur. Une **fonction** regroupe une action
réutilisable. Un **argument** lui transmet une valeur. Une
**bibliothèque** met à disposition du code déjà écrit. Un **module**
permet d'organiser ce code et de l'importer ailleurs.

Tout était rangé. Chaque mot avait sa place et chaque place expliquait
la suivante.

Ce qui m'a surpris, c'est que je ne découvrais pas entièrement ces
objets. Je reconnaissais des choses que j'avais déjà manipulées. Je les
reconnaissais comme on reconnaît, sur un plan, la pièce dans laquelle on
vit depuis longtemps.

## Mon projet le plus abouti a commencé par une irritation

Pas par un langage, ni par un cours.

J'avais des captures d'écran et je ne voulais garder que l'image utile,
sans l'interface autour. Le besoin était assez limité pour être formulé
simplement, mais assez réel pour que j'aie envie d'aller jusqu'au bout. Je ne cherchais pas à
devenir développeur. Je cherchais à obtenir un résultat que les outils
à ma disposition ne me donnaient pas directement.

C'est une différence importante, parce qu'elle a déterminé toute ma
façon d'apprendre.

Je n'ai pas demandé : « Quelles sont les notions fondamentales dont
j'aurai besoin dans six mois ? » J'ai demandé : « Quelle est la prochaine
étape qui empêche l'application de fonctionner ? »

Le parcours était local. Il suivait les obstacles dans l'ordre où ils
apparaissaient. Il fallait récupérer une image, détecter ses bordures, la
recadrer, produire un nouveau fichier, vérifier le résultat. Chaque problème appelait une
solution. Chaque solution introduisait un morceau de code. J'apprenais
juste assez pour passer à l'obstacle suivant.

Cette méthode a une force : elle oblige à confronter immédiatement le
code au réel. Une instruction ne vaut pas parce qu'elle est élégante sur
une fiche. Elle vaut parce qu'elle produit le fichier attendu sans
dégrader l'image ni perdre le résultat en route.

Elle a aussi une faiblesse : elle fabrique une connaissance trouée.
Je savais retrouver certains gestes sans savoir à quelle famille ils
appartenaient. Je pouvais reconnaître une solution déjà rencontrée et
rester incapable d'expliquer pourquoi elle fonctionnait. Je pouvais
modifier une ligne et hésiter devant le nom de l'objet que j'étais en
train de modifier.

Le résultat existait. La carte mentale, beaucoup moins.

## Ce que le vocabulaire a changé

Je me méfie parfois du vocabulaire technique, surtout quand il donne
l'impression qu'un mot compliqué remplace une explication. Ici, c'est
l'inverse qui s'est produit.

Nommer les éléments ne les a pas rendus plus savants. Cela les a rendus
reliables entre eux.

Savoir qu'une fonction reçoit des paramètres et peut renvoyer une valeur
avec `return` permet de distinguer ce qu'elle montre de ce qu'elle rend
réutilisable. Comprendre qu'une bibliothèque est du code déjà écrit
permet de ne plus la voir comme une boîte magique attachée au projet.
Identifier l'interpréteur permet de comprendre qu'une erreur ne vient
pas toujours de l'idée : elle peut venir de la manière dont le code est
lu et exécuté.

Avant, je pouvais dire : « cette partie prend l'image et fait ce dont
j'ai besoin ». Maintenant, je peux commencer à demander : quelles
données entrent ? sous quel type ? quelle fonction les transforme ? que
renvoie-t-elle ? quelle bibliothèque réalise l'opération ? où le
résultat est-il écrit ?

Ce ne sont pas seulement de meilleurs mots pour raconter après coup.
Ce sont de meilleures questions pour intervenir la fois suivante.

La théorie ne remplace donc pas la pratique passée. Elle la rend
inspectable.

## Deux formes d'incomplétude

Cette expérience m'a rappelé une situation fréquente en entreprise.

D'un côté, l'expert de terrain connaît les exceptions, les raccourcis,
les points de rupture et les personnes à appeler. Il sait faire tenir
le travail dans les conditions réelles. Mais il n'a pas toujours le
vocabulaire qui lui permet de décrire sa méthode, de la transmettre ou
de la comparer à une autre.

De l'autre, la personne formée connaît les catégories, le processus
nominal et les bonnes pratiques. Elle sait expliquer comment les choses
devraient s'enchaîner. Mais elle n'a pas encore rencontré le fichier qui
n'arrive pas au bon format, la dépendance qui change ou le cas particulier
que personne n'avait écrit dans la procédure.

Le premier peut faire sans réussir à expliquer. Le second peut expliquer
sans encore savoir faire dans toutes les conditions.

On oppose souvent les deux : l'expérience contre la théorie, le terrain
contre la formation. C'est une mauvaise opposition. Chacun possède ce
qui manque à l'autre.

Le problème commence quand l'un prend l'absence de vocabulaire pour une
absence de compétence, ou quand l'autre prend la maîtrise du vocabulaire
pour une preuve d'expérience.

J'ai d'ailleurs occupé la première position bien avant cette
formation. Quand j'initiais des enfants au code avec Scratch et
code.org, je leur faisais construire des boucles, poser des conditions,
faire varier une valeur. Ça fonctionnait : ils comprenaient la logique
et fabriquaient des choses qui marchaient. Mais je transmettais des
gestes plus qu'une carte. J'enseignais la boucle sans savoir moi-même
distinguer un paramètre d'un argument.

Mes scripts et mon application m'avaient donné une petite expérience de
terrain. Les
fiches m'ont donné les premiers éléments pour la relire. Je ne suis pas
devenu plus expérimenté en apprenant le mot « interpréteur ». Je suis
devenu plus capable de comprendre et de transmettre ce que j'avais fait.

## Ce que la théorie ne donne pas

Le risque, après avoir reçu le plan, serait de croire que tout devient
simple.

Je sais maintenant définir une variable, une fonction et une
bibliothèque. Cela ne signifie pas que je sais concevoir proprement une
nouvelle application depuis une page blanche. Je peux lire un exemple
plus précisément sans encore savoir choisir seul la meilleure structure.
Je peux comprendre une correction sans être certain de l'avoir trouvée
moi-même.

La fiche 35 consolide le vocabulaire, les types de données, les
conditions, les boucles, les fonctions, les classes et les méthodes.
C'est utile parce que l'ensemble commence à former un système. Mais
aucune définition de la boucle ne donne l'intuition du moment où elle
est préférable à une autre solution. Aucune définition de la classe ne
dit automatiquement si le problème mérite d'en créer une.

Cette partie ne s'apprend qu'en construisant, en se trompant et en
revenant sur ce qu'on a construit.

Le plan évite certaines erreurs. Il ne fait pas le chantier.

## Ce que la pratique seule ne donne pas

L'inverse est tout aussi vrai.

Si je reste uniquement dans la résolution du prochain problème, je peux
accumuler des solutions locales sans voir qu'elles répètent toutes la
même structure. Je peux copier trois fois le même traitement sans penser
à en faire une fonction. Je peux obtenir le bon résultat avec un code
difficile à relire, à tester ou à transmettre.

Surtout, je dépends de la mémoire des circonstances : je sais que cette
solution a marché cette fois-là, avec ce fichier-là, dans cet
environnement-là. Sans modèle plus général, le transfert vers un nouveau
problème reste incertain.

Le vocabulaire et la théorie servent précisément à ce transfert. Ils
permettent de reconnaître, derrière deux situations différentes, une
même opération : recevoir une entrée, vérifier son type, appliquer une
transformation, gérer un échec, renvoyer un résultat.

C'est là que les fiches changent réellement mon apprentissage. Elles ne
m'apprennent pas seulement des mots que j'ignorais. Elles réduisent la
part de hasard dans la prochaine construction.

## Ce que je change maintenant

Je ne vais pas recommencer l'apprentissage dans le « bon » ordre. Cet
ordre n'existe probablement pas.

Je vais plutôt faire circuler le travail dans les deux sens.

Quand j'apprends une notion, je cherche où je l'ai déjà rencontrée dans
une réalisation concrète. Quand je construis quelque chose, je reviens
ensuite au plan : quelles fonctions ai-je créées ? quelles données
entrent et sortent ? quelles dépendances ai-je ajoutées ? quelles règles
sont implicites ?

Je veux également reprendre mon premier projet comme un document
d'apprentissage. Pas pour le réécrire entièrement ni pour effacer les
traces du bricolage, mais pour être capable d'en faire la visite guidée.
Expliquer ce que fait chaque partie. Repérer ce qui relève d'une
bibliothèque, d'une fonction, d'une variable ou d'une condition. Dire
ce que je conserverais et ce que je structurerais autrement.

C'est peut-être le meilleur test disponible : non pas produire une
nouvelle définition de Python, mais réussir à transmettre le chemin qui
va d'un besoin réel à une solution compréhensible par quelqu'un d'autre.

## Ce que ça change dans ma façon de regarder les compétences

Je serai désormais plus prudent devant deux phrases.

La première : « il ne connaît même pas le vocabulaire ». Peut-être. Mais
que sait-il faire, dans quelles conditions, et quels problèmes a-t-il
déjà résolus ?

La seconde : « il a été formé sur le sujet ». Très bien. Mais qu'a-t-il
déjà dû construire, réparer, expliquer ou maintenir quand le cas réel
sortait du support ?

La compétence complète n'est ni dans le mot ni dans le geste. Elle
apparaît quand le geste peut être compris, reproduit, adapté et transmis.

J'avais commencé par le geste. La formation me donne maintenant les
mots et le plan. Il reste à faire ce qui compte : retourner sur le
chantier avec les deux.

## Rattachement au référentiel

Cet épisode s'inscrit dans le **bloc 2 du titre RNCP40875**, au moment du
passage à la mise en œuvre technique. Les fiches 23 et 24 posent
l'environnement et le vocabulaire de base de Python ; la fiche 35
consolide ces notions avec les types de données, les structures de
contrôle, les fonctions, les classes et les méthodes.

L'enjeu dépasse l'apprentissage d'une syntaxe. Pour piloter une solution
IA, il faut pouvoir faire le lien entre un besoin, le code qui y répond
et la manière dont ce code pourra être relu, corrigé et transmis.

------------------------------------------------------------------------

*Prochain épisode : à suivre.*
