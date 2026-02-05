import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");

// Default: dry-run if nothing provided
const MODE = APPLY ? "apply" : "dry-run";

const ARTICLES_DIR = process.env.ARTICLES_DIR || "content/articles";
const TAGS_MAP = JSON.parse(fs.readFileSync("tags-map.json", "utf8"));

const CANONICAL_TAGS = new Set([
  "posture-professionnelle",
  "management",
  "leadership",
  "management-de-proximite",
  "organisation",
  "prise-de-decision",
  "pilotage",
  "responsabilite",

  "pedagogie",
  "andragogie",
  "formation",
  "apprentissage",
  "developpement-des-competences",

  "communication",
  "feedback",
  "relation-client",
  "negociation",
  "influence",

  "travail",
  "terrain",
  "experience-client",
  "retail",
  "innovation"
]);

const SERIES_NAME_BY_SLUG = {
  "atelier-de-posture": "Atelier de posture",
  "construire-carnet-experience": "Construire Carnet d’expérience",
  "durableetengage": "Marketing durable et engagé",
  "lois-utiles": "Lois utiles"
};

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
  return { meta, body, end };
}

function normalizeTag(t) {
  const raw = String(t ?? "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const mapped = TAGS_MAP[raw] || TAGS_MAP[lower] || raw;
  return mapped;
}

function uniq(arr) {
  return [...new Set(arr)];
}

const files = walk(ARTICLES_DIR);
const report = [];

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const parsed = parseFrontMatter(src);
  if (!parsed) continue;

  const before = structuredClone(parsed.meta);
  const meta = parsed.meta;

  const actions = [];

  // ---- TAGS ----
  if (Array.isArray(meta.tags)) {
    const original = meta.tags.map(String);
    const normalized = original
      .map(normalizeTag)
      .filter(Boolean)
      .filter(t => CANONICAL_TAGS.has(t));

    const deduped = uniq(normalized);

    // Limit: 4 max
    const limited = deduped.slice(0, 4);

    if (JSON.stringify(original) !== JSON.stringify(limited)) {
      meta.tags = limited;
      actions.push({ type: "tags", from: original, to: limited });
    }
  }

  // ---- SERIES.NAME ----
  if (meta.series && typeof meta.series === "object") {
    const slug = meta.series.slug;
    const hasName = typeof meta.series.name === "string" && meta.series.name.trim().length > 0;

    if (slug && !hasName) {
      const name = SERIES_NAME_BY_SLUG[String(slug)] || String(slug);
      meta.series.name = name;
      actions.push({ type: "series.name", slug: String(slug), setTo: name });
    }
  }

  if (actions.length) {
    report.push({
      file,
      mode: MODE,
      actions,
      before,
      after: structuredClone(meta)
    });

    if (APPLY) {
      const newFm = yaml.dump(meta, { lineWidth: 1000 });
      const newSrc = `---\n${newFm}---\n${parsed.body.replace(/^\n+/, "")}`;
      fs.writeFileSync(file, newSrc);
    }
  }
}

fs.writeFileSync("normalize-report.json", JSON.stringify(report, null, 2));

console.log(`✔ Mode: ${MODE}`);
console.log(`✔ Fichiers scannés: ${files.length}`);
console.log(`✔ Fichiers impactés: ${report.length}`);
console.log(`→ Rapport: normalize-report.json`);

if (!APPLY) {
  console.log("ℹ Pour appliquer: node normalize-frontmatter.mjs --apply");
}
