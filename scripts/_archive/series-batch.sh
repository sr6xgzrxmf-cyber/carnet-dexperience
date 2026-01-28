#!/usr/bin/env bash
set -euo pipefail

ARTICLES_DIR="content/articles"
SERIES_DIR="content/series"

if [ ! -d "$ARTICLES_DIR" ]; then
  echo "❌ Dossier introuvable: $ARTICLES_DIR"
  exit 1
fi

mkdir -p "$SERIES_DIR"

# 1) Crée/complète les 3 séries "absorbantes"
cat > "$SERIES_DIR/former-des-adultes.yml" <<'YML'
slug: former-des-adultes
title: Former des adultes
description: Principes, outils et situations pour concevoir, animer et améliorer l’apprentissage des adultes.
YML

cat > "$SERIES_DIR/styles-de-management.yml" <<'YML'
slug: styles-de-management
title: Styles de management
description: Panorama pragmatique des styles de management et de ce qu’ils changent vraiment sur le terrain.
YML

cat > "$SERIES_DIR/vendre-et-servir-en-retail.yml" <<'YML'
slug: vendre-et-servir-en-retail
title: Vendre et servir en retail
description: Vendre sans s’abîmer, servir sans se perdre : expérience client, communication et gestes de terrain.
YML

# 2) Script qui génère series-map.json à partir des fichiers .md (pas besoin d’articles-index.json)
cat > generate-series-map.mjs <<'JS'
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const ARTICLES_DIR = process.env.ARTICLES_DIR || "content/articles";
const OUT = "series-map.json";

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && p.endsWith(".md")) out.push(p);
  }
  return out;
}

function parseFrontMatter(src) {
  if (!src.startsWith("---")) return null;
  const end = src.indexOf("\n---", 3);
  if (end === -1) return null;
  const fmRaw = src.slice(3, end);
  const meta = yaml.load(fmRaw) || {};
  return meta;
}

function isoYear(date) {
  const m = String(date || "").match(/^(\d{4})-\d{2}-\d{2}$/);
  return m ? Number(m[1]) : null;
}

const SERIES = {
  "former-des-adultes": { name: "Former des adultes", slug: "former-des-adultes" },
  "styles-de-management": { name: "Styles de management", slug: "styles-de-management" },
  "vendre-et-servir-en-retail": { name: "Vendre et servir en retail", slug: "vendre-et-servir-en-retail" },
  "atelier-de-posture": { name: "Atelier de posture", slug: "atelier-de-posture" }
};

function hasAny(tags, needles) {
  const set = new Set((tags || []).map(String));
  return needles.some(n => set.has(n));
}

function pickSeries(meta, relFile) {
  const year = isoYear(meta.date);
  const tags = Array.isArray(meta.tags) ? meta.tags : [];

  // On ne touche PAS aux articles déjà en série
  if (meta.series && typeof meta.series === "object" && meta.series.slug) return null;

  // Priorité 2023 (grosses masses d’archives)
  if (year === 2023) {
    // Former des adultes
    if (hasAny(tags, ["andragogie","pedagogie","formation","apprentissage","developpement-des-competences"])) {
      return SERIES["former-des-adultes"];
    }
    // Retail / expérience client
    if (hasAny(tags, ["retail","experience-client","relation-client"])) {
      return SERIES["vendre-et-servir-en-retail"];
    }
    // Styles de management
    if (hasAny(tags, ["management","leadership","management-de-proximite","organisation","pilotage","prise-de-decision","responsabilite"])) {
      return SERIES["styles-de-management"];
    }
  }

  // 2026 : orphelins “posture/management” -> Atelier de posture (si tu veux du rapide)
  if (year === 2026) {
    if (hasAny(tags, ["posture-professionnelle","management","management-de-proximite","communication","feedback","prise-de-decision","pilotage"])) {
      return SERIES["atelier-de-posture"];
    }
  }

  return null; // laisse le reste volontairement non affecté (tu gardes la main)
}

// Attribution d’un order : simple, stable, basé sur date + slug
function orderFor(meta) {
  // si YYYY-MM-DD => YYYYMMDD (tri naturel), sinon 99999999
  const iso = String(meta.date || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return Number(iso.replaceAll("-",""));
  }
  return 99999999;
}

const files = walk(ARTICLES_DIR);
const mapping = {};
let n = 0;

for (const abs of files) {
  const src = fs.readFileSync(abs, "utf8");
  const meta = parseFrontMatter(src);
  if (!meta || !meta.title) continue;

  const rel = abs.replace(process.cwd() + path.sep, "");
  const series = pickSeries(meta, rel);
  if (!series) continue;

  mapping[rel] = {
    ...series,
    order: orderFor(meta)
  };
  n++;
}

fs.writeFileSync(OUT, JSON.stringify(mapping, null, 2));
console.log(`✔ series-map.json généré (${n} affectations)`);
JS

# 3) Script qui applique series-map.json dans les front-matter
cat > apply-series.mjs <<'JS'
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force"); // écrase une série existante si vraiment nécessaire

const MAP = JSON.parse(fs.readFileSync("series-map.json", "utf8"));
const report = [];

function parse(src) {
  if (!src.startsWith("---")) return null;
  const end = src.indexOf("\n---", 3);
  if (end === -1) return null;
  const fmRaw = src.slice(3, end);
  const body = src.slice(end + 4);
  const meta = yaml.load(fmRaw) || {};
  return { meta, body };
}

for (const relFile of Object.keys(MAP)) {
  const abs = path.join(process.cwd(), relFile);
  if (!fs.existsSync(abs)) continue;

  const src = fs.readFileSync(abs, "utf8");
  const parsed = parse(src);
  if (!parsed) continue;

  const before = structuredClone(parsed.meta);
  const next = parsed.meta;

  const desired = MAP[relFile];

  const hasSeries = next.series && typeof next.series === "object" && next.series.slug;

  if (hasSeries && !FORCE) {
    // On ne touche pas
    report.push({ file: relFile, action: "skip-existing-series", existing: next.series });
    continue;
  }

  next.series = {
    name: desired.name,
    slug: desired.slug,
    order: desired.order
  };

  report.push({
    file: relFile,
    action: APPLY ? "apply" : "dry-run",
    from: before.series || null,
    to: next.series
  });

  if (APPLY) {
    const newFm = yaml.dump(next, { lineWidth: 1000 });
    const out = `---\n${newFm}---\n${parsed.body.replace(/^\n+/, "")}`;
    fs.writeFileSync(abs, out);
  }
}

fs.writeFileSync("series-report.json", JSON.stringify(report, null, 2));
console.log(`✔ Mode: ${APPLY ? "apply" : "dry-run"}`);
console.log(`✔ Entrées mapping: ${Object.keys(MAP).length}`);
console.log(`✔ Rapport: series-report.json`);
if (!APPLY) console.log("ℹ Pour appliquer: node apply-series.mjs --apply");
JS

# 4) Dépendance YAML
npm i -D js-yaml >/dev/null

echo "✅ Scripts créés:"
echo "  - generate-series-map.mjs"
echo "  - apply-series.mjs"
echo "  - content/series/{former-des-adultes,styles-de-management,vendre-et-servir-en-retail}.yml"
echo ""

echo "▶ Génération du mapping…"
node generate-series-map.mjs

echo "▶ Dry-run (aucun fichier modifié)…"
node apply-series.mjs

echo ""
echo "✅ Vérifie series-report.json"
echo "Si c’est OK, applique :"
echo "  node apply-series.mjs --apply"
