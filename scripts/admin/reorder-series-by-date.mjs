import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const APPLY = process.argv.includes("--apply");
const DRY = !APPLY;

const ARTICLES_DIR = process.env.ARTICLES_DIR || "content/articles";
const REPORT_PATH = "series-reorder-report.json";

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
  const body = src.slice(end + 4);
  const meta = yaml.load(fmRaw) || {};
  return { meta, body };
}

function dump(meta, body) {
  const newFm = yaml.dump(meta, { lineWidth: 1000 });
  return `---\n${newFm}---\n${body.replace(/^\n+/, "")}`;
}

function isoKey(date) {
  // Tri fiable sur ISO "YYYY-MM-DD" ; si invalide => très grand (à la fin)
  const s = String(date || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return "9999-99-99";
}

const files = walk(ARTICLES_DIR);

// Regroupe par series.slug
const bySeries = new Map(); // slug -> [{file, abs, meta}]
for (const abs of files) {
  const src = fs.readFileSync(abs, "utf8");
  const parsed = parseFrontMatter(src);
  if (!parsed) continue;

  const { meta } = parsed;
  const s = meta.series;

  if (!s || typeof s !== "object" || !s.slug) continue;

  const slug = String(s.slug);
  const rel = abs.replace(process.cwd() + path.sep, "");

  if (!bySeries.has(slug)) bySeries.set(slug, []);
  bySeries.get(slug).push({ abs, rel, meta });
}

// Calcule ordre 0..n par série
const report = [];
let touched = 0;

for (const [seriesSlug, items] of bySeries.entries()) {
  // Tri : date asc (publication), puis slug fichier (stable)
  const sorted = [...items].sort((a, b) => {
    const da = isoKey(a.meta.date);
    const db = isoKey(b.meta.date);
    if (da !== db) return da.localeCompare(db);
    return a.rel.localeCompare(b.rel);
  });

  sorted.forEach((it, idx) => {
    const before = it.meta.series?.order;
    const after = idx;

    if (before !== after) {
      report.push({
        file: it.rel,
        series: seriesSlug,
        date: it.meta.date || null,
        from: before ?? null,
        to: after
      });

      it.meta.series = {
        ...it.meta.series,
        order: after
      };

      if (APPLY) {
        const src = fs.readFileSync(it.abs, "utf8");
        const parsed = parseFrontMatter(src);
        if (!parsed) return;

        fs.writeFileSync(it.abs, dump(it.meta, parsed.body));
      }

      touched++;
    }
  });
}

fs.writeFileSync(REPORT_PATH, JSON.stringify({
  mode: DRY ? "dry-run" : "apply",
  seriesCount: bySeries.size,
  changedCount: touched,
  changes: report
}, null, 2));

console.log(`✔ Mode: ${DRY ? "dry-run" : "apply"}`);
console.log(`✔ Séries détectées: ${bySeries.size}`);
console.log(`✔ Articles modifiés: ${touched}`);
console.log(`→ Rapport: ${REPORT_PATH}`);
if (DRY) console.log("ℹ Pour appliquer: node reorder-series-by-date.mjs --apply");
