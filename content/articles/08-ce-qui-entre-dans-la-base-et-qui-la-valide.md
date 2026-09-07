---
title: "Ce qui entre dans la base, et qui l'a validé"
date: "2026-09-01"
excerpt: "Mon cours m'apprend à remplir une base documentaire par scraping. Il ne dit nulle part ce que devient une page aspirée une fois qu'elle est dedans. Je m'étais pourtant promis de poser la question."
cover: "/images/articles/08-ce-qui-entre-dans-la-base-et-qui-la-valide.png"
source: "Laurent Guyonnet — Carnet d’expérience"
tags:
  - "IA"
  - "scraping"
  - "collecte"
  - "RGPD"
  - "sécurité"
  - "RNCP40875"
series:
  name: "Carnet de formation IA"
  slug: "carnet-de-formation-ia"
  order: 8
---
## Ce que je croyais

Que le web scraping était un sujet d'outils.

Le module est très bien fait sur ce plan. Il donne les trois
bibliothèques --- BeautifulSoup pour analyser du HTML, Selenium pour les
pages dynamiques, Scrapy pour les projets à grande échelle. Il donne le
principe : on envoie une requête, on récupère le HTML, on extrait, on
stocke. Il donne un script complet qui tourne sur un site d'entraînement
et sort un CSV de titres et de prix.

Il donne surtout une longue section sur les risques, et elle est
sérieuse : les blocages d'adresse IP, la détection de bots, les
conditions d'utilisation qu'on viole, le RGPD, la surcharge des
serveurs. Sept bonnes pratiques pour finir, dont « privilégier les API
officielles » et « consulter un expert juridique en cas de doute ».

J'ai lu tout ça en cochant. C'est complet, c'est prudent, ça couvre le
sujet.

### Quatre mots pour lire la suite

-   **Scraping** --- extraire automatiquement le contenu d'une page web
    pour le transformer en données exploitables.
-   **Pipeline de collecte** --- l'enchaînement complet, de la source
    jusqu'au stockage : ce que le script fait tourner chaque nuit sans
    que personne regarde.
-   **Provenance** --- l'information qui dit d'où vient une donnée,
    quand elle a été prise et par quel moyen. Elle ne fait pas partie du
    contenu, elle l'accompagne.
-   **Injection de prompt indirecte** --- des instructions cachées dans
    un contenu que le modèle va lire de lui-même, et que personne n'a
    tapées au clavier.

## Ce qui m'a fait buter

Je relisais le script de l'exercice. Il extrait des titres et des prix
de livres, les range dans un DataFrame, écrit un CSV. Quinze lignes, ça
marche, j'ai fait tourner.

Et j'ai regardé le fichier de sortie. Deux colonnes : titre, prix.

C'est là que ça a coincé, et pas du tout pour une raison technique. Ce
CSV ne dit pas de quelle page il vient. Ne dit pas quand il a été
produit. Ne dit pas quelle version de la page a été lue. Dans trois
mois, devant ce fichier, je serais incapable de dire si les prix sont
ceux d'octobre ou de janvier, ni de retrouver la source d'une ligne
précise.

Or j'avais déjà croisé exactement ce problème, quarante jours plus tôt,
dans l'autre sens.

Dans l'épisode sur le RAG, j'avais découvert que chaque fragment de
document devait conserver ses métadonnées --- d'où il vient, de quand il
date, qui a le droit de le lire --- et que sans elles, on ne peut ni
citer sa source, ni filtrer par droits, ni savoir qu'un document est
périmé. J'avais écrit que ce n'étaient pas des détails techniques mais
trois besoins métier.

Le module sur le RAG m'apprenait à consommer une base documentaire. Le
module sur le scraping m'apprend à la remplir. Et les deux ne se parlent
pas. Le premier exige des métadonnées, le second produit un CSV à deux
colonnes.

## Comment j'ai cherché

J'ai repris la promesse que je m'étais faite à la fin de l'épisode 1 :
devant n'importe quel schéma d'architecture, chercher les flèches
entrantes et demander qui les remplit.

Sauf que cette fois, la flèche entrante, c'est moi. Le script, c'est moi
qui le lance. Et je n'avais pas retourné la question.

**Ce que le cours traite, et ce qu'il ne traite pas.** Toute la section
« risques » du module regarde vers l'extérieur : ai-je le droit de
prendre cette donnée, vais-je me faire bloquer, est-ce que je surcharge
le serveur d'en face. Ce sont de vraies questions et elles sont bien
posées. Mais aucune ne regarde vers l'intérieur : une fois la donnée
chez moi, qu'est-ce que j'en fais, et qu'est-ce qu'elle me fait ?

