cat > scripts/uniformize_articles_filenames.mjs <<'JS'
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

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch (e) {
    console.error(`❌ Command failed: ${cmd}`);
    console.error(e?.message ?? e);
    return false;
  }
}

const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"));
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
  if (!slug) {
    issues.push({ file: filename, issue: "Title slugifies to empty string" });
    continue;
  }

  const target = `${date}-${slug}.md`;
  if (target !== filename) planned.push({ from: filename, to: target });
}

console.log("");
console.log("🗂️ Uniformisation des articles");
console.log(`🧪 Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
console.log("");

if (planned.length === 0) console.log("ℹ️ Rien à renommer.");
for (const p of planned) console.log(`- ${p.from} → ${p.to}`);

if (issues.length) {
  console.log("");
  console.log("⚠️ Problèmes détectés:");
  for (const i of issues) console.log(`- ${i.file}: ${i.issue}`);
}

if (!APPLY) {
  console.log("");
  console.log("➡️ Relance avec APPLY=1 pour appliquer");
  process.exit(0);
}

console.log("");
console.log("✅ Application...");

for (const p of planned) {
  const fromAbs = path.join(ARTICLES_DIR, p.from);
  const toAbs = path.join(ARTICLES_DIR, p.to);

  if (!fs.existsSync(fromAbs)) {
    console.log(`⚠️ Skip (source manquante): ${p.from}`);
    continue;
  }
  if (fs.existsSync(toAbs)) {
    console.log(`⚠️ Skip (cible existe déjà): ${p.to}`);
    continue;
  }

  const fromRel = path.relative(process.cwd(), fromAbs);
  const toRel = path.relative(process.cwd(), toAbs);

  // git mv (si possible), sinon on te dira pourquoi
  const ok = run(`git mv "${fromRel}" "${toRel}"`);
  if (!ok) {
    console.log("👉 Essaie ce diagnostic :");
    console.log(`   ls -la "${fromRel}"`);
    console.log(`   ls -la "${toRel}"`);
    console.log("   git status --porcelain");
    console.log("   git rev-parse --is-inside-work-tree");
    process.exit(1);
  }
}

console.log("");
console.log("🎉 Terminé. Vérifie puis commit/push.");
JS