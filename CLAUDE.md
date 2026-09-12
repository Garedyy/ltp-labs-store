# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state of the repository

The plan in `Docs/PROJECT_PLAN.md` is **fully executed**: `v1.0.0` was released on `main` on
2026-09-11 (14 feature PRs squash-merged into `development`, then one release merge commit,
tagged). `development` now carries unreleased fixes and tooling on top of it. **Read
`Docs/PROGRESS.md` first** in every session — its "Resume here" block names the current branch,
the next action and the open questions — then this file and the docs below. The plan remains the
specification the code must match (routes, data layer, i18n, a11y, tokens, tooling, git flow);
where implementation diverged, `Docs/DECISIONS.md` records why.

Sources, by authority:
- `Docs/PROJECT_PLAN.md` — the architecture and execution plan. §2 lists 31 decisions already taken
  with the user: **do not re-ask them**. §8 lists "TO VERIFY" items to resolve during implementation
  and record in `Docs/DECISIONS.md`.
- `Docs/dummyjson-openapi.yaml` — the API contract for DummyJSON. When the plan and the contract
  disagree, the contract wins.
- `Docs/goal.md` — the LTP Labs challenge brief (functional, i18n and a11y requirements).
- `Docs/Wireframe *.png` — the three Figma frames (desktop 1440 px references; every screen must be
  responsive down to 320 px).

## Working conventions (from the plan)

- Repository language is **English** for all files, commits and docs; the user converses in French.
- Never invent: when a fact is unverifiable, ask, or tag it **TO VERIFY** as the plan does.
- **Licence policy is strict**: every dependency (direct and transitive), font, icon and snippet must
  be permissive — MIT, ISC, BSD-2/3, Apache-2.0, Unlicense, 0BSD, CC0, OFL-1.1 (fonts). Never
  commercial, never copyleft (GPL, LGPL, AGPL, MPL, EPL, SSPL, CC-BY-SA…). Run
  `npm view <pkg> license` before adding anything; `scripts/check-licenses.mjs` enforces it in CI.
  This is why axe-core (MPL-2.0) was replaced by IBM `accessibility-checker` (Apache-2.0).
- **No new runtime dependency** beyond: react, react-dom, react-router, @react-router/node,
  @react-router/serve, i18next, react-i18next, remix-i18next, isbot. Dev deps are an approved list
  (plan §2 decision 18); anything else needs the user's approval. No zod (hand-written guards), no
  icon package (~12 Remix Icon paths inlined as SVG), no CSS beyond Tailwind v4.
- Code style: ultra-readable, minimal comments, TypeScript strict with `noUncheckedIndexedAccess`
  and `verbatimModuleSyntax`, `~/*` alias → `app/*`. No hard-coded UI strings in JSX
  (`eslint-plugin-i18next/no-literal-string`). Logical CSS properties only (`ps-`, `pe-`, `start`,
  `end`), never `outline-none` except on `main`, orange (`accent`) never used as text colour.

## Git workflow

`main` ← `development` ← `feature/<slug>`. `development` was created from `main` before branch 1;
every feature branches from `development`. One PR per feature, **squash-merged** into `development`
(PR title must be a Conventional Commit — it becomes the squash message); `development → main` via
merge commit per release, tagged. Issue fixes: `fix/<N>-<slug>` from `development` (the
`fix-issue` skill), same PR flow as a feature. Hotfixes `fix/<slug>` from `main`, merged into both.

Commits: Conventional Commits, English, imperative, ≤ 72-char subject, body says why. Scopes
(commitlint `scope-enum`, optional): `scaffold, tooling, ui, i18n, shell, api, catalogue, product,
cart, a11y, docs, ci, release`. No `Co-Authored-By` or tool attribution trailers (D-10).

The 14 feature branches, all merged (plan §4 has the "done when" criteria per branch):
`project-scaffold` → `tooling` → `design-system` → `i18n-foundation` → `app-shell` →
`dummyjson-client` → `catalogue` → `search` → `product-detail` → `cart-session` → `cart-page` →
`a11y-audit` → `performance` → `docs-release`.

