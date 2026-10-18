#!/usr/bin/env node
/**
 * Validasi pasca-rebrand RocAide:
 * - Semua JSON modifikasi masih valid
 * - Semua file JS yang tersentuh lolos syntax check
 * - Tidak ada sisa referensi brand lama di source tree
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..", "..");

const jsonFiles = [
  "package.json",
  "src/plugins/rocaide/package.json",
  "src/lang/en-us.json",
];
const jsFiles = [
  "src/main.js",
  "src/lib/commands.js",
  "src/pages/rocaide/index.js",
  "src/pages/rocaide/rocaide.js",
  "src/sidebarApps/rocaide/index.js",
  "src/sidebarApps/index.js",
  "src/plugins/rocaide/www/RocAide.js",
  "hooks/post-process.js",
];

let failed = 0;

for (const f of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(path.join(REPO_ROOT, f), "utf8"));
    console.log("JSON OK :", f);
  } catch (e) {
    failed++;
    console.error("JSON FAIL:", f, "->", e.message);
  }
}

for (const f of jsFiles) {
  try {
    execSync(`${process.execPath} --check ${JSON.stringify(path.join(REPO_ROOT, f))}`, { stdio: "pipe" });
    console.log("JS OK   :", f);
  } catch (e) {
    failed++;
    console.error("JS FAIL :", f, "->", e.stderr.toString());
  }
}

// Sisa referensi brand lama (dibangun dinamis agar tidak self-match)
const OLD_BRAND = ["roc", "dex"].join("");
const excludeDirs = new Set([
  "node_modules", ".git", "platforms", "plugins", "www", "ace-builds",
  ".gradle", "build",
]);
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".") || excludeDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (/\.(js|json|xml|html|md|scss|yml|ts)$/.test(entry.name)) {
      const p = path.join(dir, entry.name);
      if (p === __filename) continue; // jangan self-match (skrip ini memuat nama lama via join)
      const content = fs.readFileSync(p, "utf8");
      if (content.toLowerCase().includes(OLD_BRAND)) out.push(p);
    }
  }
  return out;
}
const leftovers = walk(REPO_ROOT, []);
if (leftovers.length) {
  failed++;
  console.error("LEFTOVER:", leftovers);
} else {
  console.log("CLEAN  : tidak ada sisa referensi brand lama di source tree");
}

process.exit(failed ? 1 : 0);
