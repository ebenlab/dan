#!/usr/bin/env node
// Structural checks for the /dan package. Zero dependencies.
// Usage: node scripts/validate.mjs
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skill = join(root, "skills", "dan");
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(p, "utf8");

// 1. SKILL.md frontmatter
const skillMd = read(join(skill, "SKILL.md"));
const fm = skillMd.match(/^---\n([\s\S]*?)\n---/);
if (!fm) fail("SKILL.md: missing frontmatter");
else {
  if (!/^name:\s*dan\s*$/m.test(fm[1])) fail("SKILL.md: name must be 'dan'");
  if (!/^description:/m.test(fm[1])) fail("SKILL.md: missing description");
}

// 2. Required files
const required = [
  "ENTRY.md", "PRINCIPLES.md", "VOICE.md", "WORKFLOWS.md", "CAPABILITIES.md", "SOURCES.md", "CHANGELOG.md",
  "references/engineering-judgment.md", "references/communication-examples.md", "references/definition-of-done.md",
  "schemas/task.schema.json", "schemas/evidence.schema.json", "schemas/action-proposal.schema.json",
  "schemas/workspace-adapter.schema.json", "adapters/example.adapter.json",
];
for (const f of required) if (!existsSync(join(skill, f))) fail(`missing skills/dan/${f}`);

// 3. Every workflow referenced in ENTRY.md / WORKFLOWS.md exists, and every workflow file is indexed
const wfDir = join(skill, "workflows");
const wfFiles = new Set(readdirSync(wfDir).filter((f) => f.endsWith(".md")));
for (const doc of ["ENTRY.md", "WORKFLOWS.md"]) {
  for (const m of read(join(skill, doc)).matchAll(/workflows\/([a-z-]+\.md)/g)) {
    if (!wfFiles.has(m[1])) fail(`${doc}: references missing workflows/${m[1]}`);
  }
}
const index = read(join(skill, "WORKFLOWS.md"));
for (const f of wfFiles) if (!index.includes(`workflows/${f}`)) fail(`WORKFLOWS.md: does not index workflows/${f}`);

// 4. Relative markdown links resolve
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
for (const file of walk(skill).filter((p) => p.endsWith(".md"))) {
  for (const m of read(file).matchAll(/\]\(([^)#\s]+)\)/g)) {
    const target = m[1];
    if (/^[a-z]+:/i.test(target)) continue;
    if (!existsSync(resolve(dirname(file), target))) fail(`${file.slice(root.length + 1)}: broken link ${target}`);
  }
}

// 5. JSON parses; schemas declare a title; example adapter has the required keys
const schemas = {};
for (const f of readdirSync(join(skill, "schemas"))) {
  try {
    const s = JSON.parse(read(join(skill, "schemas", f)));
    if (!s.title) fail(`schemas/${f}: missing title`);
    schemas[s.title] = s;
  } catch (e) { fail(`schemas/${f}: invalid JSON (${e.message})`); }
}
const checkRequired = (obj, schema, label) => {
  for (const k of schema.required ?? []) if (!(k in obj)) fail(`${label}: missing required '${k}'`);
  if (schema.additionalProperties === false) {
    for (const k of Object.keys(obj)) if (!(k in (schema.properties ?? {}))) fail(`${label}: unknown key '${k}'`);
  }
};
try {
  const adapter = JSON.parse(read(join(skill, "adapters", "example.adapter.json")));
  if (schemas.WorkspaceAdapter) checkRequired(adapter, schemas.WorkspaceAdapter, "adapters/example.adapter.json");
} catch (e) { fail(`adapters/example.adapter.json: invalid JSON (${e.message})`); }

// 6. Eval cases
try {
  const { cases } = JSON.parse(read(join(root, "evals", "cases.json")));
  const ids = new Set();
  for (const c of cases) {
    for (const k of ["id", "workflow", "granted_level", "scenario", "must", "must_not"]) if (!(k in c)) fail(`evals: case ${c.id ?? "?"} missing ${k}`);
    if (ids.has(c.id)) fail(`evals: duplicate id ${c.id}`);
    ids.add(c.id);
    if (c.workflow !== "none" && !wfFiles.has(`${c.workflow}.md`)) fail(`evals: case ${c.id} references unknown workflow ${c.workflow}`);
    if (!c.must_not?.length) fail(`evals: case ${c.id} needs at least one must_not`);
  }
  if (cases.length < 12) fail(`evals: expected the 12 spec cases, found ${cases.length}`);
} catch (e) { fail(`evals/cases.json: ${e.message}`); }

// 7. Public-repo hygiene: no real adapters committed, no obvious secrets
for (const file of walk(root).filter((p) => !p.includes("/.git/") && !p.includes("/node_modules/"))) {
  const rel = file.slice(root.length + 1);
  if (rel.endsWith(".adapter.json") && !rel.endsWith("example.adapter.json")) fail(`${rel}: real adapters must stay private`);
  if (/\.(md|json|mjs|sh|ya?ml)$/.test(rel)) {
    const text = read(file);
    if (/(gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(text)) fail(`${rel}: looks like it contains a secret`);
  }
}

// 8. Private denylist: employer/customer terms that must never appear in this public repo.
// The list itself stays private (gitignored), so the repo never names what it is guarding.
// Source: $DAN_DENYLIST, else .dan/denylist.txt. One term per line, '#' comments allowed.
const denyPath = process.env.DAN_DENYLIST || join(root, ".dan", "denylist.txt");
if (existsSync(denyPath)) {
  const terms = read(denyPath).split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean);
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const deny = terms.length ? new RegExp(`(?<![a-z0-9])(${terms.map(escape).join("|")})(?![a-z0-9])`, "i") : null;
  const scanned = walk(root).filter((p) => !p.includes("/.git/") && !p.includes("/.dan/") && !p.includes("/node_modules/"));
  for (const file of deny ? scanned : []) {
    const rel = file.slice(root.length + 1);
    read(file).split("\n").forEach((line, i) => {
      const hit = line.match(deny);
      if (hit) fail(`${rel}:${i + 1}: private term "${hit[1]}" must not be published`);
    });
  }
  console.log(`· denylist: ${terms.length} private term(s) checked`);
} else if (process.env.CI !== "true") {
  console.log("· denylist: none found (create .dan/denylist.txt to guard employer terms)");
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("✓ /dan package looks structurally sound");
