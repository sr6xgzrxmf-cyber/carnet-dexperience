#!/usr/bin/env bash
set -euo pipefail

patch_file () {
  local file="$1"
  [ -f "$file" ] || { echo "⏭️  Skip (absent): $file"; return 0; }

  cp "$file" "$file.bak"

  # 1) tags.map((t: string) => ( <...> ))  --> ajoute key={t}
  perl -0777 -i -pe '
    s/
      (\{[^{}]*\btags\.map\(\(t:\s*string\)\s*=>\s*\(\s*<)([A-Za-z0-9_:-]+)
      (?![^>]*\bkey=)
      (\b)
    /$1$2 key={t}$3/gxs;
  ' "$file"

  # 2) highlights.slice(...).map((h) => ( <...> )) --> ajoute key={`${h}-${idx}`} si idx existe, sinon key={h}
  perl -0777 -i -pe '
    s/
      (\{[^{}]*\bhighlights\.slice\([^)]*\)\.map\(\(h,\s*idx\)\s*=>\s*\(\s*<)([A-Za-z0-9_:-]+)
      (?![^>]*\bkey=)
      (\b)
    /$1$2 key={`${h}-${idx}`}$3/gxs;

    s/
      (\{[^{}]*\bhighlights\.slice\([^)]*\)\.map\(\(h\)\s*=>\s*\(\s*<)([A-Za-z0-9_:-]+)
      (?![^>]*\bkey=)
      (\b)
    /$1$2 key={h}$3/gxs;
  ' "$file"

  echo "✅ Patched: $file (backup: $file.bak)"
}

patch_file "app/articles/[slug]/page.tsx"
patch_file "app/parcours/page.tsx"

echo "Done."
