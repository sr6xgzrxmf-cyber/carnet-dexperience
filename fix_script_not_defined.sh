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

path = Path("app/layout.tsx")
s = path.read_text(encoding="utf-8")

# 1) Supprime tous les imports Script existants (pour éviter les doublons)
s = re.sub(r'^\s*import\s+Script\s+from\s+["\']next/script["\'];\s*\n', '', s, flags=re.M)

# 2) Vérifie si <Script est utilisé
uses = "<Script" in s

if uses:
    # 3) Injecte un import unique Script après les imports next/font/google si présent,
    # sinon après le premier import.
    m = re.search(r'^\s*import\s+\{[^}]*\}\s+from\s+["\']next/font/google["\'];\s*\n', s, flags=re.M)
    if m:
        insert_at = m.end()
        s = s[:insert_at] + 'import Script from "next/script";\n' + s[insert_at:]
    else:
        m2 = re.search(r'^\s*import[^\n]*\n', s, flags=re.M)
        insert_at = m2.end() if m2 else 0
        s = s[:insert_at] + 'import Script from "next/script";\n' + s[insert_at:]

path.write_text(s, encoding="utf-8")
print("✅ Import Script corrigé (doublons supprimés, import unique ajouté si nécessaire)")
PY

echo "✅ Patch appliqué."
echo "🗂  Backup : $FILE.bak"