Le mot « scraping » désigne l'extraction. Le pipeline, lui, continue
après.

**Le contenu aspiré est du contenu non relu.** C'est l'évidence que le
mot « automatisation » masque. Le principe même du scraping est qu'un
humain ne regarde pas ce qui passe. Sur dix pages, on relit. Sur
cinquante mille, non, jamais, c'est précisément pourquoi on automatise.

Et si ces cinquante mille pages finissent dans une base documentaire
interrogée par un modèle de langage --- ce qui est le cas d'usage
évident, et celui vers lequel toute ma formation converge ---, alors je
viens de créer exactement la situation que j'avais décrite comme un
angle mort : une base remplie de contenus que personne ne relit, dans
laquelle un paragraphe peut contenir des instructions que le modèle lira
comme des instructions.

Je n'avais pas fait le lien. Les deux modules sont séparés par cinq
semaines de formation, et rien dans les supports ne les rapproche.

**Ce qui manque au CSV.** J'ai listé ce que je devrais stocker à côté de
chaque ligne extraite, et j'en ai trouvé cinq. L'URL exacte de la
source. L'horodatage de la collecte. L'URL demandée, l'URL finale après
redirection et l'historique des redirections, parce qu'un script peut
aboutir sur une page différente de celle qu'il avait initialement
demandée. Le sélecteur ou la règle qui a servi à extraire, parce que
c'est ce qui cassera en premier quand le site changera. Et la version du
script, pour savoir quelle logique a produit quoi.

Aucun de ces cinq champs n'est dans le script du cours. Aucun n'est
difficile à ajouter --- c'est un dictionnaire un peu plus long. Mais on
ne les ajoute que si on s'est demandé à quoi servira le fichier dans six
mois.

**La question de l'effacement, encore.** Elle revient. Si une page
aspirée contient un avis client signé d'un prénom et d'une ville, j'ai
potentiellement collecté une donnée personnelle. La question ne se
résume alors pas au consentement : il faut aussi savoir sur quelle base
légale repose la collecte, pour quelle finalité elle est faite, quelles
données sont réellement nécessaires, comment les personnes peuvent
exercer leurs droits et comment une donnée peut être supprimée. Or, dans
un fichier dont je ne sais pas dire d'où vient chaque ligne, cette
dernière opération devient déjà difficile. Le module mentionne le RGPD
dans ses risques légaux, en une phrase, du côté « ai-je le droit ». Il
ne dit rien du côté « que devient la donnée une fois chez moi ». Ce sont
deux questions distinctes.

## Ce que ça change

**Une règle sur les sorties de collecte.** Un fichier de collecte sans
provenance n'est pas une donnée, c'est une rumeur bien formatée.
J'ajoute désormais les cinq champs avant d'écrire la première ligne, pas
après --- parce qu'après, la collecte est faite et l'information est
perdue pour de bon.

**Une question à poser sur tout projet qui remplit une base.** Elle
complète les trois que je m'étais données sur le RAG. Celles-là étaient
: qu'est-ce qui entre et qui l'a validé, comment mesure-t-on que ça
marche, que se passe-t-il quand un document est supprimé. J'y ajoute :
**ce qui entre a-t-il été produit par un humain qui l'a relu, ou par un
script qui ne relit rien ?** Ce n'est pas la même chose et ça n'appelle
pas les mêmes garde-fous.

**Une observation sur la façon dont les modules sont découpés.** Le
scraping est enseigné dans une section « collecte des données ». Le RAG
l'était dans une section sur les modèles de langage. Ce sont deux bouts
du même tuyau, séparés par le plan de formation. Le risque n'apparaît
qu'en les mettant côte à côte, ce que personne ne fait à ma place.

Je note ça sans reproche : la formation prévient elle-même que ses
énoncés peuvent paraître incomplets et que chercher ce qui manque fait
partie du travail. Simplement, je commence à voir où se logent les
manques. Ils sont rarement à l'intérieur d'un module. Ils sont presque
toujours entre deux.

## Rattachement au référentiel

Cet épisode relève du **sous-bloc BC2.5 --- Automatiser une solution
avec Make et l'IA**, dans le bloc 2 du titre **RNCP40875** : un pipeline
de collecte est une automatisation, et sa conception engage la fiabilité
de tout ce qui vient après. Il croise **BC2.4** pour la partie injection
de prompt indirecte, et le volet RGPD du socle data pour la collecte de
données personnelles sans consentement.

------------------------------------------------------------------------

*Prochain épisode : ce que coûte une annotation, et qui la produit.*
