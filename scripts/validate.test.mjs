#!/usr/bin/env node
// Negative fixture tests for scripts/validate.mjs. Zero dependencies (node:test).
// Usage: node --test scripts/validate.test.mjs
//
// Each test copies the publishable files into a temp dir, plants a fixture, and runs the
// validator there. Fixture terms and tokens are built at runtime so this file never
// contains them literally (the validator scans this file too).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync, realpathSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TERM = ["Zor", "blax"].join("");                  // invented private term
const TOKEN = ["gh", "p_"].join("") + "A".repeat(36);  // token-shaped, not a real secret

// Inside a git hook, git exports GIT_DIR / GIT_INDEX_FILE / … pointing at the real repo.
// Fixture git calls must never inherit them, or they would write to the real index.
const baseEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
const git = (args, cwd) => spawnSync("git", args, { cwd, env: baseEnv, encoding: "utf8" });

const listed = git(["ls-files", "-z", "--cached", "--others", "--exclude-standard"], repo);
assert.equal(listed.status, 0, "tests must run from a git checkout");
const sources = listed.stdout.split("\0").filter(Boolean);

// Fresh copy of the publishable tree. withGit: init a repo so validate.mjs uses git's file list.
const fixture = (withGit) => {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "dan-validate-")));
  for (const rel of sources) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    cpSync(join(repo, rel), join(dir, rel));
  }
  if (withGit) {
    git(["init", "-q"], dir);
    git(["add", "-A"], dir);
  }
  return dir;
};
const put = (dir, rel, text) => {
  mkdirSync(dirname(join(dir, rel)), { recursive: true });
  writeFileSync(join(dir, rel), text);
};
const run = (dir, env = {}) => {
  const clean = { ...baseEnv };
  delete clean.DAN_DENYLIST;
  delete clean.CI;
  const r = spawnSync(process.execPath, [join(dir, "scripts", "validate.mjs")], { cwd: dir, env: { ...clean, ...env }, encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
};
const withDenylist = (dir) => put(dir, ".dan/denylist.txt", `# fixture\n${TERM}\n`);

for (const mode of [{ name: "git", withGit: true }, { name: "no git", withGit: false }]) {
  test(`[${mode.name}] clean copy passes`, () => {
    const dir = fixture(mode.withGit);
    withDenylist(dir);
    const r = run(dir);
    rmSync(dir, { recursive: true, force: true });
    assert.equal(r.code, 0, r.out);
  });

  test(`[${mode.name}] private term in a public file fails`, () => {
    const dir = fixture(mode.withGit);
    withDenylist(dir);
    put(dir, "skills/dan/domains/leak.md", `Notes about ${TERM} internals\n`);
    const r = run(dir);
    rmSync(dir, { recursive: true, force: true });
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /skills\/dan\/domains\/leak\.md:1/);
  });

  test(`[${mode.name}] same term in .agent-exchange/ and .dan/ passes`, () => {
    const dir = fixture(mode.withGit);
    withDenylist(dir);
    put(dir, ".agent-exchange/codex/0001-review.md", `Mentions ${TERM}\n`);
    put(dir, ".dan/notes.md", `Mentions ${TERM}\n`);
    const r = run(dir);
    rmSync(dir, { recursive: true, force: true });
    assert.equal(r.code, 0, r.out);
  });

  test(`[${mode.name}] token-shaped string in private folders does not fail`, () => {
    const dir = fixture(mode.withGit);
    put(dir, ".dan/denylist.txt", `${TERM}\n${TOKEN}\n`);
    put(dir, ".agent-exchange/claude/0001-response.md", `${TOKEN}\n`);
    const r = run(dir);
    rmSync(dir, { recursive: true, force: true });
    assert.equal(r.code, 0, r.out);
  });

  test(`[${mode.name}] token-shaped string in a public file fails`, () => {
    const dir = fixture(mode.withGit);
    put(dir, "evals/notes.md", `token: ${TOKEN}\n`);
    const r = run(dir);
    rmSync(dir, { recursive: true, force: true });
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /evals\/notes\.md: looks like it contains a secret/);
  });

  test(`[${mode.name}] CI=true reports the location but masks the term`, () => {
    const dir = fixture(mode.withGit);
    withDenylist(dir);
    put(dir, "README-extra.md", `line one\nabout ${TERM}\n`);
    const r = run(dir, { CI: "true" });
    rmSync(dir, { recursive: true, force: true });
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /README-extra\.md:2: a private term \(masked\)/);
    assert.ok(!r.out.includes(TERM), "term leaked into CI output");
  });

  test(`[${mode.name}] denylist outside the repo via DAN_DENYLIST still applies`, () => {
    const dir = fixture(mode.withGit);
    const list = join(realpathSync(mkdtempSync(join(tmpdir(), "dan-deny-"))), "terms.txt");
    writeFileSync(list, `${TERM}\n`);
    put(dir, "AGENTS-extra.md", `${TERM}\n`);
    const r = run(dir, { DAN_DENYLIST: list });
    rmSync(dir, { recursive: true, force: true });
    rmSync(dirname(list), { recursive: true, force: true });
    assert.equal(r.code, 1, r.out);
  });
}

test("[git] gitignored local adapter is not treated as published", () => {
  const dir = fixture(true);
  put(dir, "skills/dan/adapters/work.adapter.json", "{}\n");
  const r = run(dir);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(r.code, 0, r.out);
});

test("[git] force-added private file is scanned (it would be published)", () => {
  const dir = fixture(true);
  withDenylist(dir);
  put(dir, ".agent-exchange/claude/0001-response.md", `Mentions ${TERM}\n`);
  git(["add", "-f", ".agent-exchange/claude/0001-response.md"], dir);
  const r = run(dir);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(r.code, 1, r.out);
});
