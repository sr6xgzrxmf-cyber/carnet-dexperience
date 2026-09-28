---
title: "Paramètre ou argument : je les utilisais sans les distinguer"
date: "2026-10-20"
excerpt: "J'écrivais déjà des fonctions. Le cours m'a donné deux mots pour ce que je voyais comme une seule chose — et ces deux mots changent la manière d'expliquer le code."
cover: "/images/articles/17-parametre-ou-argument-je-les-utilisais-sans-les-distinguer.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "vocabulaire"
  - "fonctions"
  - "précision"
  - "transmission"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 17
---
J'utilisais déjà des fonctions avant de savoir distinguer un paramètre
d'un argument.

Je savais reconnaître la forme générale : un nom, des parenthèses, une
ou plusieurs valeurs, puis un résultat. Je pouvais modifier ce qui
entrait dans la fonction et observer ce qui changeait à la sortie.

Pour moi, ce qui se trouvait entre les parenthèses portait un seul nom.
Ou plutôt, cela n'en portait aucun. C'était « ce qu'on met dans la
fonction ».

Puis une fiche a posé deux mots là où je ne voyais qu'une seule chose.

```python
def multiplier(nombre1, nombre2):
    return nombre1 * nombre2

resultat = multiplier(4, 5)
```

Dans la définition, `nombre1` et `nombre2` sont des **paramètres**. Ils
désignent les places prévues par la fonction.

Dans l'appel, `4` et `5` sont des **arguments**. Ce sont les valeurs
concrètes placées à cet instant dans les places prévues.

Je me suis dit : *ah, c'est ça que ça s'appelle*.

## Je savais faire, pas nommer

La distinction paraît minuscule. Dans beaucoup de conversations, les
deux mots sont d'ailleurs employés l'un pour l'autre sans que le
programme cesse de fonctionner.

Mon code ne marchait pas moins bien quand je les confondais. Python ne
refuse pas une fonction parce que son auteur ne sait pas expliquer le
vocabulaire qui la décrit.

Mais la confusion devient visible dès qu'il faut parler avec quelqu'un.

Dire « change le truc dans les parenthèses » peut suffire quand je suis
seul devant mon écran et que je sais exactement quelle ligne je regarde.
La phrase devient inutilisable dès qu'une autre personne doit savoir si
je parle de la définition de la fonction ou de l'une de ses
utilisations.

« Ajoute un paramètre à la fonction » signifie : change ce que la
fonction prévoit de recevoir.

« Passe cet identifiant comme argument » signifie : donne cette valeur
précise au moment de l'appel.

Les deux actions ne se font pas au même endroit et n'ont pas la même
portée. Il ne s'agit donc pas de deux mots savants pour embellir une
explication. Ils évitent une ambiguïté réelle.

## Le mot montre la structure

Avant cette distinction, je voyais surtout une fonction en mouvement.
Je lui donnais quelque chose, elle faisait quelque chose, j'obtenais un
résultat.

Le vocabulaire m'a fait voir sa structure.

Le paramètre appartient au contrat de la fonction. Il annonce ce dont
elle aura besoin, sans connaître encore la valeur qui arrivera. Il rend
la fonction générale : `multiplier` ne sait pas à l'avance si elle
recevra 4 et 5, 10 et 20, ou deux variables calculées ailleurs.

L'argument appartient à une situation. C'est la valeur choisie ici, au
moment où le programme appelle la fonction.

L'un décrit une possibilité. L'autre la réalise.

Cette séparation explique précisément pourquoi une fonction est
réutilisable. Si les valeurs étaient écrites directement dans son corps,
elle ne ferait qu'un seul calcul. Parce qu'elle déclare des paramètres,
elle peut recevoir des arguments différents à chaque appel.

Je connaissais l'effet. Il me manquait le mécanisme conceptuel.

## Nommer permet de diagnostiquer

La précision du vocabulaire ne sert pas seulement à enseigner. Elle aide
aussi à chercher une erreur.

