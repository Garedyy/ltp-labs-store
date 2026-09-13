# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- A back link above the heading of the product page, the cart page (with items) and the
  payment page (#45, D-19): a `BackLink` primitive (`components/ui/`), a left chevron plus a
  translated label (`common.backTo.*`, "Back to the shop" / "Voltar à loja") in a 44 px target.
  The destinations are fixed (product and cart go to the shop; the payment page goes to the
  cart, or to the product after Buy now) so the link is a plain `<a href>` that works without
  JavaScript. The payment page's text-only link that sat below the form is replaced. The
  chevron mirrors under `dir="rtl"`. Covered by `back-link.test.tsx` and by `product.spec.ts`,
  `cart.spec.ts`, `checkout.spec.ts`, `no-js.spec.ts` and `targets.spec.ts`.
- Motion-safe transitions across the interface (#43, D-18). A motion scale in `tokens.css`
  (`--ease-out-quart`, keyframes `page-enter`, `pop-in`, `fade-in`) applied with Tailwind
  utilities only, every use gated by `motion-safe:`: the page content enters with a 200 ms fade
  and rise on every page change, client-side and full-page, JavaScript disabled included (a
  wrapper keyed by pathname inside `main`, so `RouteAnnouncer` and the focus on `main` are
  untouched); buttons, header icon links, disclosure summaries and the cart remove button get a
  `scale(0.97)` press; product cards raise their border and scale the image on hover; the
  language panel, the mobile menu and the header cart badge pop in; notices and alerts fade in;
  the categories panel fades in on phones; the navigation bar fades and slides; a cart line
  dims while it is removed. The landing page opens with more motion than the other pages: title, intro and Browse the
  shop rise in three beats (500 ms, 120 ms apart), the eight trending cards cascade in (450 ms,
  one every 80 ms, `ProductGrid stagger`) and See more follows; a control focused before its turn loses its delay and stays revealed; Lighthouse A/B against the previous build shows identical scores and LCP. Nothing moves under `prefers-reduced-motion: reduce`. Covered by
  `layout.spec.ts`, `no-js.spec.ts` and `header-actions.test.tsx`; the rules come from the
  `web-animation-design` skill vendored in `.claude/skills/` (MIT).
- About, Contact, Blog and Account pages with real, invented content in `en` and `pt` (#30,
  D-14), replacing the "coming soon" placeholders. About tells the story, values and a
  fictional team; Contact lists an invented address, mailbox and hours and offers a name /
  e-mail / message form; Blog carries three dated posts; Account shows what the device knows
  (cart count, last order with a link to its confirmation), a demo profile and a sign-in form.
  Both forms are validated server-side with per-field codes (`field-required`, `email-invalid`),
  keep the typed values on a refusal, focus the first invalid field with and without JavaScript,
  and confirm through the URL (`?sent=1`, `?demo=1`) with a focused status; nothing is sent,
  created or stored. New shared building blocks: `lib/forms.ts`, `lib/validation.ts`,
  `components/forms/` (`TextField`, `FormNotice`, `useFocusFirstInvalid`).
- A payment page at `/:lang/checkout` between the cart and the confirmation (#30, D-15). It
  recaps the order, asks for an e-mail, a shipping address and the payment method (card fields
  — name, number, MM/YY, security code — required for card only and folded away for PayPal
  through CSS, with and without JavaScript), validates everything server-side (Luhn, expiry,
  code) and places the order the way the cart's checkout used to. Card data is format-checked
  and dropped, never stored, logged or echoed back; every field is length-capped; a reconciled
  cart is announced on the page.
  Buy now now lands on this page in product mode (`?product=<id>`): one unit, cart and promo
  untouched. Covered by `checkout.spec.ts` in the four Playwright projects, IBM scans of every
  new state and reflow at 320 px.

- Home page split from the shop (#29). `/:lang` is now a landing page listing the eight
  best-rated products (`sortBy=rating&order=desc`, one cached DummyJSON call) with a visible
  "Trending products" heading and a "Browse the shop" link; the catalogue — sort, category filter,
  pagination, the same URL parameters — moves to `/:lang/shop`. Old catalogue URLs on `/:lang`
  that carry `q`, `category`, `sort` or `page` redirect permanently (301) to `/:lang/shop` with
  the same search. Home and Shop each get `aria-current` on their own page; every "back to the
  shop" link (empty states, error pages, coming-soon pages, "Continue shopping") targets the shop.
  Translated in `en` and `pt`; recorded as D-13 in `Docs/DECISIONS.md` (plan decisions 6 and 22
  superseded); `tests/e2e/routes.ts` scans the new routes and `home.spec.ts` covers the page.
- Product page: a "Buy now" button next to "Add to cart" (#28). It orders one unit of the
  product shown, on its own — the cart is neither included nor touched, the cart's promo code
  does not apply — through the product route's new `buy-now` intent (same `out-of-stock` /
  `product-not-found` refusals as "Add to cart"), writes the order (card, one item, price +
  shipping) and answers 303 to the confirmation page, with and without JavaScript (D-12). Buy now
  is the primary, full-width call to action and Add to cart the secondary button below it; both
  share the one fetcher form (landmark "Purchase options") as submit buttons named `intent`, are
  described by the stock status and disabled when sold out (`Docs/DESIGN_SYSTEM.md`). Translated in `en` and `pt`; `isAddIntent` unit-tested; covered in
  the `desktop-chromium`, `mobile-chromium`, `pt` and `no-js` Playwright projects and by an IBM
  scan of the confirmation reached through Buy now.

### Changed

- Home: a "Browse the shop" link now sits next to the heading block ("Trending products" and
  its intro, grouped), aligned to its bottom end and wrapping under it on narrow screens, so the
  way to the full catalogue is visible without scrolling on desktop and on a 320 px phone; a
  centred "See more" link to the same shop closes the page after the eight product cards. DOM order and
  visual order stay the same; "see more" / "ver mais" joins the glossary (#40, D-13).
- Shop: on phones the category filter folds under the toolbar behind a "Categories" button
  (`aria-expanded`; opening moves the focus into the list, Escape folds it back) instead of
  sitting after the pagination behind a jump link; choosing a category behaves as before and
  keeps the list open. Without JavaScript the list is shown in place. Desktop rendering and tab
  order are unchanged (#31, D-16).
- Cart: "Check out" and "Or pay with PayPal" are links to the payment page (`?method=paypal`
  preselects PayPal); the cart action no longer accepts `intent=checkout`. An empty cart reaching
  the payment page is sent back to the cart with the focused "Your cart is empty" alert (#30,
  D-15).
- Product page: Buy now answers 303 to `/checkout?product=<id>` instead of writing the order
  itself (D-12 amended by D-15).

- Catalogue and search: choosing a "Sort by" option applies the sort at once instead of waiting
  for the Apply button (#25). The select navigates on change like the category checkboxes, keeps
  the focus, shows the pending URL's sort while the navigation is in flight (so Back and Forward
  always show the URL's sort), and a visible hint linked with `aria-describedby` tells
  the user beforehand that the results update on selection (WCAG 2.2 SC 3.2.2). The Apply button
  remains the form's submit, visible without JavaScript and shown on focus with it. Recorded as
  D-11 in `Docs/DECISIONS.md`; it supersedes the plan's "no auto-submit" sentence.
- Documentation brought back in line with `v1.0.0` and the fixes merged since (#17): `CLAUDE.md`
  no longer describes a pre-scaffold repository; `Docs/PROGRESS.md` marks every TO VERIFY item
  resolved, records the merged fix PRs and names the `v1.0.1` release as the next action;
  `Docs/DECISIONS.md` D-8 gains the `setQuantity` addendum and D-10 records the `release` scope
  and the no-attribution rule; `Docs/ACCESSIBILITY.md` lists every route-owned announcement and
  focus rule and justifies the `input_label_visible` and open-language-panel scan exclusions;
  `Docs/ARCHITECTURE.md`, `README.md` (scripts table, bundle figures) and `CONTRIBUTING.md`
  (issue-fix branches, Claude Code skills) updated accordingly.

### Fixed

- Order confirmation: the page was a bare title, one sentence and three definitions, with no
  sign that the order succeeded and nothing about the products ordered (#38). It now opens on a
  green check disc, "Thank you for your order", the order number set apart, then an "Order
  summary" card listing every ordered line (thumbnail, title, quantity, line price) above the
  items / payment method / total. `lastOrder` stores the order's `{ productId, quantity }` lines
  (D-17) instead of a frozen item count and formatted total: the confirmation prices them again
  from the cached catalogue, and the account page and the confirmation format the total in the
  current locale. An older cookie without lines reads as no order (`sanitiseOrder`).
- UI strings: about thirty English and Portuguese strings, the `<title>` separator and the
  discount sign used the em dash, the en dash, the ellipsis, curly quotes, the multiplication
  sign or the minus sign, none of which a Portuguese keyboard types (#38). They now use `-`,
  `...`, `"` and `x`; `locales.test.ts` rejects any other character and `Docs/I18N.md` records
  the rule.
- Product page: the main image was a square as wide as its column, about 800 px tall on desktop
  and tablet, so the thumbnails and, in one column, the buy block fell out of the first screen
  (#27). The image box now takes the wireframe's 5:3 landscape ratio from `md` (`md:aspect-[5/3]`),
  as wide as its column with the square image centred inside, so its height never exceeds ~540 px
  on desktop; phones keep the full-width square, `preload` and `fetchPriority="high"` are
  unchanged. `tests/e2e/product.spec.ts` checks the box at 1280 x 800 and 820 x 1180 and the
  square on a phone.
- Shell: on short pages (coming soon, 404, empty cart, order confirmation) the footer stopped
  right after the content and left the page background visible below it (#26). `<body>` is now a
  `min-h-svh` flex column and `<main>` grows, so the footer sits on the bottom edge of the viewport
  and long pages are unchanged; `tests/e2e/layout.spec.ts` checks both cases.
- Cart page: pressing Enter in the quantity field dropped the focus to the document (#18). The
  input was keyed on the in-flight value, so React remounted it mid-submission; it is now
  uncontrolled and never remounted, the shown value is written back when a submission or a
  clamp changes it. Applying a promo code dropped the focus too, because the Apply form was
  replaced by the Remove form: "Remove code" now receives it, as the plan's focus matrix states.
- Header badge: the cart link only knew the raw cookie count, so a cart reconciled by the cart
  page (vanished or sold-out lines dropped, quantities clamped) kept the stale count until the
  next navigation (#18). `SiteHeader` prefers `useRouteLoaderData("routes/cart")`.
- Checkout: the only mutation form without the `noJs` hidden input, so a refused checkout
  (`empty-cart`) answered a bare 400 without JavaScript and, with it, its result never reached
  the page (`useFetchers` does not see navigation forms) (#18). The form now honours the no-JS
  contract, the page reads `actionData`, reloads the cart after the refusal (React Router skips
  the reload after a 4xx by default) and renders a focused `empty-cart` alert in both states.
- Hardening in the same files: `redirectBack` no longer throws on a malformed `Referer`, the cart
  action answers 400 instead of 500 to a non-form body, and `loadCartView` derives the totals
  once.
- Search page: the first search from `/search` was never announced to screen readers, and
  neither was the way back to the empty prompt (#19). The prompt rendered a different tree, so
  the results component mounted fresh and its announcer hook only reacted to later changes.
  `CatalogueResults` now accepts a null view and stays mounted across both states.
- Target size: `Button size="sm"` (sort Apply, "Remove code") rendered 36 px, and the footer
  brand, navigation and language links and the header brand were ~26 px text lines (#19). They
  all meet the 44 px target the project commits to; `tests/e2e/targets.spec.ts` measures them.
- Search page: the results title had no plural forms, so a single hit rendered "(1 results)" /
  "(1 resultados)" in the document title, the tab and the route announcement (#20).
  `catalogue.search.resultsTitle` now carries `_zero`/`_one`/`_many`/`_other` in both locales;
  the `_zero` form also avoids "(0 resultado)", since the `pt` plural rules put 0 in the `one`
  category. The locales test now rejects any key that interpolates `count` without a plural
  suffix.
- Cart page: the quantity stepper's minus button did nothing, with and without JavaScript
  (#15). The +/- buttons shared the text input's `quantity` name and the server kept the last
  value, but browsers serialise the clicked button at its DOM position, so the minus button
  (before the input) was overridden by the unchanged typed value. The buttons now submit
  `setQuantity`, which takes precedence over the typed `quantity`.

## [1.0.0] - 2026-09-11

First release: the complete challenge, delivered through fourteen squash-merged feature pull
requests (#1 scaffold, #2 tooling, #3 design system, #4 i18n foundation, #5 app shell,
#6 DummyJSON client, #7 catalogue, #8 search, #9 product detail, #10 cart session, #11 cart page,
#12 accessibility audit, #13 performance, #14 docs and release).

### Added

- Performance: per-locale client chunks, CDN preconnect, measured bundle sizes and Lighthouse
  results recorded in the README.
- Accessibility audit: reflow at 320 px with text spacing on every route, WCAG 2.2 scans of
  error, cart, disclosure and media-emulation states; visible quantity label, named cart forms,
  shrinking sort select.
- Cart page: line items with stepper and removal, summary with totals, promo codes, mocked
  checkout (card / PayPal) and confirmation page; everything works without JavaScript.
- Cart session: signed cookie cart, sanitisation, integer-cent totals, promo codes, intents,
  `add` action with fetcher and no-JS Post/Redirect/Get, live header count.
- Product page: gallery with URL-driven thumbnails, price with derived original price and
  discount badge, rating, stock status, practical information, tags, reviews; typed error codes.
- Search page (`/search?q=`) with the same sort and pagination, prompt and no-result states.
- Catalogue: home page with the 9-product grid, sort (five options), single-category filter,
  pagination, results summary, translated category names, 404 on out-of-range pages, 502 page
  when the product service fails; product placeholder route.
- DummyJSON client: typed guards following the API contract, 8 s timeout, 404/502 mapping,
  TTL cache with in-flight de-duplication, catalogue query/pagination helpers, fixtures and a
  fixture-backed mock API with fault injection for e2e.
- App shell: sticky floating header (nav, Search/Account/Cart icon links with badge, language
  switcher, mobile menu), footer, announcer + route announcer, navigation status bar, coming-soon
  pages, keyboard and WCAG 2.2 scans on every route, `Docs/ACCESSIBILITY.md` v1.
- i18n foundation: locale-prefixed routing with middleware validation, `/` redirect, typed EN/PT
  resources, server-only `Intl` formatting, language switcher + `set-language` action, hreflang,
  `Docs/I18N.md`.
- Design system: three-layer colour tokens, self-hosted Manrope, `ui/*` primitives with
  role/name tests, contrast test, Remix Icon v4.8.0 paths, `Docs/DESIGN_SYSTEM.md`.
- Tooling: ESLint 9 (typescript-eslint, react, react-hooks, jsx-a11y strict, i18next
  `no-literal-string`), Prettier with Tailwind plugin, Vitest + Testing Library, Playwright with four
  Chromium projects and the IBM `accessibility-checker` WCAG 2.2 scan, licence checker, Husky +
  lint-staged + commitlint, GitHub Actions CI, PR template, `CONTRIBUTING.md`.
- Project scaffold: React Router v8 framework mode, Tailwind CSS v4, TypeScript strict, dotfiles,
  `.env.example`, documentation skeleton.
