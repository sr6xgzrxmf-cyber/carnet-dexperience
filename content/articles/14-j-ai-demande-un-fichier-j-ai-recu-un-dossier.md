---
title: "J'ai demandé un fichier, j'ai reçu un dossier"
date: "2026-09-29"
excerpt: "La dernière ligne du module PySpark sauvegarde un résultat en CSV. Elle m'a rendu un répertoire de fragments. Ce n'était pas une erreur : c'était le cours qui parlait."
cover: "/images/articles/14-j-ai-demande-un-fichier-j-ai-recu-un-dossier.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "Spark"
  - "PySpark"
  - "calcul distribué"
  - "pédagogie"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 14
---
## Ce que je croyais

Que PySpark, c'était pandas en plus gros.

Le module est rassurant. On installe, on ouvre une session, on charge un CSV, on regarde les premières lignes, on filtre, on ajoute une colonne calculée, on groupe, on sauvegarde. Les noms sont familiers : `select`, `filter`, `groupBy`. La syntaxe est celle que je connais. J'ai suivi les huit étapes sans accrocher une seule fois, et j'ai coché le module.

Puis j'ai exécuté la dernière ligne : `df.write.csv('résultat.csv')`.

### Quatre mots pour lire la suite

- **Partition** — un morceau du jeu de données, confié à une machine du cluster. Un DataFrame Spark n'existe jamais en un seul endroit.
- **Transformation / action** — une transformation décrit un traitement sans le lancer ; une action déclenche l'exécution de tout ce qui a été décrit avant.
- **Évaluation paresseuse** — le fait que Spark n'exécute rien tant qu'aucune action n'est appelée.
- **Coalesce** — l'opération qui réduit le nombre de partitions, par exemple pour tout ramener sur une seule machine.

## Ce qui m'a fait buter

Spark n'a pas créé de fichier. Il a créé un dossier, nommé `résultat.csv`, contenant `part-00000-…csv`, `part-00001-…csv`, et un fichier vide appelé `_SUCCESS`.

Mon premier réflexe a été de chercher ce que j'avais mal tapé. Le second, une fois établi que je n'avais rien mal tapé, a été de chercher l'option qui produit un vrai fichier — j'ai trouvé, ça existe, on y vient plus loin.

Le troisième réflexe est arrivé beaucoup plus tard, et c'est le seul qui valait quelque chose : **ce dossier de fragments n'est pas un défaut de l'outil, c'est la démonstration du cours que je venais de suivre.**

Le module m'avait expliqué pendant vingt minutes que Spark découpe les données en partitions réparties sur plusieurs machines, et que c'est de là que vient sa vitesse. Un fichier de sortie unique supposerait de rapatrier toutes les partitions sur une seule machine avant d'écrire — exactement ce que l'architecture est faite pour éviter. Chaque machine écrit son morceau, en parallèle, là où elle est. Le dossier de `part-` est ce à quoi ressemble un calcul distribué quand il se termine.

J'avais compris cette phrase. Je ne l'avais pas crue.

## Comment j'ai cherché

**J'ai commencé par le fichier vide.** `_SUCCESS` ne contient rien, et c'est tout son intérêt. Dans un système distribué, un répertoire à moitié écrit ressemble exactement à un répertoire complet : des fichiers, tous valides. Rien ne permet de savoir, en le regardant, si les machines ont toutes terminé ou si trois d'entre elles sont tombées en route. Le marqueur vide est la seule façon de dire « le job s'est terminé entièrement ». Sur un disque local, la question ne se pose pas. Ici, il faut un fichier pour y répondre.

**J'ai relancé la commande.** Elle a échoué : le répertoire existait déjà. En local, on écrase sans y penser. Ici, l'écrasement est un choix explicite — `mode('overwrite')` — parce que détruire un résultat réparti sur des dizaines de machines n'est pas une opération anodine. Deuxième différence, même origine.

**J'ai trouvé la solution au fichier unique, et compris pourquoi elle est un piège.** `df.coalesce(1).write…` fonctionne : Spark ramène tout sur une machine et écrit un fichier. Sur mon jeu de données d'exercice, c'est instantané. Sur un vrai volume, c'est demander à une seule machine d'absorber ce que le cluster entier vient de traiter — le calcul est distribué, l'écriture ne l'est plus, et la machine choisie devient le goulot. La commande qui rend le résultat « normal » est celle qui annule le bénéfice de l'outil.

**Je suis remonté en arrière, et j'ai découvert que je m'étais fait avoir plus tôt.** Ma cellule `groupBy('ville').avg('depense')` s'était exécutée en une fraction de seconde et je l'avais notée comme « rapide ». Elle n'était pas rapide : elle n'avait rien fait. C'est une transformation, elle décrit un traitement sans le lancer. Le calcul a eu lieu au moment du `write`, tout d'un coup, avec le reste. Là encore, le code ressemblait à du pandas, donc je l'avais lu comme du pandas — c'est-à-dire comme si chaque ligne s'exécutait quand je l'écris.

**Le motif se répète.** Trois surprises, une seule cause : une API distribuée présentée avec la syntaxe d'une API locale. Chaque fois que Spark cesse de se comporter comme pandas, c'est précisément à l'endroit où le concept distribué se trouve. Les points de friction ne sont pas des scories du cours : ce sont ses seuls contenus réels.

## Ce que ça change

**Une méthode pour aborder tout outil distribué.** Je pose désormais trois questions avant de me fier à la ressemblance syntaxique : où sont physiquement les données, quand le calcul a-t-il lieu, et que se passe-t-il si une machine tombe. Sur Spark, les trois réponses — en partitions, à l'action, on recalcule à partir du lignage — expliquent à elles seules la totalité de ce qui m'a surpris.

**Une phrase ajoutée à ma fiche.** J'ai réécrit la section export : nom de dossier et non de fichier, `mode('overwrite')` explicite, `coalesce(1)` mentionné avec son coût. Et un point de vigilance qui dit ce que le support ne dit pas : `write.csv()` ne produit pas un fichier. Cinq mots. C'est la troisième ou quatrième fois dans ce carnet que la correction tient en une phrase, toujours du même type — celle qui dit ce qui va se passer quand on quittera l'exemple.

**Une prudence sur la simplification pédagogique.** Je ne reproche pas au module d'avoir choisi une syntaxe familière : c'est ce qui m'a permis de tout suivre sans décrocher, et c'est un vrai service. Mais ce confort a un prix, et le prix n'est pas signalé. Quand un outil distribué est enseigné avec les gestes d'un outil local, l'apprenant n'apprend pas le calcul distribué — il apprend pandas avec un préfixe, et il découvrira la différence au premier passage à l'échelle, c'est-à-dire au pire moment.

**Le lien avec l'épisode précédent.** La fois d'avant, une grille m'avait fait fabriquer une réponse fausse parce qu'elle ne prévoyait pas de case vide. Ici, une syntaxe m'a fait fabriquer une compréhension fausse parce qu'elle ne prévoyait pas de dépaysement. Dans les deux cas, ce n'est pas le contenu qui m'a trompé : c'est la forme, choisie pour être confortable, et le confort ne se signale pas comme une hypothèse.

## Rattachement au référentiel

Cet épisode relève du bloc 2 du titre **RNCP40875**. Il touche à la mise en œuvre technique d'une solution de traitement de données : savoir qu'une commande d'apparence anodine produit une sortie non conforme aux attentes d'un système aval fait partie des points sur lesquels un chef de projet doit pouvoir interroger son équipe. *[Sous-bloc BC2.x à préciser.]*

------------------------------------------------------------------------

*Prochain épisode : journal du mois 4.*
