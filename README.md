<h1 align="center">/dan</h1>

<p align="center"><b>Reason, investigate, build, review and communicate the way Dan would trust.</b></p>

`/dan` is Dan Kobina's personal work skill: his engineering judgment and working habits,
packaged so any agent (Claude Code, Codex, others that read `SKILL.md`) works the same way
across employers, projects and tools.

It carries **judgment and workflows**. It does **not** carry permissions, credentials,
schedules or employer data. Installing it doesn't create an always-on assistant. A runtime
supplies that, and the skill tells the runtime where the lines are.

## Quick start

```sh
# install globally (Agent Skills CLI)
npx skills add ebenlab/dan -g

# or from a checkout: symlinks into ~/.claude/skills and ~/.codex/skills
git clone https://github.com/ebenlab/dan && dan/scripts/install.sh
```

Then, in your agent:

```
/dan triage my review queue
/dan investigate why exports time out for large accounts
/dan prepare a fix for #123
/dan review this PR
/dan draft a reply to this thread
/dan morning handoff
```

## How it works

```
/dan <ask>
   │
   ▼
SKILL.md ── hard rules (always loaded, short)
   │
   ▼
ENTRY.md ── 5 questions: task? workspace? evidence? tools? allowed level?
   │
   ├── PRINCIPLES.md       (always, compact, each with status + counterexample)
   ├── workflows/<one>.md  (only the one that matches)
   ├── references/…        (only what that workflow names)
   └── VOICE.md            (only when writing as / for Dan)
   │
   ▼
Answer / draft / patch + review packet / briefing
labeled with evidence status and the milestone actually reached
```

### Action levels

| Level | Behavior | Default? |
| --- | --- | --- |
| A0 Observe | Read authorized sources | |
| **A1 Prepare** | Private drafts, plans, evidence packets | **yes** |
| A2 Build | Isolated checkout, run permitted tests | needs grant |
| A3 Publish for review | Branch, draft PR, ticket | needs grant |
| A4 Bounded communication | Routine replies under a standing grant | needs grant |
| Reserved | Merge, release, money, credentials, security | separate, often human-only |

Confidence says whether an answer is supportable. Authorization says whether an action may
happen. Neither replaces the other.

## Repository layout

```
skills/dan/            ← the installable skill (only this folder gets installed)
  SKILL.md             entry + hard rules
  ENTRY.md             routing: task, workspace, evidence, tools, level
  PRINCIPLES.md        P1–P11 working judgments
  VOICE.md             output modes + voice guidance
  WORKFLOWS.md         workflow index (inputs, outputs, stop conditions)
  CAPABILITIES.md      layers, tool-neutral operations, adapters, grants
  SOURCES.md           provenance + status labels
  CHANGELOG.md         how principles change; release notes
  workflows/           triage, reconcile-commitments, answer-or-draft, investigate-bug,
                       prepare-change, review-change, verify-change, morning-handoff
  references/          engineering-judgment, communication-examples, definition-of-done
  schemas/             task, evidence, action-proposal, workspace-adapter (JSON Schema)
  adapters/            example.adapter.json (fake values; real ones stay private)
  domains/             Dan's views on whole fields (logistics/shipping planned)
evals/                 12 behavioral cases from the spec + grading rubric
scripts/               validate.mjs (structure + secret + private-denylist checks), install.sh, hooks/
```

## Status (v0.1.0)

- Principles: all **Proposed**, distilled from Dan's spec, awaiting his own examples.
- Voice samples: **none yet**, on purpose. See `references/communication-examples.md`.
- Runner (scheduling, leases, checkpoints, budgets): **not included**. The schemas define
  what a runner must record.
- Evals: cases + rubric only. Grading is manual for now.
- Domains: `skills/dan/domains/` is ready for Dan's views on logistics and shipping tech as
  a whole. These are industry-wide views, never employer-specific. No content yet.

## Open decisions

1. Which workspace/repository gets the first private adapter?
2. Which Dan-authored samples set voice and judgment?
3. Morning readiness time, timezone, budget, machine.
4. Should the first runner stop at local patches, or open draft PRs in named repos?
5. Which audiences and message types, if any, ever get unattended replies?
6. Who can access private adapters and evidence, and what gets retained?

## Public repo note

Dan's spec defaults the package to private. This repo is public at Dan's request, so it
holds **only** employer-neutral judgment and workflows. Real adapters, voice samples with
private context, rosters and customer data must stay out (`.gitignore` and
`scripts/validate.mjs` both guard this).

`scripts/validate.mjs` also checks every file against a **private denylist** of employer
terms (`.dan/denylist.txt`, gitignored), so the repo never names what it guards against.
Turn on the pre-commit hook once per clone:

```sh
git config core.hooksPath scripts/hooks
```

## Contributing

See [AGENTS.md](AGENTS.md). Changes come through PRs that Dan reviews. Changes to
principles need a source; changes that raise autonomy need Dan's explicit approval.

## License

[MIT](LICENSE)
