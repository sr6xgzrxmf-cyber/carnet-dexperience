#!/usr/bin/env bash
set -euo pipefail

FILE="app/layout.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ Fichier introuvable : $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak"

python3 - <<'PY'
from pathlib import Path
import re

path = Path("app/layout.tsx")
s = path.read_text(encoding="utf-8")

# 0) Fix: duplicate import Script (tu l'as 2 fois)
s = re.sub(r'^\s*import\s+Script\s+from\s+"next/script";\s*\n', '', s, flags=re.M)
# Ré-insère une seule fois juste après next/font/google (ou après la 2e ligne d'import)
lines = s.splitlines(True)
out = []
inserted = False
for i, line in enumerate(lines):
    out.append(line)
    if not inserted and re.search(r'from\s+"next/font/google";', line):
        out.append('import Script from "next/script";\n')
        inserted = True
s = "".join(out)
if not inserted:
    # fallback: en haut après les imports "next"
    s = s.replace('import type { Metadata, Viewport } from "next";\n',
                  'import type { Metadata, Viewport } from "next";\nimport Script from "next/script";\n')

# 1) Remove any existing key-warning-trace Script block
s = re.sub(r'<Script\s+id="key-warning-trace"[\s\S]*?</Script>\s*', '', s)

# 2) Insert new block right after <head>
block = r'''
        <Script
          id="key-warning-trace"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  function argsToText(args) {
    try {
      return Array.prototype.slice.call(args).map(function (a) {
        if (typeof a === "string") return a;
        try { return JSON.stringify(a); } catch(e) { return String(a); }
      }).join(" ");
    } catch (e) {
      return "";
    }
  }

  function wrap(methodName) {
    var orig = console[methodName];
    console[methodName] = function () {
      try {
        var text = argsToText(arguments);
        if (text.indexOf('Each child in a list should have a unique "key" prop') !== -1 || text.indexOf("warning-keys") !== -1) {
          console.group("🔎 key warning (" + methodName + ")");
          console.log("args:", arguments);
          for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === "string" && arguments[i].indexOf("\\n    at ") !== -1) {
              console.log("component stack:\\n" + arguments[i]);
            }
          }
          console.trace("trace");
          console.groupEnd();
        }
      } catch (e) {}
      return orig.apply(console, arguments);
    };
  }

  wrap("error");
  wrap("warn");
})();
`,
          }}
        />
'''.lstrip("\n")

m = re.search(r"<head>\s*", s)
if not m:
    raise SystemExit("❌ Impossible de trouver <head> dans app/layout.tsx")

pos = m.end()
s = s[:pos] + "\n" + block + s[pos:]

path.write_text(s, encoding="utf-8")
print("✅ patch appliqué dans app/layout.tsx (import Script + trace key warning)")
PY

echo "🗂 Backup : $FILE.bak"
