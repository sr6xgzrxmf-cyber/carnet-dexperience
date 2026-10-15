---
title: "Locataire de mes outils, j'ai voulu devenir propriétaire"
date: "2026-10-15"
excerpt: >-
  Mes fichiers, mon agenda et mes visios vivaient chez des prestataires que je
  ne maîtrise pas. J'ai monté ma propre suite numérique sur un Mac, à la maison.
  Ce que j'en retiens tient moins à la technique qu'à la méthode.
cover: "/images/articles/2026-10-15-locataire-de-mes-outils-cles.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "souveraineté numérique"
  - "auto-hébergement"
  - "méthode"
  - "apprentissage"
  - "outils"
series:
  name: "Mes données à la maison"
  slug: "mes-donnees-a-la-maison"
  order: 1
---

Pendant des années, j'ai été locataire de mes outils de travail.

Mes fichiers chez un prestataire, mon agenda chez un autre, mes contacts ailleurs encore, mes visios chez un quatrième. Comme dans une location, tout fonctionne tant que le propriétaire ne change pas le règlement. Et comme dans une location, je ne savais pas vraiment ce qu'il y avait derrière les murs.

Alors j'ai voulu essayer de devenir propriétaire. Je savais qu'être propriétaire, c'est aussi découvrir la plomberie. Je n'imaginais pas à quel point.

## L'envie de départ

Le déclic est venu de La Suite Numérique de l'État, qui assemble des outils libres pour le travail collaboratif. L'idée m'a plu : des briques que l'on peut comprendre, et des données qui restent là où l'on a décidé qu'elles soient.

Je n'ai pas cherché à la reproduire. Je me suis posé une question beaucoup plus modeste : est-ce que je peux, à mon échelle, réunir mes fichiers, mon agenda, mes contacts, mes documents et mes visios sur une machine que je contrôle, sans mettre ma sécurité en danger ?

Trois jours plus tard, la réponse est oui. Avec une longue liste de « pas encore », que je raconterai aussi.

## Savoir abandonner une route qui avance bien

J'ai commencé par la solution la plus simple : mon hébergement mutualisé, celui de mon nom de domaine. Tout se passait bien. Le sous-domaine était créé, le certificat de sécurité installé, le cadenas apparaissait dans le navigateur.

Puis, au moment d'attaquer l'étape suivante, une évidence m'a arrêté : cet hébergement ne pouvait pas faire tourner la visio, ni l'édition de documents en ligne. J'aurais obtenu un espace de stockage avec un agenda, pas une suite de travail.

C'est le piège classique des projets qui avancent bien : chaque étape réussie donne envie de continuer, même quand la route ne mène pas où l'on veut aller. J'ai mis cette piste en pause, sans rien supprimer, et j'ai changé de cap le jour même : un Mac allumé en permanence, à la maison.

**Une étape réussie ne prouve pas que l'on va dans la bonne direction.** Elle prouve seulement que l'on sait marcher.

## Une maison sans porte sur la rue

Sans entrer dans la technique (je la détaille dans une fiche à part), voici l'idée.

Les outils tournent sur un Mac, chacun dans son compartiment. Ils ne sont pas publiés sur Internet. Ils vivent dans un réseau privé qui ne relie que mes appareils : mon Mac, mon iPhone, mes autres ordinateurs. Pour reprendre l'image de la maison, c'est une maison sans porte sur la rue. Seuls les appareils qui ont la clé peuvent entrer, et ils entrent par un passage qui n'existe pas pour les autres.

C'est cette idée, plus que n'importe quel logiciel, qui m'a convaincu de me lancer : je n'avais pas besoin d'ouvrir ma box à tout Internet pour accéder à mes outils depuis n'importe où.

## La box qui se souvenait d'un nom qui n'existait pas

Ma première vraie leçon est arrivée avant même le changement de cap.

Mon nouveau sous-domaine fonctionnait partout… sauf chez moi. Mon Mac affirmait que le serveur était introuvable, pendant que mon iPhone, en 4G, l'affichait sans difficulté.

