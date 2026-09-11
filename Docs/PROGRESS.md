# Progress tracker

> Single resume point for the implementation of `Docs/PROJECT_PLAN.md`. Read this file first when
> resuming work in a new session; keep it accurate at every milestone (see "Tracking rule").
> Dates are ISO (YYYY-MM-DD). Status values: `todo` · `in-progress` · `pr-open` · `merged` · `blocked`.

## Tracking rule

1. **Read first**: at the start of every session, read this file, then `git branch --show-current`
   and `git status`, before touching code.
2. **Update at every milestone**: branch created, "done when" criterion met, PR opened, PR merged,
   blocker hit or lifted, TO VERIFY item resolved, decision recorded in `Docs/DECISIONS.md`.
3. **Commit it with the work**: the tracker travels in the same commit/PR as the change it
   describes (scope `docs` when committed alone), so `development` always carries the latest state.
4. **"Resume here" is authoritative**: it names the current branch, the exact next action and any
   open question for the user. Never leave it stale at the end of a session.
5. **Never re-ask** the 31 decisions in `PROJECT_PLAN.md` §2; log new questions under "Open questions".

## Resume here

- **Current branch**: `feature/catalogue` (PR open → `development`)
- **Current step**: branch 7 complete; local criteria verified; waiting for CI, then squash-merge
- **Next action**: after merge, branch `feature/search` (plan §4 branch 8): `search.tsx` loader
  (`q` empty → no fetch; else `searchProducts`), search form (`role="search"`, visible label,
  `handle.initialFocus`), reuse `CatalogueResults` (heading "Search", no aside, empty state "No
  results for “q”" + English hint), `catalogue.search.announce`, e2e ("phone" paginated, empty q
  focuses input, no-result state)
- **Open questions for the user**: none

## Feature branches (plan §4)

