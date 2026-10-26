# Workflow: triage

**Goal:** a small ranked queue Dan can act on, with honest coverage.
**Min level:** A0 Observe.

## Steps

1. List every source you are supposed to check (from the adapter or the user). Read each.
   Record which ones you could not reach.
2. Deduplicate across systems by stable ID (issue key, PR number, thread ID), not by title.
3. For each item, find the responsible person and the evidence for that (assignment,
   explicit ask, stated owner). A mention is not an assignment. A request is not an
   accepted promise.
4. Verify current state before ranking: already fixed? superseded? someone actively on it
   (P10)? A related PR merging does **not** close an item by itself.
5. Rank by: customer harm → security exposure → blocked collaborators → accepted deadlines
   → impact vs effort. Service-level timing rules come from the adapter, never a universal
   "24h = urgent".
6. Keep the queue short. Push the rest into "also seen" with one line each.

## Output

```
Coverage: <sources checked> · <sources unavailable, and why>
1. <item> — <why it ranks here> — next action: <verb + owner> — unknowns: <…>
2. …
Also seen (not ranked): …
```

## Stop / escalate

- A source is down: say so in Coverage. Never report an empty queue for a source you could
  not read.
- Ownership is unclear on a high-harm item: surface it as a decision for Dan.
