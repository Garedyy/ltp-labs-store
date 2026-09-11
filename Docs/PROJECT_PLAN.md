# LTP Labs — Online Store: Analysis & Architecture Plan

> Repository language: English (all files, commits, docs). Conversation language: French.
> Sources: challenge PDF, 3 wireframe PNGs, the DummyJSON OpenAPI contract
> (`Docs/dummyjson-openapi.yaml`, authoritative for the API layer), live DummyJSON checks, live
> ltplabs.com CSS/HTML, official React Router v8 template + remix-i18next v8 README, npm registry
> (2026-09-11).
> Architecture produced by a 9-agent design workflow (3 architects → synthesis → 3 adversarial
> verifiers → completeness critic → revision), then adapted to the user's final answers.

## Context

LTP Labs frontend coding challenge: a simple e-commerce app "in Remix" — Homepage (product list,
sort, category filter, pagination), Product detail ("Add to cart"), optional Shopping cart — that
reproduces the provided Figma wireframes, is responsive, uses loaders/actions and clean routing,
follows frontend best practices, and is submitted on a VCS. LTP's email adds: any Remix version is
fine, even React Router v7.

The user raises the bar beyond the PDF: ltplabs.com visual identity, Remix + Tailwind only (ask
before anything else), a fully reliable multi-language system, accessibility for every visual
impairment, ultra-readable code with minimal comments, frontend/UX/performance rigour, a clean git
model (`main` ← `development` ← `feature/*`), responsive on phone/tablet/desktop from day one,
everything in English, never inventing (ask when in doubt), and a strict licence policy: **never a
commercial licence, never a contaminating (copyleft) licence** — code, fonts, icons and every
dependency (including transitive ones) must be permissive (MIT, ISC, BSD, Apache-2.0, Unlicense,
OFL-1.1 for fonts).

Outcome of this plan: a repository skeleton and documentation set that make every later feature
branch a small, predictable step, with the architecture (routing, data, i18n, a11y, design tokens,
tooling, git flow) fixed up front and every unverifiable claim tagged **TO VERIFY**.

## Execution summary (14 feature branches, in order)

| # | Branch | Delivers |
|---|---|---|
| 1 | `feature/project-scaffold` | React Router v8 app, dotfiles, `.env.example`, `Docs/` skeleton, README skeleton |
| 2 | `feature/tooling` | ESLint 9, Prettier, Vitest, Playwright + axe, Husky, lint-staged, commitlint, CI, PR template, CONTRIBUTING |
| 3 | `feature/design-system` | tokens, Manrope, `ui/*` primitives + tests, `DESIGN_SYSTEM.md` |
| 4 | `feature/i18n-foundation` | locale routing, middleware, typed EN/PT resources, entries, `I18N.md` |
| 5 | `feature/app-shell` | skip link, header, footer, announcer, error boundaries, coming-soon pages, `ACCESSIBILITY.md` v1 |
| 6 | `feature/dummyjson-client` | API client, types, guards, cache, catalogue helpers, formatting, fixtures, mock API |
| 7 | `feature/catalogue` | Home: grid, sort, category filter, pagination |
| 8 | `feature/search` | `/search` |
| 9 | `feature/product-detail` | product page (gallery, price/discount, stock, reviews, info list) |
| 10 | `feature/cart-session` | cookie session, cart maths, `add` action, header count |
| 11 | `feature/cart-page` | cart page, stepper, remove, summary, promo, checkout, confirmation |
| 12 | `feature/a11y-audit` | reflow / media-emulation tests, WCAG 2.2 scan matrix (IBM accessibility-checker), manual audit log |
| 13 | `feature/performance` | preload/preconnect/image priorities, bundle review, Lighthouse |
| 14 | `feature/docs-release` | final README, ARCHITECTURE, DECISIONS, CHANGELOG, `v1.0.0` |

Bootstrap before branch 1: `chore: initial commit` on `main` (README skeleton, `.gitignore`,
`Docs/`), create `development` from it, branch every feature from `development`.

---

## 1. Source analysis

### 1.1 Challenge PDF (`Docs/LTPLabs - frontend coding challenge.pdf`)

| Page | Required | Details |
|---|---|---|
| Homepage | yes | Fetch product list; each product links to detail; sort by user preference; filter by category; pagination |
| Product detail | yes | Fetch single product; every Figma element present; extra elements appreciated; "Add to cart" adds to cart |
| Shopping cart | optional | Fits app layout; reachable from header icon; shows items, quantity per item, total; remove items |
| Design | — | Tailwind optional; must work on mobile + desktop |
| Key notes | — | Use loaders/actions appropriately; clean Remix routing; submit on VCS |

Links embedded in the PDF: Remix https://remix.run/ · Figma
https://www.figma.com/design/ug7UHoyrz8aEpeDa8iZC07/LTP---FE-test (auth-walled → user supplied PNG
screenshots) · API https://dummyjson.com/docs/products.

### 1.2 Figma wireframes (`Docs/Wireframe *.png`, frames 1440 px wide)

**The wireframes are desktop references only (1440 px). The display must be responsive**: every
screen below is reproduced faithfully on desktop and adapted — same content, same order, same
behaviour — to tablet and phone (down to 320 px), per §3.8. No layout may require horizontal
scrolling, and every control stays reachable and ≥ 44 px on touch devices.

Common header: logo "THE ONLINE STORE" (condensed bold uppercase, left), centred nav (5 text
links), right icons: search, account, cart (bag). Thin bottom border. Nav labels differ between
frames (Homepage: Home / Shop / About / Contact / Blog — Product & Cart: Home / Shop / Deals /
Contact / Account).

**Homepage (1440×1489)** — toolbar "Sort by ▾" (left) · "Showing 1-9 of 100" (right); grid 3×3 =
**9 products/page**, card = square image, "Product title", "$19.99"; right sidebar "Categories" with
**checkboxes** (Category 1…4) + divider; pagination bottom-right `1` (active dark square) `2 3 4 5 ›`.

**Product detail (1440×900)** — large image (~⅔) · right: "Product title" (bold), "$129.99",
full-width dark "Add to Cart", divider, "Product Details" label, description paragraph.

**Shopping cart (1440×1012)** — left: line items separated by dividers (square thumbnail, title as
link, price, stepper `− 1 +`, trash icon); right: "Cart Summary" card (Subtotal / Shipping $20.00 /
Total, dark "Check out", "Or pay with PayPal", divider, "Promo code" input "Enter code" + "Apply").

### 1.3 DummyJSON Products API (contract: `Docs/dummyjson-openapi.yaml`, verified live)

**`Docs/dummyjson-openapi.yaml` is the API documentation to use** — an OpenAPI 3.0.3 contract
(v2.2.0) aligned with https://dummyjson.com/docs and cross-checked against the server source code
on 2026-09-11; status codes, validation rules and error payloads come from the source. It covers
products (read), carts, users, auth (`/auth/login`, `/auth/me`, `/auth/refresh`, `/auth/…` prefix
on any path) and HTTP mocks; product/user writes are deliberately out of scope. Every API decision
below derives from it; when the plan and the contract disagree, the contract wins.

Behaviours from the contract that shape the client (see §3.4):
- **Rate limit: 100 requests / 10 s per client IP → `429 { message }`.** In SSR every call comes
  from the server IP, so the budget is shared by all visitors: cache aggressively and never fan out
  more than needed.
- List params `limit` (default 30, `0` = all), `skip`, `select` (`id` always included, comma list
  or repeated), `sortBy` (unknown field silently ignored), `order` (case-insensitive; validated only
  when `sortBy` is present → `400`), `delay` (0–5000 ms, handy for manual loading-state checks),
  `modifiedAfter` / `modifiedBefore`. Invalid `limit`/`skip` → `400`.
- The `limit` echoed in a list response is the number of items **actually returned**, not the
  value requested → pagination maths must use our own `PAGE_SIZE`, never the echoed `limit`.
- A trailing slash → `301` to the slash-less path (the client never emits one).
- Every API error is JSON `{ "message": "…" }`; a path matching no route returns the provider's
  **HTML** 404 page (guards must not assume JSON).
- `/products/search`: `q` is trimmed, lower-cased, hyphens → spaces; **absent `q` returns all
  products**; a repeated `q` → `400`.
- `/products/category/{slug}`: case-insensitive; unknown slug → `200` with an empty list.
- `Product` schema `required: [id, title, price, category]` — everything else (`stock`, `images`,
  `thumbnail`, `reviews`, `discountPercentage`, `brand`…) must be treated as optional by the guards
  and defaulted. Contract examples show `…/products/images/…/1.png` while the live CDN serves
  `…/product-images/…/1.webp`: never assume an image extension or path.
- Carts / users / auth endpoints exist and can back the future "Account" page (not in phase 1).

| Endpoint | Notes |
|---|---|
| `GET /products` | `limit` (default 30, `0` = all), `skip`, `select=a,b`, `sortBy=<field>`, `order=asc\|desc` |
| `GET /products/:id` | 404 → `{"message":"Product with id 'X' not found"}` |
| `GET /products/search?q=` | same list params; `category` ignored |
| `GET /products/categories` | 24 × `{ slug, name, url }` |
| `GET /products/category-list` | 24 slugs |
| `GET /products/category/:slug` | supports `limit/skip/select/sortBy/order`; unknown slug → `200 {products:[],total:0}` |

List wrapper `{ products, total, skip, limit }`; **194 products**; out-of-range `skip` → `200`
with empty `products`. Product fields: `id, title, description, category, price,
discountPercentage, rating, stock, tags[], brand?, sku, weight, dimensions{width,height,depth},
warrantyInformation, shippingInformation, availabilityStatus (In Stock | Low Stock | Out of Stock),
reviews[{rating,comment,date,reviewerName,reviewerEmail}], returnPolicy, minimumOrderQuantity,
meta{createdAt,updatedAt,barcode,qrCode}, images[] (webp), thumbnail (webp)`. Verified quirks:
`brand` missing on 92 products, `stock: 0` on 4, `discountPercentage < 1` on 7, max price
$36,999.99, 3 reviews per product, image CDN `cdn.dummyjson.com` replies `Cache-Control: no-store`.
Units of `weight`/`dimensions` are undocumented. Category slugs: beauty, fragrances, furniture,
groceries, home-decoration, kitchen-accessories, laptops, mens-shirts, mens-shoes, mens-watches,
mobile-accessories, motorcycle, skin-care, smartphones, sports-accessories, sunglasses, tablets,
tops, vehicle, womens-bags, womens-dresses, womens-jewellery, womens-shoes, womens-watches.

### 1.4 ltplabs.com design system (extracted from live CSS — Next.js + Tailwind v4)

Font **Bw Modelica** 400/500 (commercial → **Manrope**). Body 16px/1.6, antialiased.
Colour tokens: black `#121211`, white, dark-blue `#10131c` (+lighter `#1c1f27`), medium-blue
`#12173a` (+lighter `#242b42`, primary buttons / nav text), blue `#16105f`, shapers-blue
`#1d1d8a`, orange `#ff6a00` (accent, icon buttons, focus-visible outline everywhere), light-green
`#007474`, shapers-green `#50bc81`, light-gray `#f4f7f9`, medium-gray `#eaecf0`, dark-gray
`#6a6a68`, inline error `#e5484d`.
Typography utilities: `h1` 48px/1.3/-1px, `h2` 36px/1.3/-1px, `h3` 28px/1.4, `h4` 22px/1.4, `h5`
18px/1.4, `body` 16px/1.6, `body-small` 14px/1.6, `tagline` 14px/1.2; `-bold` variants = weight
500 (never 700); `.button` 14px/500/1.2. Radii: default Tailwind (`lg .5rem` … `3xl 1.5rem`),
`--block-radius: 1.5rem`. Container: Tailwind `.container`, gutters `px-4 lg:px-6`, header inner
`max-w-[87rem]`. Header: fixed floating white card `rounded-2xl`, `shadow-[0_4px_7.5px_rgba(8,10,25,0.05)]`,
60px (lg 64px), 3-column grid (logo · nav · actions); nav items `rounded-lg px-2.5 py-2 text-[14px]
text-medium-blue hover:bg-light-gray`; primary CTA `bg-medium-blue text-white rounded-xl` with an
orange icon square; icon buttons `size-11 rounded-xl bg-orange`; language switcher outlined pill
`border-medium-gray h-11 rounded-xl` (`aria-label="Language: English"`). Sections `rounded-3xl`.
Focus `focus-visible:outline-2 outline-offset-2 outline-orange`; `motion-reduce:` respected.
Languages EN/PT. Icons: Remix Icon.

### 1.5 Toolchain facts (verified 2026-09-11)

Node v24.13.0, npm 11.6.2 (no pnpm/yarn/bun). `@remix-run/react` 2.17.5 — **Remix v2 is EOL**
since React Router v8 (June 2026). `react-router` 8.3.1 (framework mode = Remix successor;
ESM-only, Node ≥ 22.22, React ≥ 19.2.7, Vite 7/8, `react-router-dom` removed → `react-router` /
`react-router/dom`); `create-react-router` 8.3.1; `remix-i18next` 8.0.0 (peer `react-router ^8`,
`i18next ^24|25|26`); `i18next` 26.4.2; `react-i18next` 17.0.13; `tailwindcss` 4.3.3 +
`@tailwindcss/vite`. Official template: `vite.config.ts` `[tailwindcss(), reactRouter()]` +
`resolve.tsconfigPaths`; `react-router.config.ts` `{ ssr: true }`; `app/routes.ts` with
`index/route/layout/prefix` from `@react-router/dev/routes`; route types `./+types/<name>`;
`react-router reveal` exposes `entry.server.tsx` (`handleRequest(request, status, headers,
routerContext: EntryContext, loadContext: RouterContextProvider)`, `renderToPipeableStream`, isbot)
and `entry.client.tsx` (`HydratedRouter`). Git: remote `origin` =
https://github.com/Garedyy/ltp-lab-store-.git, **no commits yet**, no `.gitignore`, `.DS_Store`
present, `Docs/` untracked.

