# SOURCES.md

Where the content in this package came from, and how sure we are.

## Status labels

- **Confirmed:** Dan directly requested or corrected it. Record source and scope.
- **Observed:** supported by attributable examples, not yet approved as a lasting rule.
- **Proposed:** a design recommendation.
- **Unknown / Superseded:** not enough evidence, or replaced by a later decision. Keep the
  entry and link the replacement; don't delete history.

Agent output, silence, or one successful draft is **not** evidence of a lasting preference.

## Sources

| ID | Source | Used for | Status |
| --- | --- | --- | --- |
| S1 | "Dan Personal Work Skill and Agent Operating Specification" (Notion, revised 2026-10-26) | Structure, principles P1–P11, autonomy levels, send gates, workflows, eval cases | Proposed: Dan requested the outcomes; the details are recommendations for his review |
| S2 | kunchenguid/kun (public GitHub repo) | Package shape only: thin entry skill, separate judgment / voice / tools files, selective loading | Structural reference; no opinions copied |

## Where the source of truth lives

Notion is the editorial spec. This repo is the executable source. Changes flow one way:
reviewed spec edits → PR here → tagged release. Don't let two copies rewrite each other.

## What is deliberately not here

App inventories, machine paths, costs, model versions, ports and integration status from
earlier drafts. Those are runtime snapshot material, and an adapter must check its own
environment.
