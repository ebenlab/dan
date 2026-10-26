# AGENTS.md

Instructions for any agent (Claude, GPT/Codex, others) changing this repo.

## What this repo is

The public, employer-neutral source of Dan's `/dan` work skill. The installable package is
`skills/dan/`. Everything else supports it (evals, scripts, docs).

## Rules

1. **Nothing private.** No employer names tied to internal detail, customer data, private
   URLs, credentials, machine paths or real workspace adapters. If in doubt, leave it out
   and say so in the PR.
2. **Provenance.** A new or changed principle needs a status (Confirmed / Observed /
   Proposed), a scope, a counterexample, and a source in `SOURCES.md`. Agent output is not
   a source for Confirmed.
3. **Never raise autonomy by default.** The default level stays A1. Changes to levels,
   grants or send gates need Dan's explicit approval in the PR.
4. **Keep `SKILL.md` thin.** Hard rules and load order only. Detail goes in the files it
   routes to.
5. **Keep workflows self-contained.** An agent should be able to open one workflow file and
   the references it names, and nothing else.
6. **Add an eval case** to `evals/cases.json` for any new behavioral rule.
7. Run `node scripts/validate.mjs` before opening a PR.

## Giving an alternative opinion

Second opinions are welcome. To make them useful:

- Put each disagreement in the PR as: what's there now → what you'd change → why → what it
  would break.
- Separate blocking problems (unsafe, wrong, contradicts the spec) from preferences.
- If you think the spec itself is wrong, say so explicitly instead of quietly diverging.
- Prefer small commits per concern so Dan can accept some and reject others.
