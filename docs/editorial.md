
## Covers d’articles (règle officielle)

### Objectif
- Une règle simple, stable, et vérifiable.
- Zéro dépendance aux dates.
- Zéro “casse” en production : si une cover manque, on affiche un fallback.

### Convention de nommage
- Chaque article a un `slug` (le nom du fichier Markdown sans la date).
- Chaque cover est nommée **uniquement à partir du slug** :

`/images/articles/<slug>.jpg`

Exemples :
- `content/articles/2026-01-28-ecrire-pour-etre-utile-pas-pour-etre-brillant.md`
  → `cover: "/images/articles/ecrire-pour-etre-utile-pas-pour-etre-brillant.jpg"`

- `content/articles/2023-10-09-projection-de-competence-vs-ecoute-active.md`
  → `cover: "/images/articles/projection-de-competence-vs-ecoute-active.jpg"`

### Contraintes
- Chemin unique : `/images/articles/…`
- Extensions autorisées : `.jpg` (recommandé), `.jpeg`, `.png`, `.webp`
- Nom de fichier :
  - minuscules
  - tirets `-`
  - pas d’espaces
  - pas d’accents
- La valeur `cover:` dans le front-matter doit être **entre guillemets** :
  - ✅ `cover: "/images/articles/mon-slug.jpg"`
  - ❌ `cover: /images/articles/mon-slug.jpg` (toléré mais non standard)
  - ❌ `cover: " /images/articles/mon-slug.jpg "` (espaces parasites)

### Source de vérité
- Le fichier image doit exister **dans Git** (pas seulement en local).
- Avant un push (renommage / batch), on lance l’audit.

### Audit obligatoire
- `node scripts/audit-covers.mjs`
- En cas d’écart, on corrige via `--fix` (si possible), sinon correction manuelle.

### Fallback obligatoire
Si une cover est absente en prod, le site doit afficher :
`/images/articles/placeholder.jpg`

