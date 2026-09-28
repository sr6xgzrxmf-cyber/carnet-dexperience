---
title: "79 caractères : la règle que personne ne m'avait donnée"
date: "2026-11-03"
excerpt: "Mon code pouvait fonctionner tout en restant difficile à reprendre. PEP 8 m'a rappelé qu'un programme n'est pas seulement exécuté par une machine : il est relu par des personnes."
cover: "/images/articles/19-79-caracteres-la-regle-que-personne-ne-m-avait-donnee.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "PEP 8"
  - "normes"
  - "lisibilité"
  - "collaboration"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 19
---
La règle tient en une ligne : en Python, PEP 8 recommande de limiter la
longueur du code à 79 caractères.

Ma première réaction a été de me demander pourquoi 79.

Ma deuxième a été plus utile : pourquoi personne ne m'avait-il jamais
donné ce genre de règle quand j'apprenais seul ?

J'avais appris à vérifier qu'un programme s'exécute, qu'il produit le
bon fichier et qu'il ne s'arrête pas sur une erreur. Je n'avais pas
appris à regarder une ligne en me demandant si une autre personne aurait
envie de la lire.

Le code marchait. La question posée par PEP 8 est différente : pouvait-il
être repris ?

## Une limite qui ne vient pas de la machine

Python peut exécuter une ligne bien plus longue que 79 caractères. La
limite n'est pas une contrainte technique du langage. Elle ne rend pas
le calcul plus juste et n'accélère pas le programme.

Elle s'adresse au lecteur.

Une ligne courte peut être lue sans faire défiler horizontalement
l'écran. Deux fichiers peuvent être affichés côte à côte. Une différence
entre deux versions reste visible. Une instruction complexe est obligée
de montrer ses morceaux plutôt que de les cacher dans une phrase
continue.

Le nombre exact compte moins que le déplacement qu'il provoque. Pour la
première fois, une règle de mon cours ne cherchait pas à dire à la
machine quoi faire. Elle cherchait à faciliter le travail de la personne
qui viendrait après.

## Relire un ancien script autrement

J'ai repensé à mes premiers scripts, écrits pour résoudre mon propre
problème.

Tant que j'en étais l'unique lecteur, beaucoup de décisions restaient
dans ma tête. Je savais ce que désignait une variable parce que je
venais de la créer. Je savais pourquoi une étape arrivait là parce que
j'avais essayé les autres positions. Je pouvais tolérer une longue ligne
ou un nom imprécis : le contexte était encore frais.

Vu avec les yeux de PEP 8, le critère change.

Les variables sont-elles nommées en `snake_case` ? Les arguments sont-ils
séparés par des espaces ? Les opérateurs respirent-ils ? L'indentation
est-elle régulière ? Les commentaires expliquent-ils une intention ou
répètent-ils simplement le code ? Une fonction possède-t-elle une
docstring qui annonce ce qu'elle reçoit et ce qu'elle renvoie ?

Aucune de ces questions ne prouve que le programme fonctionne. Elles
montrent s'il laisse des prises à quelqu'un d'autre.

Mon ancien critère était : « je peux le relancer ».

Le nouveau devient : « quelqu'un peut-il comprendre où intervenir sans
devoir reconstruire tout mon raisonnement ? »

## Le style n'est pas la décoration

Le mot *style* prête à confusion. Il évoque une préférence personnelle,
comme choisir une couleur ou une police.

PEP 8 ne fonctionne pas ainsi. Le guide propose des conventions
partagées : nommage, indentation, espaces, longueur des lignes,
organisation des imports. Chacune pourrait être différente. Leur valeur
vient surtout du fait qu'elles sont connues par plusieurs personnes.

Si chacun invente sa propre convention, chaque fichier oblige le lecteur
à apprendre une nouvelle langue locale. Le programme peut être correct,
mais l'équipe paie un coût de traduction permanent.

Une norme réduit ce coût. Elle rend certaines décisions prévisibles et
libère l'attention pour les vraies questions : que fait cette fonction ?
pourquoi cette condition existe-t-elle ? quel cas n'est pas traité ?

La forme commune ne remplace pas le raisonnement. Elle évite que le
raisonnement soit caché par la forme.

## 79 caractères ne suffisent pas

Il serait absurde de transformer cette règle en test absolu.

Un code peut respecter chaque espace de PEP 8 et rester incompréhensible.
Une fonction de deux cents lignes ne devient pas claire parce que
chacune en compte moins de 79 caractères. Un mauvais nom reste mauvais,
même écrit en `snake_case`.

À l'inverse, certaines lignes peuvent raisonnablement dépasser la limite.
Le guide lui-même prévoit des adaptations. Une convention sert le
travail ; elle ne doit pas devenir un moyen d'éviter de réfléchir.

La vraie leçon n'est donc pas « couper toutes les lignes au caractère
80 ». Elle est : le code possède un destinataire humain, et sa forme
doit tenir compte de lui.

## Le lien avec la transmission

Dans les métiers où l'expérience compte, une grande partie du savoir
reste implicite. La personne expérimentée agit vite parce qu'elle voit
des indices que les autres ne remarquent pas encore.

Le risque est de laisser le résultat sans les prises qui permettraient
de comprendre le chemin.

Le code amplifie ce problème. La machine peut exécuter une suite
d'instructions opaque sans demander la moindre explication. Elle donne
ainsi l'illusion qu'un résultat fonctionnel est un résultat terminé.

Pour une équipe, ce n'est pas vrai. Le travail continue quand il faut
corriger, tester, faire évoluer, auditer ou transmettre.

PEP 8 est une langue commune pour cette continuité. Pas la seule, pas
suffisante, mais concrète jusque dans la longueur d'une ligne.

## Ce que je change

Je veux ajouter une étape à mes vérifications.

Après « est-ce que ça fonctionne ? », poser « est-ce que quelqu'un
d'autre peut le relire ? ».

Cela signifie appliquer un formatage cohérent, choisir des noms qui
portent le sens, découper ce qui devient trop dense, documenter les
fonctions et supprimer les commentaires qui ne font que traduire une
instruction évidente.

Cela signifie aussi accepter qu'une relecture n'est pas un jugement sur
l'auteur. Elle teste ce que le code rend visible à une personne qui ne
possède pas le contexte de sa création.

La règle des 79 caractères m'a paru arbitraire pendant quelques minutes.
Elle est devenue le symbole d'une bascule : seul, j'écrivais pour obtenir
un résultat ; dans un collectif, j'écris aussi pour que ce résultat
puisse continuer sans moi.

## Rattachement au référentiel

Cet épisode relève du **bloc 2 du titre RNCP40875**, dans les pratiques
de développement qui rendent une solution maintenable et transmissible.
La fiche 31 présente PEP 8, les conventions de nommage, l'indentation,
les commentaires, les docstrings et la documentation Markdown.

------------------------------------------------------------------------

*Prochain épisode : ce que le cours ne montre pas.*
