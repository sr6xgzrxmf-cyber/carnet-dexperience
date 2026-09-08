---
title: "J'ai rangé Hadoop dans deux cases différentes"
date: "2026-09-22"
excerpt: "Deux de mes fiches associent les mêmes outils aux trois piliers du Big Data. Elles ne les associent pas pareil. J'ai cherché laquelle avait raison, et c'était la mauvaise question."
cover: "/images/articles/13-j-ai-range-hadoop-dans-deux-cases-differentes.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "Big Data"
  - "méthode"
  - "fiches de synthèse"
  - "modèles"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 13
---
## Ce que je croyais

Que les 3 V étaient une description du domaine, et que chaque V avait ses technologies.

Le module d'introduction au Big Data est construit là-dessus. Volume, Vélocité, Variété : trois piliers, trois défis, trois familles d'outils. Le Volume appelle du stockage distribué. La Vélocité appelle du traitement en flux. La Variété appelle des bases capables d'avaler autre chose que des colonnes.

C'est net, ça se retient en une lecture, et ça se met très bien dans un tableau à trois lignes. J'en ai fait un. Puis, quinze jours plus tard, sur une autre fiche, j'en ai refait un.

### Quatre mots pour lire la suite

- **Les 3 V** — Volume, Vélocité, Variété : les trois caractéristiques par lesquelles on définit habituellement le Big Data.
- **HDFS** — le système de fichiers distribué de Hadoop, qui répartit un fichier en blocs sur plusieurs machines.
- **Schema-on-read** — le fait de stocker des données brutes sans leur imposer de structure, et de ne définir cette structure qu'au moment de les lire. L'inverse du modèle relationnel, où le schéma existe avant la donnée.
- **NoSQL** — famille de bases de données qui ne suivent pas le modèle relationnel et acceptent des enregistrements de forme variable.

## Ce qui m'a fait buter

Les deux tableaux ne disent pas la même chose.

Dans le premier, la ligne Volume porte « Cloud, systèmes distribués » et la ligne Variété porte « Hadoop, NoSQL ». Dans le second, la ligne Volume porte « Cloud, bases NoSQL » et la ligne Variété porte « Hadoop, MongoDB ». Hadoop reste dans la Variété, mais NoSQL a changé de case, et je ne me souviens d'aucune décision à ce sujet.

Ma première réaction a été de chercher laquelle des deux versions était juste, pour corriger l'autre. J'ai passé un moment à argumenter pour l'une, puis pour l'autre, avec l'impression désagréable de pouvoir défendre les deux.

C'est ce moment-là qui est intéressant, et j'ai mis un jour à comprendre pourquoi : **quand on arrive à justifier les deux réponses, c'est en général qu'on répond à une question qui n'en est pas une.**

## Comment j'ai cherché

**J'ai regardé ce que fait réellement chaque outil**, au lieu de regarder dans quelle case je l'avais mis.

Hadoop, c'est d'abord HDFS : un fichier découpé en blocs répartis sur des machines ordinaires, avec réplication. C'est une réponse au Volume, sans ambiguïté. Mais HDFS accepte n'importe quoi — du texte, du JSON, des images, des logs — parce qu'il ne connaît pas la structure de ce qu'il stocke. Le schéma n'est appliqué qu'à la lecture. Autrement dit, la même propriété technique répond au Volume *et* à la Variété. Ce n'est pas une coïncidence : c'est la même décision d'architecture vue sous deux angles.

MongoDB stocke des documents de forme libre, donc Variété. Cassandra accepte aussi des schémas souples, mais son argument principal est de tenir des volumes énormes en ajoutant des machines, donc Volume. Les deux sont classées « NoSQL », et elles ne répondent pas au même V.

Spark, que mes deux fiches rangent tranquillement dans la Vélocité, est avant tout un moteur de traitement de gros volumes. Il fait du flux, mais ce n'est pas ce pour quoi on le choisit en premier.

**Le résultat est net : aucun de ces outils n'occupe une case.** Chacun répond à deux V, parfois trois, et par le même mécanisme.

**J'ai ensuite regardé le tableau lui-même.** Trois lignes, une colonne « outils associés », une cellule à remplir par ligne. La forme demande une réponse par V, et une seule. Elle ne prévoit pas « celui-ci répond aux trois », encore moins « ces deux V sont deux faces de la même contrainte ». Alors on tranche. Et comme il faut bien mettre quelque chose dans la case Variété, on y met ce qui reste.

C'est exactement ce que j'ai fait, deux fois, différemment.

**Un dernier indice m'a convaincu.** Les 3 V sont devenus 4, puis 5 — Véracité, Valeur —, et certains articles en comptent sept ou dix. Un modèle ne grossit pas comme ça. Une formule mnémotechnique, si : on peut lui ajouter des V tant qu'on trouve des mots qui commencent par V. Les 3 V sont un moyen de retenir, pas une grille d'analyse. Le tableau leur a donné un statut qu'ils n'ont pas.

## Ce que ça change

**Une règle sur mes propres tableaux.** Quand une grille impose une réponse par case, je vérifie maintenant que l'objet se range vraiment en cases. Si un même élément relève de deux lignes, le tableau est le mauvais format, ou il lui manque une colonne. Concrètement, ma fiche Big Data ne dit plus « outils associés » mais « outils qui répondent principalement à ce défi », avec une ligne dessous qui précise que la plupart en couvrent plusieurs. Deux mots et une phrase. Le tableau reste lisible et il cesse d'affirmer une chose fausse.

**Une remarque que je note pour plus tard.** Dans le premier article de ce carnet, j'écrivais que la structure identique imposée à toutes mes fiches faisait apparaître les trous, et que la moitié de ce que j'avais à raconter venait de ces cases vides. C'est vrai. Mais il y a le symétrique, et je ne l'avais pas vu : une case qu'on ne peut pas laisser vide se remplit toute seule, et personne ne verra jamais que son contenu a été fabriqué par la forme du tableau. Le trou visible est un cadeau. Le faux plein ne se signale pas.

**Une pratique de relecture.** J'ai découvert la contradiction parce que j'ai relu deux fiches ensemble, à voix haute, avec un assistant à qui je demande surtout de me contredire — c'est ce qui a fait remonter l'inversion. Ce n'est pas la finesse de la relecture qui a produit le résultat, c'est la mise côte à côte. Deux documents à moi qui se contredisent, c'est plus utile qu'un document juste : le désaccord désigne l'endroit où je n'ai pas décidé, seulement rempli.

**Une nuance, pour être juste avec mon support.** Les 3 V font leur travail. Ils donnent en trente secondes une idée de ce qui distingue le Big Data d'une grosse base de données, et cette idée est correcte. Le problème n'apparaît qu'au moment où on passe de la formule au tableau, c'est-à-dire au moment où c'est moi qui écris. L'erreur est de mon côté. Ce qui m'intéresse, c'est qu'elle n'est pas due à une inattention : elle est due à la forme que j'ai choisie, et elle se serait reproduite autant de fois que j'aurais refait le tableau.

## Rattachement au référentiel

Cet épisode relève du bloc 2 du titre **RNCP40875**, et plus précisément de **BC2.1** : choisir une brique technique suppose de savoir à quel besoin elle répond réellement, et une association outil/besoin approximative se paie au moment de l'arbitrage, pas au moment de la fiche.

------------------------------------------------------------------------

*Prochain épisode : j'ai demandé un fichier à Spark, il m'a rendu un dossier.*