---

## 2. Decisions taken with the user (all answered — do not re-ask)

| # | Topic | Decision |
|---|---|---|
| 1 | Framework | **React Router v8 framework mode** (SSR, `@react-router/node` + `@react-router/serve`). README explains the Remix lineage. |
| 2 | Design source | PNG screenshots of the 3 Figma frames in `Docs/`. |
| 3 | Font | **Manrope** (Google Fonts, OFL), self-hosted variable woff2 (400–600). |
| 4 | i18n | **remix-i18next 8 + i18next 26 + react-i18next 17**. **EN (default) + PT (pt-PT)**. URL prefix `/en/…` `/pt/…`; `/` redirects to detected locale (cookie → Accept-Language → EN). Header language switcher. Adding a language = 3 edits. |
| 5 | Category filter | **Single selection**, checkbox visuals (wireframe), one API call per page. |
| 6 | Header nav | **Home, Shop, About, Contact, Blog** + icons Search, Account, Cart. Shop → `/` (same route). About/Contact/Blog/Account = translated accessible **"Coming soon"** pages (built later). |
| 7 | Search | **Functional from phase 1** (`/search?q=`), same sort/pagination. |
| 8 | Cart | Faithful visual + **simple mocked logic**: fixed shipping, promo code validated in an action, Check out / PayPal → mocked confirmation page. |
| 9 | Cart persistence | **Signed cookie session** `{productId, quantity}` (+ promo code + last order in the same signed cookie); actions add/update/remove; SSR header count; works without JS. |
| 10 | Sort options | Price low→high, Price high→low, Name A→Z, Name Z→A, Best rating. |
| 11 | Product extras | Image gallery (thumbnails), rating + reviews, strikethrough price + discount + stock (out of stock disables Add to cart), practical info `<dl>` (brand, SKU, shipping, warranty, return policy, dimensions, weight). |
| 12 | Tooling | ESLint (+jsx-a11y, +**eslint-plugin-i18next `no-literal-string`**) + Prettier (+tailwind plugin); Vitest + Testing Library; Playwright + **IBM `accessibility-checker`** (Apache-2.0, replaces axe-core which is MPL-2.0 — see decision 31); Husky + lint-staged + commitlint. |
| 13 | Deployment | None yet; standard Node build; GitHub Actions CI on PRs. |
| 14 | Git | `main` ← `development` ← `feature/<slug>`; Conventional Commits (English); squash into development; merge commit development → main per release; `Docs/` committed; `.DS_Store` ignored. |
| 15 | Theme | Semantic colour tokens only; light at launch; `prefers-contrast` + `forced-colors` supported; dark theme addable later without touching components. |
| 16 | Currency | USD from API, `Intl.NumberFormat` per locale (formatted in loaders). |
| 17 | Page size | 9 products per page. |
| 18 | Dev dependencies | Approved list: eslint@9 (+@eslint/js, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y, eslint-plugin-i18next, eslint-config-prettier, globals), prettier + prettier-plugin-tailwindcss, vitest, jsdom, @testing-library/{react,dom,jest-dom,user-event}, @playwright/test, accessibility-checker, husky, lint-staged, @commitlint/{cli,config-conventional}. **No runtime dependency beyond** react, react-dom, react-router, @react-router/node, @react-router/serve, i18next, react-i18next, remix-i18next, isbot. |
| 19 | API validation | **Hand-written type guards** (no zod). |
| 20 | Icons | **~12 Remix Icon paths copied as inline SVG** (Apache-2.0, attribution in README), `fill="currentColor"`. |
| 21 | Page headings | **Small visible `<h1>`** on catalogue ("Shop") and cart ("Your cart"), `text-h4`. |
| 22 | Colours | Orange **never as text** (backgrounds, badges, focus ring only); error text **#b42318** (derived), error border `#e5484d`. |
| 23 | Product cards | **Title + price only** (+ "Out of stock" text when stock 0); `select=id,title,price,thumbnail,stock`. |
| 24 | Footer | **Minimal footer** on dark-blue: brand, nav (header order), language links, "Coding challenge for LTP Labs — demo store". |
| 25 | E2E data | **Fixture-backed mock API** (no deps) with fault injection; fixtures extracted from the real API. |
| 26 | Units | Dimensions in **cm**, weight in **kg**, labelled; assumption documented. |
| 27 | Promo codes | **`LTP10`** = −10 % on subtotal, **`FREESHIP`** = free shipping. |
| 28 | Misc | **No LICENSE file** (all rights reserved; Manrope stays OFL, Remix Icon Apache-2.0 attributed); `robots.txt` **allows all**; Playwright **Chromium only**. |
| 29 | Language switcher | POST to a small resource route (`/:lang/set-language`) that validates, sets the `lng` cookie and redirects — the Remix-idiomatic "mutation = action" shape, works without JS (changed from the workflow draft's `?lng=` link + middleware step; see §10). |
| 30 | Licence policy | **Never commercial, never contaminating (copyleft: GPL, LGPL, AGPL, MPL, EPL, SSPL, CC-BY-SA…)**. Allow-list: MIT, ISC, BSD-2/3, Apache-2.0, Unlicense, 0BSD, CC0; OFL-1.1 for fonts. Applies to direct **and transitive** dependencies, fonts, icons, snippets. Verified with `npm view <pkg> license` before any addition, enforced in CI by an in-repo script (`scripts/check-licenses.mjs`, no deps), listed in the PR checklist. Audit of the approved stack (2026-09-11): all MIT / ISC / Apache-2.0 / Unlicense except axe-core (MPL-2.0) → replaced. |
| 31 | A11y engine | **IBM `accessibility-checker`** (Apache-2.0, Equal Access rules, policy `WCAG_2_2`) via `getCompliance(page, label)` on Playwright pages, instead of `@axe-core/playwright` (MPL-2.0). Transitive deps all permissive (puppeteer, chromedriver, js-yaml, microdiff, write-excel-file, @ibm/telemetry-js). Chromium download for puppeteer skipped and IBM telemetry disabled through env vars (**TO VERIFY** exact names). |

---

## 3. Architecture specification

### 3.1 Overview

React Router v8 framework-mode app, server-rendered by `@react-router/node` + `@react-router/serve`,
styled with Tailwind CSS v4 only, translated with remix-i18next + i18next + react-i18next.
Organising principle: **the URL and the cookie are the state; the server owns the truth.**
Catalogue sort/filter/page/search and the gallery image live in the URL; the cart lives in a signed
cookie session; every page renders from loaders; every mutation is a native `<form method="post">`
handled by a route action. JavaScript is additive (fetchers keep the user in place, an announcer
manages focus/live messages, disclosures gain Escape/outside-click) and every flow is verified with
JavaScript disabled (Playwright `no-js` project). Without JS, mutations follow Post/Redirect/Get.

The locale is the first path segment. A locale layout route validates it in a **middleware**
(before any loader), renders the shell (skip link, floating header with cart count, loading bar,
`<main>`, footer, live regions); an inner pathless layout hosts the translated error boundary so
errors never unmount the shell. Translations are one typed i18next namespace assembled from domain
files; PT structurally `satisfies` EN at compile time; a Vitest test checks placeholders, plural
suffixes and empty values. Money/numbers/dates are formatted with `Intl` **in loaders** so server
and client HTML are identical.

Visual language reproduces ltplabs.com on top of the wireframes through a three-layer token model
(raw palette → semantic roles → Tailwind `@theme inline`), so a dark/high-contrast theme is one
future CSS block. Accessibility is WCAG 2.2 AA by construction. Performance comes from structure:
server-side TTL cache in front of DummyJSON, one self-hosted variable font with preload, image
priority rules, intent prefetching, minimal runtime dependencies.

### 3.2 Repository tree

```
ltp-lab-store-/
├── .github/
│   ├── workflows/ci.yml                     # PR + push: commitlint (commits + PR title), licences, typecheck, lint, format, unit, build, e2e (+a11y scan)
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/  pre-commit (npx lint-staged) · commit-msg (npx --no -- commitlint --edit "$1")
├── .vscode/ extensions.json · settings.json
├── Docs/                                    # challenge PDF, wireframe PNGs, dummyjson-openapi.yaml (API contract), PROJECT_PLAN.md, ARCHITECTURE / ACCESSIBILITY / I18N / DESIGN_SYSTEM / DECISIONS .md
├── app/
│   ├── root.tsx                             # html shell, middleware [i18next, responseHeaders], root loader { locale, origin }, hreflang, root ErrorBoundary
│   ├── routes.ts
│   ├── entry.client.tsx                     # i18next init with bundled resources, lng from <html lang>, await init, HydratedRouter
│   ├── entry.server.tsx                     # revealed node entry wrapped in I18nextProvider(getInstance(loadContext)) with EN fallback instance
│   ├── styles/
│   │   ├── app.css                          # @import "tailwindcss"; @import "./fonts.css"; "./tokens.css"; "./base.css"
│   │   ├── fonts.css                        # @font-face Manrope variable 400–600, latin subset, font-display swap
│   │   ├── tokens.css                       # raw palette → semantic roles (+ prefers-contrast block) → @theme / @theme inline
│   │   └── base.css                         # body defaults, links underlined, two-tone :focus-visible, reduced motion, forced-colors, scroll-padding
│   ├── fonts/
│   │   ├── manrope-latin.woff2              # Google Fonts variable file (imported from CSS → hashed by Vite)
│   │   └── OFL.txt                          # SIL Open Font License 1.1 (required for redistribution)
│   ├── middleware/
│   │   ├── i18next.ts                       # createI18nextMiddleware → [i18nextMiddleware, getLocale, getInstance]
│   │   └── response-headers.ts              # Cache-Control: private, no-cache + security headers
│   ├── i18n/
│   │   ├── config.ts                        # LOCALES, DEFAULT_LOCALE, Locale, localeCodes, isLocale(), localeFromHtmlLang()
│   │   ├── i18next.d.ts                     # CustomTypeOptions (defaultNS, resources, returnNull: false)
│   │   ├── locale-cookie.server.ts          # createCookie("lng")
│   │   ├── detect-locale.server.ts (+ .test.ts)  # cookie → Accept-Language → DEFAULT_LOCALE
│   │   ├── paths.ts (+ .test.ts)            # withLocale(), switchLocale()
│   │   ├── format.server.ts (+ .test.ts)    # formatPrice / formatNumber / formatPercent / formatDate (Intl, server only)
│   │   ├── use-locale.ts                    # useLocale(): Locale from root loader data, i18n.language fallback
│   │   └── locales.test.ts                  # placeholders, plural suffixes, no empty / key-equal values
│   ├── locales/
│   │   ├── index.ts                         # export default { en, pt }
│   │   ├── en/ index.ts · translation.ts · common.ts · catalogue.ts · product.ts · cart.ts · pages.ts · errors.ts
│   │   └── pt/                              # same files; each `satisfies typeof import("~/locales/en/<file>").default`
│   ├── services/
│   │   ├── dummyjson/
│   │   │   ├── client.server.ts             # fetchJson(path, params, guard); ApiError(status)
│   │   │   ├── cache.server.ts              # cached(key, ttlMs, load) — Map, clear() above 300 entries
│   │   │   ├── types.ts                     # Product, ProductSummary, ProductList<T>, Category, Review, CategorySlug, CATEGORY_SLUGS
│   │   │   ├── guards.ts (+ .test.ts)       # isProduct, isProductSummaryList, isCategoryList (hand-written)
│   │   │   └── products.server.ts (+ .test.ts)
│   │   └── cart/
│   │       ├── session.server.ts            # createCookieSessionStorage("__cart"), getCartSession, commitCartSession
│   │       ├── types.ts                     # CartLine, CartSessionData, CartLineView, TotalsView, CartView, LastOrder
│   │       ├── cart.ts (+ .test.ts)         # addLine, setQuantity, removeLine, countItems, sanitiseLines
│   │       ├── totals.ts (+ .test.ts)       # integer-cent maths
│   │       ├── promo-codes.ts               # mocked table, findPromo()
│   │       ├── intents.ts (+ .test.ts)      # parseCartIntent(formData)
│   │       └── load-cart.server.ts          # loadCartView(request, locale)
│   ├── lib/
│   │   ├── catalogue/ sort-options.ts · query.ts · pagination.ts · types.ts (+ .test.ts)
│   │   ├── error-codes.ts                   # ErrorCode, NoticeCode unions (single source)
│   │   ├── http.ts                          # notFound(code?), serviceUnavailable(), toRouteError(), isNoJs(formData), redirectBack()
│   │   ├── meta.ts (+ .test.ts)             # pageMeta({ title, description }) → MetaDescriptor[]
│   │   └── cx.ts                            # join truthy class strings
│   ├── components/
│   │   ├── ui/       button · icon · visually-hidden · field · checkbox · select · alert · disclosure · price · rating · definition-list · discount-badge (+ tests)
│   │   ├── layout/   page-container · skip-link · site-header · site-nav · header-actions · language-switcher · site-footer
│   │   │             announcer (AnnouncerProvider + useAnnounce, two alternating role="status" regions)
│   │   │             route-announcer (pathname change → close disclosures, focus main, announce title)
│   │   │             navigation-status (2 px progress bar after 300 ms, main aria-busy)
│   │   ├── catalogue/ catalogue-results · sort-form · results-summary · category-filter · product-card · product-grid · pagination · empty-state
│   │   ├── product/   product-gallery · stock-status · add-to-cart-form · product-info-list · review-list
│   │   ├── cart/      cart-line-item · quantity-stepper · cart-summary · promo-code-form · checkout-actions · empty-cart · cart-notice
│   │   └── pages/     coming-soon · error-page · route-error-boundary
│   └── routes/
│       ├── locale-redirect.tsx              # "/" → 302
│       ├── locale-layout.tsx                # "/:lang": middleware (validate, asset deny-list), loader (cartCount), shell
│       ├── locale-errors.tsx                # pathless layout: <Outlet/> + shared ErrorBoundary (shell stays mounted)
│       ├── set-language.tsx                 # "/:lang/set-language": action only — validates, sets lng cookie, 303 redirect
│       ├── catalogue.tsx · search.tsx · product.tsx · cart.tsx · order-confirmation.tsx
│       ├── about.tsx · contact.tsx · blog.tsx · account.tsx
│       └── not-found.tsx                    # "/:lang/*"
├── tests/
│   ├── setup.ts                             # @testing-library/jest-dom/vitest, afterEach(cleanup)
│   ├── helpers/ render.tsx (renderWithProviders) · i18n.ts (test instance, missing key throws) · text.ts (normalise NBSP)
│   ├── fixtures/dummyjson/ products-all.json (194 summaries) · product-<id>.json ×10 · categories.json
│   └── e2e/ mock-api.server.ts · a11y-check.ts (getCompliance/assertCompliance wrapper) · routes.ts · a11y · keyboard · i18n · catalogue · search · product · cart · no-js · reflow · not-found .spec.ts
├── scripts/check-licenses.mjs               # walks node_modules/**/package.json, fails on any licence outside the allow-list (no deps)
├── public/ favicon.svg · favicon.ico · robots.txt (allow all)
├── .achecker.yml                            # ruleArchive latest · policies [WCAG_2_2] · failLevels [violation, potentialviolation] · outputFolder test-results/a11y
├── .editorconfig · .env.example · .gitignore · .npmrc · .nvmrc · .prettierrc · .prettierignore
├── CHANGELOG.md · CONTRIBUTING.md · README.md
├── commitlint.config.js · eslint.config.js · playwright.config.ts · react-router.config.ts
├── package.json · package-lock.json · tsconfig.json · vite.config.ts · vitest.config.ts
```

`.gitignore`: `node_modules`, `build`, `.react-router`, `.env`, `.DS_Store`, `playwright-report`,
`test-results`, `coverage`.

### 3.3 Routing

`app/routes.ts`:

```ts
import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/locale-redirect.tsx"),
  ...prefix(":lang", [
    layout("routes/locale-layout.tsx", [
      route("set-language", "routes/set-language.tsx"),
      layout("routes/locale-errors.tsx", [
        index("routes/catalogue.tsx"),
        route("search", "routes/search.tsx"),
        route("products/:productId", "routes/product.tsx"),
        route("cart", "routes/cart.tsx"),
        route("checkout/confirmation", "routes/order-confirmation.tsx"),
        route("about", "routes/about.tsx"),
        route("contact", "routes/contact.tsx"),
        route("blog", "routes/blog.tsx"),
        route("account", "routes/account.tsx"),
        route("*", "routes/not-found.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
```

No top-level `*`: any path with segments matches `:lang` and is validated by the layout middleware.
Internal links use `href("/:lang/products/:productId", { lang, productId: String(id) })` — params
are strings. Route modules import `type { Route } from "./+types/<name>"`. **Routing logic never
parses `request.url`**: loaders, actions and middleware read `url` from their args (the raw request
may carry `.data` suffixes / `_routes` params on client navigations in v8).

**URL contract** (`?q`, `?category`, `?sort`, `?page`, `?image`)
- Generated URLs write params in the fixed order `q, category, sort, page`; `page=1` never written;
  `buildSearch(current, patch)` deletes `page` whenever `q`, `category` or `sort` changes.
- `?page` not a positive integer → 1 silently; `page > pageCount` with `total > 0` → 404.
- `?sort` not a `SortKey` → default API order silently.
- `?category` not `/^[a-z-]+$/` or not in the category list → **302 to the same URL without `category`**.
- `?q` trimmed, truncated to 100 chars; whitespace-only = absent.
- `?image` 1-based, omitted for image 1; invalid → 1 silently.
- History: push for `q`/`category`/`sort`/`page`, `replace` only for `?image`.

**Locale layout middleware** (`locale-layout.tsx`, `export const middleware: Route.MiddlewareFunction[] = [validateLocale]`)
runs before every loader in the subtree (parent/child loaders run in parallel, so validation cannot
live in a loader):
1. `raw = params.lang`; if it contains `.` or is in `ASSET_DENY_LIST` (`favicon.ico`,
   `.well-known`, `robots.txt`, `apple-touch-icon.png`) → `throw data(null, { status: 404 })`.
2. `lower = raw.toLowerCase()`; if `isLocale(lower)` and `raw !== lower` → 301 to lower-case URL.
3. If `!isLocale(lower)` → 302 to `withLocale(url.pathname + url.search, detectLocale(request))`
   (`/products/3` → `/en/products/3`; `/foo` → `/en/foo` → translated 404 in the shell).
4. `await next()`.
Trailing slash: **TO VERIFY** that `/en/` matches the `:lang` index; `i18n.spec.ts` asserts it.

**`set-language.tsx`** (resource route, action only): reads `locale` and `redirectTo` from the form;
`redirectTo` must be a same-origin path (starts with `/`, not `//`); invalid locale → 400; else
`throw redirect(switchLocale(redirectTo, locale), { status: 303, headers: { "Set-Cookie": await localeCookie.serialize(locale) } })`.
GET → 405. Only place the `lng` cookie is written, so following a shared `/pt/…` link never changes
a user's remembered language.

**Per-route table**

| Path | File | Loader | Action | `<title>` | Errors |
|---|---|---|---|---|---|
| (root) | `root.tsx` | `{ locale: getLocale(context), origin: process.env.APP_ORIGIN ?? url.origin }` | — | `The Online Store` | Root boundary (no shell): `ErrorPage` with status from `isRouteErrorResponse`, strings from bundled default-locale resources; handles 404 (asset deny-list), 405, 500 |
| `/` | `locale-redirect.tsx` | `throw redirect("/" + detectLocale(request), { status: 302, headers: { Vary: "Cookie, Accept-Language" } })` | — | — | — |
| `/:lang` | `locale-layout.tsx` | `cartCount = countItems(sanitiseLines(session))` (no API call, no commit) | — | — | Layout boundary renders the shell with `cartCount = loaderData?.cartCount ?? 0` + `ErrorPage` (**TO VERIFY** `Route.ErrorBoundaryProps.loaderData` populated; fallback 0) |
| (pathless) | `locale-errors.tsx` | — | — | — | `export { RouteErrorBoundary as ErrorBoundary }`; component `<Outlet/>` — leaf errors render **inside the mounted shell** |
| `/:lang/set-language` | `set-language.tsx` | 405 | set cookie + 303 | — | 400 on invalid input |
| `/:lang` index | `catalogue.tsx` | `getCategories()` (1 h cache) → `parseCatalogueQuery(url.searchParams, categories)` → unknown category → 302 canonical → `getProductsByCategory` / `getProducts` → `CatalogueView` | — | "Shop" or category name; " — page N" when `page > 1` | page out of range → `notFound("page-not-found")`; `ApiError` → 502 |
| `/:lang/search` | `search.tsx` | `q` empty → no fetch (`products: null`); else `searchProducts(q, params)` | — | `Search` / `Search: “q” (N results)` | as catalogue |
| `/:lang/products/:productId` | `product.tsx` | id positive int else `notFound("product-not-found")`; `getProduct` null → same; `image` clamped; `ProductView` (formatted prices/dates/numbers); reads + commits flash `notice` (no-JS PRG) | `intent=add` | product title | `shouldRevalidate`: default when `formMethod` set, `false` when only `image` differs |
| `/:lang/cart` | `cart.tsx` | `loadCartView(request, locale)` (drops vanished / stock-0 lines, clamps, notices), `cartCount`, `promoCode`, flash `notice`; commits session | `set-quantity \| remove \| apply-promo \| remove-promo \| checkout` | `Shopping cart (N units)` | boundary in `locale-errors` |
| `/:lang/checkout/confirmation` | `order-confirmation.tsx` | `session.get("lastOrder")` (persistent); missing → `redirect(cart)` | — | "Order confirmed" | `shouldRevalidate: () => false` |
| `/:lang/about\|contact\|blog\|account` | 10-line files | `{ title: getInstance(context).t("pages.<name>.title") }` | — | translated | — |
| `/:lang/*` | `not-found.tsx` | `data({ title }, { status: 404 })` | — | "Page not found" | `ErrorPage 404` with links home / search / cart |

**Root module**: `middleware = [i18nextMiddleware, responseHeadersMiddleware]`; `links()`: font
preload (`rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"`, URL from a `?url`
import — **TO VERIFY** same hashed file as the CSS `url()`; fallback `public/fonts/`), `rel="icon"`,
`preconnect` to `https://cdn.dummyjson.com`; stylesheet via `import "./styles/app.css"`. `Layout`:
`<html lang={htmlLang} dir={dir}>` from `LOCALES[locale]`; `<Meta/>`, `<Links/>`, `<AlternateLinks/>`
(one `<link rel="alternate" hrefLang>` per locale + `x-default` → EN, rendered directly in the head
because child `meta` replaces parent meta); `<ScrollRestoration/>`; `<Scripts/>`. `App`: `useEffect`
syncing `i18n.changeLanguage(locale)`.

**Screen-state matrix** (every state must exist, be translated, and be covered by tests)

| Route · state | Trigger | Status | Renders | Focus | Announcement |
|---|---|---|---|---|---|
| Catalogue · results | default | 200 | `<h1>` "Shop", toolbar, grid (9), pagination, aside | on arrival: `main` | `document.title` |
| Catalogue · param change | GET | 200 | same | page change → `#results-heading`; sort Apply → stays; category → stays on checkbox; Clear filter → `fieldset` | `catalogue.results.announce{from,to,total}` / `_zero` |
| Catalogue · empty | category with 0 products | 200 | `EmptyState` `<h2>` "No products in this category" + "Show all products" | as above | `announce_zero` |
| Catalogue · unknown category | `?category=foo` | 302 | canonical URL | — | — |
| Catalogue · page out of range | `?page=99` | 404 | `ErrorPage` in shell | `main` | title |
| Catalogue · API down | `ApiError` | 502 | `ErrorPage` "Product service unavailable" + retry link | `main` | title |
| Any · loading (JS) | `navigation.state !== "idle"` > 300 ms | — | 2 px accent bar under header, `<main aria-busy>` | unchanged | `common.loading` once |
| Search · no query | `q` empty | 200 | form + prompt; no summary | search input | title |
| Search · results | `?q=phone` | 200 | form + results | stays in input (JS) | `catalogue.search.announce{q,total}` (`_one/_other/_zero`) |
| Search · no results | total 0 | 200 | `EmptyState` "No results for “{{q}}”" + hint "Products are searched in English" + link to shop | input | `_zero` |
| Product · in / low / out of stock | `stock` | 200 | `StockStatus`; Low → "Only {{count}} left"; out → button `disabled` + text | `main` | title |
| Product · single image | `images.length === 1` | 200 | no thumbnail list | | |
| Product · add ok / capped | action | 200 | status "Added to your cart. You now have N items. View cart" / "Quantity limited to available stock ({{max}})" | button (JS) / status region `autoFocus` (no-JS) | same text |
| Product · add errors | `product-not-found` 404, `out-of-stock` 400, `cart-full` 400 | | `Alert` + link | alert | — |
| Product · not found | bad id | 404 | `ErrorPage` "Product not found" + link to shop | `main` | title |
| Cart · empty | no lines | 200 | `<h1>` "Your cart is empty", paragraph, "Continue shopping"; no summary/promo | `main` / `<h1>` after last removal | `cart.removed{title}` |
| Cart · items | lines | 200 | `<h1>` "Your cart", list, summary card, promo form, checkout actions | `main` | title |
| Cart · notice | flash `items-removed` / `quantities-adjusted` | 200 | `CartNotice` `<p role="status" tabIndex=-1>` | notice (no-JS) / stays (JS) | notice text |
| Cart · quantity updated / clamped | `set-quantity` | 200 | line re-rendered | stays | "Quantity of X updated to N" / "Quantity limited to {{max}}" |
| Cart · invalid quantity | non-integer | 400 | `Alert` under input, value kept | input | — |
| Cart · promo applied / invalid / required / removed | | 200/400 | "Code LTP10 applied" + Remove code; or `Alert` | input (error) / Remove code (applied) | status |
| Cart · checkout | POST | 303 → confirmation | | `main` | title |
| Confirmation | `lastOrder` present | 200 | `<h1>` "Thank you — order {{number}}", `<dl>` Items / Payment method / Total, demo paragraph, "Continue shopping"; survives reload + language switch | `main` | title |
| Confirmation · none | | 302 → cart | | | |
| Coming soon ×4 | | 200 | `<h1>`, body, link home | `main` | title |
| 404 | `/:lang/anything` | 404 | `ErrorPage` + links | `main` | title |
| Unknown / upper-case locale | `/xx/…`, `/EN/…` | 302 / 301 | | | |

**Progressive-enhancement matrix**

| Interaction | Without JS | With JS |
|---|---|---|
| Sort | GET form, visible **Apply** button | same (`<Form method="get">`, client navigation, push) |
| Category | checkbox + `<noscript>` Apply | `onChange` → `navigate()` push, hint advises; focus stays |
| Page / search | links / GET form → full document | client navigation; page change focuses `#results-heading` |
| Gallery thumbnail | link `?image=n` | client navigation, `replace`, no refetch |
| Add to cart, stepper, remove, promo | POST → **303 redirect back** + flash notice (`noJs` hidden input in `<noscript>`) | `fetcher.Form`, stay in place, announcements, focus handoff |
| Checkout / PayPal | POST → 303 confirmation | `<Form>` full navigation |
| Language switch | POST form → 303 | same (`reloadDocument`-equivalent: full navigation) |
| Mobile menu / switcher panel | native `<details>` | Escape / outside click / close on navigate |

### 3.4 Data layer

**DummyJSON client** (`app/services/dummyjson/`, server-only). Source of truth:
`Docs/dummyjson-openapi.yaml` (§1.3). Rules derived from it: paths without trailing slash; only
valid `limit`/`skip`/`order` values are ever sent (a `400` is therefore a programming error →
logged + `ApiError(502)`); `429` (rate limit) → `ApiError(502)` rendered as "service unavailable,
retry"; non-JSON bodies (provider HTML 404) → `ApiError(502)`; pagination uses `PAGE_SIZE`, never
the echoed `limit`; guards follow the contract's `required` list and default every other field.
```ts
const BASE_URL = process.env.DUMMYJSON_BASE_URL ?? "https://dummyjson.com";
export class ApiError extends Error { constructor(readonly status: 404 | 502, message: string) { super(message); } }
export async function fetchJson<T>(path: string, params: Record<string, string | number | undefined>, guard: (v: unknown) => v is T): Promise<T>
```
`URLSearchParams` (undefined skipped); `fetch(url, { signal: AbortSignal.timeout(8_000), headers: { accept: "application/json" } })`;
404 → `ApiError(404)`; other non-2xx / timeout / network → `ApiError(502)`; guard failure →
`ApiError(502, "Unexpected response shape")` (logged).

`types.ts`: `Product`, `ProductSummary = Pick<Product, "id" | "title" | "price" | "thumbnail" | "stock">`,
`ProductList<T>`, `Category = { slug; name; url }`, `CATEGORY_SLUGS` (24 literals) + `CategorySlug` +
`isCategorySlug()`, `Review`. `guards.ts`: hand-written, tolerant of extra fields, strict on what the
UI needs; `reviews: []` and missing `brand` accepted.

`products.server.ts` (one function per endpoint, each through `cached()`):

| Function | Endpoint | TTL |
|---|---|---|
| `getProducts({ limit, skip, sortBy?, order? })` | `/products` | 5 min |
| `getProductsByCategory(slug, same)` | `/products/category/:slug` | 5 min |
| `searchProducts(q, same)` | `/products/search?q=` | 5 min |
| `getProduct(id)` → `Product \| null` | `/products/:id` (404 → null) | 10 min |
| `getProductsByIds(ids)` | parallel `getProduct` (≤ 50, bounded by cart cap + timeout) | — |
| `getCategories()` | `/products/categories` | 1 h |

`inStock = stock > 0` (numeric truth for clamping); the visible label comes from `availabilityStatus`.
`cache.server.ts`: `cached(key, ttlMs, load)`; module-scope `Map`; only successes cached;
`if (cache.size > 300) cache.clear()`; **in-flight de-duplication** (a second call for the same
key while the first is pending awaits the same promise) — required by the shared 100 req / 10 s
budget of the contract. The e2e mock API mirrors the contract's behaviours (echoed `limit`, `q`
normalisation, empty list for unknown category, `{ message }` errors, `429` on demand).

