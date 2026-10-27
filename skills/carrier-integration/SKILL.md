---
name: carrier-integration
description: >
  Build, extend or fix a carrier / logistics-provider connector the way Dan does: pure
  mappers around a single I/O proxy, generated carrier schemas that are never hand-edited,
  quirks contained in a units layer, errors returned as data, capabilities derived from
  what is implemented, and a fixed test pattern. Use when adding a carrier to karrio or any
  multi-carrier framework, designing such a framework's connector interface, or debugging
  a carrier mapping (rates, labels, tracking, pickups, manifests, documents).
user-invocable: true
metadata:
  short-description: "Build carrier connectors the way Dan designed karrio's framework."
  version: 0.1.0
---

# /carrier-integration

Dan's judgment about **how carrier integrations are built**. The API that clients see is
`/shipping-api-design`'s concern. Checking a finished connector is `/shipping-review`'s.

## Standalone use and authority

- This skill gives judgment, not permission. When `/dan` is installed, its action levels
  and grants decide what you may do.
- When `/dan` is **not** installed, default to **prepare-only**: read the context you're
  given and prepare private plans, drafts and proposed diffs.
  - Editing a checkout or running its tests needs explicit authorization for that task,
    repository and environment. The user's current request can give it ("fix this
    connector in this repo").
  - Calls to carriers (sandbox included), publishing and sending each need their own
    explicit request for that exact action in this session.
  - The absence of `/dan` never grants more.
- References to `/shipping-api-design` (SA-n) and `/shipping-review` are optional. If
  those skills aren't installed, say so and continue with this skill alone.

## First: which codebase?

- **Inside a karrio checkout:** karrio's own `AGENTS.md`, `CARRIER_INTEGRATION_GUIDE.md`
  and `CARRIER_INTEGRATION_FAQ.md` are authoritative and more detailed than this skill.
  Read them and follow them exactly. Use this skill for the reasoning behind them.
- **Any other framework:** apply `ARCHITECTURE.md` as design guidance, and say which
  parts your framework already has and which it lacks.

## Load order

1. `ARCHITECTURE.md`: the connector model and the principles (CI-1…).
2. For a new carrier: `workflows/add-carrier.md`.
3. `references/quirks.md` when a carrier behaves oddly. It says where each kind of quirk
   belongs.
4. `references/testing.md` before writing or changing tests.

## Hard rules: invariants for any framework

- **Mapping is side-effect free.** Turning a unified request into a carrier request, and
  a carrier response back, does no I/O. Network calls, auth and retries live in one
  place.
- **Errors are data.** Every carrier failure becomes a normalized message tagged with the
  carrier and connection. A multi-carrier call never fails as a whole because one
  carrier failed.
- **Requested semantics are never dropped silently.** A required feature a service can't
  honor excludes or fails that service, with a reason.
- **Secrets never reach logs, traces, fixtures or this repo.**
- **Fixtures first; live calls need a grant.** Verify on sanitized, recorded fixtures.
  Any call to a carrier, sandbox included, needs an explicit grant naming the carrier,
  environment, operations, expected side effects and non-billable test data. Having
  credentials is not a grant. Never create real shipments or charges to "see what
  happens".
- **Only keep authorized, sanitized samples.** No credentials, PII, real parcels, or
  customer or employer payloads in schemas, fixtures or this repo. If a sample can't be
  kept, report the gap and ask for an approved one (add-carrier step 3).

## karrio conventions (apply in karrio; elsewhere only if the framework adopts them)

- Never hand-edit generated carrier schemas: change the source sample or XSD and regenerate.
- No raw strings for carrier codes: use typed enums.
- One tree expression per request; no `_build_*` helpers.
- If the scaffolder or code generator fails, fix the tool; don't hand-write its output.

In another framework that deliberately uses, say, validated dicts or a different
generator, follow that framework's own conventions. Don't rewrite it to match karrio's
style. Recommend a convention only when it fixes a concrete defect, and say which
invariant that defect breaks.