L'explication m'a fait sourire. Par souci de rigueur, j'avais fait un état des lieux complet avant de commencer. J'avais donc demandé à ma box l'adresse de ce sous-domaine **avant de l'avoir créé**. La box avait poliment répondu « ce nom n'existe pas », puis elle avait gardé cette réponse en mémoire, pour une durée qui pouvait aller jusqu'à 24 heures.

Mon excès de rigueur avait fabriqué le problème que je cherchais à éviter. Il n'y avait rien à réparer : il suffisait d'attendre que la box oublie.

**Observer un système trop tôt peut changer ce qu'il nous répond.** C'est vrai d'un réseau. C'est vrai aussi d'une équipe qu'on interroge sur un changement qui n'existe pas encore.

## Le Relais privé, ou l'art d'isoler les couches

Deuxième épisode, côté iPhone. Il était bien connecté à mon réseau privé, et pourtant Safari refusait d'afficher mes outils.

J'aurais pu tout réinstaller. J'ai préféré procéder couche par couche. Le réseau fonctionnait-il ? Oui : en tapant directement l'adresse privée du serveur, celui-ci répondait. Le problème venait donc uniquement du nom.

Le coupable était une fonction de confidentialité d'Apple, le Relais privé d'iCloud. Elle confie la recherche des noms aux serveurs d'Apple, qui ignorent tout de mon petit réseau privé. Je l'ai désactivée, et tout s'est affiché. Puis le problème est revenu, parce que ce réglage se cache à trois endroits différents et que je n'avais pas vu le troisième.

C'est exactement ce que j'avais appris à l'envers pendant des années : **garder la solution qui marche, sans comprendre le diagnostic**. Cette fois, j'ai noté le diagnostic, et c'est lui qui m'a permis de retrouver tout de suite la cause quand le problème est revenu.

## Le refus qui m'a fait plaisir

Il y a un moment que je n'avais pas prévu : être ravi qu'un logiciel me dise non.

En configurant le client de synchronisation sur un autre Mac, j'ai tapé l'adresse de mon serveur un peu trop vite, en `http://` au lieu de `https://`. Le logiciel a refusé net, avec un message sec : le serveur impose une sécurité de transport stricte.

Traduction : mes outils refusent de communiquer autrement qu'en connexion chiffrée, même avec moi. C'était précisément ce que j'avais configuré. Mais une protection qu'on a configurée n'est qu'une promesse. **Une protection qui vous bloque, vous, devient une preuve.**

La veille, la protection contre les tentatives de connexion répétées m'avait déjà bloqué, après plusieurs mots de passe refusés sur l'iPhone. Agaçant sur le moment. Rassurant ensuite.

## Tester comme on accompagne

C'est la partie du projet où j'ai le plus retrouvé mon métier.

Quand j'accompagnais le déploiement d'un nouvel outil auprès d'une équipe, je savais qu'un outil qui fonctionne en démonstration n'est pas encore un outil adopté. Il faut le confronter aux vrais usages, avec les vrais appareils, dans les vraies conditions.

J'ai appliqué la même règle à mon propre projet. Pas question de crier victoire devant un écran de connexion. J'ai testé chaque usage avec l'application réelle :
- un document Word modifié en ligne, puis rouvert ;
- une photo envoyée depuis l'iPhone en 4G ;
- l'agenda et les contacts dans les applications natives de l'iPhone ;
- des fichiers synchronisés entre deux ordinateurs et le téléphone ;
- une visio entre le Mac et l'iPhone.

Presque tous les problèmes racontés ici sont apparus pendant cette recette, et aucun n'aurait été visible depuis l'écran d'accueil.

## Pourquoi ça peut vous intéresser, même si vous ne le ferez jamais

Je ne pense pas que tout le monde doive héberger ses outils chez soi. Mais je crois que cette expérience dit quelque chose d'utile à beaucoup d'indépendants et de petites structures.

**Savoir où sont vos données change votre façon de choisir vos outils.** Après ce projet, je ne lis plus les conditions d'un prestataire de la même manière. Je me demande où sont les fichiers, qui peut y accéder, et ce qui se passerait si le service s'arrêtait.

