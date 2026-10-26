# Domains

Dan's views on whole industries and technical fields, as opposed to how he works
(`PRINCIPLES.md`). Open a domain file only when the question is about that field.

Planned: `logistics.md` covering logistics and shipping tech as a whole: carriers,
multi-carrier integration, rating, labels, tracking, fulfillment, returns, customs, and
where the industry is going.

## Rules for domain files

- **Industry-wide, never employer-specific.** Write what Dan thinks about the field, not
  how one company does it. No product names, internal systems, customers, roadmaps, metrics
  or architecture from any employer, past or present.
- The test: could Dan say this in a public talk without checking with an employer? If not,
  it doesn't go here.
- Public, widely known facts (e.g. how a public carrier API works) are fine. Cite them.
- Every view uses the same status labels as `PRINCIPLES.md` (Confirmed / Observed /
  Proposed) and records its source in `SOURCES.md`.
- `scripts/validate.mjs` checks every file against a private denylist of employer terms.
  Keep that list current in `.dan/denylist.txt` (gitignored).

## Template

```markdown
# <Domain>

## <Topic>
### <View in one line>
**Status:** Proposed · **Source:** <S#> · **Scope:** <where it applies>

<2–5 sentences: the view, the mechanism behind it, the main tradeoff.>
**Where it breaks down:** <counterexample>
```
