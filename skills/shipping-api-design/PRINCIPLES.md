# PRINCIPLES.md: shipping API design

## How to read a principle

Each principle has five parts. Their status differs:

| Part | Status | Meaning |
| --- | --- | --- |
| **Rule** | Observed | Stated in Dan's published work (the cited source) |
| **Prevents** | Observed | The failure the source gives as the reason, quoted or paraphrased |
| **Source** | n/a | `OLS D11` = Open Logistics Specification decision 11; `OLS 00:59` = chapter 00, line 59; karrio paths are relative to the karrio repo (see `SOURCES.md`) |
| **Scope** | Proposed | Where the agent applies it. Written by the agent from the source's context |
| **Not when** | Proposed | A boundary written by the agent, **unless** the line cites its own source |

"Observed" means the rule is drawn from Dan's published work but he hasn't confirmed it
as a standing rule. "Proposed" means the agent's reading, for Dan to confirm or correct.
Promote either via `skills/dan/CHANGELOG.md`.

---

## Boundary and architecture

### SA-1. The adapter layer is the only mapping layer
**Rule:** carrier disagreement is quarantined in carrier adapters. Domain services, storage
and clients see canonical objects only.
**Prevents:** carrier quirks leaking into every feature; every new carrier touching core code.
**Source:** OLS architecture.md:82; karrio `modules/sdk/karrio/api/interface.py`
**Scope:** any system that talks to more than one carrier.
**Not when:** an implementer *is* the carrier (OLS Carrier mode, 12:178). Its catalog is
the model, and its config schema is generated from the catalog (SA-14, cited).

### SA-2. Integration work should become configuration
**Rule:** a carrier that implements the standard is onboarded by discovery and
registration, with no custom code. Design so the next carrier is data, not a fork.
**Prevents:** per-carrier engineering forever.
**Source:** OLS 09:407-417, 09:440, D40
**Scope:** platform architecture and roadmap decisions.
**Not when:** a legacy carrier will never publish schemas. Write an adapter, but behind
the same contract.

### SA-3. Profiles over shared modules, not separate APIs
**Rule:** aggregators, carriers, 3PLs and fleets share most of their surface. The
difference is which modules are required. Clients branch on modules, not implementer type.
**Prevents:** clients written for one implementer failing on another.
**Source:** OLS D24, 12:208
**Scope:** public API surface design across implementer types.
**Not when:** internal-only APIs with a single consumer; the portability benefit doesn't apply.

---

## Contract

### SA-4. Strict on input, lenient on output
**Rule:** reject unknown request fields; ignore unknown response fields; treat every enum
as open with a documented fallback.
**Prevents:** "silently dropping a misspelled `signature_required` is how wrong labels get
bought"; additive changes breaking clients.
**Source:** OLS D11, 00:59-60, 00:69
**Scope:** public request/response contracts.
**Not when:** inside a connector, translating to a carrier's own API. There, filtering
keys the carrier doesn't accept is the adapter's job (see CI-9).

### SA-5. Borrow trusted conventions instead of inventing them
**Rule:** prefixed opaque IDs, `Idempotency-Key`, cursor pagination, `expand[]`, dated
versions, test/live keys and signed webhooks, after Stripe, on purpose. Name what was
borrowed and what was rejected (form encoding was rejected; JSON only).
**Prevents:** developers relearning solved problems.
**Source:** OLS README:18, A-rationale:10-16
**Scope:** conventions for any developer-facing API.
**Not when:** a convention conflicts with a shipping-specific need. The spec keeps
Stripe's shape but splits metadata three ways (SA-28, cited OLS D22).

### SA-6. Names that survive generated SDKs and every mode
**Rule:** `ship_from`/`ship_to` (not `from`, a Python keyword); `handling_units` (not
`parcels`, so pallets fit); one spelling per concept everywhere (`carrier_configs`).
**Prevents:** unusable generated clients; per-object parsing rules.
**Source:** OLS D14, D30, D31
**Scope:** field and resource naming.
**Not when:** an industry standard identifier exists. Carry standard names verbatim
(OLS B-standards:6-8, cited).

### SA-7. Lean roots, grouped by concern
**Rule:** keep only descriptive input at an object's root. Group outcomes (`purchase`,
`tracking`, `handover`, `returns`). Every document, the label included, lives in one
typed `documents[]`.
**Prevents:** 40-field roots where a void refund sits next to an address; unclear nullability.
**Source:** OLS D29, 03:151
**Scope:** core resource shapes (shipment, pickup, manifest).
**Not when:** small leaf objects (an address, a money value), where grouping adds nesting
without clarity.

