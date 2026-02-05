#!/usr/bin/env bash
set -euo pipefail

FILE="app/articles/page.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ Fichier introuvable : $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak"

# On ajoute key={s.slug} sur le premier <div ...> qui suit seriesCards.map
perl -0777 -i -pe '
  if (/seriesCards\.map\(\(s\)\s*=>\s*\{\s*return\s*\(\s*<div(?![^>]*\bkey=)/s) {
    s/(seriesCards\.map\(\(s\)\s*=>\s*\{\s*return\s*\(\s*<div)(\s+)/$1 key={s.slug}$2/s;
  }
' "$FILE"

echo "✅ Patch appliqué."
echo "🗂  Backup : $FILE.bak"
