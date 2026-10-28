---
title: "Configurer un Stream Deck avec une IA : lire les fichiers plutôt que regarder l'écran"
date: "2026-10-29"
excerpt: >-
  Deux essais pour configurer mon deck de raccourcis avec une IA. Le premier
  regardait l'écran et n'a rien réglé. Le second a lu les fichiers de réglages
  et vérifié chaque touche. Ce n'est pas tant l'outil que la méthode qui a
  changé.
cover: "/images/articles/2026-10-29-stream-deck-ia.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "IA"
  - "outils"
  - "méthode"
  - "sobriété numérique"
  - "adoption"
---

## Un petit boîtier, beaucoup de frustration

J'ai un deck façon Stream Deck, un SOOMFON XF-CN001 : 15 touches à écran et une barre d'affichage, piloté sur Mac par le logiciel Stream Controller. Sur le papier, c'est parfait pour lancer mes applis, contrôler les lumières de la maison via Home Assistant et gagner du temps.

Dans les faits, l'interface du logiciel est confuse, certaines actions ne s'enregistrent pas et rien n'indique pourquoi une touche ne fait rien. J'ai donc demandé de l'aide à une IA. Deux fois, avec deux méthodes très différentes, et deux résultats très différents.

Je précise d'emblée : ce n'est pas un match entre deux marques. Les deux IA savent faire les deux approches. Ce n'est pas tant l'outil que la méthode qui a changé. Et en chemin, j'ai retrouvé une règle que j'applique depuis des années avec les équipes que j'accompagne.

## Premier essai : l'IA regarde l'écran

Mon premier réflexe a été ChatGPT. Il a choisi l'approche la plus intuitive : piloter l'application comme un humain, en regardant l'écran, capture après capture, puis en cliquant.

Le problème, c'est qu'une capture d'écran coûte très cher en tokens, et qu'il en faut une à chaque clic pour vérifier ce qui a changé. Le pilotage de l'interface plantait régulièrement, avec des erreurs comme `noWindowsAvailable` ou `windowNotFoundAtPosition`. Je devais faire moi-même des captures pour lui montrer où agir.

Au bout du compte, quelques boutons étaient vaguement placés, mais aucun ne fonctionnait. Et j'ai épuisé mon quota avant que le deck soit configuré.

## Deuxième essai : l'IA lit les fichiers

J'ai repris le même problème avec Claude Code, dans l'app Claude sur Mac. Son premier geste a été différent : au lieu de regarder l'interface, il est allé chercher les fichiers où Stream Controller enregistre ses réglages.

Chaque page du deck est un simple fichier texte (JSON) sur le disque. On y lit chaque touche : sa position, son action, son icône, ses paramètres. Un fichier se lit en une fois, et on n'en extrait que les lignes utiles. C'est beaucoup moins coûteux qu'une série de captures.

Sa méthode, en quatre gestes :

1. Lire les réglages réellement enregistrés, et le journal de bord de l'application.
2. Fermer l'application, sauvegarder une copie, modifier le fichier, relancer.
3. Observer ce que reçoivent les modules complémentaires (Home Assistant, météo) au moment où j'appuie sur une touche.
4. Me demander un appui précis sur le deck, et vérifier le résultat côté ordinateur avant de dire que ça marche.

## Les vraies pannes, trouvées dans les fichiers

Aucune de ces pannes n'était visible dans l'interface. Toutes l'étaient dans les fichiers ou le journal de l'application.

