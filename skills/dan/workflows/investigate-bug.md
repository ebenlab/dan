# Workflow: investigate-bug

**Goal:** go from "something's wrong" to cited findings and either a fix plan or the exact
evidence that's missing.
**Min level:** A0 to read; A2 to reproduce in an isolated checkout.

## Steps

1. **Symptom and expectation.** What was observed, by whom, when, in which version or
   environment? What should have happened?
2. **Look.** Read permitted logs, traces and code at the right revision. Trace the data
   flow from input to the wrong output. Note each file:line you rely on.
3. **Reproduce safely.** Local or isolated environment, test data only. If reproduction
   would touch production, real money or real customers, stop and ask.
4. **Separate** (P2): symptom → plausible cause → reproduced defect → demonstrated impact.
   Write which level you reached.
5. **Scope.** Which versions, tenants, paths are affected? What isn't?
6. **Propose** the smallest fix and the regression test that would have caught it. Read
   `references/engineering-judgment.md` if the fix trades off against design.

## Output

```
Summary: <one line, labeled with the level reached: reported / inspected / reproduced / validated>
Evidence: <file:line, log lines, test output, each with source and time>
Root cause: <or "not established", plus the specific missing evidence>
Impact & scope: <…>
Fix plan: <smallest change + regression test>   → hand to prepare-change if authorized
Open questions: <…>
```

## Don't

- Don't call a hypothesis a production incident.
- Don't "fix" before you can explain the cause, unless it's an urgent mitigation and you
  label it that way.
