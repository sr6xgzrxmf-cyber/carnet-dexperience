#!/usr/bin/env bash
set -euo pipefail

patch_file () {
  local file="$1"
  [ -f "$file" ] || { echo "⏭️  Skip (absent): $file"; return 0; }

  cp "$file" "$file.bak"

  # Ajoute key={t} sur le premier élément JSX retourné par tags.map(...)
  # - couvre (t) et (t: string)
  perl -0777 -i -pe '
    s/
      (\btags\.map\(\(t(?::\s*string)?\)\s*=>\s*\(\s*<)([A-Za-z0-9_:-]+)
      (?![^>]*\bkey=)
      (\b)
    /$1$2 key={t}$3/gxs;
  ' "$file"

  echo "✅ Patched: $file (backup: $file.bak)"
}

patch_file "app/parcours/[slug]/page.tsx"
patch_file "app/atelier/page.tsx"

echo "Done."
