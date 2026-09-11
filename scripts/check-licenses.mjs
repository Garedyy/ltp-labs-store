#!/usr/bin/env node
// Fails when any installed package (direct or transitive) carries a licence outside the allow-list.
// Policy: Docs/PROJECT_PLAN.md decision 30; named exceptions: Docs/DECISIONS.md D-1.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ALLOWED = new Set([
  "MIT",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "Unlicense",
  "0BSD",
  "CC0-1.0",
  "OFL-1.1",
  "MIT-0",
  "BlueOak-1.0.0",
  "Python-2.0",
]);

// Unmodified build-time-only transitive packages the approved stack cannot avoid (D-1).
// Keys are package names; "lightningcss-*" covers its per-platform binaries.
const EXCEPTIONS = {
  lightningcss: "MPL-2.0 - required by vite and @tailwindcss/node; build-time only, never bundled",
  "lightningcss-*": "MPL-2.0 - platform binaries of lightningcss",
  "caniuse-lite": "CC-BY-4.0 - browserslist data via @react-router/dev -> Babel; build-time only",
  "axe-core":
    "MPL-2.0 - rule metadata used by eslint-plugin-jsx-a11y; lint-time only, never bundled",
};

function isExcepted(name) {
  return Object.keys(EXCEPTIONS).some((pattern) =>
    pattern.endsWith("*") ? name.startsWith(pattern.slice(0, -1)) : name === pattern,
  );
}

const failures = [];
let checked = 0;

function licenceOf(manifest) {
  const raw = manifest.license ?? manifest.licenses;
  if (Array.isArray(raw)) return raw.map((entry) => entry.type ?? entry).join(" OR ");
  if (raw && typeof raw === "object") return raw.type ?? "";
  return typeof raw === "string" ? raw : "";
}

function isAllowed(expression) {
  const terms = expression.replace(/[()]/g, "").split(/\s+(?:OR|AND)\s+/);
  return expression !== "" && terms.every((term) => ALLOWED.has(term.trim()));
}

function inspect(dir) {
  const manifestPath = join(dir, "package.json");
  if (!existsSync(manifestPath)) return;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!manifest.name) return;
  checked += 1;
  const licence = licenceOf(manifest);
  if (isAllowed(licence) || isExcepted(manifest.name)) return;
  failures.push(`${manifest.name}@${manifest.version}: ${licence || "no licence field"}`);
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === ".bin") continue;
    const path = join(dir, entry.name);
    if (entry.name.startsWith("@")) {
      walk(path);
      continue;
    }
    inspect(path);
    const nested = join(path, "node_modules");
    if (existsSync(nested)) walk(nested);
  }
}

walk(join(process.cwd(), "node_modules"));

if (failures.length > 0) {
  console.error(`Licence check failed for ${failures.length} package(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  `Licence check passed: ${checked} packages, ${Object.keys(EXCEPTIONS).length} documented exceptions.`,
);
