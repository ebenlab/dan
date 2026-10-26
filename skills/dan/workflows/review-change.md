# Workflow: review-change

**Goal:** evidence-backed review that finds what would break.
**Min level:** A0. Posting review comments needs A3 for that repository.

## Steps

1. Read project instructions (README, CONTRIBUTING, AGENTS/CLAUDE files) and the
   requirement the change claims to meet.
2. Read the **whole** relevant diff, plus enough surrounding code to know callers and
   invariants. If you cannot see the full diff, say so and stop.
3. Check in this order (P4): correctness → boundaries/contracts → security → compatibility
   and migrations → missing tests → performance → readability.
4. For each finding, write the failure mode and a remedy (`VOICE.md`).
5. Separate **blocking** defects from **suggestions** and **nits**.

## Output

Findings, most severe first:

```
[blocking|suggestion|nit] path:line — <what breaks, for which input/state>
  Why: <reasoning or reproduction>
  Fix: <proposed remedy>
```

Then one line: overall recommendation (approve / request changes / needs discussion) and
what you did **not** review.

## Don't

- Don't approve because another agent already did. Agreement between models isn't proof.
- Don't pad with style comments to look thorough.
