# Decisions (ADR-lite)

Short records of the decisions taken during implementation, including the resolution of every
**TO VERIFY** item from `PROJECT_PLAN.md` §8. The 31 decisions taken with the user before
implementation are listed in `PROJECT_PLAN.md` §2 and are not repeated here.

Format: `## D-<n> · <title>` with **Context**, **Decision**, **Consequences**, date and branch.

## D-1 · Named licence exceptions for unavoidable build-time packages

- **Date / branch**: 2026-09-11 · `feature/project-scaffold`
- **Context**: decision 30 bans every non-permissive licence, direct or transitive. The first
  full-tree audit (175 packages) found two packages outside the allow-list that the approved stack
  itself requires: `lightningcss` (**MPL-2.0**, hard dependency of both `vite@8` and
  `@tailwindcss/node@4`) and `caniuse-lite` (**CC-BY-4.0**, via `@react-router/dev` → Babel →
  browserslist). React Router v8 requires Vite 7/8, so neither can be avoided without abandoning
  decisions 1 and 12. Both run at build time only, are used unmodified, and never ship in the app
  bundle (MPL-2.0 is file-scoped and does not extend to our sources; CC-BY-4.0 covers the
  browser-support data set, not our code).
- **Decision**: keep the strict allow-list and add a **named exceptions list** to
  `scripts/check-licenses.mjs` — `lightningcss` (+ its `lightningcss-*` platform binaries),
  `caniuse-lite` and, added the same day with the user's approval, `axe-core` (**MPL-2.0**, rule
  metadata used by `eslint-plugin-jsx-a11y` at lint time only) — each with its reason, so any other
  non-permissive package still fails CI. Adding an exception requires the user's approval and a
  new entry here. All exceptions are credited in the README.
- **Consequences**: the licence policy remains enforceable and auditable; the README licence
  section documents the two exceptions and their rationale; the PR checklist wording stays
  "permissive only" with a pointer to this entry. Rejected alternatives: changing the stack
  (invalidates the plan) and a blanket "any build-time licence" exception (untraceable).

## D-2 · Additional permissive licences in the allow-list

- **Date / branch**: 2026-09-11 · `feature/tooling`
- **Context**: the full dev tree carries `MIT-0` (`@csstools/*`), `BlueOak-1.0.0` (`minimatch`,
  `lru-cache`) and `Python-2.0` (`argparse`). None is in the plan's allow-list, yet all three are
  OSI-approved permissive licences with no copyleft or commercial clause — exactly what decision 30
  means by "permissive".
- **Decision**: add `MIT-0`, `BlueOak-1.0.0` and `Python-2.0` to the allow-list of
  `scripts/check-licenses.mjs` and to `CONTRIBUTING.md`.
- **Consequences**: no exception needed for these packages; the policy's intent (never commercial,
  never copyleft) is unchanged.

## D-3 · Accessibility scan assertion and manual-review rules

- **Date / branch**: 2026-09-11 · `feature/tooling`
- **Context**: `accessibility-checker`'s `assertCompliance` fails on any result whose level is in
  `failLevels` and offers no per-rule exclusion. The rule `style_color_misuse` fires at
  `potentialviolation` level on **every** page whose stylesheet sets a colour (Tailwind's preflight
  is enough) and only asks a human to verify that colour is not the sole carrier of meaning.
- **Decision**: `tests/e2e/a11y-check.ts` applies the same criterion as `assertCompliance`
  (fail on `violation` and `potentialviolation`) minus an explicit `MANUAL_REVIEW_RULES` set; every
  entry must be justified in `Docs/ACCESSIBILITY.md` and covered by the manual audit protocol.
  Initial set: `style_color_misuse`.
- **Consequences**: the scan stays strict for everything the engine can decide; manual-only rules
  are tracked in the audit log instead of being silently baselined.

## TO VERIFY resolutions

| #   | Item                                                           | Status | Resolution |
| --- | -------------------------------------------------------------- | ------ | ---------- |
| 1   | remix-i18next `findLocale` args carry `url`                    | open   |            |
| 2   | `Route.ErrorBoundaryProps.loaderData` for the layout boundary  | open   |            |
| 3   | Font `?url` hash parity; Manrope weight axis                   | open   |            |
| 4   | `/en/` trailing slash matches the index route                  | open   |            |
| 5   | Node 24 type stripping for the mock API                        | open   |            |
| 6   | Forced-colors SVG fill for rating stars                        | open   |            |
| 7   | Unit-testing loaders with a hand-built `RouterContextProvider` | open   |            |
| 8   | `accessibility-checker` env variables and API                  | open   |            |
