import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const APPLY = process.argv.includes("--apply");
const MODE = APPLY ? "apply" : "dry-run";

const ARTICLES_DIR = process.env.ARTICLES_DIR || "content/articles";
const SERIES_DIR = process.env.SERIES_DIR || "content/series";

const REPORT = {
  mode: MODE,
  changed: [],
  skipped: [],
  errors: []
};

function walk(dir, exts) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, exts));
    else if (ent.isFile() && exts.some(ext => p.endsWith(ext))) out.push(p);
  }
  return out;
}

function dumpQuoted(obj) {
  // Force quotes everywhere it makes sense (strings).
  // forceQuotes applies to "strings that look like other types" + helps with : and ’ cases.
  // We also pick double quotes to avoid escaping apostrophes.
  return yaml.dump(obj, {
    lineWidth: 1000,
    quotingType: '"',
    forceQuotes: true,
    noRefs: true
  });
}

function rewriteSeriesYamlFile(abs) {
  const rel = abs.replace(process.cwd() + path.sep, "");
  try {
    const src = fs.readFileSync(abs, "utf8");
    const data = yaml.load(src);

    if (!data || typeof data !== "object") {
      REPORT.skipped.push({ file: rel, reason: "empty-or-non-object" });
      return;
    }

    const out = dumpQuoted(data);

    if (out !== src) {
      REPORT.changed.push({ file: rel, kind: "series-yml" });
      if (APPLY) fs.writeFileSync(abs, out);
    }
  } catch (e) {
    REPORT.errors.push({ file: rel, error: String(e?.message || e) });
  }
}

function rewriteArticleFrontMatter(abs) {
  const rel = abs.replace(process.cwd() + path.sep, "");
  const src = fs.readFileSync(abs, "utf8");
  if (!src.startsWith("---")) {
    REPORT.skipped.push({ file: rel, reason: "no-frontmatter" });
    return;
  }

  const end = src.indexOf("\n---", 3);
  if (end === -1) {
    REPORT.errors.push({ file: rel, error: "frontmatter-not-closed" });
    return;
  }

  const fmRaw = src.slice(3, end).trimEnd();
  const body = src.slice(end + 4); // includes newline(s)

  let meta;
  try {
    meta = yaml.load(fmRaw) || {};
  } catch (e) {
    REPORT.errors.push({ file: rel, error: "yaml-parse-failed: " + String(e?.message || e) });
    return;
  }

  const newFm = dumpQuoted(meta).trimEnd();
  const rebuilt = `---\n${newFm}\n---\n${body.replace(/^\n+/, "")}`;

  if (rebuilt !== src) {
    REPORT.changed.push({ file: rel, kind: "article-frontmatter" });
    if (APPLY) fs.writeFileSync(abs, rebuilt);
  }
}

function main() {
  // Ensure dependency is present
  // (will already be installed by the bash)
  const articleFiles = walk(ARTICLES_DIR, [".md"]);
  const seriesFiles = walk(SERIES_DIR, [".yml", ".yaml"]);

  for (const f of seriesFiles) rewriteSeriesYamlFile(f);
  for (const f of articleFiles) rewriteArticleFrontMatter(f);

  fs.writeFileSync("quote-yaml-report.json", JSON.stringify(REPORT, null, 2));

  console.log(`✔ Mode: ${MODE}`);
  console.log(`✔ Changés: ${REPORT.changed.length}`);
  console.log(`✔ Skippés: ${REPORT.skipped.length}`);
  console.log(`✔ Erreurs: ${REPORT.errors.length}`);
  console.log("→ Rapport: quote-yaml-report.json");
  if (!APPLY) console.log("ℹ Pour appliquer: node quote-yaml-everywhere.mjs --apply");
}

main();
