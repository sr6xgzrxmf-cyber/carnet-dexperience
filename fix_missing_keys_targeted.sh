#!/usr/bin/env bash
set -euo pipefail

patch () {
  local file="$1"
  [ -f "$file" ] || { echo "⏭️  Skip (absent): $file"; return 0; }

  cp "$file" "$file.bak"

  perl -0777 -i -pe '
    # ------------------------------------------------------------
    # 1) atelier fiche: cfg.fields.map((f) => ( <label ...> ))
    #    -> cfg.fields.map((f, idx) => ( <label key=... ...> ))
    # ------------------------------------------------------------
    s/cfg\.fields\.map\(\(f\)\s*=>\s*\(/cfg.fields.map((f, idx) => (/g;

    # Ajoute key sur <label ...> rencontré dans le bloc map (si pas déjà présent)
    s/
      (cfg\.fields\.map\(\(f,\s*idx\)\s*=>\s*\(\s*<label)
      (?![^>]*\bkey=)
    /$1 key={(f as any).name ?? (f as any).id ?? idx}/gxs;

    # ------------------------------------------------------------
    # 2) admin series catalog: seriesCatalog.map((s) => ( <Link ...> ))
    # ------------------------------------------------------------
    s/
      (seriesCatalog\.map\(\(s\)\s*=>\s*\(\s*<Link)
      (?![^>]*\bkey=)
    /$1 key={(s as any).slug ?? (s as any).name ?? String(s)}/gxs;

    # ------------------------------------------------------------
    # 3) admin series detail: articles.map((a) => ( <li ...> )) ou <Link ...>
    # ------------------------------------------------------------
    s/
      (articles\.map\(\(a\)\s*=>\s*\(\s*<li)
      (?![^>]*\bkey=)
    /$1 key={(a as any).slug ?? (a as any).id ?? String(a)}/gxs;

    s/
      (articles\.map\(\(a\)\s*=>\s*\(\s*<Link)
      (?![^>]*\bkey=)
    /$1 key={(a as any).slug ?? (a as any).id ?? String(a)}/gxs;

    # ------------------------------------------------------------
    # 4) archives: uniqueSeries.map / items.map (souvent Link/li)
    # ------------------------------------------------------------
    s/
      (uniqueSeries\.map\(\(s\)\s*=>\s*\(\s*<Link)
      (?![^>]*\bkey=)
    /$1 key={(s as any).slug ?? String(s)}/gxs;

    s/
      (items\.map\(\(a\)\s*=>\s*\(\s*<li)
      (?![^>]*\bkey=)
    /$1 key={(a as any).slug ?? (a as any).id ?? String(a)}/gxs;

    s/
      (items\.map\(\(a\)\s*=>\s*\(\s*<Link)
      (?![^>]*\bkey=)
    /$1 key={(a as any).slug ?? (a as any).id ?? String(a)}/gxs;
  ' "$file"

  echo "✅ Patched: $file (backup: $file.bak)"
}

patch "app/atelier/fiche/[step]/page.tsx"
patch "app/admin/series/page.tsx"
patch "app/admin/series/[slug]/page.tsx"
patch "app/articles/archives/page.tsx"

echo "Done."
