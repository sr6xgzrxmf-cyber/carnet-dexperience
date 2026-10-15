---
title: "Fiche technique : ma suite numérique sur un Mac, derrière Tailscale"
date: "2026-10-15"
excerpt: >-
  L'architecture, les mesures de sécurité et l'état réel de ma suite numérique
  auto-hébergée : Nextcloud, Collabora, Jitsi et Grist sous Docker, accessibles
  via Tailscale sans aucun port ouvert.
cover: "/images/articles/2026-10-15-fiche-technique-schema.jpg"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "Nextcloud"
  - "Tailscale"
  - "Docker"
  - "auto-hébergement"
  - "sécurité"
series:
  name: "Mes données à la maison"
  slug: "mes-donnees-a-la-maison"
  order: 2
---

*Cette fiche accompagne l'article [« Locataire de mes outils, j'ai voulu devenir propriétaire »](/articles/2026-10-15-locataire-de-mes-outils-jai-voulu-devenir-proprietaire). Elle s'adresse aux curieux qui veulent savoir comment c'est construit. Elle ne contient que ce que j'ai réellement fait et vérifié, entre le 13 et le 15 octobre 2026.*

## L'architecture en un coup d'œil

| Brique | Rôle | Adresse (exemple) |
|---|---|---|
| Nextcloud | Fichiers, agenda, contacts, Deck | `fichiers.mon-reseau.ts.net` |
| Collabora | Édition de documents en ligne | `office.mon-reseau.ts.net` |
| Jitsi | Visio | `visio.mon-reseau.ts.net` |
| Grist | Tableaux collaboratifs | `grist.mon-reseau.ts.net` |

- **Le serveur** : un Mac Studio, avec une adresse fixe réservée dans la box, la mise en veille désactivée et le redémarrage automatique après une coupure de courant.
- **Docker** fait tourner chaque outil dans son propre conteneur.
- **Tailscale** forme un réseau privé entre mes appareils (le Mac Studio, deux Mac mini et un iPhone).
- **Un conteneur Tailscale par outil** : chaque service a son propre nom dans le réseau privé, avec un vrai certificat HTTPS Let's Encrypt.
- **Traefik retiré** : il servait de point d'entrée pendant les tests locaux ; avec un conteneur Tailscale par service, il n'était plus nécessaire.

## Pourquoi pas un mutualisé ou un VPS

| Option | Avantage | Limite pour ce projet |
|---|---|---|
| Hébergement mutualisé | Simple, certificat renouvelé automatiquement | Pas de Docker : ni visio, ni édition en ligne, ni Grist |
| Serveur loué (VPS) | Docker possible | Services exposés sur Internet, à surveiller et à durcir |
| Mac à la maison + Tailscale | Docker, et rien d'exposé publiquement | Disponibilité liée à la box, au courant et à la machine |

J'ai commencé sur le mutualisé (sous-domaine et certificat Let's Encrypt en place), puis je l'ai mis en pause dès que la limite Docker est apparue. Rien n'a été supprimé.

## La sécurité

- **Pas d'accès public.** Les outils ne sont joignables que par le réseau privé. L'entrée publique de Tailscale (Funnel) est fermée : ses journaux montrent des connexions rejetées.
- **HTTPS et HSTS.** L'en-tête HSTS est configuré dans Apache (auparavant fourni par Traefik) et validé par le contrôle de sécurité intégré à Nextcloud. Le client de synchronisation a refusé une adresse saisie en `http://`, ce qui confirme son fonctionnement.
- **Un compte personnel sans droits d'administration**, distinct du compte administrateur.
- **Des mots de passe d'application** dédiés et révocables pour chaque appareil (application iOS, client de synchronisation, profil Agenda et Contacts).
- **L'anti-bruteforce** a bloqué plusieurs tentatives ratées depuis l'iPhone, puis la protection a expiré d'elle-même. Nextcloud voit l'adresse réelle de chaque appareil, et le blocage se fait donc appareil par appareil.
- **Des logiciels vérifiés avant installation** : empreinte SHA-256 et notarisation Apple pour Tailscale, signature Developer ID de Nextcloud GmbH et notarisation pour le client de synchronisation.
- **La clé d'inscription Tailscale** a été retirée du fichier de configuration après l'inscription des quatre outils, et l'historique du Terminal a été purgé.

## Ce qui est vérifié

| Usage | Appareil | État |
|---|---|---|
| Fichiers et documents dans Collabora (édition, réouverture, versions) | Mac, Safari | ✅ |
| Application Nextcloud : connexion en 4G, envoi d'une photo | iPhone | ✅ |
| Agenda et Contacts natifs (profil de configuration Apple) | iPhone | ✅ |
| Client de synchronisation, synchronisation dans les deux sens | Mac mini ↔ serveur ↔ iPhone | ✅ |
| Visio entre deux appareils, hôte authentifié et invité | Mac et iPhone | ✅ (à deux) |
| Tableau Deck créé | Navigateur | ✅ |
| Synchronisation d'une carte Deck déplacée depuis l'iPhone | iPhone | ⏳ |
| Grist avec le compte personnel | — | ⏭️ reporté |

## Les incidents techniques, en bref

- **Redirections CalDAV et CardDAV en `http://`** : derrière Tailscale, Apache reçoit du HTTP. Ni un `ServerName` global, ni une réécriture des en-têtes `Location` n'ont suffi. Solution : un site virtuel Apache dont le `ServerName` porte le schéma `https://`.
- **Grist redémarre en boucle après un changement d'adresse** : il démarre avant Nextcloud et ne trouve pas son fournisseur d'identité ; la politique de redémarrage le relance jusqu'à ce que Nextcloud réponde.
- **Résolution des noms sur iPhone** : le Relais privé d'iCloud contourne le DNS de Tailscale. Il faut le désactiver à trois endroits : iCloud, chaque réseau Wi-Fi et les données cellulaires (« Limiter le suivi de l'adresse IP »).
- **Cache DNS négatif de la box** : un nom interrogé avant sa création reste « inexistant » pendant la durée autorisée par la zone, jusqu'à 24 heures dans mon cas.

## Les limites et prochaines étapes

- Mettre en place les **sauvegardes** (priorité) ; d'ici là, le téléversement automatique des photos reste désactivé.
- Activer la **double authentification**.
- Valider la **visio à trois participants ou plus**, qui passera par le pont vidéo (le test à deux s'est fait en pair-à-pair).
- Tester **Grist** avec le compte personnel.
- Vérifier la **synchronisation du Deck** depuis l'iPhone.
- Ouvrir **Funnel** pour les liens de partage publics. La visio avec des invités extérieurs demandera une autre solution, car Funnel ne transporte pas l'UDP utilisé par Jitsi.
- Configurer le **démarrage automatique de Docker Desktop** après un redémarrage du Mac.
- Installer Tailscale sur les autres appareils, puis créer le **deuxième utilisateur**.
