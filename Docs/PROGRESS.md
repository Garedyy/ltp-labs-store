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

- **Current branch**: `development`, ahead of `main` = `v1.0.0` (released 2026-09-11) by the
  unreleased fixes #16 (#15 minus button), #21 (#20 plurals), #22 (#19 announce + targets),
  #23 (#18 cart focus / header count / `noJs`), the documentation sync #17, the Claude Code
  tooling (`issue`, `fix-issue`, `commit-push`, `pull-request`, `merge-pr`, `project-review`
  skills and reviewer agents), the footer fix for #26 (`fix/26-footer-bottom-short-pages`), the
  gallery cap for #27 (`fix/27-cap-gallery-image`, PR #33), the sort on selection for #25
  (`fix/25-sort-on-selection`, PR #34, D-11) and the Buy now button for #28
  (`fix/28-buy-now-button`, in progress).
- **Current step**: plan fully executed (14 feature PRs, release `v1.0.0`); post-release fixes
  from the 2026-09-12 project review merged into `development`.
- **Next action**: release the fixes — `development → main` merge commit `chore(release): v1.0.1`,
  tag `v1.0.1`, move the `[Unreleased]` changelog entries under `[1.0.1]` — when the user decides
  to; until then `development` holds. Human-only follow-ups unchanged: VoiceOver + Safari run on
  the three challenge pages and the Chrome vision-deficiency check, recorded in
  `Docs/ACCESSIBILITY.md` (audit log). Any further work starts as `feature/<slug>` or
  `fix/<N>-<slug>` from `development` (hotfixes `fix/<slug>` from `main`) and updates this file.
- **Open questions for the user**: release `v1.0.1` now or hold?

## Feature branches (plan §4)

| #   | Branch                                | Status | Started    | Merged     | PR                                                       | Notes                                                         |
| --- | ------------------------------------- | ------ | ---------- | ---------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| 0   | bootstrap (`development` from `main`) | merged | 2026-09-11 | 2026-09-11 | —                                                        | tracker added on `main`; `development` pushed                 |
| 1   | `feature/project-scaffold`            | merged | 2026-09-11 | 2026-09-11 | [#1](https://github.com/Garedyy/ltp-lab-store-/pull/1)   | dev + typecheck verified                                      |
| 2   | `feature/tooling`                     | merged | 2026-09-11 | 2026-09-11 | [#2](https://github.com/Garedyy/ltp-lab-store-/pull/2)   | all local criteria verified; D-1 amended (axe-core), D-2, D-3 |
| 3   | `feature/design-system`               | merged | 2026-09-11 | 2026-09-11 | [#3](https://github.com/Garedyy/ltp-lab-store-/pull/3)   | D-4 (Remix Icon v4.8.0), TO VERIFY 3 resolved                 |
| 4   | `feature/i18n-foundation`             | merged | 2026-09-11 | 2026-09-11 | [#4](https://github.com/Garedyy/ltp-lab-store-/pull/4)   | TO VERIFY 1 + 4 resolved; D-3 addendum                        |
| 5   | `feature/app-shell`                   | merged | 2026-09-11 | 2026-09-11 | [#5](https://github.com/Garedyy/ltp-lab-store-/pull/5)   | TO VERIFY 2 resolved; D-3 addendum, D-5                       |
| 6   | `feature/dummyjson-client`            | merged | 2026-09-11 | 2026-09-11 | [#6](https://github.com/Garedyy/ltp-lab-store-/pull/6)   | TO VERIFY 5 resolved                                          |
| 7   | `feature/catalogue`                   | merged | 2026-09-11 | 2026-09-11 | [#7](https://github.com/Garedyy/ltp-lab-store-/pull/7)   | D-6                                                           |
| 8   | `feature/search`                      | merged | 2026-09-11 | 2026-09-11 | [#8](https://github.com/Garedyy/ltp-lab-store-/pull/8)   |                                                               |
| 9   | `feature/product-detail`              | merged | 2026-09-11 | 2026-09-11 | [#9](https://github.com/Garedyy/ltp-lab-store-/pull/9)   | D-7; Add-to-cart button present, action in branch 10          |
| 10  | `feature/cart-session`                | merged | 2026-09-11 | 2026-09-11 | [#10](https://github.com/Garedyy/ltp-lab-store-/pull/10) |                                                               |
| 11  | `feature/cart-page`                   | merged | 2026-09-11 | 2026-09-11 | [#11](https://github.com/Garedyy/ltp-lab-store-/pull/11) | D-8                                                           |
| 12  | `feature/a11y-audit`                  | merged | 2026-09-11 | 2026-09-11 | [#12](https://github.com/Garedyy/ltp-lab-store-/pull/12) | TO VERIFY 6, 7 resolved                                       |
| 13  | `feature/performance`                 | merged | 2026-09-11 | 2026-09-11 | [#13](https://github.com/Garedyy/ltp-lab-store-/pull/13) | D-9 (budget superseded by measurements)                       |
| 14  | `feature/docs-release`                | merged | 2026-09-11 | 2026-09-11 | [#14](https://github.com/Garedyy/ltp-lab-store-/pull/14) |                                                               |

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

- [x] search route, header link (`SearchForm`, `CatalogueResults` reuse, `handle.initialFocus`)
- [x] e2e: "phone" paginated; empty q focuses input; no-result state (`search.spec.ts`, no-JS search; 143 e2e green, 2026-09-11)

### 9 · `feature/product-detail`

- [x] product route (`ProductGallery`, `StockStatus`, `AddToCartForm` markup without its action — stated in PR, `ProductInfoList`, `ReviewList`, `Price`/`DiscountBadge`/`Rating`)
- [x] e2e: thumbnail switch without `.data` request; stock-0 product shows disabled button + text; id 9999 → 404 in shell (`product.spec.ts`; 163 e2e green, 2026-09-11)

### 10 · `feature/cart-session`

- [x] session, `cart.ts`, `totals.ts`, `promo-codes.ts`, `intents.ts`, `load-cart.server.ts`, `add` action, `AddToCartForm` (fetcher + no-JS PRG), header count from the cookie
- [x] no-JS: add twice → badge 2, refresh does not re-add (`no-js.spec.ts`, 2026-09-11)
- [x] tampered cookie → empty cart, no 500 (`cart-session.spec.ts` + `session.server.test.ts`)
- [x] 50-line cookie < 4000 B (`session.server.test.ts`); 51st line → `cart-full` (`cart.test.ts` — the mock API only carries ten full products, so the e2e path cannot build 51 lines; unit-covered)

### 11 · `feature/cart-page`

- [x] cart route, line items, stepper, remove, summary, promo, checkout, confirmation
- [x] e2e: clamp at stock; remove → focus next line; `LTP10` reduces total; `FREESHIP` shows Free; checkout → confirmation → reload and language switch keep it (`cart.spec.ts` + no-JS cart flow; 205 e2e green, 2026-09-11)

### 12 · `feature/a11y-audit`

- [x] reflow/emulateMedia tests, a11y scan on all states, automated-audit fixes and log
- [x] reflow green on every route EN+PT (`reflow.spec.ts`); zero `accessibility-checker` violations across the matrix (`a11y.spec.ts` + `a11y-states.spec.ts`, 283 e2e green, 2026-09-11); [ ] VoiceOver log — **requires a person**: logged as not run in `ACCESSIBILITY.md`; `v1.0.0` shipped without it, still due

### 13 · `feature/performance`

- [x] preload (font, branch 3), preconnect (CDN), image priorities (branch 7/9), header check (`Cache-Control: private, no-cache`, immutable assets, gzip — verified with curl), bundle review (per-locale chunks), Lighthouse
- [x] Lighthouse mobile 94 / a11y 100 recorded in the README (2026-09-11); catalogue JS recorded: **≈ 138 KB gzipped, above the plan's 90 KB** — the framework floor; documented as D-9, not hidden

### 14 · `feature/docs-release`

- [x] README final (challenge checklist, repository map, limitations), `ARCHITECTURE.md` (PE matrix, conventions, add-a-page recipe), `DECISIONS.md` (TO VERIFY table rewritten — the earlier per-row edits had silently missed the Prettier-aligned table), `CHANGELOG.md` `[1.0.0]`
- [x] checklist complete; every TO VERIFY resolved (8/8); [x] tag `v1.0.0` pushed (2026-09-11)

## TO VERIFY register (plan §8 → `Docs/DECISIONS.md`)

All eight resolved; the full resolutions are in the `DECISIONS.md` "TO VERIFY resolutions" table.

| #   | Item                                                                                                                                                              | Branch | Status                          | Resolution                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | remix-i18next 8 `findLocale` args carry `url`                                                                                                                     | 4      | resolved (2026-09-11)           | yes — middleware args forwarded, `url` normalised (`DECISIONS.md` row 1)            |
| 2   | `Route.ErrorBoundaryProps.loaderData` populated for the layout boundary                                                                                           | 5      | resolved (2026-09-11)           | optional; `loaderData?.cartCount ?? 0` (`DECISIONS.md` row 2)                       |
| 3   | Font `?url` import hash parity with CSS `url()`; Manrope weight axis                                                                                              | 3      | resolved (2026-09-11)           | same hash, true variable font (`DECISIONS.md` row 3)                                |
| 4   | `/en/` (trailing slash) matches the `:lang` index route                                                                                                           | 4      | resolved (2026-09-11)           | 200, no redirect needed (`DECISIONS.md` row 4)                                      |
| 5   | Node 24 type stripping runs `tests/e2e/mock-api.server.ts` directly                                                                                               | 6      | resolved (2026-09-11)           | yes, no `.mjs` fallback (`DECISIONS.md` row 5)                                      |
| 6   | Forced-colors SVG `fill="currentColor"` for rating stars per browser                                                                                              | 12     | resolved (2026-09-11)           | stars alike under `CanvasText`; number + label carry it (`DECISIONS.md` row 6)      |
| 7   | Unit-testing loaders with a hand-built `RouterContextProvider`                                                                                                    | 2/6    | resolved (2026-09-11, e2e only) | not done; loaders/actions covered by Playwright (`DECISIONS.md` row 7)              |
| 8   | `accessibility-checker`: Puppeteer skip / telemetry env names, `.achecker.yml` `outputFolder`, `getCompliance` with a Playwright `Page`, `assertCompliance` codes | 2      | resolved (2026-09-11)           | env names, config keys and API confirmed; wrapper filter D-3 (`DECISIONS.md` row 8) |

## Deviations from the plan

| Date       | Deviation                                                                                                                             | Reason                                                                                           | Record                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------- |
| 2026-09-11 | Decision 30 amended: named exceptions `lightningcss` (MPL-2.0) and `caniuse-lite` (CC-BY-4.0) in `check-licenses.mjs`                 | unavoidable build-time transitive deps of Vite 8 / Tailwind 4 / Babel                            | `DECISIONS.md` D-1          |
| 2026-09-11 | `axe-core` (MPL-2.0) added to the D-1 exceptions                                                                                      | dependency of `eslint-plugin-jsx-a11y` (decision 12), lint-time only; user approved              | `DECISIONS.md` D-1          |
| 2026-09-11 | `MIT-0`, `BlueOak-1.0.0`, `Python-2.0` added to the licence allow-list                                                                | permissive OSI licences present in the dev tree, absent from the plan's list                     | `DECISIONS.md` D-2          |
| 2026-09-11 | a11y scan assertion re-implemented with a `MANUAL_REVIEW_RULES` filter (`style_color_misuse`) instead of `assertCompliance`           | the engine flags every coloured stylesheet at `potentialviolation`; no per-rule exclusion exists | `DECISIONS.md` D-3          |
| 2026-09-11 | commitlint `scope-enum` gains `release`                                                                                               | the plan's release commit is `chore(release): vX.Y.Z`                                            | `DECISIONS.md` D-10         |
| 2026-09-11 | No attribution trailer on commits and PRs (the plan asked for the session's trailer)                                                  | user's global instruction: commits and PRs are authored by the user only                         | `DECISIONS.md` D-10         |
| 2026-09-11 | Mock API webServer entry deferred to branch 6 (Playwright config listed the app alone until then)                                     | mock API did not exist before branch 6; both servers are listed since                            | —                           |
| 2026-09-12 | Cart stepper buttons submit `setQuantity` instead of sharing the input's `quantity` name (#15)                                        | browsers serialise the submitter at its DOM position, so the minus button never won              | `DECISIONS.md` D-8 addendum |
| 2026-09-13 | Sort applies on selection, Apply button `sr-only` until focused with JS (#25); supersedes decision 16 and the plan's "no auto-submit" | one click instead of two; SC 3.2.2 kept through a visible hint linked with `aria-describedby`    | `DECISIONS.md` D-11         |

## Working agreements (added during implementation)

- **PR merges**: Claude squash-merges each feature PR into `development` itself once the "done
  when" criteria, `npm run check` and e2e are verified green (user decision 2026-09-11), then
  proceeds to the next branch; the user reviews a posteriori.

## Incidents

| Date       | What happened                                                                                                                                                         | Consequence                                       | Fix                                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-11 | PR #11 was squash-merged although its e2e CI job had failed (`cart.spec.ts` "invalid quantity" flaky on mobile/pt): the merge command ran without checking the result | `development` carried a flaky test for one branch | root cause fixed in branch 12 (quantity submitted on blur instead of every keystroke; no remount on invalid values); the merge step now waits for and reads the check result before merging |

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

| Date       | Session summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-09-11 | Plan read in full; tracker created; tracking rule saved in project memory; bootstrap done (`development` from `main`); branch 1 scaffolded, verified, PR #1 opened and squash-merged; licence issue Q1 raised and resolved (D-1); merge policy agreed (Claude merges after green checks). Branch 2 (tooling) built and verified locally: ESLint/Prettier/Vitest/Playwright/IBM checker/licence script/Husky/commitlint/CI; axe-core exception approved; TO VERIFY 8 resolved; PR #2 merged. Branch 3 (design-system): tokens, Manrope, 12 `ui/*` primitives + tests, contrast test, Remix Icon v4.8.0 (D-4), TO VERIFY 3 resolved; PR #3 merged. Branch 4 (i18n-foundation): config, typed EN/PT resources, detection, paths, formatting, middleware, entries, routes skeleton, locale layouts, set-language, switcher, 43 e2e green, TO VERIFY 1 + 4 resolved; PR #4 merged. Branch 5 (app-shell): header/nav/actions/footer/announcer/route announcer/navigation status, coming-soon pages, keyboard + a11y specs (76 e2e), ACCESSIBILITY.md v1, TO VERIFY 2 resolved, D-5; PR #5 merged. Branch 6 (dummyjson-client): types, guards, client, cache, product functions, catalogue helpers, fixtures, mock API + contract spec, TO VERIFY 5 resolved; PR #6 merged. Branch 7 (catalogue) PR #7 merged. Branch 8 (search) PR #8 merged. Branch 9 (product-detail) PR #9 merged. Branch 10 (cart-session) PR #10 merged. Branch 11 (cart-page) PR #11 merged (incident: e2e was red — fixed in 12). Branch 12 (a11y-audit) PR #12 merged after a CI fix (brand wrapping on Linux fonts). Branch 13 (performance) PR #13 merged. Branch 14 (docs-release) PR #14 merged. Release: `development → main` merge commit, tag `v1.0.0`. Plan complete; VoiceOver + vision-deficiency checks left to a person.                                                                                                                                                                                                                                                                         |
| 2026-09-12 | Issue #15 (cart minus button inert): root cause = shared `quantity` name between the stepper buttons and the text input while the browser serialises the submitter at its DOM position; fix on `fix/cart-minus-button` (buttons submit `setQuantity`, parser prefers it), unit + e2e regression tests (JS and no-JS), PR #16 merged into `development` (D-8 addendum). Issue #20 (search results title "1 results"): `catalogue.search.resultsTitle` split into `_zero/_one/_many/_other` in EN and PT (the `_zero` form also covers the `pt` CLDR rule that puts 0 in `one`), locales test now requires a plural suffix on every `count` key, e2e title assertions for one and zero hits, fix on `fix/search-results-title-plurals`, PR #21 merged into `development`. Issue #19 (first search never announced, targets under 44 px): `CatalogueResults` accepts a null view and stays mounted so the prompt ↔ results transitions announce; `Button size="sm"`, the footer links and the header brand raised to 44 px; unit test on the announcements, `targets.spec.ts` measuring the shell controls; fix on `fix/19-search-announce-and-targets`, PR #22 merged into `development`. Issue #18 (cart focus after Enter and Apply, stale header badge, checkout without `noJs`): stepper input no longer keyed on the in-flight value (effect writes the shown value back), "Remove code" focused after Apply, `SiteHeader` prefers `useRouteLoaderData("routes/cart")`, checkout form gains the `noJs` input, the page reads `actionData`, `shouldRevalidate` reloads the cart after the 400 and a focused `empty-cart` alert renders in both states; plus `URL.canParse` in `redirectBack`, guarded `request.formData()`, single totals derivation; unit tests (stepper, promo, header) + e2e (JS, no-JS, a11y state); fix on `fix/18-cart-focus-header-nojs`, PR #23 merged into `development`. Pre-existing flake noted: `a11y-states.spec.ts` "filled cart" sometimes sees the promo form unchanged after a successful Apply (reproduced on `development`, ~2/12 runs). |
| 2026-09-12 | Issue #17 (documentation out of date since `v1.0.0`): `CLAUDE.md` state and commands rewritten to the released state; TO VERIFY register set to resolved; "Resume here" now describes `development` ahead of `main` and names the `v1.0.1` release as the next action; D-8 addendum for the `setQuantity` contract, D-10 for the `release` scope and the no-attribution rule; `ACCESSIBILITY.md` announcements/focus table completed for catalogue, search, product and cart, manual-review table gains `input_label_visible` and the open language panel; `ARCHITECTURE.md` banner dropped, cart action names `setQuantity`; README scripts table completed and bundle figures re-measured; `CONTRIBUTING.md` documents the Claude Code skills and the fix-branch rule. Fix on `fix/17-docs-sync`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-09-12 | Issue #26 (footer short of the viewport bottom on short pages): `<body>` becomes a `min-h-svh` flex column and `<main>` gets `grow`, no wrapper element so the skip link stays first and the landmarks are unchanged; `tests/e2e/layout.spec.ts` measures the footer edge on four short routes and the catalogue; `DESIGN_SYSTEM.md` shell anatomy and `CHANGELOG.md` updated. Fix on `fix/26-footer-bottom-short-pages`. Also committed on `development`: the `/issue` skill (`chore(tooling)`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-09-13 | Issue #27 (product gallery image far too large): the image box takes the wireframe's 5:3 landscape ratio from `md` (`md:aspect-[5/3]`), as wide as its column with the square image centred inside, so its height stays under ~540 px on desktop; phones keep the square; `preload` / `fetchPriority` unchanged. A first attempt (figure capped at 60 svh and centred) was rejected in review of the rendering: the floating square broke the alignment with the header and the text column. `tests/e2e/product.spec.ts` measures the box at 1280 x 800 and 820 x 1180 and the square on a phone; `DESIGN_SYSTEM.md` (layout + deviations table), `PROJECT_PLAN.md` 3.8 and `CHANGELOG.md` updated. Fix on `fix/27-cap-gallery-image`, PR #33.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-09-13 | Issue #25 (sort applies only after the Apply button): `SortForm` navigates on change with `buildSearch` (`page` dropped, `preventScrollReset`), controlled select with an optimistic selection like `CategoryFilter`, visible `catalogue.sort.hint` linked with `aria-describedby` (SC 3.2.2), Apply kept as the submit and `sr-only` until focused with JavaScript; `sort-form.test.tsx` (navigation, focus, query kept, default order), `catalogue.spec.ts`, `search.spec.ts` and `targets.spec.ts` updated, `no-js.spec.ts` unchanged; D-11 recorded, `ACCESSIBILITY.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md` and `CHANGELOG.md` updated. Fix on `fix/25-sort-on-selection`, PR #34; its review found the optimistic choice stale after Back (kept in state, re-applied once the URL returned to its base), fixed by reading the pending navigation's URL instead; the same latent pattern in `CategoryFilter` is left for a separate issue.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-09-13 | Issue #28 (Buy now button): the product route's action accepts `add` and `buy-now` (`AddIntent` in `intents.ts`), same add logic and refusals; a successful `buy-now` is flashed as a cart notice (`added` / `added-capped`) and answers 303 to `/:lang/cart` with or without JavaScript (the fetcher follows the redirect); `AddToCartForm` renders both submit buttons named `intent` in a `sm:grid-cols-2` grid, tracks the pending intent from `fetcher.formData` and returns the focus to the pressed button after a refusal; `buyNow` / `buyingNow` strings in `en` and `pt`. E2E: `cart-session.spec.ts` (JS flow, capped flow, refused flow, 400 on sold-out/unknown), `no-js.spec.ts` (notice focused, no re-add on refresh), `product.spec.ts` (both buttons, PT names), `a11y-states.spec.ts` (cart reached through Buy now). `ARCHITECTURE.md`, `ACCESSIBILITY.md`, `DESIGN_SYSTEM.md`, `I18N.md` glossary and `CHANGELOG.md` updated; `isAddIntent` unit-tested after the PR review. Fix on `fix/28-buy-now-button`, PR #35.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
