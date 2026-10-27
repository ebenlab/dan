import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { compileSchema } from "./schema-validation.mjs";

const load = (name) => JSON.parse(readFileSync(new URL(`../skills/dan/schemas/${name}.schema.json`, import.meta.url), "utf8"));
const schemas = Object.fromEntries(["task", "action-proposal", "workspace-adapter", "evidence"].map((name) => [name, load(name)]));
const checks = Object.fromEntries(Object.entries(schemas).map(([name, s]) => [name, compileSchema(s)]));
const valid = (name, record) => assert.deepEqual(checks[name](record), []);
const invalid = (name, record, location) => {
  const errors = checks[name](record);
  assert.ok(errors.length, "invalid fixture accepted");
  if (location) assert.ok(errors.some((e) => e.includes(location)), errors.join("\n"));
};
const clone = (v) => structuredClone(v);
const date = "2026-10-26T20:00:00Z";
const task = () => ({ id: "task-example", workspace: "example", sources: [{ system: "issues", source_id: "EX-1" }],
  intended_outcome: "Prepare a narrow patch", workflow_state: "working", verification_state: "inspected",
  permission: { level: "A1" }, last_verified_at: date });
const proposal = () => ({ id: "action-example", task_id: "task-example", action: "open_draft_pr", level: "A3",
  target: { system: "git", destination: "example/widgets" }, content: "Proposed patch",
  approval: { state: "pending" } });
const executable = () => ({ ...proposal(), base_revision: "revision-example", evidence: ["evidence-example"],
  intended_side_effects: ["Create a draft PR"], approval: { state: "approved", grant_ref: "session-grant-example",
    approved_by: "user", approved_at: date } });

