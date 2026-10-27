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
   If the runtime provides no independent reviewer, or its policy does not allow starting
   one, hand off the patch with review explicitly pending. Do not call self-review
   independent review.
7. **Package** (see `references/definition-of-done.md`). Include a proposed PR title and
   description stating the problem, resulting behavior, checks and remaining limitations.
   Preparing that text does not publish it.
8. **Before any authorized publication.** Read `CAPABILITIES.md` for grant requirements.
   Reread the task, relevant thread and repository state; recheck assignment, active human
   work, cancellation, base revision and the current grant for the exact destination and
   action. A human takeover, revocation or material change invalidates the queued proposal;
   stop that action and reconcile before preparing a replacement. A3 access alone is not
   permission to publish a stale patch.
   Record the exact action and its receipt. If push or PR creation times out, mark the
   outcome uncertain and reconcile the remote branch/PR by stable target and revision
   before any retry. If the outcome cannot be established, hand off the uncertainty;
   do not repeat the action or claim publication succeeded.

## Output: review packet

- What changed and why (link to the problem).
- Test evidence: commands run, results, the new regression test.
- Review findings and how each was resolved.
- Remaining risks, rollback notes.
- Milestone reached (P5): patch / tests pass / draft PR / … never more than reality.

## Don't

- Don't merge or deploy. Those are Reserved actions.
- Don't mark ready because a reviewer model approved while tests fail.
