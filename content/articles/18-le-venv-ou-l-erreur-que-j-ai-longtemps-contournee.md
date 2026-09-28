---
title: "Le venv, ou l'erreur que j'ai longtemps contournée"
date: "2026-10-27"
excerpt: "J'avais appris à relancer, réinstaller ou changer d'outil jusqu'à ce que ça marche. Le cours m'a enfin montré pourquoi une bibliothèque pouvait être installée et rester introuvable."
cover: "/images/articles/18-le-venv-ou-l-erreur-que-j-ai-longtemps-contournee.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "venv"
  - "environnement"
  - "VS Code"
  - "autodidacte"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 18
---
J'ai longtemps traité les problèmes d'installation comme on traite une
porte qui ferme mal : en apprenant le geste qui permet quand même de
l'ouvrir.

Relancer l'éditeur. Réinstaller la bibliothèque. Fermer le terminal.
Changer l'interpréteur jusqu'à ce que l'erreur disparaisse. Reprendre la
commande trouvée la fois précédente.

Je n'ai pas conservé le message exact de la première galère. C'est déjà
une information sur ma manière d'apprendre à l'époque : je gardais la
solution qui avait fonctionné, pas le diagnostic.

La fiche sur l'installation de Python a posé un mot sur la cause que je
contournais : **l'environnement virtuel**, ou `venv`.

## Installé où ? Exécuté par quoi ?

Le scénario est déroutant quand on débute.

On installe une bibliothèque. La commande confirme que tout s'est bien
passé. Puis le programme répond qu'il ne trouve pas cette bibliothèque.

Les deux affirmations semblent incompatibles. Si elle est installée,
elle devrait être disponible.

La phrase oublie pourtant une question : installée **dans quel
environnement** ?

Un ordinateur peut contenir plusieurs installations de Python et
plusieurs ensembles de bibliothèques. VS Code peut exécuter le fichier
avec un interpréteur tandis que le terminal utilise un autre Python.
Jupyter peut faire tourner le notebook avec un kernel encore différent.

La bibliothèque est bien installée. Simplement, elle ne l'est pas dans
l'environnement qui exécute le code.

Le problème n'est donc pas une absence. C'est une séparation invisible.

## Ce que fait réellement un venv

Un environnement virtuel crée un espace propre à un projet. Il associe
ce projet à une version de Python et à un ensemble déterminé de
bibliothèques, sans mélanger automatiquement le tout avec les autres
projets de la machine.

Cette isolation répond à un problème très concret. Un projet peut avoir
besoin d'une version d'une bibliothèque, un autre d'une version plus
récente. Si tout est installé au même endroit, mettre le second à jour
peut casser le premier.

Le `venv` n'est donc pas une formalité ajoutée pour compliquer le
démarrage. C'est une frontière.

À l'intérieur : les dépendances de ce projet.

À l'extérieur : celles des autres projets et du système.

La fiche 26 me l'a présenté comme un concept d'environnement. La fiche
27 a donné le rôle de VS Code : sélectionner l'interpréteur, utiliser le
terminal intégré, exécuter un notebook ou un fichier `.py`. La fiche 35
a remis les mots ensemble — environnement virtuel, kernel,
terminal.

Tout à coup, plusieurs astuces apprises empiriquement formaient une seule
explication.

## J'avais une solution, pas la cause

L'autodidacte développe vite des procédures de survie.

Il sait que telle commande doit être lancée avant telle autre. Que le
terminal doit parfois être rouvert. Qu'un menu de VS Code permet de
choisir un autre Python. Que la réinstallation finit souvent par faire
disparaître le message.

Ces astuces ont de la valeur. Elles viennent d'une confrontation réelle
avec l'outil. Elles évitent de rester bloqué et permettent de terminer le
travail.

Mais elles deviennent fragiles si elles ne sont reliées à aucune cause.
Elles marchent dans un ordre précis, sur une machine précise, parfois
sans que l'on sache quelle étape a réellement corrigé le problème.

Réinstaller une bibliothèque dans le mauvais environnement peut même
renforcer la confusion : la commande réussit une deuxième fois, et le
programme échoue toujours.

Je connaissais le détour qui m'avait permis de continuer. Je ne savais
pas dessiner la route.

## Le terrain et la compréhension de fond

Il serait facile de conclure que la théorie vaut mieux que l'astuce.
Ce serait faux.

La compréhension d'un environnement virtuel ne dispense pas de savoir
lire ce que VS Code utilise réellement, de repérer le terminal actif ou
de vérifier le kernel d'un notebook. Inversement, savoir cliquer au bon
endroit ne garantit pas que l'on saura reproduire le réglage sur un
nouveau projet.

Le terrain donne les signaux : ici, ça casse ; cette action débloque ;
ce projet se comporte différemment de l'autre.

La théorie donne le modèle qui relie ces signaux : plusieurs
interpréteurs, plusieurs environnements, des dépendances isolées, un
éditeur qui doit savoir lequel utiliser.

Avec les deux, le dépannage change de nature. Je ne lance plus une série
de gestes jusqu'à ce que l'erreur disparaisse. Je peux vérifier une
hypothèse : quel Python exécute ce fichier ? où la bibliothèque a-t-elle
été installée ? quel kernel exécute cette cellule ?

La différence tient dans ce passage du rituel au diagnostic.

## Une erreur peut disparaître sans être comprise

C'est probablement le point le plus utile de cet épisode.

Quand une erreur disparaît, on a tendance à considérer le problème
comme réglé. Pour le travail immédiat, c'est vrai. Pour l'apprentissage,
pas toujours.

Si je ne sais pas laquelle de mes actions a résolu le problème, je n'ai
pas gagné une méthode. J'ai seulement obtenu un répit.

Cette règle vaut au-delà de Python. Une automatisation repart après un
redémarrage. Un fichier s'ouvre après une conversion. Un accès revient
après avoir changé trois réglages. Tant que la cause reste inconnue, le
résultat est difficile à reproduire, à sécuriser et à transmettre.

Le `venv` m'intéresse donc moins comme commande que comme rappel : deux
choses peuvent porter le même nom — « Python », « la bibliothèque »,
« le terminal » — et appartenir à des contextes différents.

## Ce que je change

Pour chaque nouveau projet Python, je veux désormais rendre
l'environnement visible :

- créer un environnement propre au projet ;
- vérifier quel interpréteur VS Code utilise ;
- installer les bibliothèques depuis le terminal de cet environnement ;
- vérifier le kernel lorsqu'il s'agit d'un notebook ;
- conserver la liste des dépendances nécessaires ;
- noter le message d'erreur exact avant de tenter plusieurs corrections.

La dernière ligne est aussi importante que les autres. Une erreur
recopiée fidèlement permet de comparer, de chercher et d'expliquer. Une
erreur résumée de mémoire devient vite « Python ne marche plus ».

Je continuerai probablement à utiliser des astuces de terrain. Mais je
veux savoir, chaque fois que possible, quelle cause elles traitent.

Contourner permet de finir aujourd'hui. Comprendre permet de ne pas
recommencer demain.

## Rattachement au référentiel

Cet épisode relève du **bloc 2 du titre RNCP40875**, dans la préparation
d'un environnement de développement fiable. Les fiches 26 et 27
présentent l'installation de Python, VS Code, Jupyter, les interpréteurs
et les environnements virtuels ; la fiche 35 consolide ce vocabulaire.

------------------------------------------------------------------------

*Prochain épisode : 79 caractères, la règle que personne ne m'avait donnée.*
