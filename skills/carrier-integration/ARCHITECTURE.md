# ARCHITECTURE.md: the connector model

## How to read a principle

| Part | Status | Meaning |
| --- | --- | --- |
| **Rule** and **Why** | Observed | From Dan's code and docs in karrio (pinned `4ef0fdb`; paths relative to the karrio repo root) or the Open Logistics Specification (`OLS`) |
| **Source** | n/a | Where to check it (see `SOURCES.md`) |
| **Scope** | Proposed | Where the agent applies it, written from the source's context |
| **Not when** | Proposed | A boundary written by the agent, unless it cites its own source |

Anything marked **Proposed (our reading)** is the agent's interpretation for Dan to
confirm or correct. It is not his stated judgment.

## The pipeline (one shape for every operation)

```
caller payload
   │  coerce into the unified model (RateRequest, ShipmentRequest, …)
   ▼
check_operation ── capability supported? origin serviced by this account?
   │                 no → normalized message, no call
   ▼
mapper.create_X_request(payload, settings)   PURE → Serializable(value, serializer, ctx)
   ▼
proxy.<verb>(request)                        ALL I/O → Deserializable(response, parser, ctx)
   ▼
mapper.parse_X_response(response, settings)  PURE → (result | None, [Message])
```

Sources: `modules/sdk/karrio/api/interface.py`, `api/gateway.py`,
`core/utils/serializable.py`, karrio `AGENTS.md` "Request Lifecycle".

---

### CI-1. One uniform pipeline per operation
**Rule:** rates, shipments, tracking, pickups, manifests, address validation, documents,
duties, insurance and webhooks all use the same request → proxy → parse shape. The façade
is fluent and lazy: nothing runs until the result is parsed.
**Why:** a reader who knows one operation knows them all, and tracing, caching and error
capture attach in one place.
**Source:** `api/interface.py`, `sdk.py`
**Scope:** every carrier operation in the framework.
**Not when:** inbound flows (carrier webhooks, OAuth callbacks). They go through hooks,
not the request pipeline (`api/hooks.py`, cited).

### CI-2. Mappers are pure functions; the proxy owns I/O
**Rule:** request builders take `(unified payload, settings)` and return a serializable
carrier request. Parsers take `(response, settings)` and return `(result, messages)`. Only
the proxy talks to the network, handles auth tokens and retries, and fans out calls.
**Why:** pure mappers are testable from fixtures alone; network behavior is swappable and mockable.
**Source:** `api/mapper.py`, `api/proxy.py`; connector `providers/` vs `mappers/`
**Scope:** all connector code.
**Not when:** never put I/O in a mapper. If parsing needs another call, model it as a
pipeline step in the proxy (CI-4).

### CI-3. Carry request context into parsing explicitly
**Rule:** when a response can only be read with request knowledge (origin-dependent service
codes, which package a reply belongs to), pass it in the request's `ctx`. Don't re-derive
it or use globals.
**Source:** `core/utils/serializable.py`; UPS `providers/ups/rate.py` (origin in ctx);
karrio FAQ "Missing Context in Deserializable"
**Scope:** parsers that need request facts.
**Not when:** the response already carries the fact. Read it from the response.

### CI-4. Multi-step carrier conversations are data
**Rule:** when one operation needs several calls (check availability, then book), model
them as an ordered pipeline of jobs, not ad-hoc control flow in the proxy.
**Source:** `core/utils/pipeline.py`; Canada Post `providers/canadapost/pickup/create.py`
**Scope:** operations with dependent carrier calls.
**Not when:** independent parallel calls (one rate request per package). The proxy runs
them concurrently and the parser recombines them (Canada Post `mappers/canadapost/proxy.py`
`run_asynchronously`, and `providers/canadapost/rate.py` multi-piece recombination; cited).

