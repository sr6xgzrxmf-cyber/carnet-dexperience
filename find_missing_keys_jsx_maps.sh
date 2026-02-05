#!/usr/bin/env bash
set -euo pipefail

ROOTS=("app" "components")

echo "Scanning .tsx/.jsx for JSX-returning .map without key on first element…"
echo

# On repère les lignes ".map(" puis on inspecte les ~15 lignes suivantes.
# Si on voit un début de balise JSX (<div, <Link, <span, <li, <button, <option, etc.)
# et qu'on ne voit pas "key=" dans les 3 premières lignes du tag, on reporte.
while IFS= read -r -d '' file; do
  perl -ne '
    our $ln;
    $ln++;
    if (/\.map\(/) { $in_map=1; $start_ln=$ln; $window=0; $buf=""; }
    if ($in_map) {
      $window++;
      $buf .= $_;

      # Détecte le début d’un tag JSX (pas un import <T> générique)
      if ($buf =~ /<([A-Za-z][A-Za-z0-9:_-]*)\b/) {
        my $tag = $1;

        # On prend les 3 premières lignes à partir du début du tag
        my @lines = split(/\n/, $buf);
        my $joined = join("\n", @lines[0..($#lines < 2 ? $#lines : 2)]);

        if ($joined !~ /\bkey\s*=/) {
          print "$ARGV:$start_ln  -> <$tag> (pas de key visible)\n";
        }
        $in_map=0;
      }

      # fenêtre max ~15 lignes : si on ne voit pas de JSX, on arrête
      if ($window > 15) { $in_map=0; }
      $buf="" if length($buf) > 2000;
    }
  ' "$file"
done < <(find "${ROOTS[@]}" -type f \( -name "*.tsx" -o -name "*.jsx" \) -print0)

echo
echo "Done."