## Commands

Node 24 / npm only (no pnpm/yarn/bun). `.env` is loaded by `react-router dev`/`build` but **not**
by `react-router-serve` — export `SESSION_SECRET` etc. explicitly for `npm start`, CI and Playwright.

```
npm run dev              # react-router dev server
npm run build && npm start
npm run typecheck        # react-router typegen && tsc
npm run lint / lint:fix
npm run format / format:check
npm run test             # Vitest (jsdom), app/**/*.test.{ts,tsx}
npm run test:watch
npx vitest run app/services/cart/totals.test.ts   # single unit test file
npm run test:e2e         # Playwright: boots mock API (:4010) + built app (:3000)
npm run test:e2e:ui
npx playwright test tests/e2e/cart.spec.ts --project=desktop-chromium   # single spec / project
npm run check:licenses   # scripts/check-licenses.mjs
npm run check            # typecheck && lint && format:check && check:licenses && test
```

Playwright has four Chromium projects: `desktop-chromium`, `mobile-chromium` (Pixel 7), `no-js`
(`javaScriptEnabled: false`, `testMatch: /no-js/`) and `pt` (`locale: pt-PT`). E2E never hits the
real DummyJSON: `tests/e2e/mock-api.server.ts` serves fixtures with fault injection
(`/products/999` → 500, `/products/998` → 10 s delay, `?fail=1` on categories → 500).
`tests/e2e/routes.ts` is the route list every feature PR must append to.

## Architecture (big picture)

**Stack**: React Router v8 framework mode (the Remix successor — the challenge says "Remix", Remix v2
is EOL; README must explain the lineage), SSR via `@react-router/node` + `@react-router/serve`,
Tailwind CSS v4 (`@tailwindcss/vite`), remix-i18next 8 + i18next 26 + react-i18next 17.

**Organising principle: the URL and the cookie are the state; the server owns the truth.**
- Catalogue sort/filter/page/search and the gallery image live in the URL (`?q`, `?category`,
  `?sort`, `?page`, `?image`; fixed param order; `page=1` never written; `page` dropped whenever
  `q`/`category`/`sort` change).
- The cart lives in a signed cookie session `__cart` (`{ cart: {productId, quantity}[], promoCode?,
  lastOrder? }`), sanitised on every read, capped at 50 lines / qty 1..99.
- Every page renders from loaders; every mutation is a native `<form method="post">` handled by a
  route action. JS is additive (fetchers, announcer, disclosures); every flow must work with JS
  disabled (Post/Redirect/Get with a flash `notice`, triggered by a `<noscript>` `noJs` hidden input).

**Routing** (`app/routes.ts`): `/` → 302 to detected locale; everything else under `prefix(":lang")`
→ `locale-layout.tsx` (middleware validates the locale *before* any loader: asset-like segments 404,
upper-case 301, unknown 302 to detected locale; loader supplies `cartCount`; renders the shell) →
pathless `locale-errors.tsx` (shared `ErrorBoundary` so leaf errors render inside the mounted shell)
→ leaves: catalogue (index), `search`, `products/:productId`, `cart`, `checkout/confirmation`,
`about|contact|blog|account` (translated "coming soon"), `*` (404). `set-language` is an action-only
resource route and the **only** writer of the `lng` cookie. Loaders/actions/middleware read `url`
from their args, never parse `request.url` (client navigations carry `.data` suffixes).

**Action ownership**: the product route owns `intent=add`; the cart route owns
`set-quantity | remove | apply-promo | remove-promo | checkout`. Quantities are always absolute (no
`+1`/`-1` intents) so rapid clicks are idempotent. Every action clears `lastOrder` and commits the
session. Error/notice codes are a single union in `app/lib/error-codes.ts` mapped to translation
keys with `Record<ErrorCode, ParseKeys>` so a missing translation is a compile error.