**Catalogue query** (`app/lib/catalogue/`):
```ts
export const SORT_OPTIONS = {
  "price-asc": { sortBy: "price", order: "asc" }, "price-desc": { sortBy: "price", order: "desc" },
  "title-asc": { sortBy: "title", order: "asc" }, "title-desc": { sortBy: "title", order: "desc" },
  "rating-desc": { sortBy: "rating", order: "desc" },
} as const;
```
`PAGE_SIZE = 9`; `skip = (page − 1) × 9`; `pageCount = max(1, ceil(total / 9))`; `from = total ? skip + 1 : 0`,
`to = skip + products.length`. `parseCatalogueQuery(searchParams, categories)` → `{ page, sort?, category?, q, canonical? }`.
`pageWindow(page, pageCount, size = 5)`: `start = clamp(page − 2, 1, max(1, pageCount − size + 1))`,
`end = min(start + size − 1, pageCount)`; examples `(1,22)→1–5`, `(4,22)→2–6`, `(22,22)→18–22`, `(2,3)→1–3`.
`ProductCardView = { id; title; thumbnail; priceFormatted; inStock; href }`;
`CatalogueView = { products; total; page; pageCount; showing: { from; to }; query; categories: { slug; name }[]; title }`.

**Error and notice codes** (`app/lib/error-codes.ts`, single source; `Record<ErrorCode, ParseKeys>`
maps codes to translation keys — a missing translation is a compile error):

