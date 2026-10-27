# SOURCES.md

| Key | Source | Pinned at |
| --- | --- | --- |
| karrio | `karrioapi/karrio` (public, open source). SDK under `modules/sdk/karrio/`, connectors under `modules/connectors/<carrier>/`, plus `AGENTS.md`, `CARRIER_INTEGRATION_GUIDE.md`, `CARRIER_INTEGRATION_FAQ.md` and generic `PRDs/` | [`4ef0fdb`](https://github.com/karrioapi/karrio/tree/4ef0fdb) (release 2026.1.32) |
| OLS | Open Logistics Specification, `ebenlab/openshipping.tech` (public) | [`f56f7f1`](https://github.com/ebenlab/openshipping.tech/tree/f56f7f1) |

Direct links to the most-cited files:
- [api/interface.py](https://github.com/karrioapi/karrio/blob/4ef0fdb/modules/sdk/karrio/api/interface.py)
- [core/units.py](https://github.com/karrioapi/karrio/blob/4ef0fdb/modules/sdk/karrio/core/units.py)
- [CARRIER_INTEGRATION_GUIDE.md](https://github.com/karrioapi/karrio/blob/4ef0fdb/CARRIER_INTEGRATION_GUIDE.md)
- [CARRIER_INTEGRATION_FAQ.md](https://github.com/karrioapi/karrio/blob/4ef0fdb/CARRIER_INTEGRATION_FAQ.md)
- [UPS connector](https://github.com/karrioapi/karrio/tree/4ef0fdb/modules/connectors/ups)

## What "Observed" means here

karrio is a public project Dan leads, with many contributors. Its code and docs are
evidence of the **conventions of a project Dan leads**, not proof that Dan personally
wrote each line or holds each convention as a personal rule. So principles are
**Observed**, not Confirmed, and the agent's readings are marked **Proposed** (see the
legend in `ARCHITECTURE.md`).

"History" references summarize karrio commit subjects; they are not quoted rules.

## Exclusion rule (checked against the private denylist)

- **Never cited:** a karrio PRD, commit or file whose subject is an employer or customer,
  or that names one. Also never cited: karrio's `ee/` and `.karrio/` folders, private
  submodules, private repositories and forks, and specifics OLS attributes to its
  anonymized "cross-border carrier practice" source. Excluded so far: one migration PRD
  and one commit subject (not named here), plus every karrio PRD tied to an employer.
- **Cited with a narrow exception:** karrio's broadly public `CARRIER_INTEGRATION_FAQ.md`
  mentions a denylisted company once, as an example in its "Per-Package Request" pattern
  list. That section isn't cited and nothing from it is used. Only §6, §7, "Settings vs
  ConnectionConfig" and "Missing Context in Deserializable" are cited.
- Every cited karrio file and commit subject was scanned against the private denylist
  at `4ef0fdb` (counts only; terms never printed). Re-run that scan when adding a citation.
