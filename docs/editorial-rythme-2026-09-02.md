# Passe éditoriale — rythme et prose (2026-09-02)

Reprise du corpus article par article pour corriger cinq tics de rythme, série par
série, de la plus récente à la plus ancienne.

## Ce qui a motivé la passe (mesuré sur 173 articles)

| Tic | Fréquence corpus |
|---|---|
| Sauts de ligne forcés (`<br>` / lignes à deux espaces) | 335 occurrences, 52 articles |
| Antithèse « ce n'est pas X, c'est Y » / « non pas… mais… » | 256 occurrences, 124 articles |
| Clôture « la vraie question… » / « question ouverte » / question rhétorique en gras | 65 articles |
| Section H2 qui se termine systématiquement sur une maxime courte | quasi général sur les articles « méthode » |
| Paragraphes tous de même longueur (2–4 phrases), peu de respiration | général |

## Ce qu'on garde (ne pas aplatir la voix)

- Les phrases courtes. C'est la voix, elles sont bonnes.
- Le « je », la situation concrète, la phrase exacte citée, le coût réel.
- Le ton sobre, sans jargon, sans posture.
- Un tic **porteur** se garde. Exemple : « Mais il n'était pas seul dans la pièce. »
  Rationner ≠ éradiquer.

## Ce qu'on ne touche pas

- Le fond, l'ordre des idées, les faits, les positions.
- Les titres, l'`excerpt`, le front-matter, les `series`.
- Les intertitres H2 (sauf s'ils reprennent un tic).

## Les cinq règles

1. **Rationner l'antithèse.** Une à deux par article maximum. Ailleurs : montrer le
   mécanisme, donner l'exemple, laisser le lecteur faire le contraste.
2. **Une seule punchline de clôture par article** (deux si vraiment méritées). Les
   autres sections finissent sur un exemple, un détail concret, une question — ou
   s'arrêtent sans chute.
3. **Varier le souffle des paragraphes.** Fusionner les enchaînements « une phrase =
   un paragraphe ». Autoriser un paragraphe ample quand on pose une scène ou qu'on
   déroule un raisonnement. Le contraste fait mieux claquer les phrases courtes.
4. **Zéro `<br>` de mise en forme.** Les échelles « à éviter / à la place », les
   lignes empilées → listes `-`, tableau, ou citation `>`.
5. **Sortir des gabarits.** Pas de clôture systématique en question rhétorique
   grasse « Et si… ? ». Varier : affirmation, question, image, ou fin sèche.

## Processus

- Une série à la fois, de la plus récente à la plus ancienne.
- Pour chaque série : édition directe des fichiers (drafts + publiés), puis log
  ci-dessous, puis relecture demandée avant la série suivante.
- `git` sert de filet : `git checkout content/articles/<fichier>` annule.

## Déjà traité hors de cette passe

- **Série « Ce que Ted Lasso nous apprend… » (21 fichiers)** : une passe de même
  nature a déjà été faite (working tree non commité, horodatée ~07:36 le
  2026-09-02, avant cette session). `<br>` retirés, fragments refondus en phrases.
  À laisser tel quel. Sert aussi de référence de calibrage pour le reste.

---

## Journal

### Série « Ce qui donne de la valeur à une vente » (6 articles) — ÉDITÉ

Statut : les 6 fichiers réécrits, 0 saut de ligne forcé restant, front-matter
intact. En attente de relecture avant de passer à la série suivante.

### Séries 6 à 11 — ÉDITÉ (42 articles au total avec la série ci-dessus)

Toutes vérifiées : 0 `<br>` de mise en forme, front-matter intact, aucune clôture
en question grasse, `npm run build` OK. Net ~1 300 lignes retirées (broetry
repliée en paragraphes).

| Série | Fichiers | Profil dominant | Travail |
|---|---|---|---|
| 6 · Vendre n'est plus convaincre | 6 (2026-02-05 → 03-09) | essais très denses en antithèses | ~12 chutes « n'est pas X, c'est Y » ramenées à 1–2/article ; clôtures en question grasse supprimées ; art. 5 (« tu » + listes) : pile de 3 lignes repliée |
| 7 · Lois utiles | 4 (2026-02-09 → 03-04) | gabarit rigide, **clôture identique dans les 4** | les 4 clôtures « La vraie question à se poser… » + `<br>` + gras remplacées par 4 fins différentes ; piles de fragments repliées |
| 8 · Faire exister un projet | 8 (2026-05-06 → 06-21) | récits perso, broetry + triplets antithétiques | doublons de triplets « Je [verbe]. Ils [verbe]. » ramenés à 1 ; ~30 orphelines d'une ligne fusionnées ; `<br>` retirés ; art. 6, 7, 8 en touche légère |
| 9 · Relancer, décider, arrêter | 4 (2026-05-14 → 05-26) | 2 fiches-outils + 2 courts essais | fiches : `<br>` + clôture seulement, tableaux/listes gardés ; essais : sections fusionnées, triplets réduits, 4 clôtures variées |
| 10 · Les triangles d'équilibre | 7 (2026-08-24 → 09-04) | tic du **paragraphe d'une seule ligne** en rafale | dizaines d'orphelines fusionnées ; ~5 antithèses porteuses gardées par article (elles sont la colonne du raisonnement) ; formules « X + Y + Z = résultat » passées en liste ; H2 redondants (= titre) retirés ; clôtures variées |
| 11 · Les triangles d'arbitrage | 7 (2026-08-31 → 09-14) | idem série 10 | idem : fusion des beats, 2–3 antithèses/article, listes pour les 3 forces, H2 redondants retirés, clôtures variées |

**Tics porteurs gardés (échantillon) :** « Diagnostiquer un problème est devenu
courant. Aider à trancher reste rare. » · « parler plus fort à quelqu'un qui
n'écoute déjà plus » · « La simplification n'avait pas diminué l'exigence, elle
l'avait rendue visible. » · « Rien n'avait été inventé ; tout avait été
réordonné. » · « Le budget est fermé. La relation, non. »

**Restant après cette passe :** séries 1–5 (Former des adultes 45, Atelier de
posture 36, Construire Carnet d'expérience 13, Vendre et servir en retail 3,
Marketing durable et engagé 2) + 11 articles hors série.

### Série « Atelier de posture » (36 articles) — TERMINÉ

Vérifié : 36/36, 0 `<br>`, front-matter intact, `npm run build` OK.
Net ~400 lignes retirées. Touche variable : réécriture complète sur les intros et
les fiches chargées de `<br>` (WhatsApp, mails-bilan, prototype 30 j) ; touche
légère (édits ciblés) sur les nombreux textes déjà classés « solides » dans
l'audit de juin (tout-est-prioritaire, facilitateur, tension/conflit, fiche de
poste, cadres légers, arrêter de débattre, améliorer un process…).

