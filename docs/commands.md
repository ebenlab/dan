# Commands reference

Everything you can run: installing the skills, invoking them in an agent, and the repo's
validation, tests and hooks. For what each skill does, see [skills.md](skills.md).

## Install

### Agent Skills CLI

```sh
npx skills add ebenlab/dan -g
```

`-g` installs globally (all projects). The CLI discovers skills from each
`skills/<name>/SKILL.md` in the repo. It hasn't been verified yet that all four skills
are picked up this way; check your agent's skill list after installing.

### From a checkout

```sh
git clone https://github.com/ebenlab/dan
dan/scripts/install.sh
```

| Form | Effect |
| --- | --- |
| `scripts/install.sh` | Symlinks **every** skill (each `skills/<name>/` with a `SKILL.md`) into `~/.claude/skills/<name>` and `~/.codex/skills/<name>` |
| `scripts/install.sh --skill NAME` | Installs only the named skill. `NAME` must exactly match a discovered skill (see `--list`); paths such as `../x` are refused. Repeat it for several: `--skill dan --skill shipping-review` |
| `scripts/install.sh --copy` | Copies instead of linking, which pins the installed version to this checkout |
| `scripts/install.sh DIR…` | Installs into the given skill folders instead of the defaults |
| `scripts/install.sh --list` | Lists the skills this checkout provides |
| `scripts/install.sh --help` | Prints usage |

Options combine: for example,
`scripts/install.sh --copy --skill carrier-integration ~/.claude/skills`.

- A symlink follows the checkout, so `git pull` updates the skills. Use `--copy` when you
  want reviewed, pinned versions.
- Rerunning is safe: existing symlinks are replaced.
- A destination that exists and isn't a symlink is skipped with a message, never overwritten.
- An unknown skill name, a path, or an unknown option exits with code 2 and installs
  nothing, even when other selectors were valid.
- Selecting skills without `dan` prints a note: the shipping skills then run prepare-only.
- Works with the bash 3.2 that ships with macOS.

## Invoke in an agent

| Skill | Example |
| --- | --- |
| `/dan` | `/dan triage my review queue` · `/dan prepare a fix for #123` · `/dan morning handoff` |
| `/shipping-api-design` | `/shipping-api-design how should carrier-specific options be modelled?` |
| `/carrier-integration` | `/carrier-integration add a connector for <carrier>` |
| `/shipping-review` | `/shipping-review this PR` |

Agents can also load a skill without the slash command when the request matches the
skill's description (for example, "review this carrier connector" triggers
`/shipping-review`).

### Environment for `/dan`

| Variable / path | Purpose |
| --- | --- |
| `DAN_WORKSPACE_ADAPTER` | Path to a private workspace adapter JSON (first match wins) |
| `.dan/adapter.json` | Project-local private adapter (gitignored here) |
| `~/.config/dan/adapters/<id>.json` | User-level private adapters |

Adapters describe a workspace. They never hold credentials and never grant permissions.

## Validation

```sh
node scripts/validate.mjs
```

Zero-dependency structural and hygiene checks. It exits non-zero on any problem.

| Check | What it enforces |
| --- | --- |
| Skill entries | Every `skills/<name>/` folder has a `SKILL.md` whose frontmatter `name` equals the folder name and which has a description; `skills/dan` must exist |
| Required files | The core `/dan` files, references, schemas and example adapter exist |
| Workflow index | Every workflow `ENTRY.md`/`WORKFLOWS.md` mention exists, and every workflow file is indexed |
| Links | Relative markdown links resolve in every skill, in `docs/` and in `README.md` |
| Schemas | All four schemas compile in the local checker; the example adapter validates against its schema in full |
| Evals | Every case has the required fields, a unique ID, a known workflow and at least one `must_not` |
| Hygiene | No publishable real `*.adapter.json`, and nothing that looks like a secret (GitHub, OpenAI-style and AWS keys, private keys) |
| Private denylist | No publishable file contains a private term (see below) |

"Publishable" means what git would publish: tracked files plus untracked files that
aren't ignored. Outside a git checkout, it falls back to walking the tree, skipping
`.git`, `node_modules`, `.dan` and `.agent-exchange`.

On success it prints the skills it checked, e.g.
`✓ 4 skill(s) look structurally sound: carrier-integration, dan, shipping-api-design, shipping-review`.

`/dan`'s required files, workflow index, schemas and evals get deeper checks. The other
skills currently get entry, link, hygiene and denylist checks.

### Private denylist

```sh
mkdir -p .dan && $EDITOR .dan/denylist.txt   # gitignored
```

One term per line, case-insensitive, whole-word; `#` starts a comment. Use it for
employer or customer names that must never appear in this public repo. The list stays
private, so the repo never names what it guards against.

| Variable | Effect |
| --- | --- |
| `DAN_DENYLIST=/path/to/list.txt` | Use a list outside the repo instead of `.dan/denylist.txt` |
| `CI=true` | Report hits as `path:line: a private term (masked)` without printing the term (CI logs may be public) |

## Tests

```sh
node --test scripts/validate.test.mjs scripts/schema-validation.test.mjs scripts/install.test.mjs
```

| Suite | Tests | Covers |
| --- | --- | --- |
| `validate.test.mjs` | 26 | Negative fixtures for the validator. Privacy: private folders skipped, terms in public files caught, token-shaped strings, CI masking, external denylist, gitignored vs force-added files. Structure: skill folders without a `SKILL.md`, names that don't match their folder, broken links in any skill or the docs, eval cases naming an unknown skill or workflow. Most run both with and without git |
| `schema-validation.test.mjs` | 21 | The record schemas: approval provenance, grants, receipts, completion rules, budgets, blank fields, unknown fields, date-times, unsupported keywords |
| `install.test.mjs` | 7 | `install.sh` in throwaway folders: install all, `--skill` + `--copy`, `--list`, path traversal refused with nothing written, no partial install when one selector is bad, unknown options, existing real folders kept |

Tests copy the repo (or the installer and skills) to a temp folder and never touch
`~/.claude` or `~/.codex`. The validator tests strip `GIT_*` variables, so they're safe
inside a commit hook. Fixture terms and tokens are built at runtime, so the test files never
contain them.

`scripts/schema-validation.mjs` is the local schema checker. It supports only the
keywords these schemas use and fails loudly on anything else. It is not a general JSON
Schema implementation.

## Pre-commit hook

```sh
git config core.hooksPath scripts/hooks   # once per clone
```

On every commit, [scripts/hooks/pre-commit](../scripts/hooks/pre-commit) runs the
validator and all three test suites (about 5–6 seconds), and blocks the commit if anything fails.

## CI

[.github/workflows/validate.yml](../.github/workflows/validate.yml) runs on every pull
request and on pushes to `main`, with Node 22: the validator, then all three test suites. CI has
no private denylist, so that scan only runs locally.

## Contributing

Read [AGENTS.md](../AGENTS.md) first. In short:
- nothing private;
- every principle needs a status, scope, counterexample and source;
- the default action level stays A1;
- add an eval case for any new behavioral rule;
- run the validator and tests before opening a PR.
