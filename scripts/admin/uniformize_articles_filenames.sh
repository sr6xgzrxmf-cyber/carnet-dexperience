#!/usr/bin/env bash
set -euo pipefail

ARTICLES_DIR="content/articles"
NODE_SCRIPT="scripts/uniformize_articles_filenames.mjs"

mkdir -p scripts

if [ ! -d "$ARTICLES_DIR" ]; then
  echo "❌ Dossier introuvable: $ARTICLES_DIR"
  exit 1
fi

echo "📦 Installation dépendance gray-matter (si absente)…"
npm i gray-matter --silent

cat > "$NODE_SCRIPT" <<'JS'
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { execSync } from "child_process";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const APPLY = process.env.APPLY === "1";

function slugify(str) {
  return String(str)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
}

function isIsoDate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function gitMv(fromAbs, toAbs) {
  const fromRel = path.relative(process.cwd(), fromAbs);
  const toRel = path.relative(process.cwd(), toAbs);
  execSync(`git mv "${fromRel}" "${toRel}"`, { stdio: "inherit" });
}

const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith(".md"));
const planned = [];
const issues = [];

for (const filename of files) {
  const abs = path.join(ARTICLES_DIR, filename);
  const raw = fs.readFileSync(abs, "utf8");
  const { data } = matter(raw);

  if (!data?.title || !data?.date) {
    issues.push({ file: filename, issue: "Missing title or date in YAML" });
    continue;
  }

  const date = String(data.date).slice(0, 10);
  if (!isIsoDate(date)) {
    issues.push({ file: filename, issue: `Invalid date: ${data.date}` });
    continue;
  }

  const slug = slugify(data.title);
  const target = `${date}-${slug}.md`;

  if (target !== filename) {
    planned.push({ from: filename, to: target });
  }
}

console.log("");
console.log("🗂️ Uniformisation des articles");
console.log(`🧪 Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
console.log("");

for (const p of planned) {
  console.log(`- ${p.from} → ${p.to}`);
}

if (issues.length) {
  console.log("");
  console.log("⚠️ Problèmes détectés:");
  for (const i of issues) {
    console.log(`- ${i.file}: ${i.issue}`);
  }
}

if (!APPLY) {
  console.log("");
  console.log("➡️ Relance avec APPLY=1 pour appliquer");
  process.exit(0);
}

for (const p of planned) {
  gitMv(
    path.join(ARTICLES_DIR, p.from),
    path.join(ARTICLES_DIR, p.to)
  );
}

console.log("");
console.log("✅ Terminé.");
JS

node "$NODE_SCRIPT"