| #   | Branch                                | Status  | Started    | Merged     | PR                                                     | Notes                                                         |
| --- | ------------------------------------- | ------- | ---------- | ---------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| 0   | bootstrap (`development` from `main`) | merged  | 2026-09-11 | 2026-09-11 | —                                                      | tracker added on `main`; `development` pushed                 |
| 1   | `feature/project-scaffold`            | merged  | 2026-09-11 | 2026-09-11 | [#1](https://github.com/Garedyy/ltp-lab-store-/pull/1) | dev + typecheck verified                                      |
| 2   | `feature/tooling`                     | merged  | 2026-09-11 | 2026-09-11 | [#2](https://github.com/Garedyy/ltp-lab-store-/pull/2) | all local criteria verified; D-1 amended (axe-core), D-2, D-3 |
| 3   | `feature/design-system`               | merged  | 2026-09-11 | 2026-09-11 | [#3](https://github.com/Garedyy/ltp-lab-store-/pull/3) | D-4 (Remix Icon v4.8.0), TO VERIFY 3 resolved                 |
| 4   | `feature/i18n-foundation`             | merged  | 2026-09-11 | 2026-09-11 | [#4](https://github.com/Garedyy/ltp-lab-store-/pull/4) | TO VERIFY 1 + 4 resolved; D-3 addendum                        |
| 5   | `feature/app-shell`                   | merged  | 2026-09-11 | 2026-09-11 | [#5](https://github.com/Garedyy/ltp-lab-store-/pull/5) | TO VERIFY 2 resolved; D-3 addendum, D-5                       |
| 6   | `feature/dummyjson-client`            | merged  | 2026-09-11 | 2026-09-11 | [#6](https://github.com/Garedyy/ltp-lab-store-/pull/6) | TO VERIFY 5 resolved                                          |
| 7   | `feature/catalogue`                   | pr-open | 2026-09-11 |            | #TBD                                                   | D-6                                                           |
| 8   | `feature/search`                      | todo    |            |            |                                                        |                                                               |
| 9   | `feature/product-detail`              | todo    |            |            |                                                        |                                                               |
| 10  | `feature/cart-session`                | todo    |            |            |                                                        |                                                               |
| 11  | `feature/cart-page`                   | todo    |            |            |                                                        |                                                               |
| 12  | `feature/a11y-audit`                  | todo    |            |            |                                                        |                                                               |
| 13  | `feature/performance`                 | todo    |            |            |                                                        |                                                               |
| 14  | `feature/docs-release`                | todo    |            |            |                                                        |                                                               |

## "Done when" checklists (plan §4)

Tick a box only once the criterion has been verified locally (command output seen), not assumed.

### 1 · `feature/project-scaffold`

- [x] `npx create-react-router@latest` scaffold, `~` alias, dotfiles, `.env.example`, `Docs/` skeleton, README skeleton, `.gitignore`
- [x] `npm run dev` serves (HTTP 200, `<html lang="en">`, 2026-09-11)
- [x] `npm run typecheck` passes (2026-09-11)

### 2 · `feature/tooling`

- [x] ESLint 9 (+jsx-a11y, +i18next), Prettier, Vitest, Playwright + `accessibility-checker` skeleton, `scripts/check-licenses.mjs`, Husky, lint-staged, commitlint, CI, PR template, `CONTRIBUTING.md`, smoke tests
- [x] `npm run check` + `npm run test:e2e` green locally and on PR #2 (CI quality 32 s + e2e 55 s, 2026-09-11)
- [x] a bad commit message is rejected (`commit-msg` hook refused "bad message without a type" and an unknown scope, 2026-09-11)
- [x] `check:licenses` passes on the full tree (612 packages, 4 exceptions) and fails with exit 1 on a deliberately installed `@axe-core/playwright` (MPL-2.0), then restored with `npm ci` (2026-09-11; shown in PR)

### 3 · `feature/design-system`

- [x] styles, font + OFL, `ui/*` with tests, `cx`, `Icon` (Remix Icon v4.8.0 paths + attribution), `DESIGN_SYSTEM.md`
- [x] every `ui/*` has a role/name test (12 primitives, 23 assertions, 2026-09-11)
- [x] contrast table reproduced with a tool (`app/styles/contrast.test.ts`, 15 checks computed from `tokens.css`, 2026-09-11)
- [x] font appears once in `build/client/assets` (`manrope-latin-C46ZzDBF.woff2`, same hash in CSS `url()` and preload, 2026-09-11)

### 4 · `feature/i18n-foundation`

- [x] `i18n/*`, `locales/*` (all six domain files, minimal keys), middleware, entries, `routes.ts` skeleton, `locale-layout` (minimal shell), `locale-errors`, `set-language`, `LanguageSwitcher`, `I18N.md`
- [x] `/` → `/pt` with `Accept-Language: pt` (`i18n.spec.ts`, 2026-09-11)
- [x] cookie set only by switcher (`i18n.spec.ts` + `no-js.spec.ts`, 2026-09-11)
- [x] `/xx/…` and `/EN/…` redirect (302 prefixing / 301 lower-case, `i18n.spec.ts`, 2026-09-11)
- [x] deleting a PT key fails `tsc` (removed `errors.serviceUnavailable.retry` → `TS2741 Property 'retry' is missing`, restored; shown in PR, 2026-09-11)

### 5 · `feature/app-shell`

- [x] skip link, header, footer, announcer, navigation status, headers middleware, error boundaries, coming-soon, hreflang, a11y/keyboard/i18n specs, `ACCESSIBILITY.md` v1
- [x] a11y scan clean on `/en`, `/pt`, `/en/about`, `/en/nowhere` (and every route × locale on desktop + mobile, plus the open mobile menu — `a11y.spec.ts`, 2026-09-11)
- [x] skip link → main; menu Escape restores focus; open menu → About → focus on main (`keyboard.spec.ts`, 76 e2e green, 2026-09-11)

### 6 · `feature/dummyjson-client`

- [x] client, types, guards, cache (TTL + in-flight dedupe), product functions, `lib/catalogue`, `format.server` (branch 4), fixtures, mock API — against `Docs/dummyjson-openapi.yaml`
- [x] unit: URL mapping, 404 → null, 429/timeout/HTML body → 502, guard → 502, dedupe (`products.server.test.ts`, `cache.server.test.ts`, `guards.test.ts`; 92 unit tests, 2026-09-11)
- [x] mock API serves all fixtures + faults and mirrors the contract behaviours (`mock-api.spec.ts`; 82 e2e green, 2026-09-11)

### 7 · `feature/catalogue`

- [x] catalogue route + components (`CatalogueResults`, `SortForm`, `ResultsSummary`, `CategoryFilter`, `ProductCard`, `ProductGrid`, `Pagination`, `EmptyState`) + product placeholder route
- [x] e2e: 9 cards; "Showing 1–9 of 194"; sort changes first title; category total; page 22 ok, 23 → 404; `?category=foo` → 302; no-JS Apply works; focus on results heading after page change (`catalogue.spec.ts`, `no-js.spec.ts`; 124 e2e green, 2026-09-11)

### 8 · `feature/search`

- [ ] search route, header link
- [ ] e2e: "phone" paginated; empty q focuses input; no-result state

### 9 · `feature/product-detail`

- [ ] product route (no add button yet — stated in PR)
- [ ] e2e: thumbnail switch without `.data` request; stock-0 product shows disabled button + text; id 9999 → 404 in shell

### 10 · `feature/cart-session`

- [ ] session, `cart.ts`, `totals.ts`, `intents.ts`, `add` action, `AddToCartForm`, header count
- [ ] no-JS: add twice → badge 2, refresh does not re-add
- [ ] tampered cookie → empty cart, no 500
- [ ] 50-line cookie < 4000 B; 51st line → `cart-full`

### 11 · `feature/cart-page`

- [ ] cart route, line items, stepper, remove, summary, promo, checkout, confirmation
- [ ] e2e: clamp at stock; remove → focus next line; `LTP10` reduces total; `FREESHIP` shows Free; checkout → confirmation → reload and language switch keep it

### 12 · `feature/a11y-audit`

- [ ] reflow/emulateMedia tests, a11y scan on all states, manual audit fixes and log
- [ ] reflow green on every route EN+PT; zero `accessibility-checker` violations across the matrix; VoiceOver log filled

### 13 · `feature/performance`

- [ ] preload, preconnect, image priorities, header check, bundle review, Lighthouse
- [ ] Lighthouse mobile ≥ 90 / a11y 100 recorded; catalogue JS < 90 KB gzipped recorded

### 14 · `feature/docs-release`

- [ ] README final (challenge checklist), `ARCHITECTURE.md`, `DECISIONS.md` (TO VERIFY resolved), `CHANGELOG.md`
- [ ] checklist complete; every TO VERIFY resolved; tag `v1.0.0` pushed

## TO VERIFY register (plan §8 → `Docs/DECISIONS.md`)

| #   | Item                                                                                                                                                              | Branch | Status | Resolution |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | ---------- |
| 1   | remix-i18next 8 `findLocale` args carry `url`                                                                                                                     | 4      | open   |            |
| 2   | `Route.ErrorBoundaryProps.loaderData` populated for the layout boundary                                                                                           | 5      | open   |            |
| 3   | Font `?url` import hash parity with CSS `url()`; Manrope weight axis                                                                                              | 3      | open   |            |
| 4   | `/en/` (trailing slash) matches the `:lang` index route                                                                                                           | 4      | open   |            |
| 5   | Node 24 type stripping runs `tests/e2e/mock-api.server.ts` directly                                                                                               | 6      | open   |            |
| 6   | Forced-colors SVG `fill="currentColor"` for rating stars per browser                                                                                              | 12     | open   |            |
| 7   | Unit-testing loaders with a hand-built `RouterContextProvider`                                                                                                    | 2/6    | open   |            |
| 8   | `accessibility-checker`: Puppeteer skip / telemetry env names, `.achecker.yml` `outputFolder`, `getCompliance` with a Playwright `Page`, `assertCompliance` codes | 2      | open   |            |

## Deviations from the plan

| Date       | Deviation                                                                                                                   | Reason                                                                                           | Record             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------ |
| 2026-09-11 | Decision 30 amended: named exceptions `lightningcss` (MPL-2.0) and `caniuse-lite` (CC-BY-4.0) in `check-licenses.mjs`       | unavoidable build-time transitive deps of Vite 8 / Tailwind 4 / Babel                            | `DECISIONS.md` D-1 |
| 2026-09-11 | `axe-core` (MPL-2.0) added to the D-1 exceptions                                                                            | dependency of `eslint-plugin-jsx-a11y` (decision 12), lint-time only; user approved              | `DECISIONS.md` D-1 |
| 2026-09-11 | `MIT-0`, `BlueOak-1.0.0`, `Python-2.0` added to the licence allow-list                                                      | permissive OSI licences present in the dev tree, absent from the plan's list                     | `DECISIONS.md` D-2 |
| 2026-09-11 | a11y scan assertion re-implemented with a `MANUAL_REVIEW_RULES` filter (`style_color_misuse`) instead of `assertCompliance` | the engine flags every coloured stylesheet at `potentialviolation`; no per-rule exclusion exists | `DECISIONS.md` D-3 |
| 2026-09-11 | commitlint `scope-enum` gains `release`                                                                                     | the plan's release commit is `chore(release): vX.Y.Z`                                            | —                  |
| 2026-09-11 | Mock API webServer entry deferred to branch 6 (Playwright config lists the app only for now)                                | mock API does not exist yet                                                                      | —                  |

## Working agreements (added during implementation)

- **PR merges**: Claude squash-merges each feature PR into `development` itself once the "done
  when" criteria, `npm run check` and e2e are verified green (user decision 2026-09-11), then
  proceeds to the next branch; the user reviews a posteriori.

## Open questions

- ~~Q1~~ **resolved 2026-09-11 → D-1 (named exceptions)**. Original question: the licence audit of the scaffold tree (175 packages) finds
  `lightningcss` **MPL-2.0** (hard dependency of both `vite@8` and `@tailwindcss/node@4`) and
  `caniuse-lite` **CC-BY-4.0** (via `@react-router/dev` → Babel → browserslist). Both are
  build-time-only, unmodified, and never ship in the app bundle, but decision 30 bans MPL outright
  and the plan's stack audit missed them. React Router v8 requires Vite 7/8, so they cannot be
  avoided with the approved stack. Proposed: amend decision 30 with a named-exception list for
  unmodified build-time-only transitive packages (`lightningcss`, `caniuse-lite`), recorded in
  `DECISIONS.md`, enforced by `check-licenses.mjs` (exceptions must be listed with a reason) and
  credited in the README.

## Session log

| Date       | Session summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-11 | Plan read in full; tracker created; tracking rule saved in project memory; bootstrap done (`development` from `main`); branch 1 scaffolded, verified, PR #1 opened and squash-merged; licence issue Q1 raised and resolved (D-1); merge policy agreed (Claude merges after green checks). Branch 2 (tooling) built and verified locally: ESLint/Prettier/Vitest/Playwright/IBM checker/licence script/Husky/commitlint/CI; axe-core exception approved; TO VERIFY 8 resolved; PR #2 merged. Branch 3 (design-system): tokens, Manrope, 12 `ui/*` primitives + tests, contrast test, Remix Icon v4.8.0 (D-4), TO VERIFY 3 resolved; PR #3 merged. Branch 4 (i18n-foundation): config, typed EN/PT resources, detection, paths, formatting, middleware, entries, routes skeleton, locale layouts, set-language, switcher, 43 e2e green, TO VERIFY 1 + 4 resolved; PR #4 merged. Branch 5 (app-shell): header/nav/actions/footer/announcer/route announcer/navigation status, coming-soon pages, keyboard + a11y specs (76 e2e), ACCESSIBILITY.md v1, TO VERIFY 2 resolved, D-5; PR #5 merged. Branch 6 (dummyjson-client): types, guards, client, cache, product functions, catalogue helpers, fixtures, mock API + contract spec, TO VERIFY 5 resolved; PR #6 merged. Branch 7 (catalogue): route, eight components, catalogue/no-JS specs, D-6; PR opened. |