test("compiler rejects unsupported keywords even in unused branches", () => {
  assert.throws(() => compileSchema({ if: { const: false }, then: { unknownKeyword: true } }), /unsupported keyword/);
  assert.throws(() => compileSchema({ properties: { x: { $ref: "remote" } } }), /unsupported keyword/);
  assert.throws(() => compileSchema({ type: ["string"] }), /unsupported type/);
  assert.throws(() => compileSchema({ format: "uri" }), /unsupported format/);
  assert.throws(() => compileSchema({ else: false }), /unsupported keyword/);
  assert.throws(() => compileSchema({ not: {} }), /unsupported keyword/);
});
test("if/then respects required guards and does not apply orphan then", () => {
  const check = compileSchema({ if: { required: ["state"], properties: { state: { const: "approved" } } },
    then: { required: ["grant"] } });
  assert.deepEqual(check({}), []);
  assert.ok(check({ state: "approved" }).length);
  assert.deepEqual(check({ state: "approved", grant: "session" }), []);
  assert.deepEqual(check({ state: "pending" }), []);
  assert.deepEqual(compileSchema({ then: false })({}), []);
});
test("real schemas stay within the independently agreed keyword contract", () => {
  const agreed = new Set(["$schema", "$id", "title", "description", "type", "enum", "const", "required",
    "properties", "additionalProperties", "items", "minItems", "minLength", "pattern", "minimum",
    "exclusiveMinimum", "format", "allOf", "anyOf", "if", "then"]);
  const walk = (s) => {
    if (typeof s === "boolean") return;
    for (const key of Object.keys(s)) assert.ok(agreed.has(key), `unagreed keyword: ${key}`);
    for (const child of Object.values(s.properties ?? {})) walk(child);
    for (const key of ["items", "additionalProperties", "if", "then"]) if (key in s) walk(s[key]);
    for (const key of ["allOf", "anyOf"]) for (const child of s[key] ?? []) walk(child);
  };
  for (const s of Object.values(schemas)) { walk(s); assert.equal(typeof compileSchema(s), "function"); }
});
test("nested checks reject wrong types and additional fields without echoing values", () => {
  const check = compileSchema({ type: "object", properties: { items: { type: "array", items: { type: "integer", minimum: 1 } } }, additionalProperties: false });
  assert.deepEqual(check({ items: [1, 2] }), []);
  assert.ok(check({ items: [0] }).some((e) => e.includes("items[0]")));
  assert.ok(check({ unexpected: "private-value-example" }).length);
  assert.ok(check({ unexpected: "private-value-example" }).every((e) => !e.includes("private-value-example")));
});
test("supported date-time profile requires timezone and valid calendar components", () => {
  const check = compileSchema({ type: "string", format: "date-time" });
  for (const value of [date, "2024-02-29T10:30:00+02:30"]) assert.deepEqual(check(value), []);
  for (const value of ["2026-02-29T10:00:00Z", "2026-10-26T25:00:00Z", "2026-10-26T20:00:00", "yesterday"]) assert.ok(check(value).length);
});
test("pending proposal and default preparation task can be incomplete", () => {
  valid("action-proposal", proposal());
  valid("task", task());
});
test("approved proposals require approver, time and grant", () => {
  valid("action-proposal", executable());
  for (const field of ["approved_by", "approved_at", "grant_ref"]) {
    const record = executable(); delete record.approval[field]; invalid("action-proposal", record, "approval");
    record.approval[field] = " "; invalid("action-proposal", record, "approval");
  }
});
test("standing-grant proposals require a grant, invalidations require a reason", () => {
  const record = executable(); record.approval = { state: "not_required_under_grant", grant_ref: "standing-example" };
  valid("action-proposal", record);
  delete record.approval.grant_ref; invalid("action-proposal", record, "approval");
  record.approval = { state: "invalidated" }; invalid("action-proposal", record, "approval");
  record.approval.invalidated_reason = "Human takeover"; valid("action-proposal", record);
});
test("actionable proposals require a base, evidence and declared side effects", () => {
  for (const field of ["base_revision", "evidence", "intended_side_effects"]) {
    const record = executable(); delete record[field]; invalid("action-proposal", record, field);
  }
  const record = executable(); record.base_revision = " "; invalid("action-proposal", record, "base_revision");
  record.base_revision = "revision-example"; record.evidence = []; invalid("action-proposal", record, "evidence");
});
test("send actions require A4 and A4 requires a sending identity", () => {
  const record = executable(); record.action = "send_message";
  invalid("action-proposal", record);
  record.level = "A4"; invalid("action-proposal", record, "sending_identity");
  record.target.sending_identity = "identity-example"; valid("action-proposal", record);
  record.target.sending_identity = " "; invalid("action-proposal", record, "sending_identity");
});
test("A2/A3/A4 task records require an explicit grant reference", () => {
  for (const level of ["A2", "A3", "A4"]) {
    const record = task(); record.permission.level = level; invalid("task", record, "permission");
    record.permission.grant_ref = " "; invalid("task", record, "permission");
    record.permission.grant_ref = "session-grant-example"; valid("task", record);
  }
});
test("completed preparation tasks need criteria and evidence but not production validation", () => {
  const record = task(); record.workflow_state = "completed"; invalid("task", record);
  record.acceptance_criteria = ["Patch prepared"]; record.evidence_status = "verified"; record.evidence = ["evidence-example"];
  valid("task", record);
  for (const field of ["acceptance_criteria", "evidence"]) {
    const bad = clone(record); bad[field] = []; invalid("task", bad, field);
  }
  delete record.evidence_status; invalid("task", record, "evidence_status");
});
test("task budgets reject invalid bounds while preserving zero-spend limits", () => {
  for (const field of ["max_minutes", "max_review_rounds"]) {
    for (const value of [0, -1]) { const record = task(); record.budget = { [field]: value }; invalid("task", record, field); }
  }
  const record = task(); record.budget = { max_review_rounds: 1.5 }; invalid("task", record, "max_review_rounds");
  record.budget = { max_cost_usd: -1 }; invalid("task", record, "max_cost_usd");
  record.budget = { max_cost_usd: 0 }; valid("task", record);
  record.budget = { max_minutes: 1, max_cost_usd: 1, max_review_rounds: 1 }; valid("task", record);
});
test("historical and uncertain receipts survive later invalidation", () => {
  const record = executable(); record.receipt = { outcome: "uncertain" }; valid("action-proposal", record);
  record.approval = { state: "invalidated", invalidated_reason: "Grant revoked after timeout" };
  valid("action-proposal", record);
  record.receipt = { outcome: "succeeded", executed_at: date, external_id: "remote-example" };
  valid("action-proposal", record);
  record.receipt = {}; invalid("action-proposal", record, "outcome");
});
test("succeeded receipts require time and either a remote identifier or URL", () => {
  const record = executable(); record.receipt = { outcome: "succeeded" }; invalid("action-proposal", record, "receipt");
  record.receipt.executed_at = date; invalid("action-proposal", record, "receipt");
  record.receipt.external_id = "remote-example"; valid("action-proposal", record);
  delete record.receipt.external_id; record.receipt.url = "https://example.invalid/receipt"; valid("action-proposal", record);
  record.receipt.url = " "; invalid("action-proposal", record, "receipt");
});
test("reserved proposals can await human approval but cannot use a standing-grant shortcut", () => {
  const record = proposal(); record.level = "reserved"; valid("action-proposal", record);
  record.approval = { state: "rejected" }; valid("action-proposal", record);
  record.approval = { state: "not_required_under_grant", grant_ref: "standing-example" };
  invalid("action-proposal", record, "approval");
  const approved = executable(); approved.level = "reserved"; valid("action-proposal", approved);
});
test("completed investigation can preserve conflicting evidence when that is its outcome", () => {
  const record = task(); record.workflow_state = "completed";
  record.intended_outcome = "Document the conflicting reports";
  record.acceptance_criteria = ["Both sources cited and conflict recorded"];
  record.evidence_status = "conflicted"; record.evidence = ["evidence-one", "evidence-two"];
  valid("task", record);
});
test("executable references and list entries cannot be blank", () => {
  for (const field of ["evidence", "intended_side_effects"]) {
    const record = executable(); record[field] = [" "]; invalid("action-proposal", record, field);
    record[field] = []; invalid("action-proposal", record, field);
  }
  const record = executable(); record.approval.approved_at = "2026-02-30T00:00:00Z";
  invalid("action-proposal", record, "approved_at");
});
test("adapter validation checks nested types, required fields and unknown properties", () => {
  const adapter = JSON.parse(readFileSync(new URL("../skills/dan/adapters/example.adapter.json", import.meta.url), "utf8"));
  valid("workspace-adapter", adapter);
  const wrongType = clone(adapter); wrongType.repositories[0].check_commands = [false]; invalid("workspace-adapter", wrongType, "check_commands[0]");
  const missing = clone(adapter); delete missing.repositories[0].default_branch; invalid("workspace-adapter", missing, "default_branch");
  const unknown = clone(adapter); unknown.sources[0].grant = "invented"; invalid("workspace-adapter", unknown, "grant");
});
test("evidence validates nested source and timestamp without inventing missing provenance", () => {
  const record = { id: "evidence-example", claim: "Checked code", kind: "code_inspection", source: { system: "git", source_id: "path" }, retrieved_at: date, scope: "example" };
  valid("evidence", record);
  record.source.source_id = 2; invalid("evidence", record, "source_id");
});
test("repository validator rejects nested adapter errors through its real entry point", () => {
  const temp = mkdtempSync(join(tmpdir(), "dan-schema-integration-"));
  try {
    const repo = fileURLToPath(new URL("../", import.meta.url));
    cpSync(join(repo, "skills"), join(temp, "skills"), { recursive: true });
    mkdirSync(join(temp, "scripts")); mkdirSync(join(temp, "evals"));
    for (const file of ["validate.mjs", "schema-validation.mjs"]) cpSync(join(repo, "scripts", file), join(temp, "scripts", file));
    cpSync(join(repo, "evals", "cases.json"), join(temp, "evals", "cases.json"));
    const path = join(temp, "skills", "dan", "adapters", "example.adapter.json");
    const adapter = JSON.parse(readFileSync(path, "utf8"));
    adapter.repositories[0].check_commands = [false]; writeFileSync(path, JSON.stringify(adapter));
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_") && k !== "DAN_DENYLIST"));
    const result = spawnSync(process.execPath, [join(temp, "scripts", "validate.mjs")], { cwd: temp, env, encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /repositories\[0\]\.check_commands\[0\]: expected string/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