| Code | Producer | HTTP | Rendered as |
|---|---|---|---|
| `invalid-intent` | cart/product action | 400 | `Alert` top of form |
| `invalid-quantity` | `set-quantity` | 400 | `Alert` under the line's input, focus input |
| `product-not-found` | product loader / `add` | 404 / 400 | `ErrorPage` / `Alert` + link to shop |
| `out-of-stock` | `add` | 400 | `Alert` |
| `cart-full` | `add` (50 distinct lines) | 400 | `Alert` + link to cart |
| `promo-required` / `promo-invalid` | `apply-promo` | 400 | `Alert` under promo input, focus |
| `empty-cart` | `checkout` (server guard) | 400 | `Alert` |
| `page-not-found` | loaders | 404 | `ErrorPage` |
| `service-unavailable` | any loader (`ApiError 502`) | 502 | `ErrorPage` + retry |
| Notices `added`, `added-capped`, `quantity-updated`, `quantity-clamped`, `removed`, `promo-applied`, `promo-removed`, `items-removed`, `quantities-adjusted` | actions / cart loader | 200 | status region (JS) or `CartNotice` with `autoFocus` (no-JS) |

**Cart cookie session** (`app/services/cart/`):
```ts
type CartLine = { productId: number; quantity: number };
type CartSessionData = { cart: CartLine[]; promoCode?: string; lastOrder?: LastOrder };
type CartFlashData = { notice?: NoticeCode };
type LastOrder = { number: string; method: "card" | "paypal"; totalCents: number; itemCount: number };
const storage = createCookieSessionStorage<CartSessionData, CartFlashData>({
  cookie: { name: "__cart", path: "/", httpOnly: true, sameSite: "lax",
            secure: process.env.COOKIE_SECURE === "true", maxAge: 60 * 60 * 24 * 30, secrets: [sessionSecret()] },
});
```
- `sessionSecret()` reads `SESSION_SECRET`; production throws at boot when missing; development
  uses a fixed dev secret with a console warning. `COOKIE_SECURE=true` behind HTTPS only.
- `sanitiseLines()` on every read (array, integer ids, quantity 1..99, first 50 lines); `add`
  refuses a 51st line with `cart-full`. 50 lines ≈ 2.1 KB base64 + signature < 4 KB; `cart.test.ts`
  serialises a 50-line cart and asserts `< 4000` bytes.
- `cart.ts`: `addLine(lines, id, max)` → `{ lines, capped }`; `setQuantity(lines, id, qty, max)`
  (clamped `1..min(99, stock)`, returns `clamped: "min" | "max" | null`); `removeLine`; `countItems`.
  Insertion order kept; adding an existing product increments in place. `minimumOrderQuantity`
  ignored (documented).
- `totals.ts` (integer cents): `toCents(price) = Math.round(price × 100)`;
  `originalPriceCents = round(priceCents / (1 − d/100))` shown only when `d ≥ 1` and ≥ 1 cent
  different; `subtotal`; `discount = round(subtotal × 10 / 100)` with `LTP10`; `shipping = 2000` when
  non-empty (0 with `FREESHIP`, label "Free"); `total = subtotal − discount + shipping`. Test includes
  `$36,999.99 × 99`. `TotalsView = { subtotalFormatted; discountFormatted?; promoCode?; shippingFormatted; isFreeShipping; totalFormatted }`;
  `CartLineView = { productId; title; thumbnail; quantity; maxQuantity; unitPriceFormatted; linePriceFormatted; href }`.
- `promo-codes.ts`: `{ LTP10: { percentOff: 10 }, FREESHIP: { freeShipping: true } }`, `findPromo(code)`
  trimmed / case-insensitive; applying replaces an existing code; `remove-promo` with none → 200 no-op.
- `intents.ts`: `parseCartIntent(formData)` → `set-quantity {productId, quantity}` | `remove` |
  `apply-promo` | `remove-promo` | `checkout {payment: "card" | "paypal"}` | `invalid`. No relative
  increment intents: `+`/`−` submit **absolute** quantities (idempotent under rapid clicks).
- **Action rules**: every action unsets `lastOrder` and commits the session. `set-quantity`:
  non-integer → 400; `≤ 0` → 1; `> min(99, stock)` → clamped; equal → 200 no-op; product vanished →
  line removed + `items-removed`. `add` (product route): missing → `product-not-found`; `stock === 0`
  → `out-of-stock`; 50 lines and new id → `cart-full`; capped → `added-capped`. `checkout`: empty →
  `empty-cart`; else `lastOrder = { number: "LTP-" + Date.now().toString(36).toUpperCase(), … }`,
  clear `cart` + `promoCode`, `throw redirect(confirmation, { status: 303, headers })`.
- **No-JS PRG**: every mutation form contains `<noscript><input type="hidden" name="noJs" value="1"/></noscript>`;
  when `isNoJs(formData)`, the action flashes `notice` and `throw redirectBack(request, { status: 303, headers })`.
  Fetcher path returns `data(...)` with `Set-Cookie` (preserved without a `headers` export — verified).
- **Concurrency**: `AddToCartForm` ignores submits while `fetcher.state !== "idle"`; stepper values
  derive from in-flight `fetcher.formData`. Cookie cart is last-write-wins across tabs (documented).
- `loadCartView(request, locale)`: `getProductsByIds`; drop vanished / stock-0 lines
  (`items-removed`), clamp `quantity > stock` (`quantities-adjusted`), commit if changed; returns
  `CartView = { lines; totals; cartCount; promoCode?; notice? }`. The header prefers
  `useRouteLoaderData("routes/cart")?.cartCount` when present.

### 3.5 Internationalisation

`app/i18n/config.ts`:
```ts
export const LOCALES = {
  en: { htmlLang: "en",    intlLocale: "en-US", dir: "ltr", nativeName: "English",   plurals: ["one", "other"] },
  pt: { htmlLang: "pt-PT", intlLocale: "pt-PT", dir: "ltr", nativeName: "Português", plurals: ["one", "many", "other"] },
} as const;
export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = "en";
export const localeCodes = Object.keys(LOCALES) as Locale[];
export function isLocale(value: unknown): value is Locale
export function localeFromHtmlLang(lang: string): Locale   // "pt-PT" → "pt", unknown → DEFAULT_LOCALE
```

`app/middleware/i18next.ts`:
```ts
export const [i18nextMiddleware, getLocale, getInstance] = createI18nextMiddleware({
  detection: {
    supportedLanguages: localeCodes,
    fallbackLanguage: DEFAULT_LOCALE,
    order: ["custom"],                                   // URL prefix only; never ?lng=, cookie or Accept-Language
    async findLocale({ url }) { return url.pathname.split("/").at(1)?.toLowerCase() ?? null; },
  },
  i18next: { resources, fallbackLng: DEFAULT_LOCALE, supportedLngs: localeCodes, interpolation: { escapeValue: false } },
  plugins: [initReactI18next],
});
```
`findLocale` is `async`, returns `string | null`, reads `url` from its args — **TO VERIFY** at
implementation that the args carry `url`; fallback `new URL(request.url).pathname.replace(/\.data$/, "")`.
`i18next.d.ts`: `declare module "i18next" { interface CustomTypeOptions { defaultNS: "translation"; resources: typeof resources.en; returnNull: false } }`.
Registered once in `root.tsx` so it also runs for `/:lang/*` 404s.

**Detection & cookie**: `detectLocale(request)` (in-repo, unit-tested): `lng` cookie if `isLocale`
→ `Accept-Language` (`,` split, `;q=` weights, primary subtag so `pt-BR` → `pt`) → `DEFAULT_LOCALE`.
Used only by `/` and by the unknown-prefix redirect. `lng` cookie = `createCookie("lng", { path: "/",
sameSite: "lax", httpOnly: true, secure: COOKIE_SECURE, maxAge: 1 year })`, written **only** by
`set-language.tsx`.

