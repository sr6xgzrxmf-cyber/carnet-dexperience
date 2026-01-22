#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Migrating scripts to scripts/admin (Option B)…"

mkdir -p scripts/admin

# 1) Déplacer les scripts "outils" dans scripts/admin/
move_if_exists () {
  local src="$1"
  local dst="$2"
  if [ -f "$src" ]; then
    git mv "$src" "$dst"
    echo "✅ moved: $src -> $dst"
  fi
}

move_if_exists scripts/setup_calendar_editor.sh scripts/admin/setup_calendar_editor.sh
move_if_exists scripts/setup_articles_audit.sh scripts/admin/setup_articles_audit.sh
move_if_exists scripts/uniformize_articles_filenames.sh scripts/admin/uniformize_articles_filenames.sh
move_if_exists scripts/uniformize_articles_filenames.mjs scripts/admin/uniformize_articles_filenames.mjs

# 2) Wrappers (compat) : tu peux continuer à lancer ./scripts/xxx.sh
cat > scripts/setup_calendar_editor.sh <<'WRAP'
#!/usr/bin/env bash
set -euo pipefail
exec bash scripts/admin/setup_calendar_editor.sh "$@"
WRAP
chmod +x scripts/setup_calendar_editor.sh

cat > scripts/setup_articles_audit.sh <<'WRAP'
#!/usr/bin/env bash
set -euo pipefail
exec bash scripts/admin/setup_articles_audit.sh "$@"
WRAP
chmod +x scripts/setup_articles_audit.sh

cat > scripts/uniformize_articles_filenames.sh <<'WRAP'
#!/usr/bin/env bash
set -euo pipefail
exec bash scripts/admin/uniformize_articles_filenames.sh "$@"
WRAP
chmod +x scripts/uniformize_articles_filenames.sh

# 3) Help central (si pas déjà là)
mkdir -p scripts/admin
if [ ! -f scripts/admin/help.sh ]; then
cat > scripts/admin/help.sh <<'HELP'
#!/usr/bin/env bash
set -euo pipefail
echo "🧰 Admin scripts"
echo ""
echo "Calendrier éditorial / éditeur:"
echo "  ./scripts/setup_calendar_editor.sh"
echo ""
echo "Contrôle éditorial (audit):"
echo "  ./scripts/setup_articles_audit.sh"
echo ""
echo "Uniformiser les noms d'articles:"
echo "  ./scripts/uniformize_articles_filenames.sh"
echo ""
echo "Docs:"
echo "  docs/admin.md"
HELP
chmod +x scripts/admin/help.sh
fi

# 4) Ajouter un raccourci npm admin:help (si absent)
node - <<'NODE'
const fs = require("fs");
const p = "package.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));
j.scripts ||= {};
if (!j.scripts["admin:help"]) j.scripts["admin:help"] = "bash scripts/admin/help.sh";
if (!j.scripts["admin:calendar"]) j.scripts["admin:calendar"] = "bash scripts/admin/setup_calendar_editor.sh";
if (!j.scripts["admin:audit"]) j.scripts["admin:audit"] = "bash scripts/admin/setup_articles_audit.sh";
if (!j.scripts["admin:slugs"]) j.scripts["admin:slugs"] = "bash scripts/admin/uniformize_articles_filenames.sh";
fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
console.log("✅ package.json updated (admin:* scripts)");
NODE

echo ""
echo "✅ Done."
echo "Next:"
echo "  npm run admin:help"
echo "  git status"
