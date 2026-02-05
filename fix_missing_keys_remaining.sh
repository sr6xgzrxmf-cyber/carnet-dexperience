#!/usr/bin/env bash
set -euo pipefail

apply_patch () {
  local file="$1"
  [ -f "$file" ] || { echo "⏭️  Skip (absent): $file"; return 0; }

  cp "$file" "$file.bak"

  python3 - "$file" <<'PY'
import re, sys
from pathlib import Path

path = Path(sys.argv[1])
s = path.read_text(encoding="utf-8")

orig = s

# --- 1) archives: uniqueSeries.map((s) => ( <X ...> )) => ajoute key={s}
s = re.sub(
  r'(\{uniqueSeries\.map\(\(s\)\s*=>\s*\(\s*<)([A-Za-z][A-Za-z0-9:_-]*)(?![^>]*\bkey=)',
  r'\1\2 key={s}',
  s,
  flags=re.S
)

# --- 2) archives: items.map((a) => ( <X ...> )) => ajoute key={a.slug}
# (si c’est items.map((a) => { return ( <...> ) }) on couvre aussi)
s = re.sub(
  r'(\{items\.map\(\(a\)\s*=>\s*(?:\(\s*)?<)([A-Za-z][A-Za-z0-9:_-]*)(?![^>]*\bkey=)',
  r'\1\2 key={a.slug}',
  s,
  flags=re.S
)
s = re.sub(
  r'(\{items\.map\(\(a\)\s*=>\s*\{\s*return\s*\(\s*<)([A-Za-z][A-Za-z0-9:_-]*)(?![^>]*\bkey=)',
  r'\1\2 key={a.slug}',
  s,
  flags=re.S
)

# --- 3) admin series list: seriesCatalog.map((s) => ( <X ...> )) => key={s.slug}
s = re.sub(
  r'(\{seriesCatalog\.map\(\(s\)\s*=>\s*(?:\(\s*)?<)([A-Za-z][A-Za-z0-9:_-]*)(?![^>]*\bkey=)',
  r'\1\2 key={s.slug}',
  s,
  flags=re.S
)

# --- 4) admin series detail: articles.map((a) => ( <X ...> )) => key={a.slug}
s = re.sub(
  r'(\{articles\.map\(\(a\)\s*=>\s*(?:\(\s*)?<)([A-Za-z][A-Za-z0-9:_-]*)(?![^>]*\bkey=)',
  r'\1\2 key={a.slug}',
  s,
  flags=re.S
)
s = re.sub(
  r'(\{articles\.map\(\(a\)\s*=>\s*\{\s*return\s*\(\s*<)([A-Za-z][A-Za-z0-9:_-]*)(?![^>]*\bkey=)',
  r'\1\2 key={a.slug}',
  s,
  flags=re.S
)

# --- 5) atelier fiche: cfg.fields.map((f) => { return ( <label ...> ) })
# a) ajoute idx si absent
s = re.sub(
  r'cfg\.fields\.map\(\(f\)\s*=>',
  'cfg.fields.map((f, idx) =>',
  s
)
# b) ajoute key sur le 1er tag retourné (souvent <label>)
s = re.sub(
  r'(\{cfg\.fields\.map\(\(f,\s*idx\)\s*=>\s*\{\s*return\s*\(\s*<)([A-Za-z][A-Za-z0-9:_-]*)(?![^>]*\bkey=)',
  r'\1\2 key={f.key ?? f.name ?? f.id ?? idx}',
  s,
  flags=re.S
)

path.write_text(s, encoding="utf-8")

if s == orig:
  print(f"ℹ️  Aucun changement dans {path}")
else:
  print(f"✅ Patch keys appliqué dans {path}")
PY
}

apply_patch "app/articles/archives/page.tsx"
apply_patch "app/admin/series/page.tsx"
apply_patch "app/admin/series/[slug]/page.tsx"
apply_patch "app/atelier/fiche/[step]/page.tsx"

echo
echo "✅ Done. Backups créés en .bak à côté des fichiers modifiés."
