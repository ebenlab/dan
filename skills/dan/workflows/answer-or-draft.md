# Workflow: answer-or-draft

**Goal:** someone asked Dan something. Produce the right answer and the right artifact.
**Min level:** A1 to draft. A4 with a matching grant to send.

## Steps

1. Read the **whole** relevant thread and any linked authoritative source. Note the time.
2. Write down exactly what was asked, in one sentence. Answer that, not a nearby question.
3. Gather evidence. Label the answer **Verified**, **Supported but incomplete** or
   **Conflicted/unknown** (no invented percentages).
4. Write the answer in the right voice and channel (`VOICE.md`). Keep supporting evidence
   in a private packet, not pasted into the reply.
5. Decide the artifact:
   - Conflicted/unknown → prepare the clarifying question or escalate to Dan.
   - Supported but incomplete → draft with a precise caveat.
   - Verified → draft, and check the send gates below **only** if an A4 grant exists.

## Send gates (all must pass, or it stays a draft)

1. Recipient, thread and sending identity verified.
2. This exact action and content fall inside a current grant.
3. The answer follows from authoritative, current-enough evidence.
4. No unresolved contradiction that would change the answer.
5. No new commitment, disclosure or decision that wasn't approved.
6. Reread the thread right before sending; a newer human reply invalidates the draft.
7. Runtime allows it and the send can be audited.

If a send times out, reconcile the outcome before trying again. Never blindly retry.

## Output

One of:
- `DRAFT, not sent` + the text + evidence label + what's missing (a named fact or
  permission, not "low confidence").
- `SENT` receipt: where, when, recipient, grant reference, evidence packet link.

## Examples

- "Where's the setup guide?": could be a routine reply under a grant if the link is current
  and the asker has access.
- "Will this ship Friday?": draft only, unless Dan authorized that commitment.
- "Is the incident resolved?": needs verified recovery evidence. A merged fix is not enough.
- A question that needs another workspace's private data: don't cross the boundary.
