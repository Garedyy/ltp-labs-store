# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

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