**Switcher** (`<details>` pill, inside `<nav aria-label="Language">`): `<summary><span aria-hidden>EN</span><span class="sr-only">EN, English. Change language</span> ▾</summary>`
(accessible name starts with the visible label — SC 2.5.3); panel = `<Form method="post" action={href("/:lang/set-language", { lang })}>`
with `<input type="hidden" name="redirectTo" value={currentPathWithSearch}>` and one
`<button name="locale" value="pt" lang="pt" hrefLang…>Português</button>` per other locale; the
current locale is listed with `aria-current="true"` as non-interactive text. Below `lg` it lives
inside the mobile menu. Full navigation → server render in the new language (no client re-init).

**Entries**: `entry.server.tsx` = revealed node entry rendering
`<I18nextProvider i18n={instanceFor(loadContext)}><ServerRouter context={routerContext} url={request.url}/></I18nextProvider>`
where `instanceFor = try { getInstance(loadContext) } catch { fallbackInstance }` (module-scope
`createInstance().init({ resources, lng: DEFAULT_LOCALE })` so 500s thrown before the middleware still
render the root `ErrorPage` in EN). `getInstance` takes the **5th** argument (`RouterContextProvider`).
`entry.client.tsx`: `const lng = localeFromHtmlLang(document.documentElement.lang); await i18next.use(initReactI18next).init({ resources, lng, fallbackLng, supportedLngs, interpolation: { escapeValue: false } })`
**before** `hydrateRoot` (otherwise raw keys → hydration mismatch), then
`<I18nextProvider i18n={i18next}><StrictMode><HydratedRouter/></StrictMode></I18nextProvider>`.
`i18next-browser-languagedetector` is **not installed** — `<html lang>` is authoritative. Resources
bundled (~6–10 KB gzipped).

**Resources**: one namespace `translation` = `{ common, catalogue, product, cart, pages, errors }`.
Every PT file ends with `satisfies typeof import("~/locales/en/<file>").default` → missing/extra keys
fail `tsc`. Plurals: `key_one` / `key_other` in EN **and** `key_many` in both (EN's `_many` =
`_other`) — i18next has no `_many` → `_other` fallback. Conventions: camelCase keys,
`{{placeholder}}`, `_zero` where a zero message differs, never concatenate fragments, no
money/dates/HTML in strings (`<Trans>` only for a link inside a sentence). `common.brand = "The Online Store"`
(CSS `uppercase` in the logo so screen readers do not spell it). Category names:
`catalogue.categories: Record<CategorySlug, string>`; rendering `isCategorySlug(slug) ? names[slug] : category.name`.
Search title quotes live in the strings (`“{{q}}”` EN, `«{{q}}»` PT). Units: `product.info.dimensions`
= "{{w}} × {{h}} × {{d}} cm", `product.info.weight` = "{{value}} kg". `Docs/I18N.md` carries a
15-term EN↔PT glossary (cart → carrinho, checkout → finalizar compra, promo code → código
promocional, …) referenced by the PR checklist. `eslint-plugin-i18next/no-literal-string` (JSX text
and relevant attributes) enforces "no hard-coded UI strings".

**Formatting** (`app/i18n/format.server.ts`, loaders only): `formatPrice(cents, locale)`
(`Intl.NumberFormat(intlLocale, { style: "currency", currency: "USD" })` → `$19.99` / `19,99 US$`
with U+00A0), `formatNumber` (rating `maximumFractionDigits: 1`, dimensions), `formatPercent(-0.15)`
(`{ style: "percent", signDisplay: "always", maximumFractionDigits: 0 }`), `formatDate(iso, locale)`
(`dateStyle: "medium"` inside `<time dateTime>`). Tests normalise NBSP via `tests/helpers/text.ts`.
Loader data carries formatted strings next to numeric values; components never call `Intl`.

`useLocale()` = `useRouteLoaderData("root")?.locale ?? localeFromHtmlLang(i18n.language)`.
**SEO**: `<html lang/dir>`, translated `<title>` ("{page} — {brand}") + description per route,
hreflang alternates + `x-default`; `robots.txt` allows all.

**Adding a language (3 steps)**: 1. copy `app/locales/en/` → `app/locales/fr/` and translate (tsc
reports every missing/extra key); 2. add `fr` to `LOCALES` (with plural suffixes); 3. add `fr` to
`app/locales/index.ts`. Routing, redirects, switcher, hreflang, cookie, formatting, tests and the
Playwright locale list derive from these.

**Tests**: `locales.test.ts` (identical `{{placeholder}}` sets per key, required plural suffixes per
`LOCALES[l].plurals`, no empty strings, no value equal to its key); `tests/helpers/i18n.ts`
(`parseMissingKeyHandler` throws); `i18n.spec.ts` (`/` by `Accept-Language` and by cookie; cookie
written only via the switcher; switcher preserves path + params; `/EN/cart` → 301; `/en/`;
`html[lang]`; hreflang; PT shows `US$`).

### 3.6 Accessibility architecture (WCAG 2.2 AA, with and without JS)

**Global rules**
- Landmarks (all named): `<header>` → `<nav aria-label="Main">`; `<main id="main" tabIndex={-1}>`;
  catalogue `<aside aria-labelledby="filters-heading">`; search `<form role="search">` (only search
  landmark; header search icon is a link); `<nav aria-label="Pagination">`; `<footer>` →
  `<nav aria-label="Footer">`; switcher `<nav aria-label="Language">`. Desktop nav / mobile menu
  copies use `hidden lg:block` / `lg:hidden` (removed from the a11y tree), never `sr-only`.
- Headings: one visible `<h1>` per page (catalogue "Shop", cart "Your cart", `text-h4`);
  "Categories" = `<legend><h2>`; never skip levels.
- Skip link first in `<body>` → `#main`; `html { scroll-padding-top: 6rem }`; no
  `scroll-behavior: smooth` (fights `ScrollRestoration`); the `#categories` jump link uses
  `scrollIntoView` gated by `prefers-reduced-motion`.
- Links: in-text links underlined by default (`base.css`); nav, card overlay, pagination and buttons
  opt out via class.
- Focus ring: `:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; box-shadow: 0 0 0 2px var(--color-focus-inner) }`
  (orange alone is 2.9:1 → inner medium-blue ring fixes 1.4.11; outline survives forced colors).
  `outline-none` banned except `main`.
- Focus & announcements: `AnnouncerProvider` renders two alternating `role="status" aria-live="polite" aria-atomic`
  regions and exposes `useAnnounce(message)`. `RouteAnnouncer` handles **pathname changes only**:
  close disclosures, `main.focus({ preventScroll: true })` after `ScrollRestoration`, announce
  `document.title`; routes with `handle: { initialFocus: "#search-q" }` get that element focused
  instead. Search-param changes and fetcher results are **route-owned**: catalogue/search announce
  when `navigation.state` returns to idle and `loaderData` changed; page change focuses
  `#results-heading` (`tabIndex={-1}`); Clear filter focuses the fieldset; product announces
  `product.gallery.shown{index,total}`; cart line/stepper/promo announce from `fetcher.data`; Remove
  code → focus promo input. Message table in `Docs/ACCESSIBILITY.md`.
- Forms: `noValidate` everywhere; `min`/`max`/`maxLength` as hints only; server validates and
  returns codes; on error the invalid input gets focus (`useEffect` on fetcher/action data) and, for
  no-JS renders, `autoFocus`. `useFieldIds(name)` → `{ inputId, hintId, errorId, describedBy }`;
  `Field` renders label/hint/error and takes `children: (ids) => ReactNode` (no `cloneElement`).
  Errors: `aria-invalid`, `aria-describedby`, `<p role="alert">` with icon + sr "Error:". Submit
  buttons: pending text + `aria-busy`, never `disabled` (focus kept); `AddToCartForm` ignores
  re-submits while pending. Out of stock → real `disabled` + visible text. `ButtonLink` never receives
  `aria-disabled`; blocked states omit the control.
- Targets ≥ 44×44 px (`min-h-11 min-w-11`); stepper/pagination 36 px glyph in 44 px hit area;
  checkbox 20 px in a 44 px label row.
- Images: card `<img alt="">` inside the title link; product main
  `alt={t("product.gallery.imageAlt", { title, index, total })}`; thumbnails `alt=""` in links with
  `aria-label="Show image 2 of 4"` + `aria-current`; icons `aria-hidden focusable="false"`,
  `fill="currentColor"` (Remix Icon paths, forced-colors safe).
- Never colour alone: `aria-current` + underline/filled square; `<s>` + sr "Original price"; icon +
  text for errors/stock; stars `aria-hidden` + visible numeric "4.6" + sr "Rated 4.6 out of 5,
  3 reviews" (**TO VERIFY** per-browser forced-colors SVG fill; the visible number is the guarantee).
- Reduced motion: global kill switch (`animation/transition-duration: .01ms !important`,
  `scroll-behavior: auto`); only `motion-safe:` transitions.
- Forced colors: `forced-colors:border` on cards, buttons, badges; `forced-colors:underline` on
  `aria-current` links; `forced-colors:outline-2` on the selected thumbnail; `aria-disabled` →
  `forced-colors:text-[GrayText]`.
- `prefers-contrast: more`: `tokens.css` remaps `--border → dark-gray`, `--fg-muted → fg`,
  `--surface-muted → surface`.
- Reflow / zoom: rem units, unitless line-height, `min-h` (never `h`) on text containers and
  controls, grids to one column, pagination `flex-wrap`; header `static` under `max-height: 30rem`;
  `reflow.spec.ts` asserts `scrollWidth <= 320` on every route in EN and PT and injects the WCAG
  text-spacing CSS.
- Language of parts: `lang="en"` on nodes containing API text (product `<h1>`, description, brand /
  shipping / warranty / returns `<dd>`, tags, review names/comments, card and cart titles) when the
  locale is not `en`; `lang` on language names.
- Titles unique per route and state; keyboard: DOM order = tab order; native elements only; no
  `tabindex > 0`; no focus traps.

**Component patterns**
- `SiteHeader`: brand `<a>` with real text; desktop `SiteNav` = `<ul>` of `<NavLink end>` (Home gets
  `aria-current="page"` on the catalogue), **Shop = plain `<Link>` to the same URL, no `aria-current`**,
  About/Contact/Blog `NavLink`. Below `lg`: `Disclosure` (summary `aria-label={t("common.nav.openMenu")}`,
  native `aria-expanded`) containing nav + language switcher **+ Search and Account links** whenever
  their icon buttons are hidden (at 320 px the bar shows logo, cart, menu). Cart link
  `aria-label="Cart, 3 items"` / "Cart, empty" (badge hidden at 0, `99+` above 99), badge
  `aria-hidden`. Footer nav repeats the header order (3.2.3).
- `Disclosure` (`<details class="group">`): native Enter/Space; Escape → close + focus summary;
  outside pointerdown closes; closed by `RouteAnnouncer` before `main` is focused. Known limitation:
  some AT announce "summary" — documented.
- `ProductCard`: `<li><article>` → `<img alt="" width height>`, `<h2><Link prefetch="intent" class="after:absolute after:inset-0">{title}</Link></h2>`,
  price with sr "Price", "Out of stock" text when `!inStock`; ring via `focus-within`.
- `ProductGrid`: `<ul aria-labelledby="results-heading">`, `aria-busy` + `motion-safe:opacity-60` while loading.
- `SortForm`: `<Form method="get" noValidate>` → sr `<label for="sort">` + `<select>` with option
  `value=""` labelled "Sort by" when none applied / "Default order" when one is, five options from
  `SORT_OPTIONS`; hidden `category`/`q`; **visible Apply button always; no auto-submit** (SC 3.2.2).
- `CategoryFilter`: `<aside id="categories" tabIndex={-1} aria-labelledby="filters-heading">` →
  `<form method="get" noValidate>` → `<fieldset tabIndex={-1} aria-describedby="filters-hint"><legend><h2 id="filters-heading">Categories</h2></legend><p id="filters-hint">Choose one category — results update when you choose</p>`
  + `<ul>` of checkboxes (`checked={slug === query.category}`); JS `onChange` → `navigate(buildSearch(...))`
  push; `<noscript>` Apply; "Clear filter" link when active. Jump link "Categories ↓" visible below
  `lg`, `sr-only focus:not-sr-only` at `lg+`. Single-select rendered as checkboxes: user decision,
  documented limitation.
- `ResultsSummary`: `<p id="results-heading" tabIndex={-1}>` "Showing 1–9 of 194" / "No products found".
- `Pagination`: `<ul>` keyed by page number; prev/next omitted when not applicable (focus always
  moves to `#results-heading`, so a vanishing control never holds focus); chevrons `aria-hidden` + sr
  text, `rel="prev|next"`; `aria-label="Page 3"`, current `aria-current="page"` (still a link);
  `flex flex-wrap justify-center gap-1 sm:justify-end`; `prefetch="intent"`.
- `ProductGallery`: `<figure>` main `<img fetchPriority="high" loading="eager" width height>`;
  React `preload(src, { as: "image", fetchPriority: "high" })` **during render**; thumbnails only
  when `images.length > 1`, `<Link to="?image=2" replace preventScrollReset aria-label aria-current>`.
