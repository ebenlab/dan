# Decisions and the alternatives Dan rejected

Summarized from the Open Logistics Specification decision log (`spec/A-rationale.md`,
CC BY 4.0). Use this when someone asks "why not just…?". The full text is in the spec.

| # | Decision | Rejected alternative | Why |
| --- | --- | --- | --- |
| D1 | Shipment status and tracking status are separate fields | One lifecycle enum (karrio) | Different owners and causes; they can legitimately disagree |
| D2 | Rates are a persisted, expiring quote (never valid longer than the carrier's own validity); purchase by ID | Stateless rates, re-sending the shipment on purchase | Kills "rated one thing, bought another"; auditable; supports carrier rate tokens |
| D3 | Partial rating failure → `200` | `207` or an error | Checkout must survive a slow carrier; `207` is poorly supported |
| D4 | `purchasing` is a real status | Fail on carrier timeout | The label may exist; a retry double-bills |
| D5 | Void is an action | `DELETE` | The record is needed to reconcile the carrier invoice |
| D6 | Integer minor units, explicit units | Floats, implicit units | Known bug class; known support-ticket class |
| D7 | ~10 canonical statuses + open detail + raw code | One carrier's vocabulary; a large flat enum | Clients need a switchable set; support needs raw truth |
| D8 | Credentials and config separated, both with published schemas | Per-carrier client code | Dynamic UIs and agent onboarding; secrets stay write-only |
| D9 | `app` + `connect_session` + `connection` | Tokens stored on the connection | One platform app serves thousands of merchants; independent rotation |
| D11 | Reject unknown request fields; ignore unknown response fields | Lenient input | A typo silently buys the wrong label |
| D12 | Publish agent policy with the API | Endpoints only | Agents need guardrails alongside the reference |
| D13 | Contacts nest their address | Flat address (karrio, draft 0.1) | Parties and places are different things |
| D14 | `ship_from`/`ship_to` | `from`/`to` | `from` is a Python keyword |
| D15 | Items live in handling units | Flat `customs.commodities[]` | Items are physical facts needed outside customs |
| D16 | Order and declaration are separate, optional | One `customs` object | Commercial fact vs legal act; no empty customs for domestic |
| D17 | Export and import HS codes per item | One HS code | Only 6 digits are harmonized; one field forced a guess |
| D18 | Dangerous goods on the item | On the parcel or shipment | Keeps which item is hazardous in mixed boxes |
| D19 | Standardized + carrier-specific features, service inside | Separate `service` and `options` | State intent once; carrier specifics stay typed |
| D20 | `bill_to` is a party; billing is part of the quote | Inline account number | Third-party and collect billing change price; a real party is needed |
| D21 | `street_number`, not `line3` | Three free-text lines | Many carriers require it; parsing it from line 1 fails |
| D22 | Three metadata namespaces, one writer each | One `metadata` bag + karrio `meta` | Mixed owners, trust levels and stability |
| D23 | End of day is a workflow | A single manifest call (karrio) | The single call hides real carrier behavior (several manifests, async closes, scoping rules) |
| D24 | Modes are profiles over shared modules | Separate specs per implementer type | Shared surface; client portability |
| D25 | Plans and executions are separate | Mutating plans in place | Change next week without rewriting history; explain old prices |
| D27 | The catalog generates the config schema | Hand-maintained schemas | Hand-written schemas drift |
| D28 | Pricing is computed, explainable, simulated before publish | Opaque prices | "Why was I charged this?" needs an answer first |
| D29 | Lean roots grouped by concern | Flat 40-field objects | Readability, obvious nullability, a home for future fields |
| D30 | One spelling: `carrier_configs` everywhere | Singular and plural forms side by side | One parser, one validator |
| D31 | `handling_units` | `parcels` / `packages` / `pieces` | Covers parcel and freight in one model |
| D40 | Every provider is an integration with typed interfaces | Per-category machinery | Don't rebuild OAuth, credentials and health checks per category |

Decisions about networks, devices, data networks, billing and inventory (D32–D45) are
outside this skill's focus. Read them in the spec when the question goes beyond the
carrier API boundary.