### CI-5. Errors are data, normalized at the edge
**Rule:** each connector has one error parser. It searches everywhere the carrier hides
errors (HTTP status, 200-with-error bodies, nested warnings) and emits the same message
shape: carrier, connection, code, message, level, details. Parsers compute messages first
and return no result when there are errors; warnings may coexist with a result. HTTP
failures are re-wrapped so one parser handles both paths. An escaping exception becomes a
message, never a crash.
**Why:** a multi-carrier call returns partial results plus per-carrier messages (SA-18).
**Source:** `api/interface.py` (`fail_safe`, `abort`), `core/errors.py`, UPS and Canada
Post `providers/*/error.py`
**Scope:** every operation's parser.
**Not when:** programming errors in the framework itself (bad configuration at startup).
Those should fail fast in tests, not be swallowed at runtime.

### CI-6. Capabilities are derived from what is implemented
**Rule:** a base mapper and proxy define every operation as "not supported". A connector
overrides only what it really implements, and the framework detects capabilities from the
overridden methods. An unsupported call returns a normalized "not supported" message.
**Why:** a declared capability list drifts from the code; a derived one can't.
**Source:** `api/mapper.py`, `api/proxy.py`, `references.py` (`detect_capabilities`)
**Scope:** connector metadata and API references.
**Not when:** a capability depends on the account, not the code (e.g. a contract
feature). Report that per connection, not per connector.

---

## Containing carrier quirks

### CI-7. Generated, typed carrier schemas, never hand-edited
**Rule:** carrier request and response types are generated from samples (JSON) or XSDs
(XML/SOAP) and live in their own package. To change them, change the source and
regenerate. Never build carrier payloads as raw dicts or XML strings.
**Why:** type safety across many carriers; regeneration stays possible when the carrier
changes its API.
**Source:** karrio `CARRIER_INTEGRATION_GUIDE.md` Core Principle 5 and "MANDATORY:
Generated Schema Usage Patterns"; FAQ (no hard-coded XML)
**Scope:** all carrier payloads.
**Not when:** never hand-edit generated files. Samples must be authorized and sanitized
first (add-carrier step 3).

### CI-8. One tree expression per request
**Rule:** build the whole carrier request in one nested expression of generated types.
Don't scatter `_build_*` helpers.
**Why:** the request shape is visible in one place, and diffs map to the carrier's docs.
**Source:** karrio FAQ §7
**Scope:** request builders.
**Not when:** **Proposed (our reading; the FAQ states no exception):** the same sub-tree
repeats across several operations of one carrier. One shared function in that connector's
`utils` may be clearer. Raise it in review rather than assume it.

