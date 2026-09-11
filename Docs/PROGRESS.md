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

- **Current branch**: `main` (bootstrap)
- **Current step**: bootstrap — tracker committed on `main`; `development` to be created from `main`
- **Next action**: create `development`, push it, then branch `feature/project-scaffold` and run
  `npx create-react-router@latest` per plan §4 branch 1
- **Open questions for the user**: none

## Feature branches (plan §4)

| # | Branch | Status | Started | Merged | PR | Notes |
|---|---|---|---|---|---|---|
| 0 | bootstrap (`development` from `main`) | in-progress | 2026-09-11 | — | — | tracker added on `main` |
| 1 | `feature/project-scaffold` | todo | | | | |
| 2 | `feature/tooling` | todo | | | | |
| 3 | `feature/design-system` | todo | | | | |
| 4 | `feature/i18n-foundation` | todo | | | | |
| 5 | `feature/app-shell` | todo | | | | |
| 6 | `feature/dummyjson-client` | todo | | | | |
| 7 | `feature/catalogue` | todo | | | | |
| 8 | `feature/search` | todo | | | | |
| 9 | `feature/product-detail` | todo | | | | |
| 10 | `feature/cart-session` | todo | | | | |
| 11 | `feature/cart-page` | todo | | | | |
| 12 | `feature/a11y-audit` | todo | | | | |
| 13 | `feature/performance` | todo | | | | |
| 14 | `feature/docs-release` | todo | | | | |

## "Done when" checklists (plan §4)

Tick a box only once the criterion has been verified locally (command output seen), not assumed.

### 1 · `feature/project-scaffold`
- [ ] `npx create-react-router@latest` scaffold, `~` alias, dotfiles, `.env.example`, `Docs/` skeleton, README skeleton, `.gitignore`
- [ ] `npm run dev` serves
- [ ] `npm run typecheck` passes

### 2 · `feature/tooling`
- [ ] ESLint 9 (+jsx-a11y, +i18next), Prettier, Vitest, Playwright + `accessibility-checker` skeleton, `scripts/check-licenses.mjs`, Husky, lint-staged, commitlint, CI, PR template, `CONTRIBUTING.md`, smoke tests
- [ ] `npm run check` + `npm run test:e2e` green locally and on a PR
- [ ] a bad commit message is rejected
- [ ] `check:licenses` passes on the full tree and fails on a deliberately added MPL/GPL package (shown in PR, then reverted)

### 3 · `feature/design-system`
- [ ] styles, font + OFL, `ui/*` with tests, `cx`, `Icon` (Remix Icon paths + attribution), `DESIGN_SYSTEM.md`
- [ ] every `ui/*` has a role/name test
- [ ] contrast table reproduced with a tool
- [ ] font appears once in `build/client/assets`

### 4 · `feature/i18n-foundation`
- [ ] `i18n/*`, `locales/*` (common), middleware, entries, `routes.ts` skeleton, `locale-errors`, `set-language`, `I18N.md`
- [ ] `/` → `/pt` with `Accept-Language: pt`
- [ ] cookie set only by switcher
- [ ] `/xx/…` and `/EN/…` redirect
- [ ] deleting a PT key fails `tsc` (shown in PR)

### 5 · `feature/app-shell`
- [ ] skip link, header, footer, announcer, navigation status, headers middleware, error boundaries, coming-soon, hreflang, a11y/keyboard/i18n specs, `ACCESSIBILITY.md` v1
- [ ] a11y scan clean on `/en`, `/pt`, `/en/about`, `/en/nowhere`
- [ ] skip link → main; menu Escape restores focus; open menu → About → focus on main

### 6 · `feature/dummyjson-client`
- [ ] client, types, guards, cache (TTL + in-flight dedupe), product functions, `lib/catalogue`, `format.server`, fixtures, mock API — against `Docs/dummyjson-openapi.yaml`
- [ ] unit: URL mapping, 404 → null, 429/timeout/HTML body → 502, guard → 502, dedupe
- [ ] mock API serves all fixtures + faults and mirrors the contract behaviours

### 7 · `feature/catalogue`
- [ ] catalogue route + components
- [ ] e2e: 9 cards; "Showing 1–9 of 194"; sort changes first title; category total; page 22 ok, 23 → 404; `?category=foo` → 302; no-JS Apply works; focus on results heading after page change

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

| # | Item | Branch | Status | Resolution |
|---|---|---|---|---|
| 1 | remix-i18next 8 `findLocale` args carry `url` | 4 | open | |
| 2 | `Route.ErrorBoundaryProps.loaderData` populated for the layout boundary | 5 | open | |
| 3 | Font `?url` import hash parity with CSS `url()`; Manrope weight axis | 3 | open | |
| 4 | `/en/` (trailing slash) matches the `:lang` index route | 4 | open | |
| 5 | Node 24 type stripping runs `tests/e2e/mock-api.server.ts` directly | 6 | open | |
| 6 | Forced-colors SVG `fill="currentColor"` for rating stars per browser | 12 | open | |
| 7 | Unit-testing loaders with a hand-built `RouterContextProvider` | 2/6 | open | |
| 8 | `accessibility-checker`: Puppeteer skip / telemetry env names, `.achecker.yml` `outputFolder`, `getCompliance` with a Playwright `Page`, `assertCompliance` codes | 2 | open | |

## Deviations from the plan

None yet. Record any deliberate deviation here with its reason and the matching `DECISIONS.md` entry.

## Open questions

None.

## Session log

| Date | Session summary |
|---|---|
| 2026-09-11 | Plan read in full; tracker created; tracking rule saved in project memory; bootstrap started (`development` from `main`). |
