import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const FIX = args.has("--fix");
const STRICT = args.has("--strict");

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const IMG_DIR = path.join(ROOT, "public", "images", "articles");

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (name === ".venv" || name === "node_modules" || name === ".git" || name === ".obsidian") continue;

    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function extractCover(md) {
  const m = md.match(/^cover:\s*["']?([^"'\n]+)["']?\s*$/m);
  return m ? m[1].trim() : null;
}

function normalizeCover(c) {
  if (!c) return c;
  c = c.replace(/\u00A0/g, " ").trim();
  c = c.replace(/\\/g, "/");
  if (c.startsWith("images/articles/")) c = "/" + c;
  return c;
}

function fileExistsPublic(cover) {
  if (!cover) return { ok: false, reason: "no cover line" };
  if (!cover.startsWith("/images/articles/")) return { ok: false, reason: "not in /images/articles" };

  const rel = cover.replace(/^\/+/, "");
  const disk = path.join(ROOT, "public", rel);

  if (fs.existsSync(disk)) return { ok: true, disk };

  const base = disk.replace(/\.[^.]+$/, "");
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const cand = base + ext;
    if (fs.existsSync(cand)) {
      return {
        ok: false,
        reason: `missing on disk (but found ${path.basename(cand)})`,
        hint:
          "/" +
          path
            .relative(path.join(ROOT, "public"), cand)
            .replaceAll("\\", "/"),
      };
    }
  }

  return { ok: false, reason: "missing on disk" };
}

function listImages() {
  const names = new Set();
  if (!fs.existsSync(IMG_DIR)) return names;
  for (const n of fs.readdirSync(IMG_DIR)) {
    if (/\.(jpg|jpeg|png|webp)$/i.test(n)) names.add(n);
  }
  return names;
}

function gitTrackedSet() {
  try {
    const out = execSync("git ls-files public/images/articles", { encoding: "utf8" });
    return new Set(out.split("\n").filter(Boolean));
  } catch {
    return new Set();
  }
}

const rel = (p) => path.relative(ROOT, p).replaceAll("\\", "/");

function slugFromPublishedPath(filePath) {
  const base = path.basename(filePath).replace(/\.md$/, "");
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function replaceCoverLine(md, newCover) {
  if (/^cover:\s*/m.test(md)) {
    return md.replace(/^cover:\s*.*$/m, `cover: "${newCover}"`);
  }
  if (/^date:\s*/m.test(md)) {
    return md.replace(/^date:\s*.*$/m, (m) => `${m}\ncover: "${newCover}"`);
  }
  return md.replace(/^---\s*\n/, (m) => `${m}cover: "${newCover}"\n`);
}

const isArticleMd = (p) => {
  const r = rel(p);
  if (!r.startsWith("content/articles/")) return false;
  if (!r.endsWith(".md")) return false;

  // drafts (souple)
  if (r.startsWith("content/articles/drafts/")) return true;

  // publiés (strict) : YYYY-MM-DD-*.md
  const base = path.basename(r);
  return /^\d{4}-\d{2}-\d{2}-.*\.md$/.test(base);
};

const mdFiles = walk(ARTICLES_DIR).filter(isArticleMd);
const imgNames = listImages();
const tracked = gitTrackedSet();

const missing = [];
const suspicious = [];
const ok = [];

for (const f of mdFiles) {
  const r = rel(f);
  const isDraft = r.startsWith("content/articles/drafts/");
  const isPublished = !isDraft;

  const md = readText(f);
  const coverRaw = extractCover(md);
  const cover = normalizeCover(coverRaw);

  // --fix : cover = /images/articles/<slug>.jpg pour les publiés
  if (isPublished && FIX) {
    const slug = slugFromPublishedPath(f);
    const wanted = `/images/articles/${slug}.jpg`;
    if (cover !== wanted) {
      const next = replaceCoverLine(md, wanted);
      fs.writeFileSync(f, next, "utf8");
    }
  }

  const md2 = FIX ? readText(f) : md;
  const coverRaw2 = extractCover(md2);
  const cover2 = normalizeCover(coverRaw2);

  if (!cover2) {
    if (isDraft && !STRICT) {
      suspicious.push({ file: f, cover: null, issue: "draft without cover (ok)" });
      continue;
    }
    missing.push({ file: f, cover: null, issue: isDraft ? "draft missing cover (STRICT)" : "published article missing cover:" });
    continue;
  }

  if (cover2 !== coverRaw2) {
    suspicious.push({ file: f, cover: coverRaw2, issue: "cover has weird spaces / normalized", normalized: cover2 });
  }

  const check = fileExistsPublic(cover2);

  if (!check.ok) {
    const name = cover2.split("/").pop();
    const close = name && !imgNames.has(name) ? " (file not present in public/images/articles)" : "";
    missing.push({ file: f, cover: cover2, issue: check.reason + close, hint: check.hint || null });
  } else {
    ok.push({ file: f, cover: cover2, disk: check.disk });
  }
}

console.log("════════════════════════════════════════");
console.log("AUDIT MD → COVERS");
console.log("════════════════════════════════════════");
console.log("Articles:", mdFiles.length);
console.log("OK covers:", ok.length);
console.log("Missing/invalid:", missing.length);
console.log("Suspicious:", suspicious.length);
console.log();

if (missing.length) {
  console.log("1) Covers manquantes / invalides");
  for (const x of missing) {
    console.log("❌", x.cover);
    console.log("   ↳", rel(x.file));
    if (x.hint) console.log("   hint:", x.hint);
    console.log("   issue:", x.issue);
  }
  console.log();
}

if (suspicious.length) {
  console.log("2) Covers suspectes (espaces, normalisation, etc.)");
  for (const x of suspicious.slice(0, 80)) {
    console.log("🟠", rel(x.file));
    console.log("   cover:", x.cover);
    console.log("   issue:", x.issue);
    if (x.normalized) console.log("   normalized:", x.normalized);
  }
  if (suspicious.length > 80) console.log("... +" + (suspicious.length - 80) + " more");
  console.log();
}

// Bonus : images présentes sur disque mais pas versionnées
const diskImages = [];
if (fs.existsSync(IMG_DIR)) {
  for (const name of fs.readdirSync(IMG_DIR)) {
    if (/\.(jpg|jpeg|png|webp)$/i.test(name)) {
      diskImages.push(`public/images/articles/${name}`);
    }
  }
}
const notTracked = diskImages.filter((p) => !tracked.has(p));

if (notTracked.length) {
  console.log("3) Images sur disque mais PAS dans git");
  for (const p of notTracked.slice(0, 200)) console.log("🟠", p);
  if (notTracked.length > 200) console.log("... +" + (notTracked.length - 200) + " more");
  console.log();
}

console.log("✅ Audit terminé.");
process.exit(missing.length ? 1 : 0);