- `Price` / `DiscountBadge`: sr "Sale price" + price + sr "Original price" + `<s aria-hidden>`; badge
  `bg-accent text-accent-fg rounded-md px-1.5 text-body-sm font-medium` `aria-hidden`
  `forced-colors:border`, value from `formatPercent`, hidden when `discountPercentage < 1`.
- `StockStatus`: icon + text; Low stock "Only {{count}} left".
- `AddToCartForm`: `fetcher.Form method="post" noValidate`, hidden `intent=add`, `noscript` `noJs`;
  `<Button disabled={!inStock} aria-describedby="stock-status">`; pending "Adding…"; status/alert below.
- `ReviewList`: only when `reviews.length > 0`; `<section aria-labelledby>` → `<ul>` of `<article>`
  with `<h3>` reviewer, `<time>`, rating, comment.
- `ProductInfoList`: `<dl>` (with `<div>` row wrappers): brand (when present), SKU, shipping,
  warranty, return policy, dimensions ("15.14 × 13.08 × 22.99 cm" with sr "by"), weight ("4 kg"),
  tags `<ul>`.
- `CartLineItem`: `<li>` → `<img alt="" width height>`, `<h2><Link lang?>{title}</Link></h2>`, unit
  price, stepper, remove button `aria-label="Remove {title}"`; `aria-busy` while its fetcher
  submits; after removal focus → next line's remove button, else previous, else empty-cart `<h1>`;
  announces `cart.removed`.
- `QuantityStepper`: one `fetcher.Form noValidate` per line, hidden `intent=set-quantity`,
  `productId`; `<VisuallyHidden><button type="submit">Update quantity</button></VisuallyHidden>` first
  in DOM; `−` = `<button name="quantity" value={q − 1} aria-label="Decrease quantity of {title}">`
  (`aria-disabled` at 1 and `preventDefault`; server clamps 0 → 1 without JS);
  `<input type="text" inputMode="numeric" pattern="[0-9]*" name="quantity" aria-label="Quantity of {title}">`;
  `+` = `value={q + 1}`; JS submits the input on `change`; values derive from in-flight `fetcher.formData`.
- `CartSummary`: `<section aria-labelledby>` `<dl>` Subtotal / "Discount (LTP10)" / Shipping ("Free"
  with FREESHIP) / `<strong>Total`; announcement "Total updated: …" via `useAnnounce`.
- `PromoCodeForm`: `fetcher.Form noValidate`, `Field` label "Promo code", hint "Try LTP10 or FREESHIP",
  `autoComplete="off" autoCapitalize="characters"`; applied state replaces input with "Code LTP10
  applied" + Remove code.
- `CheckoutActions`: `<Form method="post">` buttons `name="payment" value="card"` (Check out) and
  `value="paypal"` ("Or pay with PayPal"), `aria-describedby="checkout-demo-note"`; rendered only
  when the cart is non-empty.
- `EmptyState` / `EmptyCart` / `CartNotice` / `ErrorPage` / `ComingSoon`: static headings, no
  live-region role except `CartNotice` (`role="status" tabIndex=-1`, `autoFocus` on no-JS renders).
- `SiteFooter`: `<footer>` outside `<main>`, `fg-inverse` text only on `surface-inverse`, brand, nav
  in header order, language links with `hrefLang`/`lang`/`aria-current`, "Coding challenge for LTP
  Labs — demo store".

**Testing**: static `jsx-a11y` strict with `components = { Button: "button", ButtonLink: "a", Checkbox: "input", Select: "select" }`;
unit RTL queries by role/name, `toHaveAccessibleName`, `aria-current`, `toBeInvalid`, focus rules
with `user-event`; e2e `a11y.spec.ts` = IBM `accessibility-checker`: `tests/e2e/a11y-check.ts`
exports `expectAccessible(page, label)` = `const { report } = await getCompliance(page, label); expect(assertCompliance(report)).toBe(0)`
(labels unique per route × locale × state, `close()` in a global teardown), `.achecker.yml`
`policies: [WCAG_2_2]`, `failLevels: [violation, potentialviolation]`; run on every route in
`tests/e2e/routes.ts` × `en/pt`, plus open disclosures, error states (mock-API fault injection),
empty cart, `page.emulateMedia({ reducedMotion: "reduce" })` / `({ forcedColors: "active" })`;
`keyboard.spec.ts` (skip link, tab order, menu Escape restores focus, open menu → About →
`activeElement === main`, stepper, focus after remove / page change / clear filter). Manual protocol
(`Docs/ACCESSIBILITY.md` audit log): VoiceOver + Safari full flows; NVDA + Firefox when a Windows
machine is available (else logged as not run); 400 % zoom; Chrome vision-deficiency emulation
(4 modes); text-spacing bookmarklet; keyboard-only run; Lighthouse a11y.

### 3.7 Design system

