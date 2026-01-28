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