Si une fonction attend deux paramètres et que je ne lui passe qu'un
argument, le problème est dans l'appel. Si je veux qu'elle accepte une
information supplémentaire dans tous les cas, je dois modifier sa
définition. Si une valeur arrive au mauvais endroit, il faut regarder
l'ordre ou la manière dont les arguments sont associés aux paramètres.

Sans les mots, tout cela reste « un problème avec les parenthèses ».

Avec eux, la zone de recherche se réduit. Je peux formuler ce qui se
passe, donc poser une question plus précise, lire un message d'erreur
avec davantage de repères et expliquer la correction sans montrer
seulement la bonne ligne.

Cela rejoint ce que j'observe depuis le début de cette formation : une
notion est réellement utile quand elle améliore les questions que je
peux poser.

## Le vocabulaire ne prouve pas la compétence

Il faut pourtant éviter le mouvement inverse.

Connaître la différence entre un paramètre et un argument ne prouve pas
que je sais concevoir une bonne fonction. Je peux réciter les définitions
et écrire une fonction trop longue, mal nommée ou impossible à
réutiliser. Je peux savoir que `return` renvoie une valeur et ne pas
savoir quelle valeur la fonction devrait réellement promettre.

Le mot ne remplace pas le geste.

Dans l'article précédent, j'écrivais que j'avais appris Python à
l'envers : une première réalisation avant le plan. Cet épisode en est
une conséquence directe. J'avais déjà manipulé la différence sans la
voir. La formation ne m'apprend pas que l'on peut transmettre des
valeurs à une fonction ; elle m'apprend à décrire proprement la relation
entre la fonction et ces valeurs.

C'est moins spectaculaire qu'un nouveau programme. C'est ce qui rend un
programme transmissible.

## La précision comme geste collectif

Dans une équipe, une langue commune réduit le nombre de choses qu'il
faut montrer du doigt.

Ce principe vaut bien au-delà du code. Un expert terrain peut accomplir
un geste très précis avec des mots approximatifs parce que le contexte
lui fournit le reste. La personne qui apprend à distance, lit une
documentation ou reprend le travail six mois plus tard ne dispose pas
de ce contexte.

Nommer oblige alors à séparer ce qui semblait confondu : la règle et son
application, le modèle et le cas, la place prévue et la valeur donnée.

Ce n'est pas le vocabulaire qui crée l'expérience. C'est lui qui permet
à l'expérience de circuler sans perdre sa structure.

## Ce que je change

Je vais reprendre mes fonctions avec quatre questions simples :

- Quels sont les paramètres annoncés par la fonction ?
- Quels arguments lui sont réellement transmis à chaque appel ?
- Que renvoie-t-elle, au lieu de seulement l'afficher ?
- Quelqu'un d'autre peut-il comprendre ce contrat sans lire tout le
  programme ?

Je veux aussi surveiller ma manière d'expliquer. Chaque fois que je dis
« le truc », « la valeur là » ou « ce qu'on met dedans », il y a peut-être
un mot utile que je n'ai pas encore acquis — ou une distinction que je
n'ai pas encore faite.

Le but n'est pas de parler comme un manuel. Le but est que la personne
en face puisse agir sans avoir besoin de voir exactement ce que je
montre.

Nommer ce que l'on fait n'est pas une décoration posée sur la pratique.
C'est l'une des conditions pour la transmettre.

## Rattachement au référentiel

Cet épisode relève du **bloc 2 du titre RNCP40875**, dans l'apprentissage
des bases nécessaires pour lire et piloter une mise en œuvre technique.
Les fiches 24 et 25 posent le vocabulaire ; les fiches 28 et 32 montrent
les fonctions en action, avec leurs paramètres, leurs arguments et leurs
valeurs de retour.

------------------------------------------------------------------------

*Prochain épisode : le venv, ou l'erreur que j'ai longtemps contournée.*