---

## Money, units, time

### SA-8. Integer minor units for money, explicit units for weight and size
**Rule:** money is an integer in the ISO 4217 minor unit plus a currency code. Weight and
dimensions always carry their unit.
**Prevents:** "Floats in money are a known bug class. Implicit units are a known
support-ticket class."
**Source:** OLS D6, 00:224-244
**Scope:** every amount, weight and dimension in APIs and storage.
**Not when:** never at the boundary. A carrier's own wire format may use decimals; convert
inside the adapter (SA-1).

### SA-9. Round up when converting units
**Rule:** convert to the carrier's precision by rounding **up**.
**Prevents:** adjustment charges later, because carriers bill on the rounded-up value.
**Source:** OLS 00:244
**Scope:** weight and dimension conversions sent to carriers.
**Not when:** displaying values to people. Show what was entered, and keep the rounded
value for the carrier call.

### SA-10. Instants as timestamps; calendar dates as local dates plus a zone
**Rule:** events are points in time; ship dates and pickup days are local calendar dates
with an IANA zone.
**Prevents:** off-by-one-day ship dates across time zones.
**Source:** OLS 00:179
**Scope:** all time fields.
**Not when:** a carrier only accepts local date-times. Convert in the adapter (SA-1).

---

## Parties, places, goods

### SA-11. Parties and places are different things
**Rule:** a contact nests its address. Tax IDs belong to the party. A party can exist
without a place, and a place without a party.
**Prevents:** a flat address that can't represent a responsible person without a location,
or a location without a person.
**Source:** OLS D13
**Scope:** every party slot (shipper, recipient, return, billing).
**Not when:** a carrier wants flat fields. Flatten inside the adapter.

### SA-12. Items are physical facts on handling units. Declaration and order are separate
**Rule:** items live in the box they're in. The order is a commercial fact; the customs
declaration is a legal act. Both are optional and separate.
**Prevents:** domestic shipments carrying an empty customs object; lost per-parcel
contents; partial returns that can't be expressed.
**Source:** OLS D15, D16
**Scope:** goods, customs and order modelling.
**Not when:** a carrier wants one flat commodity list. Aggregate in the adapter (OLS D15, cited).

### SA-13. Don't invent, don't drop, don't guess on regulated data
**Rule:** never invent HS codes, and report derived ones. Never drop dangerous-goods data;
only rate services that can carry it. If a carrier needs a separate street number and
it's ambiguous, fail with a clear error instead of guessing.
**Prevents:** customs fines and refused freight; "a fire on an aircraft"; labels to the
wrong door.
**Source:** OLS 01:352-353, 01:416, 01:207-211, D17, D18, D21
**Scope:** customs, dangerous goods, address parsing.
**Not when:** classification is offered as its own explicit capability that returns
suggestions, never silent fills (OLS 01:353, cited).

---

## Features and carrier-specific options

### SA-14. Standardized features plus typed carrier-specific ones. No free-form bag
**Rule:** a shipper states an intent once (signature, insurance, COD…), and a `*` key
applies it to every carrier being rated. Carrier-only options sit under that carrier,
typed by the carrier's published schema with no extra properties. That schema is
generated from the catalog, not hand-written.
**Prevents:** per-carrier client code; typos vanishing into an options map; schemas
drifting from what the carrier accepts.
**Source:** OLS D19, D27, 01:504-562; karrio `core/units.py` (unified option names aliased
onto carrier codes)
**Scope:** shipment options and service selection.
**Not when:** prototyping a single-carrier integration; a typed per-carrier block is still
cheaper than a free-form bag to migrate later.

### SA-15. A standardized feature is a requirement, not a hint
**Rule:** if a service can't honor a requested feature, exclude that service with a reason;
never drop the feature quietly. Expose the native code and price used for each feature.
Precedence: carrier defaults → connection → `*` → carrier entry.
**Prevents:** a label bought without the signature or insurance the shipper asked for.
**Source:** OLS 01:561-583
**Scope:** rating and purchase.
**Not when:** the client explicitly marks a feature optional. The spec has no such flag
today, so treat this as a proposal to Dan, not a rule.

### SA-16. Grow the shared model from evidence, not from one carrier
**Rule (Observed, two parts):**
- **Standardized features:** the feature registry is append-only, and a feature
  graduates into it only when two or more carriers share its semantics (OLS 01:611).
- **Carrier metadata keys:** if a `carrier_metadata` key proves useful across carriers,
  it *should be proposed* as a modelled field (OLS 00:208). The spec sets no numeric
  threshold for this.

