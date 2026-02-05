#!/usr/bin/env bash
set -euo pipefail

FILE="app/layout.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ Fichier introuvable: $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("app/layout.tsx")
s = p.read_text(encoding="utf-8")

# 1) remove any existing Script imports (avoid duplicates / broken states)
s = re.sub(r'^\s*import\s+Script\s+from\s+["\']next/script["\'];\s*\n', '', s, flags=re.M)

# 2) Ensure Script is used. If <Script exists, inject import.
if "<Script" in s:
    # Insert after first import line if present, else at top
    m = re.search(r'^\s*import[^\n]*\n', s, flags=re.M)
    if m:
        i = m.end()
        s = s[:i] + 'import Script from "next/script";\n' + s[i:]
    else:
        s = 'import Script from "next/script";\n' + s

p.write_text(s, encoding="utf-8")
print("✅ Script import forced in app/layout.tsx")
PY

echo
echo "---- Imports en tête de app/layout.tsx (vérif) ----"
sed -n '1,25p' "$FILE"

echo
echo "✅ Patch appliqué."
echo "🗂  Backup : $FILE.bak"
