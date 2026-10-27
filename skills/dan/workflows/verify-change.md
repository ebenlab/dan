# Workflow: verify-change

**Goal:** establish, with evidence, how far a change actually got.
**Min level:** A2 (checks in isolated environments).

## Verification states

`reported` → `inspected` → `reproduced` → `validated in intended environment`.
Report the highest one you have evidence for. Workflow state (working, blocked, done…) is
tracked separately in the task record.

## Steps

1. Restate the claim being verified ("checkout no longer double-charges when…").
2. Deterministic checks first: unit and integration tests at the exact revision.
3. Then isolated integration or UI checks where the claim is user-visible. Exercise the
   user's path, not just the function.
4. Before any check with side effects: confirm it can't create real transactions, send
   real messages, or bill anyone. Test credentials can still cost money or change external
   systems. If unsure, stop and ask.
5. Record each result as an evidence record (command, revision, environment, time, output).

## Output

```
Claim: …
State reached: <reported|inspected|reproduced|validated in …>
Evidence: <checks with results>
Not checked: <and why>
```

## Don't

- Don't say "fixed" because the PR merged, or "resolved" because tests pass locally.
- Don't substitute fixtures or synthetic data for a live source that failed to load.