Traitement type : antithèses « X n'est pas Y, c'est Z » ramenées à 2–4 porteuses
par article ; `<br>` avant dialogues → ligne vide ou phrase ; échelles « À
éviter / À la place » → tableau ; listes numérotées à `<br>` → vraies listes
ordonnées ; clôtures « ## Une question pour X » / « La vraie question à se
poser… » toutes retravaillées et variées. Ouverture de « La rencontre avec
Karim » laissée intacte.

Doublon corrigé : « La fiche pour se rendre lisible » avait deux sections
« Une invitation » quasi identiques — fusionnées.

**Restant après cette passe :** Former des adultes (45, 2023), Construire Carnet
d'expérience (13), Vendre et servir en retail (3), Marketing durable et engagé
(2), + 11 hors série.

#### (ancien état, remplacé)

Profil : récits Karim + essais méthodo. Tics dominants : antithèse « X n'est pas
Y, c'est Z » (souvent 6–10 par article), `<br>` avant les répliques de dialogue,
piles de fragments, clôtures en titre « ## Une question pour X ».

**Fait (10/36)** — vérifié, build OK, 0 `<br>` :

| Article | Touche |
|---|---|
| 2026-01-17 · Pourquoi raconter une progression | intro-manifeste : piles de fragments repliées, structure S→T→D→T→R→L gardée |
| 2026-01-20 · La fiche de développement | fiche-outil, touche légère |
| 2026-01-20 · La rencontre avec Karim | **meilleur texte du corpus** : ouverture intacte, seuls les triplets anaphoriques pliés |
| 2026-01-22 · Nommer ses axes | antithèses ramenées à ~4 porteuses ; `<br>` dialogue → ligne vide ; « L'axe ne crée rien. Il révèle. » gardé |
| 2026-01-25 · La fiche pour se rendre lisible | **2 sections « Une invitation » quasi dupliquées fusionnées** ; `<br>` retirés |
| 2026-01-27 · Transformer un parcours en profil lisible | cascade d'antithèses réduite à 4 crisp ; `<br>` dialogue |
| 2026-01-29 · Quand un parcours devient pilotable | essai très antithétique → 3 gardées ; `<br>` liste |
| 2026-02-06 · Accompagner avec WhatsApp | **beaucoup de `<br>`** (listes + intro) tous retirés ; ~9 antithèses → 3 |
| 2026-02-10 · Le « comment tu ferais ? » | déjà propre, touche légère |
| 2026-02-13 · Prioriser quand tout semble important | `<br>` retirés, ~4 antithèses pliées |