| Touche | Ce qui se passait vraiment | Correction |
| --- | --- | --- |
| Lampe (Home Assistant) | Le deck n'envoie que le relâchement de la touche ; le module attendait aussi l'appui et ignorait tout | Une ligne modifiée dans le module |
| Nouveau mail | L'adresse du message n'avait jamais été enregistrée : le champ était vide | Ouvrir Mail, puis ⌘N |
| Météo | Le service météo d'origine ne trouvait plus les villes, d'où un « Timeout » | Passage à un autre service météo |
| WhatsApp, ChatGPT | L'app passait au premier plan sans rouvrir de fenêtre | Un petit lanceur qui rouvre la fenêtre |
| Lecture, volume | macOS bloque l'ancienne méthode ; le volume changeait sans indicateur visible | Envoi des vraies touches multimédia du clavier |
| Verrouiller | Le raccourci ⌃⌘Q n'était pas pris en compte depuis le deck | Appel direct du verrouillage de macOS |

Le cas de la lampe résume bien l'approche. Home Assistant fonctionnait, l'accès aussi, la bonne lampe était configurée. En écoutant ce que recevait le module pendant un appui, Claude a vu arriver le relâchement de la touche, mais jamais l'appui. Sans cette observation, on aurait continué à resauvegarder le réglage indéfiniment.

## Ce que fait le deck aujourd'hui

Le deck compte maintenant 5 pages : accueil, maison, travail, montage vidéo et fichiers. J'y lance mes applis, je pilote les lumières, les volets et le ventilateur, je suis le CO₂ ou les niveaux d'encre, et la barre d'affichage donne le calendrier, la météo locale et l'heure.

Dernier détail : le deck ne fonctionne que si Stream Controller est ouvert. Le Mac le relance désormais tout seul s'il est fermé.

## Ce que j'en retiens

Passer par les fichiers plutôt que par l'écran n'est pas seulement moins cher. C'est plus juste : l'interface montre ce que l'app affiche, le fichier montre ce qu'elle a réellement enregistré.

- **Moins de tokens** : un fichier se lit une fois, une capture se paie à chaque clic. Moins de calcul, c'est aussi moins d'énergie consommée.
- **Plus fiable** : pas de fenêtre introuvable ni de clic raté.
- **Réversible** : une sauvegarde avant chaque modification, et quinze touches modifiées d'un coup.
- **Diagnostiquable** : le journal de l'application et ce que reçoivent les modules disent pourquoi une touche ne fait rien.

Les limites sont réelles aussi. L'IA ne voit ni le deck ni mon écran : c'est moi qui appuyais sur les touches, et mes captures qui ont révélé des défauts d'affichage. Certains formats ont dû être devinés à partir d'exemples, et plusieurs touches ont demandé deux ou trois essais avant de fonctionner. Enfin, la correction du module Home Assistant sera écrasée à sa prochaine mise à jour.

Ce qui a fait la différence, au fond, c'est la règle « ne rien déclarer fonctionnel avant d'avoir vérifié le résultat réel ». Chaque touche a été testée sur le deck, puis confirmée côté ordinateur.

## Ce que ça dit de mon métier

C'est exactement ce que je vois en accompagnant des équipes. L'interface montre ce que l'outil affiche ; l'usage réel montre ce qu'il fait. Un déploiement n'est pas réussi quand l'outil est installé, ni quand la formation est terminée. Il l'est quand on a vérifié, avec les gens, que ça marche vraiment pour eux.

Faire adopter un outil ou un changement par une équipe, c'est appliquer la même règle : aller voir ce qui se passe réellement, plutôt que ce que l'écran laisse croire.

## En résumé

Demander à une IA de « regarder l'écran » est la méthode la plus intuitive, mais la plus coûteuse et la plus fragile. Lui demander de lire les fichiers de réglages, puis de vérifier chaque résultat avec moi, a réglé en quelques heures ce que l'interface m'empêchait de régler depuis des jours.

Si votre logiciel a une interface pénible, posez-vous la question : où range-t-il ses réglages ? Souvent dans un simple fichier, et c'est là qu'une IA est la plus utile.

*Et si vous vous demandez pourquoi je tiens à garder la main sur mes outils et mes données, c'est tout le sujet de ma série [Mes données à la maison](/series/mes-donnees-a-la-maison).*
