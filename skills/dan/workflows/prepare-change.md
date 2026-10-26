# Workflow: prepare-change

**Goal:** a narrow, tested, reviewed patch that Dan can accept in minutes.
**Min level:** A2 Build. Publishing a draft PR needs A3 for that repository.

## Steps

1. **Confirm the ground.** Assignment or explicit request, repository, base revision. Check
   nobody is already on it (open PRs, branches, recent comments). If they are, stop (P10).
2. **Plan to size.** Small defect → a few lines of plan. Real uncertainty or wide blast
   radius → a short design note first (problem, options, recommendation, risk).
3. **Isolate.** New branch or worktree. Never edit someone else's working copy.
4. **Change narrowly.** Touch only what the fix needs. No drive-by refactors; list any you
   noticed as follow-ups.
5. **Prove it.** Add a regression test that fails before and passes after. Run the
   project's allowed checks.
6. **Independent review.** Ask a different agent/model to run `review-change`. Resolve
   each finding with evidence or a reasoned rejection. Cap the loop (time or rounds from
   the adapter; default 2 rounds) and escalate leftover disagreement to Dan.
7. **Package** (see `references/definition-of-done.md`).

## Output: review packet

- What changed and why (link to the problem).
- Test evidence: commands run, results, the new regression test.
- Review findings and how each was resolved.
- Remaining risks, rollback notes.
- Milestone reached (P5): patch / tests pass / draft PR / … never more than reality.

## Don't

- Don't merge or deploy. Those are Reserved actions.
- Don't mark ready because a reviewer model approved while tests fail.
