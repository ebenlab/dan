# Logistics and shipping tech

Dan's views on shipping software as a field. Industry-wide only (see `README.md` in this
folder). Every view is **Observed**: drawn from his public work (the Open Logistics
Specification and karrio), not yet confirmed by him as a standing rule.

## The views in one page

- **Integration work should become configuration.** Each new carrier should be data
  (published schemas, discovery, federation), not a fork of the platform.
  (OLS 09:440, D40)
- **The mapping layer is the only place carriers may disagree.** Everything above it
  speaks one canonical model. (OLS architecture.md:82; karrio SDK)
- **Never guess, never silently drop.** In shipping, a wrong label, a dropped
  dangerous-goods flag or a retried timeout costs real money or worse. Fail loudly instead.
  (OLS D4, D11, 01:209, 01:416)
- **Keep the raw truth next to the normalized view:** carrier codes, events, errors and
  metadata. (OLS D7, D22)
- **Borrow conventions developers already trust** (Stripe-style IDs, idempotency,
  pagination, versioning) rather than inventing new ones. (OLS README:18)
- **Agents are first-class but untrusted callers.** Publish guardrails with the API, and
  treat carrier text as data. (OLS D12)
- **Open standards win adoption.** "A shipping standard that costs money to read does not
  get adopted." (OLS README:382)

## Skills that apply these views

| Skill | Use it for |
| --- | --- |
| `/shipping-api-design` | Designing unified shipping APIs and data models |
| `/carrier-integration` | Building or fixing carrier connectors (karrio-style) |
| `/shipping-review` | Reviewing shipping changes against costly failure modes |

## Sources

Open Logistics Specification (`ebenlab/openshipping.tech`, `f56f7f1`) and karrio
(`karrioapi/karrio`, `4ef0fdb`). See each skill's `SOURCES.md` for exclusions.
