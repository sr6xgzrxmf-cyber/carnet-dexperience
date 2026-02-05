#!/usr/bin/env bash
set -euo pipefail

FILE="app/layout.tsx"
[ -f "$FILE" ] || { echo "❌ Introuvable: $FILE"; exit 1; }

cp "$FILE" "$FILE.bak"

python3 - <<'PY'
from pathlib import Path
import re

path = Path("app/layout.tsx")
s = path.read_text(encoding="utf-8")

# 1) Supprime tout bloc existant key-warning-trace (next/script ou <script>)
s = re.sub(r'<Script\s+id="key-warning-trace"[\s\S]*?</Script>\s*', '', s)
s = re.sub(r'<script\s+id="key-warning-trace"[\s\S]*?</script>\s*', '', s, flags=re.I)

# 2) Nettoie import Script en double (ou inutile)
# - retire toutes les lignes "import Script from "next/script";"
s = re.sub(r'^\s*import\s+Script\s+from\s+["\']next/script["\'];\s*\n', '', s, flags=re.M)

# (Si tu as encore besoin de Script pour GA/JSON-LD, tu pourras le réimporter après.
# Là on veut juste que le debug fonctionne.)

# 3) Injecte un <script> HTML direct juste après <head>
block = """
        <script
          id="key-warning-trace"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var origError = console.error;
  var origWarn = console.warn;

  function dump(method, args) {
    try {
      console.group("🔎 key warning (" + method + ")");
      try { console.log("raw args:", args); } catch(e) {}
      for (var i = 0; i < args.length; i++) {
        if (typeof args[i] === "string") {
          console.log("arg[" + i + "]:\\n" + args[i]);
        }
      }
      console.trace("js trace");
      console.groupEnd();
    } catch (e) {}
  }

  function wrap(name, orig) {
    return function () {
      try {
        var first = String(arguments[0] || "");
        if (first.indexOf('Each child in a list should have a unique "key" prop') !== -1 ||
            first.indexOf("warning-keys") !== -1) {
          dump(name, arguments);
        }
      } catch (e) {}
      return orig.apply(console, arguments);
    };
  }

  console.error = wrap("error", origError);
  console.warn  = wrap("warn", origWarn);
})();
`,
          }}
        />
""".lstrip("\n")

m = re.search(r"<head>\s*", s)
if not m:
    raise SystemExit("❌ Impossible de trouver <head> dans app/layout.tsx")

pos = m.end()
s = s[:pos] + "\n" + block + s[pos:]

path.write_text(s, encoding="utf-8")
print("✅ Injecté: <script id=\"key-warning-trace\"> dans <head>")
PY

echo "✅ OK"
echo "🗂  Backup: $FILE.bak"
