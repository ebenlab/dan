# CHECKLIST.md

Principle IDs: `SA-n` = `/shipping-api-design` PRINCIPLES.md, `CI-n` =
`/carrier-integration` ARCHITECTURE.md.

## Money and units

| Failure | Look for | Fix | ID |
| --- | --- | --- | --- |
| Float rounding in charges | Fractional money amounts (`12.99` in major units) stored or computed in `float`/`double`/JS `Number`; arithmetic on those before converting; integers outside the safe range (JS: not `Number.isSafeInteger`); unchecked rounding when converting currency or applying markups | Integer minor units + currency; check the integer range; round explicitly at one documented step | SA-8 |
| *Not a failure* | A JS `Number` (or any int type) holding an **integer** minor-unit amount that's range-checked, e.g. `1299` for €12.99 with `Number.isSafeInteger` | Nothing. Don't demand BigInt or a money library for sound integer code | SA-8 |
| Adjustment charges after the label | Weight or dimension conversions that round down or to nearest | Round up to the carrier's precision | SA-9 |
| Wrong unit sent | Weights or dimensions without a unit field; implicit defaults | Always carry the unit; convert at the edge | SA-8 |

## Contract

| Failure | Look for | Fix | ID |
| --- | --- | --- | --- |
| Typo buys the wrong label | Request parsing that ignores unknown fields; `**kwargs` passthrough | Reject unknown fields with a clear error | SA-4 |
| Client breaks on a new enum value | Exhaustive switches with no default on carrier/status enums | Open enums with a documented fallback | SA-4 |
| Feature silently not applied | Option not supported by a service, then dropped; unknown options filtered at the API edge | Exclude the service with a reason; validate at the boundary, filter only inside the connector | SA-15, CI-9 |
| Carrier key becomes core-model noise | One carrier's field added to the unified model | Keep it typed under that carrier until two carriers share it | SA-16 |

## Rating and purchase

| Failure | Look for | Fix | ID |
| --- | --- | --- | --- |
| Checkout down because one carrier is slow | Fan-out that raises or returns non-2xx on any carrier failure | Return successes plus per-carrier errors | SA-18, CI-5 |
| Rated one thing, bought another | Purchase that re-sends shipment data instead of a quote/rate ID; quotes with no expiry | Persisted, expiring quote; purchase by ID; re-rate on change | SA-17 |
| Stale or over-extended price | Quote expiry or rate cache longer than the carrier's own validity (e.g. a fixed 15-minute floor applied to a 5-minute carrier token) | Cap every quote and cache at the carrier's validity; carry the cache age | SA-17 |
| Side effects from rating | Rating that creates shipments, charges, emits webhooks or demands customs for domestic | Rating is read-only | SA-19 |
| Double-billing on retry | Purchase/pickup/manifest without an idempotency key; a timeout mapped to failure; automatic retry of purchase | Idempotency key, `purchasing` state, reconcile before reporting | SA-20 |
| Surprise price increase | No check of purchased price against quoted price | Void and error beyond the agreed ceiling | SA-21 |
| Can't reconcile the carrier invoice | `DELETE` on shipments, labels or manifests | Void to a terminal state; keep the record | SA-22 |

## Addresses, goods, customs

| Failure | Look for | Fix | ID |
| --- | --- | --- | --- |
| Label to the wrong door | Street number parsed out of line 1 by regex | Separate field; fail if required and ambiguous | SA-13 |
| Hazardous goods shipped on the wrong service | DG fields dropped in mapping; DG on the shipment instead of the item | Keep DG on the item; rate DG-capable services only | SA-13 |
| Customs filing rejected | Invented HS codes; one HS code for export and import | Never invent; report derived codes; export + import codes | SA-13 |
| Empty customs on domestic shipments | Order data stored inside the customs object | Separate order and declaration | SA-12 |

## Tracking and events

| Failure | Look for | Fix | ID |
| --- | --- | --- | --- |
| Support can't see what the carrier said | Raw carrier status codes or events dropped after normalization | Keep the raw code and the lossless event log | SA-25 |
| Wrong state after a carrier correction | Code assuming status only moves forward | Allow backwards moves | SA-25 |
| Voided-but-scanned impossible to represent | One enum for purchase lifecycle and delivery status | Two separate statuses | SA-24 |
| "Not found" treated as an error | Tracker creation failing for a fresh number | "Not found yet"; keep polling within a window | SA-25 |
| Webhook consumer misses state | Diff-only payloads; no signature; no retries; private-network targets allowed | Full object + `previous_attributes`, signed, at least once; block private addresses | SA-26 |

## Credentials, metadata, agents

| Failure | Look for | Fix | ID |
| --- | --- | --- | --- |
| Credential leak | Credentials returned by read APIs, logged, traced, or in query strings | Write-only (preview only); redact before tracing; header auth only | SA-29, CI-19 |
| Optional knob stored as a credential | Non-secret options added to the settings/credentials class | Move to connection config | CI-12 |
| Client data sent to the carrier by accident | User metadata copied into carrier payloads | Only via an explicit opt-in field | SA-28 |
| Prompt injection via carrier text | Carrier messages or metadata passed to an agent as instructions | Treat carrier text as data | SA-28, SA-31 |
| Agent spends money unasked | Spend operations not marked destructive; no test-mode default | Guardrails published with the API | SA-31 |

## Connector framework (karrio-style)

Rows marked **(karrio)** apply only to code that follows karrio conventions. The others
are invariants for any framework.

| Failure | Look for | Fix | ID |
| --- | --- | --- | --- |
| Untestable mapper | Network calls, time or randomness inside request builders or parsers | Move I/O to the proxy | CI-2 |
| Lost on regenerate (karrio) | Edits inside generated schema files | Edit the source sample/XSD and regenerate | CI-7 |
| Fragile payloads (karrio) | Raw dicts or XML strings where generated types exist | Use generated types | CI-7 |
| Hard-to-read request (karrio) | Many `_build_*` helpers assembling one request | One tree expression | CI-8 |
| Code typos reach the carrier (karrio) | Raw string service or option codes | Typed enums | CI-10 |
| Errors hidden | Parser returns a result while error messages exist; defensive `or ""` fallbacks | Messages first; no result on error; trust validated data | CI-5, CI-13 |
| Capability lies | Metadata lists an operation the proxy doesn't implement | Derive capabilities from implemented methods | CI-6 |
| Weak tests | Only success paths; partial-field asserts; live network in unit tests | Request / proxy / parse / error tests on recorded fixtures | `/carrier-integration` testing reference |
| Breaking change for users | Field or endpoint removed or renamed in place | Deprecate additively; dual fields during migration | SA-32 |
| Private data in the repo | Schema samples or fixtures with real credentials, tokens, account numbers, names, addresses, real tracking numbers, or customer/employer payloads | Use published samples or authorized, sanitized ones; drop what can't be sanitized (blocking) | add-carrier step 3 |
| Unauthorized live calls | Scripts, tests or instructions that call a carrier (sandbox included) without a grant naming carrier, environment, operations, side effects and non-billable data | Fixtures-only verification; live calls only under that explicit grant (blocking) | add-carrier step 9 |
