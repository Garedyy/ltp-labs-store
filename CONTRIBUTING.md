# Contributing

## Branch model

`main` <- `development` <- `feature/<slug>`

- `development` is the integration branch; every feature branches from it.
- One pull request per feature, **squash-merged** into `development`. The PR title must be a
  Conventional Commit: it becomes the squash commit message and is linted in CI.
- `development -> main` is a merge commit per release (`chore(release): vX.Y.Z`), tagged.
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
npm run test:e2e            # Playwright (builds and serves the app; four Chromium projects)
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
