# CHANGELOG

## How to change a principle or preference

Open a PR that records, for each change:

- the source (link or quoted Dan-authored text),
- the exact correction,
- the intended scope,
- whether it is a one-off instruction or a lasting preference.

Mark superseded entries instead of deleting them. Changes that raise autonomy or touch
grants need Dan's explicit approval in the PR. They never come from "learning".

## 0.1.0 (unreleased)

- Clarify prepare-change handoff when independent review is unavailable; preserve the
  existing two-round review cap and report the review gap honestly.
- Prepare PR descriptions privately; recheck current task, human ownership, base revision
  and exact grant before any separately authorized publication. Reconcile uncertain push
  or PR-creation outcomes before retrying. Source: S1 sections 6–8; operational workflow
  clarification, not a new personal principle or autonomy grant.
- Add behavioral cases for human takeover, uncertain PR creation, missing independent
  review and switching workspace adapters. These are grading scenarios, not a runner.
- Harden validator scans to public files as selected by Git, pruning private folders
  in plain copies and masking denylist terms in CI. Add 16 negative fixture tests and
  run them in CI and the pre-commit script; isolate fixture Git environment variables.
- First package: entry skill, principles (all Proposed), voice guidance (no samples yet),
  eight workflows, four JSON schemas, example adapter, eval cases from spec §10.
- Self-contained install: unlike kun, `/dan` does not download and run a script at load
  time. Updates arrive as reviewed, versioned releases.
