# Testing carrier connectors

Source: karrio `CARRIER_INTEGRATION_GUIDE.md` testing rules, `.claude/rules/testing.md`,
and UPS `tests/ups/test_rate.py`. **Observed.**

## The pattern, per operation

1. **Request shape:** build the carrier request from a unified payload and assert it
   equals the expected carrier payload exactly.
2. **Proxy call:** patch the HTTP layer and assert the right URL, method and headers
   are used. No real network.
3. **Parse success:** feed a recorded response and assert the **whole**
   `[result, messages]` structure, not a few fields.
4. **Parse error:** feed a recorded error response and assert the normalized messages
   (carrier, connection, code, message).

Add cases for multi-piece, missing optional fields, and each origin-dependent or
option-dependent branch you wrote.

## Conventions (in karrio)

- stdlib `unittest` only (no pytest), run per connector:
  `python -m unittest discover -v -f modules/connectors/<carrier>/tests`.
- A fixture module builds the gateway and pre-seeds the auth token cache, so tests
  never authenticate.
- Fixtures live next to the tests, in a fixed order: payload, expected request,
  response, error response, expected parsed output.
- The test structure is the same across every connector: "patterns are designed for
  consistency across 50+ carrier integrations".

## Rules that carry over to any framework

- Fixtures come from the carrier's published samples, or from captured responses you're
  authorized to keep, sanitized of credentials, PII, real parcels and customer data
  (add-carrier step 3). Include errors. Don't invent shapes you haven't seen.
- No unit test touches a carrier, sandbox included. Live sandbox runs are a separate
  step that needs its own explicit grant (add-carrier step 9).
- A reviewer model saying "looks good" does not replace a failing test (`skills/dan` P5).
