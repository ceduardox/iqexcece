const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const SUSPICIOUS = [
  { label: "mojibake A-tilde", pattern: /Ã/g },
  { label: "mojibake Â", pattern: /Â/g },
  { label: "emoji mojibake", pattern: /ðŸ/g },
  { label: "replacement char", pattern: /�/g },
];

const TEXT_EXTENSIONS = new Set([
  ".cjs", ".css", ".html", ".js", ".json", ".jsx", ".md", ".mjs",
  ".sql", ".ts", ".tsx", ".txt", ".yml", ".yaml",
]);

const IGNORED_PATHS = [
  ".git/",
  ".codex-backups/",
  ".recovery/",
  "dist/",
  "node_modules/",
  "NOTAS_CODIFICACION_TEXTOS.md",
];

const MAX_FILE_BYTES = 2 * 1024 * 1024;

function runGit(args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getChangedFiles() {
  const staged = runGit(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
  const unstaged = runGit(["diff", "--name-only", "--diff-filter=ACMR"]);
  return Array.from(new Set([...staged, ...unstaged]));
}

function getAllTrackedFiles() {
  return runGit(["ls-files"]);
}

function shouldScan(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (IGNORED_PATHS.some((ignored) => normalized === ignored || normalized.startsWith(ignored))) {
    return false;
  }
  const ext = path.extname(normalized).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

function findLine(content, index) {
  const before = content.slice(0, index);
  return before.split(/\r?\n/).length;
}

function scanFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return [];

  const stat = fs.statSync(fullPath);
  if (!stat.isFile() || stat.size > MAX_FILE_BYTES) return [];

  const content = fs.readFileSync(fullPath, "utf8");
  const hits = [];

  for (const check of SUSPICIOUS) {
    check.pattern.lastIndex = 0;
    let match;
    while ((match = check.pattern.exec(content)) !== null) {
      hits.push({
        file: relativePath,
        line: findLine(content, match.index),
        token: match[0],
        label: check.label,
      });
      if (hits.length >= 10) break;
    }
  }

  return hits;
}

function main() {
  const allMode = process.argv.includes("--all");
  const files = (allMode ? getAllTrackedFiles() : getChangedFiles()).filter(shouldScan);

  if (files.length === 0) {
    console.log("Encoding check: no text files to scan.");
    return;
  }

  const findings = files.flatMap(scanFile);
  if (findings.length === 0) {
    console.log(`Encoding check: OK (${files.length} files scanned).`);
    return;
  }

  console.error(`Encoding check: found ${findings.length} suspicious token(s).`);
  for (const hit of findings.slice(0, 40)) {
    console.error(`- ${hit.file}:${hit.line} ${hit.label} (${hit.token})`);
  }
  console.error("Review the file encoding or source text before committing.");
  process.exit(1);
}

main();
