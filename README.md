<h1 align="center">/dan</h1>

<p align="center"><b>Reason, investigate, build, review and communicate the way Dan would trust.</b></p>

Dan Kobina's installable agent skills. They hold his engineering judgment, his working
habits and his views on shipping software, packaged so any agent (Claude Code, Codex, or
others that read `SKILL.md`) works the same way across employers, projects and tools.

The skills carry **judgment and workflows**. They do **not** carry permissions,
credentials, schedules or employer data. Installing them doesn't create an always-on
assistant. A runtime supplies that, and the skills tell it where the lines are.

## Skills

| Skill | Use it for | Example |
| --- | --- | --- |
| **`/dan`** | Working the way Dan works: triage, answers and drafts, bug investigation, changes, reviews, verification, morning handoffs | `/dan prepare a fix for #123` |
| **`/shipping-api-design`** | Designing multi-carrier shipping APIs and data models: money, units, rate quotes, idempotent purchase, tracking, carrier options | `/shipping-api-design how should carrier options be modelled?` |
| **`/carrier-integration`** | Building or fixing carrier connectors the karrio way: pure mappers, one I/O proxy, generated schemas, errors as data | `/carrier-integration add a connector for <carrier>` |
| **`/shipping-review`** | Reviewing shipping changes for costly failures: double-billing, wrong labels, float money, dropped dangerous goods, leaked credentials | `/shipping-review this PR` |

**Full documentation:**
- [docs/skills.md](docs/skills.md): every skill's routing, workflows, principles and files.
- [docs/commands.md](docs/commands.md): install, invoke, validate, test, hooks and CI.

## Quick start

```sh
# install globally (Agent Skills CLI)
npx skills add ebenlab/dan -g

# or from a checkout: links every skill into ~/.claude/skills and ~/.codex/skills
git clone https://github.com/ebenlab/dan && dan/scripts/install.sh
# just some:  dan/scripts/install.sh --skill dan --skill shipping-review
```

```
/dan triage my review queue
/dan investigate why exports time out for large accounts
/dan review this PR
/dan morning handoff
/shipping-api-design should rates be stateless or persisted?
/carrier-integration where should this origin-dependent service code live?
/shipping-review modules/connectors/<carrier>
```

## How it works

```
/<skill> <ask>
   │
   ▼
SKILL.md ─── hard rules + load order (always loaded, short)
   │
   ▼
only the files this task needs
   /dan:                 ENTRY.md → one workflow → its references (+ VOICE.md, domains/)
   /shipping-api-design: PRINCIPLES.md (SA-1…32) → decisions.md for "why not X?"
   /carrier-integration: ARCHITECTURE.md (CI-1…19) → add-carrier workflow, quirks, testing
   /shipping-review:     CHECKLIST.md (failure → look for → fix → SA/CI id)
   │
   ▼
answer · labeled draft · patch + review packet · findings · briefing
with evidence status and the milestone actually reached
```

Every principle carries a status:
- **Confirmed:** Dan stated it.
- **Observed:** taken from his published work.
- **Proposed:** a recommendation awaiting his review.

That way, generated text never quietly becomes "what Dan thinks".

### Action levels (`/dan`)

| Level | Behavior | Default? |
| --- | --- | --- |
| A0 Observe | Read authorized sources | |
| **A1 Prepare** | Private drafts, plans, evidence packets | **yes** |
| A2 Build | Isolated checkout, run permitted tests | needs a grant |
| A3 Publish for review | Branch, draft PR, ticket | needs a grant |
| A4 Bounded communication | Routine replies under a standing grant | needs a grant |
| Reserved | Merge, release, money, credentials, security | separate, often human-only |

Confidence says whether an answer is supportable. Authorization says whether an action may
happen. Neither replaces the other.

## Repository layout

```
skills/
  dan/                   personal work skill
    SKILL.md, ENTRY.md   entry + routing (task, workspace, evidence, tools, level)
    PRINCIPLES.md        P1–P11 working judgments
    VOICE.md             output modes + voice guidance (no samples yet)
    WORKFLOWS.md         index of 8 workflows
    CAPABILITIES.md      layers, operations, adapters, grants
    workflows/           triage, reconcile-commitments, answer-or-draft, investigate-bug,
                         prepare-change, review-change, verify-change, morning-handoff
    references/          definition-of-done, engineering-judgment, communication-examples
    schemas/             task, evidence, action-proposal, workspace-adapter (JSON Schema)
    adapters/            example.adapter.json (fake values; real ones stay private)
    domains/             Dan's views on whole fields: logistics.md
  shipping-api-design/   PRINCIPLES.md (SA-1…32), references/decisions.md
  carrier-integration/   ARCHITECTURE.md (CI-1…19), workflows/add-carrier.md,
                         references/quirks.md, references/testing.md
  shipping-review/       CHECKLIST.md
docs/                    skills.md, commands.md
evals/                   25 behavioral cases (18 /dan, 7 shipping) + grading rubric
scripts/                 validate.mjs, schema-validation.mjs, install.sh, tests, hooks/
```

## Status (v0.1.0)

- `/dan` principles: all **Proposed**, distilled from Dan's spec, awaiting his own examples.
- Shipping principles: all **Observed**. They come from Dan's public work: the Open
  Logistics Specification (`ebenlab/openshipping.tech`) and karrio (`karrioapi/karrio`),
  with pinned versions.
- Voice samples: **none yet**, on purpose.
- Runner (scheduling, leases, checkpoints, budgets): **not included**. The schemas define
  what a runner must record.
- Evals: 25 cases (18 for `/dan`, 7 for the shipping skills) with a rubric. Grading is
  manual; the validator checks structure only.
- Shipping skills work standalone. Without `/dan` they default to prepare-only, and edits,
  tests or carrier calls need an explicit request.

## Open decisions

1. Which workspace/repository gets the first private adapter?
2. Which Dan-authored samples set voice and judgment?
3. Morning readiness time, timezone, budget, machine.
4. Should the first runner stop at local patches, or open draft PRs in named repos?
5. Which audiences and message types, if any, ever get unattended replies?
6. Who can access private adapters and evidence, and what gets retained?

## Public repo note

Dan's spec defaults the package to private. This repo is public at Dan's request, so it
holds **only** employer-neutral judgment, workflows and views drawn from public sources.

These must stay out:
- real adapters;
- voice samples with private context;
- rosters and customer data;
- anything employer-specific.

`.gitignore` and `scripts/validate.mjs` guard this. The validator also checks every
publishable file against a **private denylist** (`.dan/denylist.txt`, gitignored), so the
repo never names what it guards against. Turn on the pre-commit hook once per clone:

```sh
git config core.hooksPath scripts/hooks
```

## Contributing

See [AGENTS.md](AGENTS.md) and [docs/commands.md](docs/commands.md#contributing). Changes
come through PRs that Dan reviews. Principles need a source. Changes that raise autonomy
need Dan's explicit approval.

## License

[MIT](LICENSE)
