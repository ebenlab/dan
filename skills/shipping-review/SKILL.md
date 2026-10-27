---
name: shipping-review
description: >
  Review shipping API, data-model or carrier-connector changes for the failures that
  cost money in shipping: double-billing on retries, wrong labels from silently dropped
  options, float money, rounding down, guessed addresses, dropped dangerous goods,
  rates that don't match purchases, raw carrier data thrown away, one carrier failure
  breaking checkout, leaked credentials, and connector-framework violations. Use on a
  PR, diff, design doc or connector that touches rating, labels, tracking, pickups,
  manifests, customs, carrier credentials or a carrier integration.
user-invocable: true
metadata:
  short-description: "Review shipping code against the failures Dan designs against."
  version: 0.1.0
---

# /shipping-review

Run this **with** the general review workflow in `/dan` (`workflows/review-change.md`)
when it's installed: read the whole diff, report blocking issues before suggestions, and
give the failure mode and a fix for each finding.

## Standalone use and authority

- A review is read-only. Posting review comments or approving is a separate action: with
  `/dan`, it needs its A3 grant; without `/dan`, it needs an explicit request from the
  user in this session.
- If `/dan` isn't installed, follow the steps below directly. They're self-sufficient.
  Default to reading what you're given and writing private findings. Running the code's
  tests or editing files needs explicit authorization for that task and repository; the
  user's current request can give it. The absence of `/dan` never grants more.
- The principle texts behind `SA-n` and `CI-n` live in `/shipping-api-design` and
  `/carrier-integration`. If those aren't installed, use the checklist's own "failure"
  and "fix" columns, and say the principle text wasn't available.
- Apply karrio-specific rows (generated schemas, enums, tree expressions) only to code
  that follows karrio conventions. In other frameworks, report only the invariant
  failures: impure mapping, swallowed errors, dropped requested semantics, leaked secrets.

## Steps

1. Identify what the change touches: API contract, data model, rating, purchase,
   tracking, events, credentials, or a connector.
2. Walk the matching sections of `CHECKLIST.md`. Each row is: failure → what to look for →
   fix → principle ID.
3. For each hit, report `[blocking|suggestion] path:line: failure (for which input)`,
   then why, then the fix with its principle ID (SA-n from `/shipping-api-design`, CI-n
   from `/carrier-integration`).
4. End with what you did **not** check (e.g. "no sandbox run", "carrier docs not
   available").

## Severity

- **Blocking:** money (double charge, wrong price, float money, rounding down), a wrong
  or unsafe label (dropped option, dropped dangerous goods, guessed address), a lost
  record (delete instead of void), secret exposure, or an outage path (one carrier fails
  everything).
- **Suggestion:** framework style (helper sprawl, raw dicts where generated types
  exist), naming, test structure.

These rules are **Observed** from Dan's published work. When the codebase under review
deliberately chose otherwise (for example, an existing single-enum lifecycle), flag it
as a design difference, not a bug, unless it causes one of the blocking failures.
