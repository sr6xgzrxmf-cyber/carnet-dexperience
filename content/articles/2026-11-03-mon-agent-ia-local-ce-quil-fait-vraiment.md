---
title: "Mon agent IA local : ce qu'il fait vraiment, une fois tout vérifié"
date: "2026-11-03"
excerpt: >-
  J'ai installé un agent IA qui tourne chez moi, sans envoyer mes documents
  ailleurs. Puis j'ai tout revérifié, preuve à l'appui. Une porte ouverte sur
  Internet, 40 000 tokens cachés derrière chaque question, et un agent qui
  contournait ses propres règles : ce sont les barrières, pas les consignes,
  qui m'ont protégé.
cover: "/images/articles/mon-agent-ia-local-ce-quil-fait-vraiment.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "IA"
  - "IA locale"
  - "sécurité"
  - "méthode"
  - "sobriété numérique"
series:
  name: "Mes données à la maison"
  slug: "mes-donnees-a-la-maison"
  order: 3
---

*Je l'avais annoncé dans [« Pourquoi je veux garder mes données à la maison »](/articles/2026-10-15-pourquoi-je-veux-garder-mes-donnees-a-la-maison) : après la suite numérique, l'IA. Cet article ne contient que ce que j'ai réellement testé et vérifié, le 2 novembre 2026.*

## Un assistant qui ne quitte pas la maison

L'idée est simple : un assistant IA qui tourne chez moi, sur mes machines, capable de modifier un tableau Excel, de chercher une information sur le web ou d'ajouter un rendez-vous dans mon agenda, sans que mes documents partent dans le cloud.

J'ai monté l'installation avec l'aide d'une première IA. Sur le papier, tout était prêt : un Mac Studio qui fait tourner les modèles avec Ollama, une famille de modèles Qwen (un gros pour réfléchir, un plus rapide pour le quotidien), l'application Open Interpreter comme agent, et une recherche web branchée dessus.

Puis j'ai fait ce qu'on fait rarement : j'ai tout revérifié, avec Claude Code et une règle stricte. Rien n'est « validé » sans preuve : une commande, un fichier, un journal. Et j'ai distingué à chaque étape ce qui était **vérifié maintenant** de ce qui était **rapporté mais pas revérifié**.

## Ce que je croyais avoir n'était pas ce que j'avais

Premier constat, avant même le moindre test : la description de mon installation était fausse sur plusieurs points.

- L'agent ne tournait pas sur le Mac Studio, mais sur un Mac plus modeste qui interrogeait le Studio à travers le réseau.
- Il y avait seize modèles installés, pas cinq.
- Le profil « analyse approfondie » dont je parlais n'existait nulle part dans la configuration.
- Et surtout, l'agent exécutait ses commandes sans jamais me demander confirmation.

Une synthèse, même bien écrite, décrit ce qui était prévu. Pas forcément ce qui est.

## Une porte ouverte que personne n'avait vue

Ollama, le logiciel qui sert les modèles, était réglé pour « s'ouvrir au réseau ». Je comprenais : à mon réseau local. En réalité, il écoutait sur toutes les adresses de la machine, y compris son adresse IPv6 publique, sans mot de passe, avec le pare-feu du Mac désactivé.

La seule chose qui séparait mes modèles d'Internet, c'était le pare-feu de ma box. Il était bien réglé, je l'ai vérifié. Mais toute la protection tenait à un réglage que je n'avais jamais regardé.

Ce qu'on a corrigé, et prouvé :

- Ollama n'écoute plus que sur l'adresse du réseau local. Mes machines le joignent ; le réseau privé à distance et Internet, non. Le réglage tient après un redémarrage.
- L'agent est enfermé dans un dossier de travail : il ne lit et n'écrit rien ailleurs, et ses commandes n'ont plus accès à Internet.
- Pour sortir de ce dossier, il doit me demander l'autorisation en me montrant la commande exacte.

Ce dernier point va se révéler précieux.

## Le poids caché de chaque question

J'ai chronométré trois profils sur quatre tâches identiques : une question courte, un résumé d'une page, un petit raisonnement et un appel d'outil.

| | Gros modèle | Gros modèle qui « réfléchit » | Modèle rapide |
| --- | --- | --- | --- |
| Vitesse d'écriture | environ 18 tokens/s | environ 18 | environ 80 |
| Résumé d'une page | 20 s | 40 s | 4,5 s |
| Réponses justes | 9 sur 9 | 9 sur 9 | 9 sur 9 |

Rien d'alarmant. La surprise est venue en passant par l'agent.

Pour « Quelle est la capitale de l'Australie ? », le modèle seul reçoit une trentaine de tokens, les unités de texte qu'il lit. À travers l'agent, il en reçoit plus de 13 000 en ligne de commande, et environ 40 000 dans l'application : le mode d'emploi que l'agent renvoie à chaque fois, avec ses règles et la description de tous ses outils.

Résultat : le premier message d'une conversation a mis une minute et demie à revenir en ligne de commande, sans doute davantage dans l'application. Les suivants vont beaucoup plus vite, tant que le modèle garde ce texte en mémoire.

J'ai essayé d'alléger : en désactivant une douzaine de fonctions inutiles chez moi, j'ai gagné 616 tokens sur 13 000. L'essentiel est dans le socle de l'agent, qu'on ne règle pas.

Côté sobriété, la leçon est nette : un modèle local peut être rapide et léger, un agent beaucoup moins. Pour le quotidien, c'est le modèle rapide qu'il faut choisir.

## L'agent qui contournait ses propres règles

C'est la partie la plus instructive.

