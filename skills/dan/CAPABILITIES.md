# CAPABILITIES.md

What this skill needs from a runtime, described without assuming any vendor's CLI.

## Layers

| Layer | Lives in | Contains | Must not contain |
| --- | --- | --- | --- |
| Personal core | This repo (`skills/dan/`) | Judgment, voice guidance, workflows, schemas | Employer data, rosters, customer records, private URLs, credentials, hard-coded paths |
| Workspace adapter | Private, outside this repo | Repos, issue systems, roles, terms, test envs, release process | Authority inferred from access or assignment |
| Permission registry | The runtime | Approved actions, audiences, accounts, limits, expiry, revocation | Grants an agent created or "learned" |
| Runtime | Claude Code, Codex, a scheduler… | Scheduling, connectors, worktrees, models, budgets, logs, approvals | Dan's preferences hard-coded into one tool |
| Task evidence | Per task | Sources, decisions, artifacts, tests, open questions | An unfiltered copy of every accessible conversation |

## Operations the workflows use

Each is optional. If missing, the workflow says what it produces instead.

- **read_source**: read an issue, thread, doc or log by stable ID. Returns content + timestamp.
- **search_code / read_code**: inspect a repository at a known revision.
- **isolated_checkout**: a branch or worktree that cannot affect others' work.
- **run_checks**: run tests, linters, type checks in the isolated checkout.
- **independent_review**: a second agent or model reviews the patch (diversity ≠ proof).
- **publish_draft**: push a branch / open a draft PR or ticket (A3).
- **send_message**: post or send (A4, with a grant).
- **record**: persist task, evidence and action records (see `schemas/`).

## Workspace adapters

An adapter is a private file matching `schemas/workspace-adapter.schema.json`. Keep it out of
this public repo. Suggested locations, first match wins:

1. `$DAN_WORKSPACE_ADAPTER` (path to the file)
2. `.dan/adapter.json` in the current project
3. `~/.config/dan/adapters/<workspace-id>.json`

`adapters/example.adapter.json` in this repo shows the shape with fake values.

## Grants

A grant names: action, target, audience, content limits, expiry and revocation route. A
standing communication grant (A4) also needs: verified sending identity, named recipients
or bounded audience, permitted topics, excluded content, freshness rules, volume limits,
audit destination and escalation route. **Do not fill these in yourself.** If a field is
missing, the grant does not exist.

## Known gaps in v0.1.0

- No runner. Scheduling, leases, checkpoints and budgets are the runtime's job; the
  schemas define what it must record.
- No adapter is shipped. The first one is a decision for Dan (see README → Open decisions).
- No voice samples yet.