**Data layer** (`app/services/dummyjson/`, server-only): `fetchJson(path, params, guard)` with 8 s
timeout; 404 → `ApiError(404)`, anything else (429 rate limit, timeout, HTML body, guard failure) →
`ApiError(502)` rendered as "service unavailable". `cached(key, ttl, load)` is a module-scope Map
with in-flight de-duplication — mandatory because DummyJSON allows 100 req / 10 s per IP and SSR
shares that budget across all visitors. Pagination uses `PAGE_SIZE = 9`, never the echoed `limit`
(the API echoes the count returned). Guards follow the contract's `required: [id, title, price,
category]` — everything else is optional and defaulted (`brand` missing on 92 products, `stock: 0`
on 4). Money maths is integer cents (`app/services/cart/totals.ts`); shipping is a fixed $20,
promo codes are `LTP10` (−10 %) and `FREESHIP`.

**i18n**: locale = first path segment, detected by remix-i18next with `order: ["custom"]` only (no
`?lng=`, no cookie, no Accept-Language at that layer). `detectLocale(request)` (cookie →
Accept-Language → default) serves only `/` and unknown-prefix redirects. One i18next namespace
`translation` assembled from domain files (`common, catalogue, product, cart, pages, errors`);
every non-default locale file ends with `satisfies typeof import("~/locales/en/<file>").default`
so missing/extra keys fail `tsc`. Plurals need `_one`/`_other` **and** `_many` in every locale
(i18next has no `_many` → `_other` fallback). **`Intl` formatting happens in loaders only**
(`app/i18n/format.server.ts`) — components never call `Intl`, avoiding hydration mismatches;
loader data carries formatted strings next to numeric values. Client i18next takes `lng` from
`<html lang>` and is initialised **before** `hydrateRoot`. Adding a language = copy
`app/locales/en/`, add to `LOCALES` in `app/i18n/config.ts`, add to `app/locales/index.ts`.

**Design system**: three-layer tokens in `app/styles/tokens.css` — raw ltplabs.com palette →
semantic roles (`--surface`, `--fg`, `--primary`, `--accent`, `--focus`…) → Tailwind `@theme inline`
with `--color-*: initial`, so components only ever use semantic colour utilities and a future
dark/high-contrast theme is one CSS block. Font is self-hosted variable Manrope (OFL) — weights
400/500/600, bold = 500 never 700. Two-tone focus ring (orange outer + medium-blue inner) because
orange alone is 2.9:1.

**Accessibility (WCAG 2.2 AA, with and without JS)** is architectural, not a final pass: named
landmarks, one visible `<h1>` per page, skip link first in `<body>`, `noValidate` forms with
server-side codes and focus moved to the invalid input, `AnnouncerProvider`/`useAnnounce` with two
alternating `role="status"` regions, `RouteAnnouncer` on pathname change only (search-param and
fetcher announcements are route-owned), 44 px targets, reduced-motion kill switch, forced-colors and
`prefers-contrast` support, `lang="en"` on API-sourced text when the locale is not `en`. Automated
scans use IBM `accessibility-checker` (`getCompliance` on a Playwright page, `.achecker.yml` policy
`WCAG_2_2`) across every route × locale × state, plus reflow at 320 px.

**Testing split**: Vitest + Testing Library for pure logic and components (`createRoutesStub` for
route-aware ones); loaders/actions are covered by Playwright e2e, not unit tests.

## Documentation set to maintain

`README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `.github/PULL_REQUEST_TEMPLATE.md`, and in `Docs/`:
`PROGRESS.md` (resume point, session log, TO VERIFY register — updated at every milestone),
`ARCHITECTURE.md`, `I18N.md` (with the EN↔target-language glossary), `ACCESSIBILITY.md` (with the
announcements/focus table, the manual-review rules and the manual audit log), `DESIGN_SYSTEM.md`,
`DECISIONS.md` (ADR-lite; every TO VERIFY resolved here). Plan §5 gives the outline of each.
Update the relevant doc in the same PR as the change — the Definition of Done in
`CONTRIBUTING.md` requires it.
