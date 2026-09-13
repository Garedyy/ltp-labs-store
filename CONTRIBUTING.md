# Contributing

## Branch model

`main` <- `development` <- `feature/<slug>`

- `development` is the integration branch; every feature branches from it.
- One pull request per feature, **squash-merged** into `development`. The PR title must be a
  Conventional Commit: it becomes the squash commit message and is linted in CI.
- `development -> main` is a merge commit per release (`chore(release): vX.Y.Z`), tagged.
- Issue fixes: `fix/<N>-<slug>` from `development` (`N` = the issue number), one PR squash-merged
  into `development` like a feature; they ship with the next release.
- Hotfixes: `fix/<slug>` from `main`, merged into both `main` and `development`.
- Merge methods are enforced with GitHub rulesets (squash for `development`, merge commit for `main`).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), English, imperative mood, subject
<= 72 characters, body explains _why_. Enforced by commitlint (`commit-msg` hook and CI).

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
Scopes (optional): `scaffold`, `tooling`, `ui`, `i18n`, `shell`, `api`, `catalogue`, `product`,
`cart`, `a11y`, `docs`, `ci`, `release`.

No `Co-Authored-By` or tool attribution trailers.

## Local workflow

```sh
nvm use && npm ci
npm run dev                 # development server
npm run check               # typecheck + lint + format:check + check:licenses + unit tests
npm run test:e2e            # Playwright (builds and serves the app; four Chromium projects, reduced motion)
```

Git hooks (Husky): `pre-commit` runs lint-staged (ESLint + Prettier on staged files);
`commit-msg` runs commitlint.

`IBM_TELEMETRY_DISABLED=true` disables the telemetry of `accessibility-checker` (set it in your shell
profile; CI sets it). Its Puppeteer and chromedriver binaries are skipped through `package.json`
(`puppeteer.skipDownload`) and `.npmrc` (`chromedriver_skip_download`).

## Definition of Done

| Area                    | Requirement                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Quality                 | `npm run check` and `npm run test:e2e` green locally and in CI                                                      |
| Progressive enhancement | Every flow works without JavaScript                                                                                 |
| Accessibility           | Zero `accessibility-checker` (WCAG 2.2) failures on the routes touched; keyboard and screen-reader walkthrough done |
| Responsive              | Checked at 320 / 390 / 768 / 1440 px, no horizontal scroll                                                          |
| i18n                    | Every string in EN and PT, glossary respected, no literal strings in JSX                                            |
| Docs                    | `README.md`, `CHANGELOG.md`, the relevant `Docs/*.md` and `Docs/PROGRESS.md` updated in the same PR                 |
| Routes                  | `tests/e2e/routes.ts` lists every new route                                                                         |

## Claude Code skills

The repository ships its workflow as Claude Code skills in `.claude/skills/` (the user drives
them; every one stops for approval before writing, branching or pushing):

- `/issue <description>` — checks for duplicates, locates the affected code, drafts an English
  ASCII-only issue with the repository labels and creates it once the draft is approved.
- `/fix-issue <N>` — reads the issue, syncs `development`, proposes a plan, then branches
  `fix/<N>-<slug>`, implements, tests, commits and hands over to `/pull-request`.
- `/commit-push` — stages, commits (Conventional Commit, English, ASCII, no trailers) and pushes.
- `/pull-request [#N]` — opens the PR as a draft, runs `/project-review pr <n> --post`, marks it
  ready when nothing blocks.
- `/merge-pr <n>` — waits for a green CI, merges with the method the base requires, deletes the
  head branch, closes the linked issue, fast-forwards the local base.
- `/project-review` — see below.
- `web-animation-design` — a reference skill, not a workflow: Emil Kowalski's animation rules
  (vendored from `vercel-labs/open-agents`, MIT); Claude loads it whenever motion is touched.

## Automated review

`/project-review [all | pr <n> | diff | branch | <path>] [--no-verify] [--post] [--full]`
(Claude Code skill in `.claude/skills/project-review/`) runs one read-only reviewer agent per
perspective - correctness, conventions, security, accessibility, i18n, architecture, data
layer, design system, dependencies, testing, performance, docs and git (branch and PR scopes
only) - each armed with a checklist distilled from `CLAUDE.md`, `Docs/PROJECT_PLAN.md`,
`Docs/DECISIONS.md` and this file. To keep the token cost low, a perspective is launched only
when the scope touches its files (`--full` launches all of them), mechanical perspectives run
on Haiku, judgement-heavy ones on Sonnet, correctness and security on Opus, every agent has a
turn cap, and agents never read the docs in full. Critical and major findings are challenged
by one verifier agent per perspective before the synthesis table; `--post` comments the table
on the PR. Verdicts: `PASS` (nothing above info), `WARN` (minor findings only), `FAIL` (a
critical or major finding survived verification). It complements CI and the PR checklist; it
never replaces the keyboard, VoiceOver and 320 px walkthroughs.

## Dependency and licence policy

Only permissive licences are allowed, for direct **and transitive** dependencies, fonts, icons and
copied snippets: MIT, ISC, BSD-2/3-Clause, Apache-2.0, Unlicense, 0BSD, CC0-1.0, MIT-0,
BlueOak-1.0.0, Python-2.0; OFL-1.1 for fonts. Never commercial, never copyleft (GPL, LGPL, AGPL,
MPL, EPL, SSPL, CC-BY-SA...).

Before adding a package:

1. `npm view <pkg> license` and `npm view <pkg> dependencies`, then check the tree after install.
2. Runtime dependencies are frozen (see `README.md`); dev dependencies need the user's approval.
3. Run `npm run check:licenses`. It walks `node_modules` and fails on anything outside the
   allow-list. The only tolerated exceptions are the unmodified build-time packages named in
   `scripts/check-licenses.mjs` and justified in `Docs/DECISIONS.md`; adding one requires approval
   and a new decision entry.
4. When a needed package is copyleft or commercial: find a permissive alternative, or ask.
