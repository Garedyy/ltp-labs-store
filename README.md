# The Online Store (LTP Labs frontend challenge)

A small e-commerce app (catalogue, product detail, cart) built for the LTP Labs frontend coding
challenge on the DummyJSON products API. It renders on the server, speaks English and Portuguese,
and meets WCAG 2.2 AA with and without JavaScript. The architecture is described in
[`Docs/ARCHITECTURE.md`](Docs/ARCHITECTURE.md), the original plan in
[`Docs/PROJECT_PLAN.md`](Docs/PROJECT_PLAN.md) and the implementation history in
[`Docs/PROGRESS.md`](Docs/PROGRESS.md).

## Why React Router v8 and not Remix

The challenge asks for a Remix app. Remix v2 is end-of-life: the framework merged into React Router,
whose framework mode (React Router v7 and later, v8 here) is the direct successor, with the same
loaders, actions, nested routes, `<Form>` and progressive enhancement. LTP Labs confirmed that any
Remix version, including React Router v7+, is acceptable, so this project uses React Router v8
framework mode with server-side rendering.

## Stack

- React 19, React Router 8 (framework mode, SSR via `@react-router/node` + `@react-router/serve`)
- i18next 26, react-i18next 17, remix-i18next 8
- Tailwind CSS 4 (`@tailwindcss/vite`)
- TypeScript 5 (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`), Vite 8
- Node 24, npm (no other package manager)

## Quick start

You need Node 24 and npm. The version is pinned in `.nvmrc`; `nvm`, `fnm` and `volta` all read
it. On Windows, install Node 24 from [nodejs.org](https://nodejs.org) or use
[nvm-windows](https://github.com/coreybutler/nvm-windows) (`nvm install 24` then `nvm use 24`).

macOS / Linux (also Git Bash on Windows):

```sh
nvm use
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
```

Windows (PowerShell):

```powershell
npm install
Copy-Item .env.example .env
npm run dev        # http://localhost:5173
```

The `.env` file is optional for `npm run dev` (every variable has a development default) and is
never read by `npm start`. To serve the production build you must set at least `SESSION_SECRET`
in the shell first:

```sh
# macOS / Linux
npm run build
SESSION_SECRET=change-me npm start
```

```powershell
# Windows (PowerShell)
npm run build
$env:SESSION_SECRET = "change-me"
npm start
```

The e2e suite needs the Playwright Chromium build once: `npx playwright install chromium`.

## Scripts

Every script is a plain Node or npm command, so they behave the same on macOS, Linux and Windows.

| Script                   | Purpose                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `npm run dev`            | Development server with HMR                                                              |
| `npm run build`          | Production build into `build/`                                                           |
| `npm start`              | Serve the production build (`SESSION_SECRET` etc. must be set in the shell, see above)   |
| `npm run typecheck`      | `react-router typegen && tsc`                                                            |
| `npm run lint`           | ESLint (`lint:fix` applies the fixes)                                                    |
| `npm run format`         | Prettier (`format:check` only verifies)                                                  |
| `npm run test`           | Vitest unit tests (`test:watch` for watch mode)                                          |
| `npm run test:e2e`       | Playwright: boots the mock API and the built app, four Chromium projects (`test:e2e:ui`) |
| `npm run check:licenses` | `scripts/check-licenses.mjs`, fails on any non-permissive package                        |
| `npm run check`          | `typecheck && lint && format:check && check:licenses && test`                            |

## Challenge checklist

| Requirement ([`Docs/goal.md`](Docs/goal.md))                                                                                                                                                                                        | Where                                                                                                            | Verified by                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Homepage lists products fetched from the API, each linking to its detail page                                                                                                                                                       | `home.tsx` (trending), `catalogue.tsx` (`/shop`)                                                                 | `home.spec.ts`, `catalogue.spec.ts`                                                                                              |
| Sort by the user's preference                                                                                                                                                                                                       | `SortForm` (price low/high, name A-Z / Z-A, rating)                                                              | `catalogue.spec.ts`                                                                                                              |
| Filter by category                                                                                                                                                                                                                  | `CategoryFilter` (single selection, 24 categories; folds under the toolbar on phones, D-16)                      | `catalogue.spec.ts`                                                                                                              |
| Pagination                                                                                                                                                                                                                          | `Pagination` (9 per page, window of 5, `aria-current`)                                                           | `catalogue.spec.ts`                                                                                                              |
| Product detail fetches the product; every Figma element present                                                                                                                                                                     | `app/routes/product.tsx`: image, title, price, Add to cart, "Product details"                                    | `product.spec.ts`                                                                                                                |
| Extra elements                                                                                                                                                                                                                      | gallery thumbnails, rating + reviews, original price + discount badge, stock status, practical information, tags | `product.spec.ts`                                                                                                                |
| "Add to cart" adds to the cart                                                                                                                                                                                                      | product route `action` (`intent=add`), signed cookie session                                                     | `cart-session.spec.ts`, no-JS spec                                                                                               |
| Cart page reachable from the header icon, shows items, quantities, total, removal                                                                                                                                                   | `app/routes/cart.tsx`, `CartLineItem`, `QuantityStepper`, `CartSummary`                                          | `cart.spec.ts`                                                                                                                   |
| Responsive mobile + desktop                                                                                                                                                                                                         | mobile-first Tailwind, reflow at 320 px                                                                          | `reflow.spec.ts`, Pixel 7 project                                                                                                |
| Loaders / actions used appropriately, clean routing                                                                                                                                                                                 | every read is a loader, every mutation an action; `app/routes.ts`                                                | e2e suite                                                                                                                        |
| i18n: EN default + PT, server-resolved locale, switcher keeping the page, no hard-coded strings, `Intl` formatting, plurals, `<html lang>`, hreflang, logical properties                                                            | `app/i18n/`, `app/locales/`, `LanguageSwitcher`                                                                  | `i18n.spec.ts`, `locales.test.ts`, ESLint                                                                                        |
| a11y: landmarks, one `h1`, keyboard, skip link, names on icon controls, alt text, labelled controls, pagination nav, live announcements, contrast, 44 px targets, reduced motion, works without JS, automated audit + screen reader | see [`Docs/ACCESSIBILITY.md`](Docs/ACCESSIBILITY.md)                                                             | IBM WCAG 2.2 scans on every route, locale and state, Lighthouse a11y 100, keyboard specs; the VoiceOver run is logged as pending |
| Submitted on a VCS                                                                                                                                                                                                                  | GitHub: `main` <- `development` <- 14 feature PRs                                                                | n/a                                                                                                                              |

## Repository map

```
app/
  routes.ts, root.tsx, entry.*.tsx   routing config, document shell, server/client entries
  routes/                            one module per route (loader / action / meta / component)
  components/ui | layout | catalogue | product | cart | pages
  services/dummyjson/                API client, guards, cache, product functions (server only)
  services/cart/                     cookie session, cart maths, promo codes, intents
  i18n/, locales/, middleware/       locale config, formatting, EN/PT resources, middlewares
  lib/                               catalogue query/pagination, product view, error codes, helpers
  styles/, fonts/                    tokens, base styles, self-hosted Manrope
tests/
  e2e/                               Playwright specs, mock API, accessibility wrapper, route list
  fixtures/dummyjson/                API fixtures (194 summaries, 24 categories, 10 products)
  helpers/                           render / i18n / text helpers for Vitest
scripts/check-licenses.mjs           licence allow-list enforcement
Docs/                                brief, wireframes, API contract, plan, progress, ADRs, guides
```

## Limitations and assumptions

- Product data stays in English (`lang="en"` is set on it in Portuguese); search runs on the
  English catalogue.
- Images come in a single size from the DummyJSON CDN (`Cache-Control: no-store`).
- The cookie cart is last-write-wins across tabs and racing requests; `minimumOrderQuantity` is
  ignored; dimensions are assumed in cm and weight in kg (units are undocumented).
- Checkout is a mock: the payment page (`/checkout`) checks the format of the card details and
  drops them — nothing is charged, stored or shipped. "About", "Contact", "Blog" and "Account"
  carry invented content written for the demo (fictional team, address and posts); the contact
  and sign-in forms are validated server-side but send and store nothing.
- Cookies: `lng` (language choice) and `__cart` (cart) are strictly necessary, so there is no
  banner.

## Performance

Measured on 2026-09-13 with the production build served by `react-router-serve` against the mock
API (Lighthouse 13.4, mobile emulation, simulated throttling, `npx lighthouse <url>
--form-factor=mobile`), on the motion-safe transitions branch (#43) and, for comparison, on the
build before it: both give the same numbers, so the entrance animations do not move the LCP
(Chrome dates it at the first painted frame, where the opacity is already above zero).

| Page             | Performance | Accessibility | Best practices | SEO | LCP   | CLS | TBT  |
| ---------------- | ----------- | ------------- | -------------- | --- | ----- | --- | ---- |
| `/en` (home)     | 94          | 100           | 100            | 92  | 2.7 s | 0   | 0 ms |
| `/en/shop`       | 93          | 100           | 100            | 100 | 2.8 s | 0   | 0 ms |
| `/en/products/1` | 93          | 100           | 100            | 100 | 2.9 s | 0   | 0 ms |

Bundle sizes (gzip, measured on 2026-09-12 by gzipping each chunk in `build/client/assets/`): the
catalogue page downloads about 146 KB of JavaScript in total. `entry.client` weighs 79 KB (React
DOM, React Router, i18next, react-i18next), `jsx-runtime` 28 KB, the React Router shared chunk
12 KB, react-i18next 8 KB, the current locale about 3 KB (locales are split per language and
fetched by `load-locale.client`), the catalogue route 1.4 KB, plus around 14 KB of small shared
chunks (layout, results list, primitives, error codes). Other route chunks: product 2.9 KB, cart
3.9 KB. CSS: 7.7 KB gzip (6.7 KB before the motion scale of #43). The plan's target of less than 90 KB sits below the floor of React 19 +
React Router 8 + i18next (`Docs/DECISIONS.md` D-9); what the app adds on top of the framework is
about 18 KB.

Where the speed comes from: full SSR from loaders (no client fetching), a server-side TTL cache in
front of DummyJSON, one preloaded variable font, `preconnect` to the image CDN, `width` and `height`
on every image (CLS 0), eager loading for the first three cards and the product image
(`fetchPriority="high"` plus a render-time `preload()`), lazy loading elsewhere, `prefetch="intent"`
on links, `shouldRevalidate` rules that skip refetching on `?image` and skip the shell data on
search-param changes, and no runtime dependency beyond the approved list.

## Licence policy and credits

Every dependency, font, icon and snippet must carry a permissive licence (MIT, ISC, BSD, Apache-2.0,
Unlicense, 0BSD, CC0, MIT-0, BlueOak-1.0.0, Python-2.0; OFL-1.1 for fonts): never commercial,
never copyleft. `npm run check:licenses` walks the whole `node_modules` tree in CI. The project
itself ships no licence file (all rights reserved).

Documented exceptions (`Docs/DECISIONS.md` D-1), all unmodified, used at build or lint time only
and never part of the shipped bundle:

| Package                              | Licence   | Why it is there                                               |
| ------------------------------------ | --------- | ------------------------------------------------------------- |
| `lightningcss` (+ platform binaries) | MPL-2.0   | required by Vite 8 and Tailwind CSS 4                         |
| `caniuse-lite`                       | CC-BY-4.0 | browserslist data pulled by Babel through `@react-router/dev` |
| `axe-core`                           | MPL-2.0   | rule metadata used by `eslint-plugin-jsx-a11y`                |

Third-party credits:

- [DummyJSON](https://dummyjson.com): product data.
- [Manrope](https://github.com/sharanda/manrope): font, SIL Open Font License 1.1
  (`app/fonts/OFL.txt`), self-hosted latin subset from Google Fonts.
- [Remix Icon](https://remixicon.com) v4.8.0: 15 icon paths, Apache License 2.0
  (`app/components/ui/icon.tsx`). Later Remix Icon releases use a custom licence and are not used.
- IBM Equal Access [`accessibility-checker`](https://github.com/IBMa/equal-access): Apache-2.0.
- [`web-animation-design`](https://github.com/vercel-labs/open-agents/tree/main/.agents/skills/web-animation-design):
  Emil Kowalski's animation rules as a Claude Code skill, MIT, vendored in
  `.claude/skills/web-animation-design/` (not shipped to the browser).
