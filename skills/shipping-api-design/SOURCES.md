# SOURCES.md

| Key | Source | Pinned at | License |
| --- | --- | --- | --- |
| OLS | Open Logistics Specification, `ebenlab/openshipping.tech` (public). Chapter and line refs like `00:59`; decisions like `D11` from `spec/A-rationale.md` | [`f56f7f1`](https://github.com/ebenlab/openshipping.tech/tree/f56f7f1) | Spec text CC BY 4.0, schemas Apache-2.0 |
| karrio | `karrioapi/karrio` (public, open source). Paths relative to the repo root | [`4ef0fdb`](https://github.com/karrioapi/karrio/tree/4ef0fdb) (release 2026.1.32) | See the karrio repo |

Direct links to the most-cited files:
- [spec/A-rationale.md](https://github.com/ebenlab/openshipping.tech/blob/f56f7f1/spec/A-rationale.md)
- [spec/00-conventions.md](https://github.com/ebenlab/openshipping.tech/blob/f56f7f1/spec/00-conventions.md)
- [spec/01-core-objects.md](https://github.com/ebenlab/openshipping.tech/blob/f56f7f1/spec/01-core-objects.md)
- [spec/02-rates.md](https://github.com/ebenlab/openshipping.tech/blob/f56f7f1/spec/02-rates.md)
- [karrio core/units.py](https://github.com/karrioapi/karrio/blob/4ef0fdb/modules/sdk/karrio/core/units.py)

## What "Observed" means here

Both sources are public projects that Dan leads. The OLS repository's commits are
authored by Dan. karrio has many contributors, so a karrio file is evidence of the
**conventions of a project Dan leads**, not proof that Dan personally wrote each line.
That is why every principle is **Observed** (drawn from those artifacts) rather than
**Confirmed** (Dan stated it as his rule). The agent's own readings are marked
**Proposed** (see the legend in `PRINCIPLES.md`). Promote any of them only with Dan's
explicit sign-off (see `skills/dan/CHANGELOG.md`).

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
- OLS: general principles that other sources also support are kept.
- Every cited karrio file and commit subject was scanned against the private denylist
  at `4ef0fdb` (counts only; terms never printed). Re-run that scan when adding a citation.

## Known inconsistencies in the source (don't propagate them)

- Mode count: some chapters say four modes, others six. Six is current.
- Idempotency conflict guidance differs between `shipping.md` and `00-conventions.md`.
  Our reading, not yet confirmed by Dan: retry an in-progress request with the same key,
  and use a new key only for a genuinely different request (as `00-conventions.md` says).
