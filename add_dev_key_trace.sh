#!/usr/bin/env bash
set -euo pipefail

TRACE_FILE="components/dev/DevKeyWarningTrace.tsx"
LAYOUT="app/layout.tsx"

mkdir -p components/dev

cat > "$TRACE_FILE" <<'TSX'
"use client";

let installed = false;

function install() {
  if (installed) return;
  installed = true;

  const wrap = (method: "error" | "warn") => {
    const orig = console[method].bind(console);
    console[method] = (...args: any[]) => {
      try {
        const text = args.map((a) => (typeof a === "string" ? a : "")).join(" ");
        const isKeyWarn =
          text.includes('Each child in a list should have a unique "key" prop') ||
          text.includes("warning-keys") ||
          text.includes('unique "key" prop');

        if (isKeyWarn) {
          // React met souvent le component stack en 2e argument string
          const stackArg = args.find((a) => typeof a === "string" && a.includes("\n    at "));
          console.group(`🔎 KEY WARNING via console.${method}`);
          console.log("args:", args);
          if (stackArg) console.log("component stack:\n" + stackArg);
          console.trace("trace");
          console.groupEnd();
        }
      } catch {}
      return orig(...args);
    };
  };

  wrap("error");
  wrap("warn");
}

// installé dès l’import (avant rendu)
install();

export default function DevKeyWarningTrace() {
  return null;
}
TSX

cp "$LAYOUT" "$LAYOUT.bak"

python3 - "$LAYOUT" <<'PY'
import re, sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

# 1) ensure import exists
if 'DevKeyWarningTrace' not in s:
  # insert after other imports
  lines = s.splitlines()
  insert_at = 0
  for i, line in enumerate(lines):
    if line.startswith("import "):
      insert_at = i + 1
  lines.insert(insert_at, 'import DevKeyWarningTrace from "@/components/dev/DevKeyWarningTrace";')
  s = "\n".join(lines) + "\n"

# 2) ensure component is rendered in dev (just before </body> ideally)
if "DevKeyWarningTrace" not in s.split("export default function RootLayout",1)[1]:
  s = re.sub(
    r'(\s*<SpeedInsights\s*/>\s*)',
    r'\1\n        {process.env.NODE_ENV !== "production" ? <DevKeyWarningTrace /> : null}\n',
    s,
    count=1
  )

p.write_text(s, encoding="utf-8")
print("✅ DevKeyWarningTrace ajouté (global en dev).")
PY

echo "✅ OK"
echo "🗂  Backup: $LAYOUT.bak"
