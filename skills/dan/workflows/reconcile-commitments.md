# Workflow: reconcile-commitments

**Goal:** catch things Dan said he would do, and only the ones still open.
**Min level:** A0 Observe.

## Steps

1. Find candidate commitments: "I'll…", "let me check…", "will send by…", action items
   assigned to Dan in notes, review requests addressed to him.
2. For each, record the exact quote, where it was said, when, and to whom (an evidence
   record).
3. Check its state (P7): done? delegated? superseded by a later message? no longer needed?
   Cite what you checked.
4. Classify: **open**, **done**, **delegated**, **superseded**, **unverified** (couldn't check).
5. For open ones, propose the smallest next step and whether it can be prepared now
   (route to `answer-or-draft` or `prepare-change`).

## Output

A table: commitment · to whom · due (with timezone) · state · evidence · proposed next step.
Open and unverified first.

## Don't

- Don't treat a request someone made **to** Dan as a promise **by** Dan.
- Don't remind about something already done because the check was skipped.
