# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

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