karrio shows the same pattern: `is_return` was promoted to a top-level field, while
return-specific details stay as carrier options (PRD RETURN_SHIPMENT_API).
**Prevents:** the core model growing around one carrier's vocabulary.
**Source:** OLS 01:611, 00:208; karrio PRD RETURN_SHIPMENT_API
**Scope:** evolving the unified model.
**Proposed heuristic (our reading):** use "two carriers share the meaning" as the default
bar for any new modelled field, not only features. Dan hasn't stated this.
**Not when:** a field is required by law or safety across the board (e.g. dangerous
goods). Model it up front.

---

## Rating and purchase

### SA-17. Rates are a persisted, expiring, immutable quote. Purchase by ID
**Rule:** bind rates to the request that produced them. To change anything, re-rate. A
quote's expiry should be at least 15 minutes and preferably 30, **but never later than
the carrier's own validity**: if a carrier rate or token expires in 5 minutes, so does
the quote. Cached rates carry their age and never outlive the carrier's validity either.
**Prevents:** "rated one thing, bought another"; unauditable prices; buying on an expired
carrier rate.
**Source:** OLS D2, 02:216-218
**Scope:** any rate-then-buy flow.
**Not when:** a one-shot "buy cheapest now" call where no quote is shown to anyone. Still
record what was rated with the purchase.

### SA-18. Partial rating failure is a success response
**Rule:** if at least one connection was tried, return `200` with the rates that worked
and an `errors[]` for the rest, even when all of them failed. Non-2xx is for a bad
request, bad credentials or an implementer fault.
**Prevents:** one slow carrier taking down checkout. The spec calls this "the single most
important difference from carrier-native APIs".
**Source:** OLS D3, 02:145; karrio `Rating.fetch` fan-out with per-carrier messages
**Scope:** multi-carrier fan-out calls (rates, address validation, insurance quotes).
**Not when:** single-carrier purchase. A failed purchase is a failure (or `purchasing`,
SA-20).

### SA-19. Rating has no side effects
**Rule:** rating creates no shipment, charges no money, emits no webhook, and demands no
customs data for domestic shipments. Rates say what a purchase will `require[]`.
**Source:** OLS 02:80, 02:268-271
**Scope:** rate endpoints and rate caches.
**Not when:** never. If a carrier's "rate" endpoint creates a billable label, a charge or
an irreversible carrier record, it isn't a read-only rate query, and wrapping it in a pure
adapter doesn't make it one. Don't call it for rating. Use an authorized non-mutating
alternative (another endpoint, a rate sheet), or stop and escalate.

### SA-20. Purchases are idempotent, and "purchasing" is a real state
**Rule:** require an idempotency key on purchase, pickup and manifest, and store responses
for 24h. The same key with a different body is a conflict. On a carrier timeout, enter
`purchasing` and reconcile; never report failure first.
**Prevents:** double-billing from retries after a timeout that actually succeeded.
**Source:** OLS D4, 00:246-271
**Scope:** every operation that spends money or creates a carrier-side record.
**Not when:** read-only calls (rating, tracking reads). They don't need keys.

### SA-21. Price changes beyond the agreed ceiling void the new label
**Rule:** if the price at purchase exceeds the quote by more than `max_increase`, void and
return an error.
**Prevents:** surprise charges.
**Source:** OLS 02:249
**Scope:** purchase by quote.
**Not when:** the client sets no ceiling. Apply the implementer's documented default instead.

### SA-22. Void, never delete
**Rule:** records of money or legal handover move to a terminal state and stay.
**Prevents:** being unable to reconcile the carrier invoice (reweighs, billed voids).
**Source:** OLS D5, 10:82
**Scope:** shipments past draft, pickups, manifests, invoices.
**Not when:** drafts never purchased, and personal data under an erasure request (redact
fields, keep the record; OLS 00:432, cited).

### SA-23. Pricing is explainable and testable
**Rule:** rate sheets are plans and rates are executions. Every computed price records how
it was built, and tariff changes are simulated before they publish. Pricing logic lives
in code; prices are numbers users edit.
**Prevents:** "why was I charged this?" with no answer.
**Source:** OLS D25, D28, 15:114-121; karrio PRD RATE_ZONE_DECOUPLING
**Scope:** rate sheets, markups, negotiated and custom pricing.
**Not when:** passing a carrier's live price through unchanged. Record the source
(`rate.pricing`, OLS 02:77).

---

## Tracking and events

### SA-24. Two clocks: shipment status and tracking status are separate
**Rule:** they change for different reasons, are owned by different systems, and can
legitimately disagree (voided but scanned).
**Source:** OLS D1. **Rejected:** karrio's single lifecycle enum.
**Scope:** shipment lifecycle modelling.
**Not when:** a simple UI badge. A UI may combine them for display; storage and API keep both.

