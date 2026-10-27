# Carrier quirks: where each kind belongs

Real carriers disagree. The rule is to contain the disagreement in the connector, at the
layer named below, and keep the unified model clean (SA-1 in `/shipping-api-design`).

| Quirk | Where it goes | Example source |
| --- | --- | --- |
| Service code depends on origin country | Units (zone/origin-keyed enum) + request `ctx` so the parser resolves it | UPS `units.py` `ServiceZone`, `rate.py` ctx |
| Only rates one package per request | Proxy fans out per package; mapper recombines with multi-piece helpers | Canada Post `providers/canadapost/rate.py` |
| One operation needs several calls | Pipeline of jobs in proxy + provider | Canada Post pickup (availability → create) |
| Errors returned with HTTP 200 | Error parser checks the body on every response | UPS / Canada Post `error.py` |
| HTTP errors in a different shape from body errors | Re-wrap into the carrier's error shape so one parser handles both | Canada Post `process_error` |
| OAuth tokens expire | Proxy cache with refresh buffer; never store tokens in settings | UPS proxy |
| Unit system preference (lb/in vs kg/cm) | Units preferences by country; convert at the edge, rounding up (SA-9) | `COUNTRY_PREFERED_UNITS`; OLS 00:244 |
| Option implies other flags (e.g. dangerous goods) | Options initializer in units | UPS `shipping_options_initializer` |
| Requires a separate street number | Unified address carries it. If ambiguous, fail; don't parse a guess (SA-13) | OLS 01:207-211, D21 |
| Several manifests per close, async close, scoped closes | Treat end of day as a workflow, not a single call | OLS D23 |
| No API at all | Rate sheets + generic connector; inbound events for tracking | karrio `generic`, OLS D10 |
| Status vocabulary unlike anyone else's | Map to the small canonical set, keep the raw code, allow backwards moves | OLS D7, 07:75-134 |
| Return labels | Separate optional operation; the simplest proxy delegates to create-shipment | karrio PRD RETURN_SHIPMENT_API; UPS proxy |

If a quirk doesn't fit any row, put it in the connector's units or utils and add a row
here in a follow-up PR.