**Fait : 36/36.** (voir bloc « TERMINÉ » plus haut)

### Série « Construire Carnet d'expérience » (13) — TERMINÉ

Méta-récits perso sur la fabrication du site. Broetry lourde sur 4–5 (effet
miroir, quand ça casse, ce que je croyais savoir, le soir où le CV…) → réécriture
complète ; touche légère sur le reste. Antithèses « X n'est pas Y, c'est Z »
raréfiées, `<br>` retirés, glossaires en une ligne par terme, clôtures variées.

### Série « Vendre et servir en retail » (3, 2023) — TERMINÉ

Déjà propres. Touche minimale : quelques `<br>` / soft-breaks fusionnés.

### Série « Marketing durable et engagé » (2) — TERMINÉ

Déjà propres et bien structurées. Touche minimale.

### 11 articles hors série — TERMINÉ

Profils variés. « Déménager une équipe » : broetry lourde → réécriture. « La
promotion par le vide » : déjà excellent, laissé tel quel. Le reste : `<br>` et
soft-breaks fusionnés, clôtures « ## La vraie question » renommées, glossaires
mis en ligne.

Vérifié sur les 29 : 0 `<br>`, front-matter intact, `npm run build` OK.

### Série « Former des adultes » (45, mai–oct 2023) — TERMINÉ

Vérifié : 45/45, 0 `<br>`, front-matter intact, `npm run build` OK.

Série la plus ancienne et déjà la plus propre : la plupart des textes avaient été
repris en prose fluide en juin 2023. Le `<br>` de mise en forme était quasi
absent — un seul article (2023-10-09, « Projection de compétence vs écoute
active », de facture SEO différente du reste) en portait huit : listes remises
sur ligne vide, section « Deux logiques opposées » (trois paires empilées)
passée en tableau, paires de phrases parallèles fusionnées.

Tic dominant réel : la **clôture-gabarit en question**, présente sur presque tous
les articles 2023 — « Dans tes formations, est-ce que X… ou seulement Y ? »,
souvent sous un intertitre « ## La vraie question » / « ## Le vrai enjeu ». Toutes
réécrites en affirmation à la première personne, intertitres renommés. Secondaire :
petites piles de phrases parallèles reliées par saut de ligne doux (« Il dépend
de… / Il circule… / Il s'épuise… ») repliées en une phrase ; quelques doublets
broetry d'ouverture fusionnés.

Antithèses porteuses gardées (échantillon) : « Ce qui manque, ce n'est pas
toujours plus de contenu. C'est une manière de faire circuler ce qui est déjà
là. » · « il ne remplace pas l'apprentissage social. Il lui donne de la tenue. » ·
« La compétence doit éclairer, pas écraser. » · « Vendre, ce n'est pas prouver
qu'on sait. C'est montrer qu'on a compris. »

**Corpus intégralement repris : 173 / 173.**

## Total

| Ensemble | Articles |
|---|---|
| Ted Lasso ×2 (passe du 2026-09-02 matin, hors de cette session) | 21 |
| Ce qui donne de la valeur à une vente | 6 |
| Séries 6–11 (Vendre n'est plus convaincre, Lois utiles, Faire exister un projet, Relancer/décider/arrêter, 2× Triangles) | 36 |
| Atelier de posture | 36 |
| Construire Carnet d'expérience | 13 |
| Vendre et servir en retail | 3 |
| Marketing durable et engagé | 2 |
| Hors série | 11 |
| Former des adultes | 45 |
| **Corpus repris** | **173 / 173 — terminé** |
