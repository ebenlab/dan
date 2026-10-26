# WORKFLOWS.md

Index of workflows. Each file under `workflows/` is self-contained: open only the one you
need.

| Workflow | Input | Output | Min. level | Stop when |
| --- | --- | --- | --- | --- |
| [triage](workflows/triage.md) | Authorized queues | Small ranked queue with rationale and unknowns | A0 | A source is unavailable (report partial coverage) |
| [reconcile-commitments](workflows/reconcile-commitments.md) | Threads, tickets, notes | List of open commitments with verified state | A0 | Ownership is unclear (ask) |
| [answer-or-draft](workflows/answer-or-draft.md) | A question + its thread | Answer, labeled draft, or sent receipt | A1 (A4 to send) | Evidence is conflicted or a send gate fails |
| [investigate-bug](workflows/investigate-bug.md) | Symptom report | Cited findings + fix plan or named missing evidence | A0 (A2 to reproduce locally) | Reproduction would touch production or real money |
| [prepare-change](workflows/prepare-change.md) | Confirmed task | Patch + review packet (draft PR only at A3) | A2 | Duplicate active work, or review loop budget spent |
| [review-change](workflows/review-change.md) | Diff + requirements | Findings by severity with remedies | A0 | Cannot read the full diff |
| [verify-change](workflows/verify-change.md) | A change + its claim | Verification state with evidence | A2 | A check would create a billable or external side effect |
| [morning-handoff](workflows/morning-handoff.md) | Run records | One concise briefing | A1 | Never stops early: always report what could not be checked |

Shared contracts live in `schemas/`:

- `task.schema.json`: one unit of work, its state and its verification state.
- `evidence.schema.json`: one claim and where it came from.
- `action-proposal.schema.json`: one side effect, bound to exact content and approval.
- `workspace-adapter.schema.json`: the private, per-workspace configuration.
