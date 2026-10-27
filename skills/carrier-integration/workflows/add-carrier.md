# Workflow: add a carrier

**Goal:** a connector that passes its tests on recorded fixtures, built the house way,
plus sandbox evidence **only if** a specific grant allows live calls (step 9).

**Permissions.** Building in an isolated checkout is A2 under `/dan`. A2 covers editing
and offline tests; it does **not** cover calling a carrier. No level, A3 included, grants
a live carrier call by default; A3 is publishing a branch or draft for review. Live
calls need the explicit grant described in step 9. Without `/dan` installed, assume
prepare-only: plans and proposed diffs. Editing a checkout and running tests need the
user's explicit authorization for this task and repository (their current request can
give it). Carrier calls still need the step 9 grant.

In karrio, the commands below are real. Elsewhere, map each step to your framework's
equivalent and say which steps have no equivalent.

## 1. Research before code
- Read the carrier's API docs. List the operations it really supports (rates, ship,
  cancel, track, pickup, manifest, documents, address validation, webhooks).
- Find: auth model (API key, basic, OAuth client credentials, per-account OAuth), test
  environment URL, payload format (JSON / XML / SOAP), multi-piece model (one request
  per package or one bundled), how errors come back (status codes, 200 with error body),
  and rate limits.
- Decide: **direct** carrier (fixed services) or **hub** (dynamic services) (CI-15).
- Write this down in a short integration PRD before scaffolding (karrio:
  `modules/connectors/<carrier>/INTEGRATION_PRD.md`).

## 2. Scaffold with the tool
karrio: `./bin/cli sdk add-extension --path <location> --carrier-slug <slug> --display-name "<Name>"`
(add `--features` and the XML flag as the guide describes). If it fails, fix the tool;
don't hand-create the files (CI-17, guide Core Principle 1).

## 3. Schemas from authorized, sanitized samples
Put request and response samples (JSON) or XSDs in the connector's `schemas/`, then
generate: `./bin/run-generate-on modules/connectors/<carrier>`. Include **error**
response samples. Never edit the generated output (CI-7).

Before saving any sample, check that you're allowed to keep it:
- **Source:** prefer the carrier's published docs, OpenAPI files or XSDs. Use a captured
  response only if the person who owns that data says it may be kept in this repository.
- **Sanitize first:** remove credentials, tokens, account numbers, names, addresses,
  phone numbers, emails, tracking numbers of real parcels, and anything customer- or
  employer-specific. Replace them with obviously fake values.
- **Never** save or commit a payload you can't fully sanitize. You may write the shape
  by hand only from public or explicitly reusable schema information (published docs, a
  public OpenAPI/XSD). If the only source is confidential, hand-copying its structure is
  not a privacy boundary: report the gap and ask for an approved sample.
- The same rules apply to test fixtures (step 8).

## 4. Settings, connection config, units
- Settings: required credentials only. Connection config: optional knobs (CI-12).
- Units: service enum, option enum (aliasing unified names), packaging, origin-dependent
  codes, the options initializer with carrier business rules, and the service catalog as
  data (CI-9 to CI-11).

## 5. Proxy
Auth with a cached token and expiry buffer. One method per supported operation.
Concurrency or multi-call pipelines here. Sandbox vs production URL from `test_mode` (CI-2, CI-4, CI-19).

## 6. Providers (mappers)
One pure request builder and one parser per operation, built as single tree expressions
(CI-2, CI-8). Carry ctx where parsing needs request knowledge (CI-3). Multi-piece: use the
framework's helpers to combine per-package rates or shipments. Expose a master tracking
number plus the per-piece numbers.

## 7. Error parser
One parser that finds every error location and emits normalized messages (CI-5).

## 8. Tests (see `references/testing.md`)
Request-shape, proxy-call and parse tests, plus error parsing for each operation. Unit
tests use sanitized fixtures only (step 3 rules); no network.

## 9. Verify
- Run the connector's tests, then the framework's full checks. **This is the default
  stopping point.**
- Check that the metadata lists exactly the services and options implemented, and that
  capabilities match the overridden methods (CI-6, CI-14).
- **Live sandbox calls happen only with an explicit grant** that names all of:
  - the carrier, the environment (sandbox/test URL) and the account or connection;
  - the exact operations (e.g. rate and track only, no ship);
  - the expected side effects, and confirmation that they are non-billable. Some carrier
    "test" environments still create real pickups, manifests or charges; the carrier's
    docs must say otherwise;
  - the test data to use: fake addresses and contacts, no real parcels.

  Having sandbox credentials available is not a grant. Before each call, recheck that
  the grant still covers it. Record each call (operation, environment, request ID,
  result) without storing secrets.
- Production credentials, real shipments, real pickups and anything billable are
  **Reserved** actions under `/dan`: they need their own action-specific authorization,
  often a human doing it directly.

## Output
- the patch;
- test results;
- either sandbox evidence with the grant it ran under, or
  "fixtures only: no live-call grant";
- known gaps (unsupported operations, untested paths);
- the integration PRD.