### SA-25. Lossless event log, lossy small status, raw code always kept
**Rule:** keep an append-only event list, plus a small canonical status set (about ten)
with an open detail field. Never drop the carrier's own code. Status may move backwards,
because carriers correct themselves. An unknown tracking number is "not found yet", not
an error.
**Prevents:** clients that can't switch on status; support that can't see the raw truth.
**Source:** OLS D7, 07:75-156. **Rejected:** one carrier's vocabulary, or a flat enum
mixing status and reason (karrio's 12 × 35).
**Scope:** tracking ingestion and APIs.
**Not when:** never drop raw codes. The canonical set itself may grow by versioned
additions (open enum, SA-4).

### SA-26. Webhooks carry the full object, signed, at least once
**Rule:** send the whole object plus `previous_attributes`, never a diff. Use signatures
existing libraries verify, with an asymmetric option for agents. Delivery is at least once
and unordered. Offer an events list for clients that can't receive webhooks, and refuse
private-address targets.
**Source:** OLS 08:46-47, 08:128, 08:145-206
**Scope:** outbound webhooks.
**Not when:** very large objects. Use `expand`-style references for heavy sub-objects;
the root object stays complete.

### SA-27. Inbound is first-class
**Rule:** carrier push and "carriers with no API" (canonical injection, devices, your own
fleet) produce the same tracking events as polled carriers.
**Source:** OLS D10, D26, D36; karrio polling by default, `Hooks.on_webhook_event` where supported
**Scope:** tracking sources.
**Not when:** a carrier offers neither push nor injection. Poll, with the same event model.

---

## Metadata, connections, credentials

### SA-28. One writer per metadata namespace
**Rule:** `user_metadata` (client-writable, never sent to carriers), `carrier_metadata`
(untrusted, unversioned, never filterable), `system_metadata` (provenance).
**Prevents:** a client's `order_id` colliding with a carrier routing code; nobody knowing
which keys survive a version bump.
**Source:** OLS D22, 00:182-222. **Rejected:** a single `metadata` bag (Stripe) plus
karrio's `meta`.
**Scope:** every resource with metadata.
**Not when:** user data must reach a carrier. Use the explicit opt-in field
(`reference_template`, OLS 09:174, cited), never `user_metadata`.

### SA-29. Credentials are not config. Carrier, app and connection are separate objects
**Rule:** credentials are secret, rotate, and are write-only (preview only). Config is
readable and edited often. Carriers publish JSON Schemas for both, so UIs and agents
onboard with no per-carrier client code. "How to configure is data, who the client is is
an app, and which account is a connection." Verify credentials with a cheap
authenticated call before saving.
**Source:** OLS D8, D9, 09:8-14, 09:162-258; karrio FAQ "Settings vs ConnectionConfig"
**Scope:** carrier accounts and connection management.
**Not when:** a carrier needs no credentials (rate sheets, no-API carriers). Config only.

### SA-30. Every external provider is an integration with typed interfaces
**Rule:** carriers, address validators, insurers and payment providers share one catalog,
one OAuth wrapper and one connection object. Each interface is a subset of the same spec.
**Prevents:** rebuilding credential, OAuth and health-check machinery per provider category.
**Source:** OLS D40, 26:17-79
**Scope:** any third-party provider the platform connects to.
**Not when:** a provider is used only by internal tooling with no tenant connections.

---

## Agents as callers

### SA-31. Publish guardrails with the reference
**Rule:** an API that agents call ships its policy next to its endpoints: test mode first,
confirm before spending, always send an idempotency key, never invent identifiers, void
rather than delete, declare dangerous goods. Treat agents as first-class but untrusted:
mark spend operations destructive, and never accept a live key pasted into a prompt.
**Source:** OLS D12, shipping.md:118-131, 11:146-150
**Scope:** any API or MCP surface that agents can call.
**Not when:** never; even internal agents follow these.

---

## Evolution

### SA-32. Deprecate additively; never remove abruptly
**Rule:** add the new field or endpoint, keep the old one working with a deprecation
signal, and migrate. Use dual fields during renames.
**Source:** karrio PRD PICKUP_API_MODERNIZATION ("Deprecate, don't remove"); karrio
`modules/sdk/karrio/core/units.py` (both `shipment_date` and `shipping_date` accepted
during the rename; `shipment_date` falls back to `shipping_date`, one way)
**Scope:** any public contract change.
**Not when:** a security fix requires removing behavior. Remove it, and announce it loudly.
