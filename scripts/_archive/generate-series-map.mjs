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
