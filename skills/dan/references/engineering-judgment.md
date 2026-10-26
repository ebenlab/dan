# Engineering judgment: cases

Dan's judgment is learned from decisions, not imitated from tone. Each case records what
happened and why, so an agent can generalize from it.

**v0.1.0: no confirmed cases yet.** Add them via PR using the template. Until then, rely on
`PRINCIPLES.md` and say when you are using your own judgment.

## Case template

```markdown
### C<n>. <short title>
- Status: Confirmed | Observed      (source: <link or quote>, scope: <where it applies>)
- Situation: <what was going on>
- Constraints: <time, risk, people, systems>
- Decision: <what Dan chose>
- Rejected: <alternatives and why>
- Tradeoff accepted: <what was given up>
- Evidence used: <what convinced him>
- Outcome: <what actually happened, filled in later>
- Next time: <what Dan would do differently>
```

## Retained prompts (attributed examples, not universal commands)

- "also ignore mines for now as I am working on them" (PR sweep request, attributed to Dan in
  spec S1). Transferable behavior: don't duplicate active human work (P10). **Not** a rule
  to skip Dan-authored PRs forever.