**La souveraineté numérique n'est pas réservée aux grandes organisations.** Des outils libres et éprouvés existent. Les assembler demande du temps et de la patience, pas un service informatique de cinquante personnes.

**Ce sont les outils des administrations.** Nextcloud et Jitsi ne sont pas des curiosités de passionnés. Près de chez moi, la Ville de Lyon, avec la Métropole et le SITIV, a construit une suite collaborative libre, Territoire Numérique Ouvert, qui réunit Nextcloud, Jitsi et un éditeur de documents en ligne pour des milliers d'agents. Apprendre ces outils à la maison, c'est apprendre ceux que de plus en plus de collectivités choisissent.

**La méthode est transposable à n'importe quel projet.** Accepter de changer de cap. Isoler les couches avant de tout réinstaller. Tester avec les vrais usages. Écrire ce qui n'est pas fait. Ce sont des réflexes de conduite du changement autant que d'informatique.

**Comprendre la plomberie rend meilleur client.** Même si vous restez locataire, savoir comment fonctionne un réseau privé ou un certificat vous permet de poser les bonnes questions à vos prestataires.

## L'angle mort : devenir son propre service informatique

Il faut maintenant retourner l'histoire, parce qu'elle pourrait donner une image trop flatteuse.

Être propriétaire, c'est aussi être responsable de tout. Aujourd'hui, mes outils ne sont **pas encore sauvegardés**. Si le disque du Mac lâche, je perds ce qui s'y trouve. C'est la raison pour laquelle je n'ai pas activé l'envoi automatique des photos de mon téléphone : je ne confie pas mes souvenirs à un serveur qui n'a pas de sauvegarde.

La double authentification n'est pas encore en place. La visio n'a été testée qu'à deux. L'accès pour des personnes extérieures reste à construire. Et si ma box ou mon électricité tombent, mes outils tombent avec elles.

Chez un prestataire, tout cela est inclus dans l'abonnement, souvent sans qu'on y pense. Chez soi, chaque ligne de cette liste est un chantier. **L'auto-hébergement ne supprime pas la dépendance : il la déplace vers soi-même.** C'est un choix qui se fait en connaissance de cause, pas un réflexe militant.

## Ce que je garde de ces trois jours

Je suis parti avec une question technique. J'en reviens avec une conviction de méthode.

Les outils fonctionnent, et je les utilise réellement : mes fichiers, mon agenda, mes contacts, mes documents et mes visios, sur une machine que je maîtrise. Mais ce qui m'a le plus appris, ce sont les moments où rien ne marchait : une box trop polie, un iPhone trop discret, un logiciel trop strict. Chaque fois, la solution est venue du diagnostic, jamais du réflexe.

Ce projet m'a aussi confirmé une chose sur moi-même : je sais mettre en place ces outils, les sécuriser et les faire fonctionner de bout en bout, du serveur jusqu'au téléphone. Et c'est la combinaison qui m'intéresse le plus. Former et accompagner des équipes vers de nouveaux outils, c'est mon métier depuis seize ans. Pouvoir aussi les installer, en comprendre les rouages et en expliquer les limites change la manière d'accompagner : je ne présente plus un outil comme une boîte noire, je peux dire à une équipe ce qu'il fait de ses données, et pourquoi tel réglage la protège.

Car le vrai but n'a jamais été la technique. C'était de **garder mes données chez moi**, et de savoir comment elles sont protégées. C'est aussi pour cela que mon prochain chantier suit la même logique : un serveur d'intelligence artificielle local, pour utiliser l'IA sans envoyer mes documents ailleurs. Je le raconterai dans le prochain épisode de cette série.

*Pour les curieux, l'architecture, les mesures de sécurité et l'état précis du projet sont détaillés dans la [fiche technique qui accompagne cet article](/articles/2026-10-15-fiche-technique-ma-suite-numerique-sur-un-mac).*

**Et vous, de quels outils de travail êtes-vous locataire sans l'avoir vraiment choisi, et sauriez-vous dire où sont vos données ce soir ?**