### CI-9. Quirks live in the units layer, not the request builder
**Rule:** service codes, option codes, packaging types, origin-dependent codes, unit
preferences and option business rules (e.g. "any dangerous-goods sub-option forces the
restricted-articles flag") live in the connector's units/enums and an options
initializer. Unified option names are aliases onto carrier codes. Keys the carrier doesn't
know are filtered out before they reach it.
**Source:** UPS `providers/ups/units.py` (`ShippingOption`, `shipping_options_initializer`),
`core/units.py` (`Options`, `ShippingOptions`)
**Scope:** every carrier-specific code and rule.
**Not when / tension:** karrio's options layer keeps only keys its carrier enum knows
(`core/units.py`), while OLS rejects unknown request fields at the API edge (OLS D11) and
forbids silently dropping a requested standardized feature (OLS 01:566-570).
**Proposed (our reading, not an upstream rule):**
1. Validate and reject unknown fields at the public API boundary.
2. Before any connector filtering, check capabilities. If a service can't honor a
   requested standardized feature, exclude or fail that service with a reason (SA-15).
3. Only then may the connector drop keys that carry no requested meaning for this
   carrier (for example, another carrier's options).

Filtering must never remove requested semantics. Dan hasn't stated this reconciliation.

### CI-10. No raw strings for codes
**Rule:** every carrier code goes through a typed enum.
**Source:** karrio `AGENTS.md` ("NEVER use raw strings for service codes")
**Scope:** service, option, packaging and status codes.
**Not when:** hub carriers with dynamic services returned at runtime (CI-15). Validate
them against the hub's live list instead.

### CI-11. Service catalogs are data
**Rule:** service limits, zones, transit times and features come from a data file (CSV)
or the database, not code. Pricing logic is in code; prices are numbers users edit.
**Source:** UPS `services.csv` → `DEFAULT_SERVICES`; karrio PRD RATE_ZONE_DECOUPLING
**Scope:** service catalogs and rate sheets.
**Not when:** hub carriers, whose catalog comes from their API (CI-15).

### CI-12. Settings hold required credentials; connection config holds optional knobs
**Rule:** optional per-connection behavior (label format, default options, account flags)
goes in a typed connection-config enum, not in the credentials/settings class.
**Why:** credentials are secret and rotate; config is readable and edited often (OLS D8).
**Source:** karrio FAQ "Settings vs ConnectionConfig"
**Scope:** connector settings.
**Not when:** never. A non-secret value doesn't belong with secrets.

### CI-13. Trust validated data; no defensive fallbacks
**Rule:** the unified layer already validates and normalizes input (units, addresses,
packages). Connectors don't add `or ""` / `else None` fallbacks that hide real problems.
**Source:** karrio FAQ §6 "Defensive Empty String Fallbacks"
**Scope:** request builders and parsers.
**Not when:** data straight from the carrier response that the carrier documents as
optional. Handle the documented absence explicitly.

---

## Framework shape

### CI-14. Connectors are plugins with metadata
**Rule:** each connector registers metadata: mapper, proxy, settings, optional hooks,
services, options, packaging, presets, connection configs, direct-vs-hub, integration
status. Discovery loads plugins in priority order, and a broken plugin is recorded, not
fatal. The same metadata drives API references and dashboard forms.
**Source:** `core/metadata.py`, `references.py` (`import_extensions`,
`collect_references`), each connector's `plugins/<carrier>/__init__.py`
**Scope:** framework design.
**Not when:** a one-off script against one carrier. A plugin system is overhead there.

### CI-15. Direct carriers and hubs are different patterns
**Rule:** a direct carrier has a fixed service catalog. A hub (aggregator) has dynamic
services returned by its API and is marked as a hub. Don't force one into the other's shape.
**Source:** karrio `CARRIER_INTEGRATION_GUIDE.md` "Integration Patterns"
**Scope:** classifying a new integration (add-carrier step 1).
**Not when:** a carrier with a fixed catalog that also resells others. Decide by where
the service list comes from.

### CI-16. A carrier with no API is still a carrier
**Rule:** rate sheets plus a generic connector give rates and shipments with no API call,
through the same pipeline.
**Source:** `modules/connectors/generic`, `karrio/universal/`; OLS D10
**Scope:** regional, local or manual carriers.
**Not when:** the carrier has an API that covers the operation. Integrate it.

### CI-17. One façade for shared helpers
**Rule:** shared helpers (conversion, concurrency, envelopes, failsafe parsing) live in
one library import, not scattered utility modules. Contributed or generated connectors are
normalized back to house style.
**Source:** karrio `AGENTS.md` (`karrio.lib`); karrio history 2022 ("consolidate … into a
cleaner single import") and 2026 ("cleanup new integrations to match coding standard")
**Scope:** shared code across connectors.
**Not when:** carrier-specific helpers. They stay in that connector's `utils`.

### CI-18. New capabilities enter as optional interfaces
**Rule:** a new operation (manifests, duties, insurance, webhooks, OAuth) enters as an
optional base method plus unified models. Existing connectors keep working untouched.
**Source:** karrio history (manifest endpoints and integration templates, 2024; "karrio SDK
interface for additional LSP services", 2025); `api/hooks.py`
**Scope:** extending the framework.
**Not when:** **Proposed (our reading):** only one carrier will ever use the operation.
Keep it in that connector until a second need appears (compare SA-16).

### CI-19. Secrets never reach logs or traces
**Rule:** auth tokens are cached with an expiry buffer. Credentials and auth headers are
redacted before tracing.
**Source:** UPS `mappers/ups/proxy.py` (cached OAuth with a refresh buffer),
`core/utils/redaction.py`; OLS 00:431
**Scope:** proxies, tracing, logging.
**Not when:** never.
