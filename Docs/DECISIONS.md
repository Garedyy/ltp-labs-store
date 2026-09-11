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
- **Addendum (2026-09-11, `feature/app-shell`)**: Chromium keeps layout boxes for the content of
  a closed `<details>` (`content-visibility: hidden`), so the engine reported
  `element_tabbable_unobscured` both for controls inside closed panels and for page content
  "covered" by an invisible absolutely-positioned panel. Fixed at the source in `base.css`
  (`details:not([open]) > :not(summary) { display: none }`) rather than filtered in the wrapper.
  For the **open** mobile-menu state, the overlay covers the page by user action; `expectAccessible`
  accepts a per-call `manualReview` list and that spec passes `element_tabbable_unobscured` with a
  justification (the panel closes on Escape, outside click, focus leaving and navigation —
  `keyboard.spec.ts`).
- **Consequences**: the scan stays strict for everything the engine can decide; manual-only rules
  are tracked in the audit log instead of being silently baselined.

## D-4 · Remix Icon pinned to v4.8.0 (Apache-2.0)

- **Date / branch**: 2026-09-11 · `feature/design-system`
- **Context**: decision 20 relies on Remix Icon being Apache-2.0. Since v4.9.0 (2026-01-27) the
  project ships a custom "Remix Icon License v1.0" — permissive in practice (commercial use,
  modification and redistribution inside a larger work allowed; attribution optional) but with
  restrictions (no standalone icon packs, no competing libraries, no logo use) and **not** an
  SPDX licence on the allow-list.
- **Decision**: copy the 16 needed paths from the tagged release **v4.8.0** (2025-12-29), the last
  one published under the Apache License 2.0 — a grant that is perpetual and irrevocable for that
  version. Attribution and the Apache-2.0 notice go in `icon.tsx` and the README.
- **Consequences**: no exception needed; new icons must also come from v4.8.0 (or another
  allow-listed source). The custom licence is not evaluated for future use.

## D-5 · Disclosures close when focus leaves them

- **Date / branch**: 2026-09-11 · `feature/app-shell`
- **Context**: the mobile menu and the language panel are absolutely positioned overlays. Tabbing
  past the last item of an open panel would move focus to content covered by it — exactly what
  SC 2.4.11 (Focus Not Obscured) forbids.
- **Decision**: `Disclosure` listens to `focusout` and closes when `relatedTarget` is outside the
  `<details>`; Escape stops propagating so nested disclosures close one level at a time;
  `RouteAnnouncer` closes every open `<details>` on navigation.
- **Consequences**: no overlay can hide the focused element; unit- and e2e-tested.

## D-6 · Catalogue forms: visible sort label and an always-present Apply

- **Date / branch**: 2026-09-11 · `feature/catalogue`
- **Context**: the plan used an sr-only label for the sort `<select>` and a `<noscript>` Apply
  button for the category form. IBM's `input_label_exists` does not credit the clipped label (and
  `input_label_visible` would flag it under SC 3.3.2 anyway), and `form_submit_button_exists`
  flags a form whose only submit lives in `<noscript>`.
- **Decision**: the sort label is visible ("Sort by" next to the select; the empty option reads
  "Default order"). The category form always contains a submit button: visible without JavaScript,
  `sr-only` until focused when scripts run (`<html class="js">` is set by a one-line inline script
  in the document head).
- **Consequences**: both forms have an explicit, discoverable submit for every user; the list
  summary guard also stops requiring `category`, which `select` never returns.

## D-7 · Gallery index read from the URL; shell loaders skip search-param revalidation

- **Date / branch**: 2026-09-11 · `feature/product-detail`
- **Context**: the plan wanted thumbnail switches without a `.data` request. Skipping the leaf
  loader's revalidation means its data cannot carry the current image; and the shell loaders
  (`root`, `locale-layout`, `locale-errors`) revalidated on every navigation anyway, producing a
  `.data` request for the parents.
- **Decision**: `ProductGallery` derives the index from `useSearchParams` (`clampImageIndex`), the
  product route's `shouldRevalidate` ignores `?image`, and the three shell routes use
  `revalidateOnPathnameOrSubmit` (revalidate on pathname change or any submission).
- **Consequences**: image switches are pure client navigations (asserted by `product.spec.ts`);
  catalogue page/sort/filter changes no longer refetch the shell either.

## D-8 · Cart results handled centrally through keyed fetchers

- **Date / branch**: 2026-09-11 · `feature/cart-page`
- **Context**: a removed line unmounts as soon as the loader revalidates, so a per-line effect
  never sees its fetcher result — no announcement, no focus handoff. Two quick announcements also
  wiped each other in the alternating regions.
- **Decision**: every cart fetcher gets a key (`remove-<id>`, `quantity-<id>`, `promo-apply`,
  `promo-remove`); the cart page reads all results once through `useFetchers()` (a `WeakSet` of
  handled result objects), announces, plans the removal focus from the DOM order and applies it
  after revalidation. `AnnouncerProvider` now keeps the other slot's text instead of clearing it.
  The `+`/`−` submitters share the `quantity` name with the input, so the action takes the **last**
  value (the submitter wins).
- **Consequences**: announcements and focus survive unmounts; rapid `+` clicks stay idempotent per
  request, but responses that race on the cookie are last-write-wins (documented limitation; the
  e2e waits for each step).

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