`app/styles/tokens.css`:
```css
/* 1. Raw ltplabs.com palette — no utilities generated */
:root {
  --palette-white:#fff; --palette-black:#121211; --palette-dark-blue:#10131c; --palette-dark-blue-lighter:#1c1f27;
  --palette-medium-blue:#12173a; --palette-medium-blue-lighter:#242b42; --palette-blue:#16105f; --palette-orange:#ff6a00;
  --palette-light-green:#007474; --palette-light-gray:#f4f7f9; --palette-medium-gray:#eaecf0; --palette-dark-gray:#6a6a68;
  --palette-error:#e5484d; --palette-error-text:#b42318; /* derived for AA error text (approved) */
}
/* 2. Semantic roles (light). A future theme = one :root[data-theme="…"] block. */
:root {
  --surface:var(--palette-white); --surface-muted:var(--palette-light-gray); --surface-placeholder:var(--palette-medium-gray);
  --surface-inverse:var(--palette-dark-blue); --fg:var(--palette-dark-blue); --fg-muted:var(--palette-dark-gray); --fg-inverse:var(--palette-white);
  --primary:var(--palette-medium-blue); --primary-hover:var(--palette-medium-blue-lighter); --primary-fg:var(--palette-white);
  --accent:var(--palette-orange); --accent-fg:var(--palette-medium-blue); --link:var(--palette-medium-blue); --link-hover:var(--palette-blue);
  --border:var(--palette-medium-gray); --border-strong:var(--palette-dark-gray); --focus:var(--palette-orange); --focus-inner:var(--palette-medium-blue);
  --success:var(--palette-light-green); --error:var(--palette-error-text); --error-border:var(--palette-error);
}
@media (prefers-contrast: more) { :root { --border:var(--palette-dark-gray); --fg-muted:var(--fg); --surface-muted:var(--surface); } }
/* 3. Tailwind utilities — semantic colours only */
@theme {
  --color-*: initial;
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-weight-*: initial; --font-weight-normal:400; --font-weight-medium:500; --font-weight-semibold:600;
  --text-h1:3rem; --text-h1--line-height:1.3; --text-h1--letter-spacing:-0.0625rem;
  --text-h2:2.25rem; --text-h2--line-height:1.3; --text-h2--letter-spacing:-0.0625rem;
  --text-h3:1.75rem; --text-h3--line-height:1.4;  --text-h4:1.375rem; --text-h4--line-height:1.4;  --text-h5:1.125rem; --text-h5--line-height:1.4;
  --text-body:1rem; --text-body--line-height:1.6; --text-body-sm:.875rem; --text-body-sm--line-height:1.6; --text-tagline:.875rem; --text-tagline--line-height:1.2;
  --shadow-header: 0 4px 7.5px rgb(8 10 25 / 0.05);  --radius-block:1.5rem;  --spacing-header:3.75rem; --spacing-header-lg:4rem;
}
@theme inline {
  --color-surface:var(--surface); --color-surface-muted:var(--surface-muted); --color-surface-placeholder:var(--surface-placeholder); --color-surface-inverse:var(--surface-inverse);
  --color-fg:var(--fg); --color-fg-muted:var(--fg-muted); --color-fg-inverse:var(--fg-inverse);
  --color-primary:var(--primary); --color-primary-hover:var(--primary-hover); --color-primary-fg:var(--primary-fg);
  --color-accent:var(--accent); --color-accent-fg:var(--accent-fg); --color-link:var(--link); --color-link-hover:var(--link-hover);
  --color-border:var(--border); --color-border-strong:var(--border-strong); --color-focus:var(--focus); --color-focus-inner:var(--focus-inner);
  --color-success:var(--success); --color-error:var(--error); --color-error-border:var(--error-border);
}
```
`--text-*--letter-spacing` is documented in Tailwind v4; `transparent`/`current`/`inherit` survive
`--color-*: initial`. Radii and breakpoints keep Tailwind defaults (equal to ltplabs').

**Contrast** (recomputed): dark-blue 18.6:1 (`fg`, `surface-inverse`); medium-blue 17.4:1 (`primary`,
`link`, `focus-inner`, `accent-fg`); blue 16:1 (`link-hover`); dark-gray 5.4:1 (`fg-muted`,
`border-strong`; avoid muted text on `surface-placeholder`); medium-gray 1.2:1 (decorative only);
orange 2.9:1 (**never text**; badge bg with medium-blue text 6.1:1; outer focus ring); light-green
5.6:1 (`success`); #e5484d 3.9:1 (`error-border`, non-text); #b42318 6.6:1 (`error` text).

`base.css`: `body { @apply bg-surface text-fg font-sans text-body antialiased }`; headings weight 400
(bold = 500, never 700); `html { scroll-padding-top: 6rem }`; underlined in-text links
(`text-underline-offset: .15em`); two-tone `:focus-visible`; reduced-motion kill switch;
forced-colors base rules.

`fonts.css`: `@font-face { font-family: "Manrope"; font-style: normal; font-weight: 400 600; font-display: swap; src: url("../fonts/manrope-latin.woff2") format("woff2"); unicode-range: <Google latin range> }`
— Google Fonts serves one variable woff2 (~24 KB) — **TO VERIFY** the served file carries the full
weight axis. `app/fonts/OFL.txt` ships with the file.

**Component inventory**

| Component | Props | Notes |
|---|---|---|
| `Button` / `ButtonLink` | `variant: primary\|secondary\|ghost\|icon; size?: md\|sm; pending?; pendingLabel?` | primary `bg-primary text-primary-fg rounded-xl min-h-11 px-5 py-2 text-tagline font-medium`; icon `size-11 rounded-xl`; `motion-safe:transition-colors` |
| `Icon` | `name: IconName; className?` | `<svg aria-hidden focusable="false" fill="currentColor" viewBox="0 0 24 24">` — ~12 Remix Icon paths in one file |
| `VisuallyHidden` | `as?; children` | |
| `Field` | `name; label; hint?; error?; children: (ids: FieldIds) => ReactNode` | uses `useFieldIds` |
| `Checkbox` | `label` + input attrs | `size-5 accent-primary`, 44 px label row |
| `Select` | `label; hideLabel?; options` | `min-h-9 rounded-lg border-border-strong ps-3 pe-9` + chevron |
| `Alert` | `children` | `role="alert"`, icon, sr "Error:" |
| `Disclosure` | `summary; summaryLabel?; children` | `<details class="group">` |
| `Price`, `DiscountBadge`, `Rating` (`value; count; valueFormatted`), `DefinitionList` | preformatted strings | |
| `AnnouncerProvider` / `useAnnounce`, `RouteAnnouncer`, `NavigationStatus` | — | layout |
| `PageContainer` | `children; className?` | `mx-auto w-full max-w-[87rem] px-4 lg:px-6` |
| `SiteHeader` (`cartCount`), `SiteNav`, `HeaderActions`, `LanguageSwitcher`, `SiteFooter`, `SkipLink` | | |
| `CatalogueResults` (`view; buildSearch`), `SortForm`, `ResultsSummary`, `CategoryFilter`, `ProductCard` (`product; priority?`), `ProductGrid`, `Pagination`, `EmptyState` (`title; body; action?`) | | |
| `ProductGallery`, `StockStatus`, `AddToCartForm`, `ProductInfoList`, `ReviewList` | `ProductView` slices | |
| `CartLineItem` (`item`), `QuantityStepper`, `CartSummary` (`totals`), `PromoCodeForm`, `CheckoutActions`, `EmptyCart`, `CartNotice` | | |
| `ComingSoon` (`page`), `ErrorPage` (`status; title; description; actions`), `RouteErrorBoundary` | | |

Logo: `common.brand` rendered `text-h5 font-semibold uppercase tracking-tight text-primary`.

**Header / footer anatomy & documented deviations from ltplabs.com**: header wrapper
`sticky top-0 z-40 px-4 pt-4 lg:px-6 lg:pt-6 [@media(max-height:30rem)]:static`; card
`mx-auto flex min-h-header max-w-[87rem] items-center justify-between rounded-2xl bg-surface ps-6 pe-3 shadow-header lg:grid lg:min-h-header-lg lg:grid-cols-[1fr_auto_1fr]`;
nav items `rounded-lg px-2.5 py-2 text-tagline font-medium text-primary hover:bg-surface-muted aria-[current=page]:bg-surface-muted aria-[current=page]:underline`;
outlined icon buttons; cart badge `absolute -end-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-[0.6875rem] text-accent-fg`.
Footer `rounded-t-3xl bg-surface-inverse p-8 lg:p-12 text-fg-inverse`. Deviations (in
`DESIGN_SYSTEM.md`): `sticky` instead of `fixed`; outlined medium-blue icon buttons instead of orange
squares (contrast); `<nav><ul><NavLink>` instead of ltplabs' `<div>` of `<button aria-haspopup>`;
Manrope logo instead of a condensed cut; wireframe's bottom border replaced by the card shadow;
visible page `<h1>` and minimal footer not in the wireframes.

### 3.8 Responsive layout per screen

Mobile-first, default breakpoints; every grid collapses to one column at 320 px; primary buttons
full-width on phone.

| Screen | Phone | Tablet | Desktop |
|---|---|---|---|
| **Home** (`grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]`) | `<h1>`; toolbar `flex flex-wrap items-center justify-between gap-4` (SortForm + Apply, Showing, "Categories ↓" jump link); grid `grid-cols-1 gap-6`; pagination `flex-wrap justify-center`; aside below (DOM: toolbar → grid → pagination → aside) | `sm:grid-cols-2` | aside `lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-start` (**not sticky**: 24 × 44 px rows exceed a 768 px viewport); grid `lg:grid-cols-3`; pagination `lg:justify-end` |
| **Product** (`grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12`) | gallery `aspect-square rounded-2xl bg-surface-placeholder object-contain`, thumbnails `flex gap-2 overflow-x-auto size-16`; title `text-h3 font-medium`, rating, price `text-h4`, stock, Add to cart full width, description `text-body-sm`, `<dl>`, reviews | title `md:text-h2` | two columns; reviews `lg:col-span-2` |
| **Cart** (`grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12`) | `<h1>`; `<ul class="divide-y divide-border">`, line `grid grid-cols-[5rem_1fr] gap-4 py-6`, thumbnail `size-20`; summary card `rounded-2xl border border-border p-6` after the list | line `sm:grid-cols-[7rem_1fr_auto]`, thumbnail `sm:size-28` | summary `lg:sticky lg:top-28` (static under `max-height: 30rem`) |
| **Search** | visible `<label>` + `input type="search" autoComplete="off"` + "Search" button, stacked above toolbar/grid/pagination (no aside) | `sm:grid-cols-2` | `lg:grid-cols-3` |
| **Coming soon / 404 / confirmation / empty cart** | centred `max-w-prose`, `text-h2` heading, body, `ButtonLink` | same | `md:text-h1` |

Header: `< lg` → logo + Search/Account/Cart icons + hamburger; at 320 px → logo + Cart + hamburger
(Search/Account inside the menu); `lg+` → 3-column card.

### 3.9 Performance plan

- Rendering: full SSR via the default streaming entry (`onAllReady` for bots, `onShellReady`
  otherwise); no deferred data, no `clientLoader`; `ScrollRestoration` on.
- API cost: TTL cache; parallel cached fetches in the cart loader; `shouldRevalidate` skips `?image`
  changes; 8 s timeout; `prefetch="intent"` on cards, pagination and nav links.
- HTTP: `responseHeadersMiddleware` sets `Cache-Control: private, no-cache` (pages depend on the cart
  cookie), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY` (no CSP; justified in ARCHITECTURE.md). `@react-router/serve`: `/assets`
  immutable 1 y, `public/` 1 h, gzip, `morgan("tiny")` (verified).
- Fonts: one variable woff2 (~24 KB) hashed by Vite, `font-display: swap`, one preload.
- Images: DummyJSON webp (~60 KB, single size, CDN `no-store`); every `<img>` has `width`/`height`
  in an `aspect-square` box → zero CLS; first three cards `loading="eager"` (first
  `fetchPriority="high"`), rest `loading="lazy" decoding="async"`; product main image
  `fetchPriority="high"` + render-time `preload()`; `preconnect` to the CDN.
- Bundle: runtime deps only react, react-dom, react-router, @react-router/node, @react-router/serve,
  i18next, react-i18next, remix-i18next, isbot. Inline SVG icons, `cx()`, Intl, `.server.ts`
  isolation, automatic route splitting, bundled translations. Budget: catalogue route < 90 KB gzipped
  JS, CSS < 15 KB; measured with `gzip -c build/client/assets/<chunk>.js | wc -c` and recorded in the README.
- Core Web Vitals: LCP = preloaded font + eager hero + SSR; CLS ≈ 0; INP = native controls,
  fetchers. Lighthouse mobile run once before release (targets ≥ 90 perf / 100 a11y) recorded in
  README; no perf gate in CI.

### 3.10 Tooling & CI

- Node/npm: `.nvmrc` = `24`; `.npmrc` `engine-strict=true`; `engines.node ">=22.22"`; `"type": "module"`;
  lockfile committed.
- **Licence policy** (decision 30): before adding any package, run `npm view <pkg> license` and check
  its dependency tree; `scripts/check-licenses.mjs` (≈ 30 lines, Node only) reads every
  `node_modules/**/package.json`, normalises SPDX expressions, and exits 1 on anything outside the
  allow-list `MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, Unlicense, 0BSD, CC0-1.0, OFL-1.1`
  (or a missing licence field) — wired as `npm run check:licenses` in `check` and in CI.
- Scripts: `dev`, `build`, `start`, `typecheck` (`react-router typegen && tsc`), `lint`, `lint:fix`,
  `format`, `format:check`, `test`, `test:watch`, `test:e2e`, `test:e2e:ui`, `check:licenses`,
  `check` (typecheck && lint && format:check && check:licenses && test), `prepare` (husky).
- Env (`.env.example`): `SESSION_SECRET=change-me`, `DUMMYJSON_BASE_URL=https://dummyjson.com`,
  `APP_ORIGIN=` (optional, hreflang behind a proxy), `COOKIE_SECURE=false`, `PORT=3000`.
  `react-router dev`/`build` load `.env` (verified); `react-router-serve` does **not** — CI and
  Playwright export variables explicitly.
- TypeScript: scaffold + `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `paths { "~/*": ["./app/*"] }`,
  `rootDirs` with `.react-router/types`.
- ESLint (flat, **pinned `eslint@^9.39` + `@eslint/js@^9.39`** — ESLint 10 is rejected by
  `eslint-plugin-jsx-a11y` 6.10 / `eslint-plugin-react` 7.37 peers): `@eslint/js` recommended →
  `typescript-eslint` recommended → `eslint-plugin-react` jsx-runtime →
  `reactHooks.configs.flat.recommended` → `jsxA11y.flatConfigs.strict` + component mapping →
  `eslint-plugin-i18next` (`no-literal-string` on JSX text + `aria-label`/`alt`/`title`/`placeholder`,
  ignoring `className`, `to`, `href`, `name`, `value`) → project rules (`consistent-type-imports`,
  `no-console: warn`, `no-restricted-imports` banning `react-router-dom`) → `eslint-config-prettier`.
  No official React Router ESLint config exists (confirmed).
- Prettier: `{ "plugins": ["prettier-plugin-tailwindcss"], "tailwindStylesheet": "./app/styles/app.css", "tailwindFunctions": ["cx"], "printWidth": 100 }`.
- Vitest 5 (`vitest.config.ts`, no React Router plugin; peers `vite ^6.4 || ^7 || ^8`): `jsdom`,
  `setupFiles`, `include: ["app/**/*.test.{ts,tsx}"]`, `resolve.tsconfigPaths`. `createRoutesStub`
  for route-aware components. Loaders/actions are **not** unit-tested (constructing a
  `RouterContextProvider` with the i18next instance outside middleware — **TO VERIFY**); e2e covers them.
- Playwright: `testDir: "tests/e2e"`, `fullyParallel`, `forbidOnly: !!CI`, `retries: CI ? 1 : 0`,
  `reporter: CI ? [["github"],["html"]] : "list"`, `use: { baseURL: "http://localhost:3000", trace: "on-first-retry" }`,
  `webServer: [ mock API (node tests/e2e/mock-api.server.ts, url /products/categories), app (npm run build && npm run start, env SESSION_SECRET=e2e, DUMMYJSON_BASE_URL=http://localhost:4010) ]`,
  `reuseExistingServer: !CI`. **Four Chromium projects**: `desktop-chromium` (1280×800,
  `testIgnore: /no-js/`), `mobile-chromium` (Pixel 7, `testIgnore: /no-js/`), `no-js`
  (`javaScriptEnabled: false`, `testMatch: /no-js/`), `pt` (`locale: "pt-PT"`,
  `testMatch: /i18n|catalogue|cart|reflow/`). `reflow.spec.ts` uses `test.use({ viewport: { width: 320, height: 256 } })`.
  `tests/e2e/routes.ts` exports the route list every feature PR appends to.
- A11y engine: `accessibility-checker` (IBM Equal Access, Apache-2.0) scans the Playwright `page`
  object; `.achecker.yml` at the root; results in `test-results/a11y` (ignored). Its optional
  Puppeteer/chromedriver binaries are not needed (we pass a Playwright page) — set
  `PUPPETEER_SKIP_DOWNLOAD=1` in `.npmrc`/CI and disable IBM telemetry via env (**TO VERIFY** the
  exact variable names and the `outputFolder` key in the current version).
- Mock API (`tests/e2e/mock-api.server.ts`, ~80 lines, no deps, erasable-syntax TypeScript —
  **TO VERIFY** Node 24 type stripping runs it directly; fallback `.mjs`): serves
  `products-all.json` (194 summaries) implementing `limit/skip/select/sortBy/order`,
  `/products/category/:slug`, `/products/search?q=`, `/products/:id` from 10 full fixtures
  (including the 4 stock-0 ids), `/products/categories`; fault injection: `/products/999` → 500,
  `/products/998` → 10 s delay, `?fail=1` on categories → 500. Fixture refresh procedure in
  `ARCHITECTURE.md`.
- Husky + lint-staged + commitlint: `commitlint.config.js` `extends: config-conventional`,
  `scope-enum` = `scaffold, tooling, ui, i18n, shell, api, catalogue, product, cart, a11y, docs, ci`,
  scope optional.
- GitHub Actions (`ci.yml`): triggers `pull_request` + `push` to `development`/`main`;
  `concurrency` cancel-in-progress. Job `quality`: checkout (fetch-depth 0), setup-node
  (`node-version-file: .nvmrc`, `cache: npm`), `npm ci`, commitlint `--from origin/${{ github.base_ref }} --to HEAD`
  (PRs), **PR title lint** (`echo "${{ github.event.pull_request.title }}" | npx commitlint` — the
  squash commit message), `check:licenses`, typecheck, lint, format:check, test, build. Job `e2e` (needs quality):
  `npx playwright install --with-deps chromium`, `npm run test:e2e`, upload `playwright-report` on
  failure. Merge methods per branch (squash for `development`, merge commit for `main`) configured
  with GitHub **rulesets**.

---

## 4. Git workflow & feature-branch plan

**Model**: `main` ← `development` ← `feature/<slug>`; one PR per feature, squash-merged into
`development` (PR title = Conventional Commit, linted in CI); `development → main` via merge commit
per release (`chore(release): vX.Y.Z`), tagged; hotfixes `fix/<slug>` from `main` merged into both.
**Commits**: Conventional Commits, English, imperative, ≤ 72-char subject, body says why;
Claude-authored commits end with the session's attribution trailer.

**Dependencies between phases**: the header takes `cartCount` from the layout loader, which returns
`0` until branch 10; `tests/e2e/routes.ts` grows per PR; branch 9 ships the product page without the
Add-to-cart button (stated in its PR description).

| # | Branch | Scope | Done when |
|---|---|---|---|
| 1 | `feature/project-scaffold` | `npx create-react-router@latest`, `~` alias, dotfiles, `.env.example`, `Docs/` skeleton, README skeleton, `.gitignore` | `npm run dev` serves; `typecheck` passes |
| 2 | `feature/tooling` | ESLint 9 (+jsx-a11y, +i18next), Prettier, Vitest, Playwright + `accessibility-checker` skeleton (`.achecker.yml`, `a11y-check.ts`), `scripts/check-licenses.mjs`, Husky, lint-staged, commitlint, CI, PR template, `CONTRIBUTING.md`, smoke tests | `check` + `test:e2e` green locally and on a PR; a bad commit message is rejected; `check:licenses` passes on the full tree and fails on a deliberately added MPL/GPL package (shown in PR, then reverted) |
| 3 | `feature/design-system` | styles, font + OFL, `ui/*` with tests, `cx`, `Icon` (Remix Icon paths + attribution), `DESIGN_SYSTEM.md` | every `ui/*` has a role/name test; contrast table reproduced with a tool; font appears once in `build/client/assets` |
| 4 | `feature/i18n-foundation` | `i18n/*`, `locales/*` (common), middleware, entries, `routes.ts` skeleton, `locale-errors`, `set-language`, `I18N.md` | `/` → `/pt` with `Accept-Language: pt`; cookie set only by switcher; `/xx/…` and `/EN/…` redirect; deleting a PT key fails `tsc` (shown in PR) |
| 5 | `feature/app-shell` | skip link, header, footer, announcer, navigation status, headers middleware, error boundaries, coming-soon, hreflang, a11y/keyboard/i18n specs, `ACCESSIBILITY.md` v1 | a11y scan clean on `/en`, `/pt`, `/en/about`, `/en/nowhere`; skip link → main; menu Escape restores focus; open menu → About → focus on main |
| 6 | `feature/dummyjson-client` | client, types, guards, cache (TTL + in-flight dedupe), product functions, `lib/catalogue`, `format.server`, fixtures, mock API — all written against `Docs/dummyjson-openapi.yaml` | unit: URL mapping, 404 → null, 429/timeout/HTML body → 502, guard → 502, dedupe; mock API serves all fixtures + faults and mirrors the contract behaviours |
| 7 | `feature/catalogue` | catalogue route + components | e2e: 9 cards; "Showing 1–9 of 194"; sort changes first title; category total; page 22 ok, 23 → 404; `?category=foo` → 302; no-JS Apply works; focus on results heading after page change |
| 8 | `feature/search` | search route, header link | e2e: "phone" paginated; empty q focuses input; no-result state |
| 9 | `feature/product-detail` | product route (no add button yet) | e2e: thumbnail switch without `.data` request; stock-0 product shows disabled button + text; id 9999 → 404 in shell |
| 10 | `feature/cart-session` | session, `cart.ts`, `totals.ts`, `intents.ts`, `add` action, `AddToCartForm`, header count | no-JS: add twice → badge 2, refresh does not re-add; tampered cookie → empty cart, no 500; 50-line cookie < 4000 B; 51st line → `cart-full` |
| 11 | `feature/cart-page` | cart route, line items, stepper, remove, summary, promo, checkout, confirmation | e2e: clamp at stock; remove → focus next line; `LTP10` reduces total; `FREESHIP` shows Free; checkout → confirmation → reload and language switch keep it |
| 12 | `feature/a11y-audit` | reflow/emulateMedia tests, a11y scan on all states, manual audit fixes and log | reflow green on every route EN+PT; zero `accessibility-checker` violations across the matrix; VoiceOver log filled |
| 13 | `feature/performance` | preload, preconnect, image priorities, header check, bundle review, Lighthouse | Lighthouse mobile ≥ 90 / a11y 100 recorded; catalogue JS < 90 KB gzipped recorded |
| 14 | `feature/docs-release` | README final (challenge checklist), `ARCHITECTURE.md`, `DECISIONS.md` (TO VERIFY resolved), `CHANGELOG.md`; release `v1.0.0` | checklist complete; every TO VERIFY resolved; tag pushed |

**PR template checklist**: Summary · Scope · Screenshots (1440 / 390 / 320 / no-JS when relevant) ·
`npm run check` · e2e incl. a11y scan · works without JS · keyboard walkthrough · VoiceOver (or N/A +
reason) · 400 % zoom · reduced motion · forced colors · every string in EN and PT (glossary
respected) · logical properties only · no new dependency without approval · **every new
dependency, font, icon or snippet has a permissive licence (no commercial, no copyleft) and
`check:licenses` passes** · docs updated · bundle reviewed · `tests/e2e/routes.ts` updated.

---

## 5. Markdown documentation set (all in English)

| Path | Outline |
|---|---|
| `README.md` | Project + Remix → React Router v8 lineage (PDF says "Remix"; Remix v2 is EOL; LTP's email allows React Router); stack/versions; quick start; scripts; **Challenge checklist** (PDF requirement → route/component/test); repository map; testing (pyramid, Playwright projects, mock API, how to run one project); demo promo codes; performance results (budgets, Lighthouse, measurement command); limitations (single-size images, English product data, cookie cart last-write-wins, `minimumOrderQuantity` ignored, cm/kg assumption); cookies note (`lng`, `__cart` strictly necessary — no banner); **licence policy** (permissive only, allow-list, `check:licenses`) and third-party credits (DummyJSON, Manrope OFL-1.1, Remix Icon Apache-2.0, IBM Equal Access Apache-2.0); no project licence file (all rights reserved) |
| `Docs/ARCHITECTURE.md` | Request lifecycle; route tree + per-route table; URL contract; screen-state matrix; error/notice code table; view-model types; server-only formatting; cart session flow, intents, PRG, concurrency; DummyJSON layer (points to `Docs/dummyjson-openapi.yaml` as the contract; endpoints used, params, rate-limit strategy, guards, TTLs, fixture refresh, assumptions); progressive-enhancement matrix; security paragraph (signed `__cart`, validated `lng`, SameSite=Lax + same-origin POSTs = no CSRF token, secret rotation, headers rationale, no user HTML); file conventions; "add a page" recipe |
| `Docs/I18N.md` | Locale routing/redirect matrix; middleware + entries; typed resources; 3-step add-a-language; naming/plural/interpolation rules; glossary; formatting API; switcher + cookie rule; hreflang; tests; RTL readiness |
| `Docs/ACCESSIBILITY.md` | Target/scope; global rules; component pattern table; announcement/focus table (event → key → target); focus-ring rationale; automated coverage; manual protocol + audit log; known limitations (`<details>`, single-select checkboxes, ltplabs nav semantics improved on purpose) |
| `Docs/DESIGN_SYSTEM.md` | Token layers + contrast table; type scale; radii/shadows/spacing; breakpoints and per-screen layouts; header/footer anatomy; component inventory; how to add a theme; icon rules; deviations from ltplabs.com and wireframes |
| `Docs/DECISIONS.md` | ADR-lite entries (one per key decision in §6), assumptions, TO VERIFY resolutions |
| `CONTRIBUTING.md` | Branch model, PR flow, squash/merge rules, commit convention + scopes, release/tagging, rulesets, Definition of Done table, **dependency & licence policy** (how to check a licence before adding a package, the allow-list, what to do when a needed package is copyleft: find a permissive alternative or ask) |
| `CHANGELOG.md` | Keep-a-Changelog; `## [1.0.0]` lists the 14 PRs |
| `.github/PULL_REQUEST_TEMPLATE.md` | Checklist from §4 |

---

## 6. Key decisions with rationale (→ `Docs/DECISIONS.md`)

1. `:lang` validated in a layout **middleware** (runs before parallel loaders); unknown prefixes
   302, upper-case 301, asset-like segments 404 without redirect.
2. remix-i18next detection is URL-only (`order: ["custom"]`); in-repo `detectLocale` (cookie →
   Accept-Language → EN) only serves `/` and un-prefixed redirects. `?lng=` cannot override the URL.
3. `lng` cookie written only by the `set-language` action (explicit switch); following a shared
   `/pt/…` link never changes a user's memory.
4. Inner pathless `locale-errors` layout hosts the shared `RouteErrorBoundary` so leaf errors render
   inside the mounted shell; the layout boundary rebuilds the shell; the root boundary is shell-less.
5. Product route owns `add`; cart route owns `set-quantity | remove | apply-promo | remove-promo | checkout`.
   No relative increment intents — absolute quantities are idempotent.
6. Fetcher responses return `data()` + `Set-Cookie`; no-JS submissions get a 303 + flash (PRG).
7. `lastOrder` persisted with `session.set`, cleared by the next mutation; confirmation never revalidates.
8. One i18next namespace from domain files; PT `satisfies` EN; `_many` in both locales.
9. Intl formatting in loaders only (no ICU hydration mismatch).
10. Client i18next takes `lng` from `<html lang>`; init awaited before hydration; no browser detector.
11. Translations bundled; no fetch backend; no zod; hand-written guards.
12. Three-layer tokens, `--color-*: initial`, `prefers-contrast` remap.
13. Orange confined to non-text; derived error text #b42318; outlined icon buttons; underlined links.
14. One variable Manrope file + OFL.txt, hashed by Vite, one preload.
15. Sticky floating header, static under `max-height: 30rem`; category aside not sticky.
16. Sort = visible Apply, no auto-submit; category checkbox navigates on change with an advisory hint;
    push history for state params, replace for `?image`.
17. Unknown category → canonical redirect; out-of-range page → 404; categories fetched first.
18. Route-owned announcements through `useAnnounce`; `RouteAnnouncer` only on pathname change.
19. `noValidate` everywhere; text/numeric stepper input; server codes only; `autoFocus` for no-JS errors.
20. Server TTL cache + `Cache-Control: private, no-cache` via root middleware.
21. Fixture-backed mock API with fault injection in e2e/CI; four Chromium Playwright projects.
22. Home and Shop link to `/:lang`; only Home gets `aria-current`. Visible `<h1>` on every page.
23. Checkout and PayPal share the `checkout` intent with a labelled demo confirmation.
24. Cards show title + price (+ "Out of stock"); `select` trimmed accordingly.
25. No new runtime dependencies; ESLint pinned to 9; `eslint-plugin-i18next` guards literals.
26. Permissive licences only (no commercial, no copyleft) for every dependency, font, icon and
    snippet, enforced by `scripts/check-licenses.mjs` in `check` and CI.
27. IBM `accessibility-checker` (Apache-2.0, `WCAG_2_2` policy) instead of axe-core (MPL-2.0).

---

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| `findLocale` args may not expose `url` | TO VERIFY in branch 4; fallback strips `.data` from `request.url` |
| `Route.ErrorBoundaryProps.loaderData` empty for the layout boundary | Fallback `cartCount = 0`; leaf errors go to `locale-errors` anyway |
| Vite `?url` import vs CSS `url()` producing two font copies; served file's weight axis | Check `build/client/assets` in branch 3; fallback `public/fonts/`; declare `400 600` |
| `/en/` trailing-slash matching | e2e asserts catalogue renders; add redirect if needed |
| Node type-stripping for the mock API | Erasable syntax only; fallback `.mjs` |
| Forced-colors SVG fill behaviour for stars | Visible numeric rating in all modes |
| DummyJSON availability / rate limits / `no-store` images | Mock API in CI, TTL cache, timeouts, 502 boundary; documented |
| Single-select filter as checkboxes | Hint, immediate replacement, Clear filter; documented |
| `<details>` announced as "summary" by some AT | Accepted; documented |
| Sticky header at 400 % zoom | `static` under `max-height: 30rem`; reflow spec |
| Cookie cart cross-tab last-write-wins; secret rotation empties carts | Documented |
| Windows AT untestable on macOS | Audit log states what ran |
| Loaders/actions not unit-tested | e2e coverage; DoD per phase |

## 8. TO VERIFY during implementation (resolve and record in `Docs/DECISIONS.md`)

1. remix-i18next 8 `findLocale` args carry `url` (else strip `.data` from `request.url`).
2. `Route.ErrorBoundaryProps.loaderData` populated for the layout boundary.
3. Font `?url` import hash parity with the CSS `url()`; served Manrope variable file's weight axis.
4. `/en/` (trailing slash) matches the `:lang` index route.
5. Node 24 type stripping runs `tests/e2e/mock-api.server.ts` directly.
6. Forced-colors SVG `fill="currentColor"` behaviour for rating stars per browser.
7. Unit-testing loaders with a hand-built `RouterContextProvider` (else e2e only).
8. `accessibility-checker`: env variable names to skip the Puppeteer Chromium download and to
   disable IBM telemetry; `.achecker.yml` `outputFolder` key; `getCompliance` accepting a Playwright
   `Page` in the installed version; `assertCompliance` return codes (0 = pass).

## 9. Verification (end-to-end)

- Every branch: `npm run check` (typecheck + lint + format + unit) and `npm run test:e2e` (mock API
  + built app, four Chromium projects incl. no-JS and pt-PT) green locally and in CI before the PR
  is squash-merged into `development`.
- Challenge acceptance (branch 14 README checklist): Homepage lists products with links, sort,
  single-category filter, pagination, "Showing x–y of N"; product page has every wireframe element +
  extras and "Add to cart" updates the header count; cart page reachable from the header icon shows
  items, quantities, total, removal; responsive at 320 / 390 / 768 / 1440; loaders/actions used for
  every read/mutation; routing per `app/routes.ts`; repo on GitHub with `main` / `development` /
  feature PRs.
- i18n acceptance: `/` → `/pt` with `Accept-Language: pt`; switcher persists the choice and keeps
  the current page + query; PT shows `19,99 US$`; deleting a PT key fails `tsc`; `locales.test.ts`
  green; no literal strings pass `eslint-plugin-i18next`.
- Accessibility acceptance: zero `accessibility-checker` (WCAG 2.2) violations on every route ×
  locale × state; keyboard specs green; reflow at 320 px green in EN and PT; reduced-motion and
  forced-colors emulation green; manual VoiceOver log filled in `Docs/ACCESSIBILITY.md`.
- Responsive acceptance: every screen checked at 320 / 390 / 768 / 1024 / 1440 px (Playwright
  desktop + mobile projects + reflow spec); no horizontal scroll; screenshots in each PR.
- Licence acceptance: `npm run check:licenses` green on the full `node_modules` tree; README
  credits list every third-party asset with its permissive licence.
- Performance acceptance: Lighthouse mobile ≥ 90 / a11y 100; catalogue JS < 90 KB gzipped;
  CSS < 15 KB; figures recorded in README.

## 10. Changes versus the workflow draft (for traceability)

- Language switcher: `?lng=` links + middleware cookie step → **POST `set-language` resource route**
  (mutation = action; simpler middleware; still no-JS friendly). Middleware step 4 removed.
- Headings: sr-only `<h1>` → **visible small `<h1>`** on catalogue and cart (user decision 21).
- Open questions 1–16 resolved by decisions 18–28 (no LICENSE file, `robots.txt` allow all,
  Chromium only, cm/kg, LTP10 + FREESHIP, minimal footer, cards title + price, inline Remix Icon,
  hand-written guards, `eslint-plugin-i18next`, #b42318 error text, mock API for e2e).
- Licence policy added (decision 30): permissive-only, enforced by `scripts/check-licenses.mjs`;
  `@axe-core/playwright` (MPL-2.0) replaced by IBM `accessibility-checker` (Apache-2.0) — decision 31.
- §1.2 now states explicitly that the wireframes are desktop references and every screen must be
  responsive down to 320 px.
