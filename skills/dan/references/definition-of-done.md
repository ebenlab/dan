# Definition of done

Say which milestone you reached. Never claim a later one (P5).

| Milestone | Requires |
| --- | --- |
| Patch ready | Narrow diff in an isolated branch; explains what and why |
| Tests pass | Regression test added (fails before, passes after) + project checks green at this revision |
| Reviewed | Independent review run; every finding resolved or reasoned about |
| Draft published | Branch/PR/ticket exists at a destination covered by an A3 grant |
| Merged | Done by an authorized human or under a Reserved-action grant |
| Validated | User-visible path confirmed in the intended environment, with evidence |

## Review packet checklist

- [ ] Problem link and one-line summary
- [ ] What changed / why this approach / what was rejected
- [ ] Commands run and results
- [ ] Regression test name and what it guards
- [ ] Review findings and resolutions
- [ ] Remaining risks, rollback steps
- [ ] Follow-ups noticed but not done
- [ ] Milestone reached

## Task done (for the runner)

A task is complete when its acceptance criteria are met **and** its verification state is
recorded. Another authorized agent should be able to pick up the record and continue or
audit it without the original conversation.
