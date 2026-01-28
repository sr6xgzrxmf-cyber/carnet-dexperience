import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");

// 👉 adapte si besoin : certains projets mettent les covers dans /public/images/articles
const PUBLIC_DIRS = [
  path.join(ROOT, "public", "images", "articles"),
  path.join(ROOT, "public", "images"),
  path.join(ROOT, "public"),
];

// -------- helpers --------
const exists = (p) => {
  try { fs.accessSync(p, fs.constants.F_OK); return true; } catch { return false; }
};

function walkFiles(dir, exts = new Set([".md", ".mdx"])) {
  const out = [];
  if (!exists(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkFiles(p, exts));
    else if (exts.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}

function walkPublicFiles(dir) {
  const out = [];
  if (!exists(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkPublicFiles(p));
    else out.push(p);
  }
  return out;
}

// Extrait cover: ... du front-matter YAML (simple mais efficace pour ton usage)
function extractCover(md) {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return null;
  const fm = m[1];

  // cover: /images/... ou cover: images/... ou cover: "..."
  const line = fm.match(/^\s*cover\s*:\s*(.+)\s*$/m);
  if (!line) return null;

  let v = line[1].trim();
  v = v.replace(/^['"]|['"]$/g, ""); // strip quotes
  return v || null;
}

function normalizePublicPath(p) {
  if (!p) return null;
  const s = String(p).trim();
  if (!s) return null;
  // url absolue => on ignore (covers externes)
  if (/^https?:\/\//i.test(s)) return { kind: "external", value: s };
  // normalise en path web /...
  const web = s.startsWith("/") ? s : `/${s}`;
  return { kind: "local", value: web };
}

function findInPublic(webPath) {
  // webPath est du genre /images/articles/foo.jpg
  const rel = webPath.replace(/^\//, "");
  for (const base of PUBLIC_DIRS) {
    const candidate = path.join(base, rel.replace(/^images\//, "")); 
    // ^ si base = public/images, on enlève "images/" ; si base = public, on garde
    if (exists(candidate)) return candidate;
  }
  // Essaie aussi en relatif à public/ directement
  const direct = path.join(ROOT, "public", rel);
  if (exists(direct)) return direct;

  return null;
}

function riskyName(name) {
  return /[:\s]/.test(name) || /[A-Z]/.test(name);
}

// -------- main --------
const articleFiles = walkFiles(ARTICLES_DIR);
if (!articleFiles.length) {
  console.error(`❌ Aucun fichier article trouvé dans ${ARTICLES_DIR}`);
  process.exit(1);
}

const referenced = new Map(); // webPath -> [articleFile...]
const externals = [];

for (const f of articleFiles) {
  const md = fs.readFileSync(f, "utf-8");
  const cover = extractCover(md);
  const norm = normalizePublicPath(cover);
  if (!norm) continue;
  if (norm.kind === "external") {
    externals.push({ article: f, cover: norm.value });
    continue;
  }
  const webPath = norm.value;
  if (!referenced.has(webPath)) referenced.set(webPath, []);
  referenced.get(webPath).push(f);
}

// Index public images (jpg/jpeg/png/webp)
const imgExts = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const publicAll = new Set();
const publicRisky = [];

for (const base of PUBLIC_DIRS) {
  for (const p of walkPublicFiles(base)) {
    const ext = path.extname(p).toLowerCase();
    if (!imgExts.has(ext)) continue;
    // calcule le web path plausible
    // si base=public/images/articles => web path /images/articles/...
    // si base=public/images => /images/...
    // si base=public => /...
    let rel = path.relative(base, p).split(path.sep).join("/");
    let web;
    if (base.endsWith(path.join("public", "images", "articles"))) web = `/images/articles/${rel}`;
    else if (base.endsWith(path.join("public", "images"))) web = `/images/${rel}`;
    else if (base.endsWith(path.join("public"))) web = `/${rel}`;
    else web = `/${rel}`;

    publicAll.add(web);

    const fname = path.basename(p);
    if (riskyName(fname)) publicRisky.push({ file: p, web });
  }
}

// 1) missing referenced
const missing = [];
for (const [webPath, who] of referenced.entries()) {
  const found = findInPublic(webPath);
  if (!found) missing.push({ web: webPath, usedBy: who });
}

// 2) orphans in public (only for paths under /images/articles by default)
const referencedSet = new Set([...referenced.keys()]);
const orphans = [];
for (const web of publicAll) {
  // on se concentre sur /images/articles/* en priorité (sinon trop large)
  if (!web.startsWith("/images/articles/")) continue;
  if (!referencedSet.has(web)) orphans.push(web);
}

// Output
function printSection(title) {
  console.log("\n" + "═".repeat(80));
  console.log(title);
  console.log("═".repeat(80));
}

printSection("1) Covers référencées mais fichiers introuvables");
if (!missing.length) console.log("✅ Aucun manque détecté.");
else {
  for (const m of missing) {
    console.log(`❌ ${m.web}`);
    for (const a of m.usedBy) console.log(`   ↳ ${path.relative(ROOT, a)}`);
  }
}

printSection("2) Images orphelines (présentes mais non référencées) — /images/articles");
if (!orphans.length) console.log("✅ Aucune image orpheline détectée.");
else {
  for (const o of orphans.sort()) console.log(`🟠 ${o}`);
}

printSection("3) Noms de fichiers à risque (espaces, ':', majuscules)");
if (!publicRisky.length) console.log("✅ Aucun nom à risque détecté.");
else {
  for (const r of publicRisky) console.log(`🟣 ${r.web}  (disk: ${path.relative(ROOT, r.file)})`);
}

printSection("4) Covers externes (non auditées)");
if (!externals.length) console.log("✅ Aucune cover externe.");
else {
  for (const e of externals) console.log(`🔵 ${path.relative(ROOT, e.article)} -> ${e.cover}`);
}

console.log("\n✅ Audit terminé.");