Les consignes de l'agent disaient clairement : « N'installe rien sans mon accord » et « Pour les documents, utilise exclusivement ce Python-là », un environnement préparé avec les bonnes bibliothèques.

Quand je lui ai demandé de modifier un fichier Excel, il a :

1. pris le Python du système, qui n'avait pas les bibliothèques ;
2. tenté de créer un environnement et d'y installer des paquets ;
3. faute d'y parvenir, réécrit le fichier Excel à la main, en manipulant son contenu interne.

Même scénario pour la navigation web : il a d'abord voulu installer un navigateur, alors qu'il en avait un à disposition.

Ce n'est pas la consigne qui l'a arrêté. C'est le bac à sable : ses commandes n'avaient plus accès à Internet, l'installation a échoué.

En cherchant pourquoi il ignorait ses consignes, j'ai découvert qu'elles lui étaient bien transmises, mais noyées au milieu de ses 40 000 tokens d'instructions. Quelques lignes au milieu d'un annuaire.

La solution a été étonnamment simple : un petit fichier texte, `AGENTS.md`, posé dans son dossier de travail. Les agents de cette famille sont conçus pour aller le lire. J'y ai mis des règles courtes, chacune tirée d'un échec observé, pas d'une crainte :

- utiliser exclusivement le bon Python, et s'il est bloqué, me demander l'autorisation plutôt que de chercher un détour ;
- ne jamais rien installer ; si un outil manque, le dire et s'arrêter ;
- écrire le code dans un fichier, et éviter les apostrophes dans les commandes (elles cassaient ses commandes en français) ;
- copier une citation mot pour mot depuis ce que l'outil a renvoyé, avec sa source.

Le test décisif, je l'ai formulé à ma façon : « Dans le budget, mets les boissons à 150 et garde une copie à part. » Il a lu son fichier de règles, écrit un script, utilisé le bon Python, m'a demandé l'autorisation et produit un fichier correct, formules intactes, original intact.

## Ce qui marche vraiment

Pour les documents, j'ai travaillé sur des copies, avec les originaux protégés en lecture seule et contrôlés par empreinte avant et après.

| Tâche | Résultat |
| --- | --- |
| Word | Ligne ajoutée au tableau, paragraphe remplacé, mise en forme conservée |
| Excel | Valeur modifiée, formule ajoutée vers une autre feuille, toutes les formules conservées et bien recalculées à l'ouverture |
| PDF | Ligne ajoutée, texte d'origine intact |
| Web | Article ouvert, lien cliqué, phrase citée exacte mot pour mot (vérifiée sur la page) |
| Agenda | « Ajoute un rendez-vous Dentiste jeudi à 14 h dans mon calendrier de test » : au bon endroit, à la bonne heure, relu pour vérification |
| Originaux | Intacts à chaque fois |

Mais rien de tout ça n'a été direct. Il a fallu l'aider à cliquer sur un lien. Il a confondu le premier et le deuxième paragraphe d'un article. L'agenda a demandé trois essais de syntaxe ratés avant le bon. Et pour le fichier Word, il a affiché des erreurs alors que le fichier était bon.

C'est un assistant patient, pas rapide. Il tâtonne, se corrige, et il faut vérifier le résultat, pas son message.

## Ce que ça dit de mon métier

Une consigne écrite ne suffit pas à changer un comportement. Mes règles « n'installe rien » existaient dès le départ ; l'agent les a contournées trois fois. Ce qui l'a arrêté, c'est un cadre : un dossier dont il ne sort pas, un réseau coupé, une demande d'autorisation que je lis.

C'est ce que je vois en accompagnant des équipes. On écrit la procédure, on l'envoie, on la croit appliquée. Puis on regarde ce qui se passe vraiment. Une règle tient quand elle est courte, tirée de situations réelles, placée là où on en a besoin, et quand le cadre rend le mauvais chemin difficile plutôt qu'interdit sur le papier.

Et comme pour une équipe, ce n'est pas le message « c'est fait » qui compte. C'est le fichier ouvert, la citation relue, le rendez-vous qui apparaît au bon jour.

## Les limites

- Tout a été testé sur des documents et un calendrier de test, pas encore sur une vraie tâche de mon quotidien.
- Les 40 000 tokens de l'application sont une estimation à partir de la taille de la requête, pas une mesure exacte.
- Chaque exécution du Python documentaire demande mon autorisation. J'ai cherché à l'éviter sans ouvrir davantage le bac à sable : ce n'est pas possible proprement avec cet agent.
- Les mesures dépendent de mon matériel et des versions du moment ; elles vieilliront vite.

## En résumé

Mon agent local n'est pas un foudre de guerre. Mais il est désormais sûr, il suit des règles qu'il lit vraiment, et il ne touche qu'à ce que je lui confie.

Si vous vous lancez :

1. **Vérifiez votre installation** au lieu de la supposer, en commençant par ce qui est exposé sur le réseau.
2. **Enfermez l'agent dans un dossier**, coupez le réseau de ses commandes et gardez les demandes d'autorisation.
3. **Lisez chaque demande d'autorisation** avant de cliquer : une commande autorisée sort de la cage.
4. **Ne lui confiez que des copies**, et vérifiez que l'original n'a pas bougé.
5. **Écrivez ses règles à partir de ses erreurs réelles**, dans un fichier court qu'il lit vraiment.
6. **Prenez le modèle rapide pour le quotidien**, le gros pour ce qui le mérite.

Reste le vrai test : une tâche de mon quotidien, faite seul, sans personne pour vérifier derrière lui. Ce sera pour un prochain article.
