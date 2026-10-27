#!/usr/bin/env node
// Tests for scripts/install.sh. Zero dependencies (node:test).
// Usage: node --test scripts/install.test.mjs
//
// Each test copies the repo's skills/ and install.sh into a temp "source" checkout and
// installs into a temp destination. Nothing touches ~/.claude or ~/.codex.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync, realpathSync, existsSync, readdirSync, lstatSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = readdirSync(join(repo, "skills")).filter((d) => existsSync(join(repo, "skills", d, "SKILL.md"))).sort();

const sandbox = () => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "dan-install-")));
  const src = join(base, "source");
  mkdirSync(join(src, "scripts"), { recursive: true });
  cpSync(join(repo, "skills"), join(src, "skills"), { recursive: true });
  cpSync(join(repo, "scripts", "install.sh"), join(src, "scripts", "install.sh"));
  // A SKILL.md outside skills/, reachable by path traversal from skills/.
  mkdirSync(join(src, "escaped"), { recursive: true });
  writeFileSync(join(src, "escaped", "SKILL.md"), "---\nname: escaped\ndescription: x\n---\n");
  return { base, src, dest: join(base, "dest") };
};
const install = (s, ...args) => {
  const env = { ...process.env, HOME: join(s.base, "home") }; // defaults land in the sandbox too
  const r = spawnSync("/bin/bash", [join(s.src, "scripts", "install.sh"), ...args], { env, encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
};
const listing = (dir) => (existsSync(dir) ? readdirSync(dir).sort() : []);

test("installs every discovered skill by default", () => {
  const s = sandbox();
  const r = install(s, s.dest);
  assert.equal(r.code, 0, r.out);
  assert.deepEqual(listing(s.dest), SKILLS);
  for (const name of SKILLS) assert.ok(lstatSync(join(s.dest, name)).isSymbolicLink());
  rmSync(s.base, { recursive: true, force: true });
});

test("--skill installs only the named skill, and --copy copies", () => {
  const s = sandbox();
  const r = install(s, "--copy", "--skill", "shipping-review", s.dest);
  assert.equal(r.code, 0, r.out);
  assert.deepEqual(listing(s.dest), ["shipping-review"]);
  assert.ok(lstatSync(join(s.dest, "shipping-review")).isDirectory());
  assert.match(r.out, /\/dan is not in this selection/);
  rmSync(s.base, { recursive: true, force: true });
});

test("path traversal in --skill is refused and writes nothing", () => {
  const s = sandbox();
  for (const bad of ["../escaped", "dan/../../escaped", "/etc", ".", ""]) {
    const r = install(s, "--copy", "--skill", bad, s.dest);
    assert.equal(r.code, 2, `${bad}: ${r.out}`);
  }
  assert.equal(existsSync(s.dest), false, "destination must not be created");
  assert.equal(existsSync(join(s.base, "escaped")), false, "nothing written outside the destination");
  rmSync(s.base, { recursive: true, force: true });
});

test("a valid selector followed by an invalid one installs nothing", () => {
  const s = sandbox();
  const r = install(s, "--skill", "dan", "--skill", "../escaped", s.dest);
  assert.equal(r.code, 2, r.out);
  assert.equal(existsSync(s.dest), false, "no partial install");
  rmSync(s.base, { recursive: true, force: true });
});

test("unknown options are refused", () => {
  const s = sandbox();
  const r = install(s, "--bogus", s.dest);
  assert.equal(r.code, 2, r.out);
  assert.equal(existsSync(s.dest), false);
  rmSync(s.base, { recursive: true, force: true });
});

test("an existing real directory is skipped, never overwritten", () => {
  const s = sandbox();
  mkdirSync(join(s.dest, "dan"), { recursive: true });
  writeFileSync(join(s.dest, "dan", "keep.txt"), "mine\n");
  const r = install(s, "--skill", "dan", s.dest);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /skip: .*dan exists and is not a symlink/);
  assert.ok(existsSync(join(s.dest, "dan", "keep.txt")));
  rmSync(s.base, { recursive: true, force: true });
});

test("--list prints exactly the discovered skills", () => {
  const s = sandbox();
  const r = install(s, "--list");
  assert.equal(r.code, 0, r.out);
  assert.deepEqual(r.out.trim().split("\n"), SKILLS);
  rmSync(s.base, { recursive: true, force: true });
});
