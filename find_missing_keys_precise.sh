#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
import re
from pathlib import Path

ROOTS = ["app", "components"]

# On veut repérer: .map( ... => ( <Tag ...> ... ))
# et vérifier que la balise d'ouverture <Tag ...> contient key=
# (en autorisant les retours à la ligne jusqu'au >)
map_re = re.compile(r"\.map\(\s*\([^)]*\)\s*=>\s*\(\s*<([A-Za-z][A-Za-z0-9:_-]*)", re.MULTILINE)
# Pareil pour => { return ( <Tag ...> ... ) }
map_return_re = re.compile(r"\.map\(\s*\([^)]*\)\s*=>\s*\{\s*return\s*\(\s*<([A-Za-z][A-Za-z0-9:_-]*)", re.MULTILINE)

def iter_files():
    for root in ROOTS:
        p = Path(root)
        if not p.exists():
            continue
        for f in p.rglob("*.tsx"):
            # ignore .next etc (au cas où)
            if ".next" in f.parts or "node_modules" in f.parts:
                continue
            yield f
        for f in p.rglob("*.jsx"):
            if ".next" in f.parts or "node_modules" in f.parts:
                continue
            yield f

def find_open_tag_block(s: str, start: int):
    # on prend depuis le '<' trouvé, jusqu'au prochain '>' (balise d'ouverture)
    lt = s.rfind("<", 0, start+1)
    if lt == -1:
        lt = start
    gt = s.find(">", start)
    if gt == -1:
        return None
    return s[lt:gt+1], lt

def line_of_pos(s: str, pos: int):
    return s.count("\n", 0, pos) + 1

hits = []

for file in iter_files():
    s = file.read_text(encoding="utf-8", errors="ignore")

    for rx in (map_re, map_return_re):
        for m in rx.finditer(s):
            tag = m.group(1)
            # position du début du tag repéré
            start = m.start(1)
            block = find_open_tag_block(s, start)
            if not block:
                continue
            open_tag, ltpos = block

            # ignore: fragments <> (déjà exclus par regex) + certains faux positifs TS
            if tag in ("string", "number", "Metadata"):
                continue

            if re.search(r"\bkey\s*=", open_tag) is None:
                ln = line_of_pos(s, ltpos)
                snippet = open_tag.replace("\n", "\\n")
                hits.append((str(file), ln, tag, snippet))

if not hits:
    print("✅ Aucun map JSX sans key détecté (selon ce scanner).")
else:
    print("⚠️ JSX map sans key détectés :")
    for f, ln, tag, snip in hits:
        print(f"- {f}:{ln} -> <{tag}>  {snip[:200]}")
PY
