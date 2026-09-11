# Design system

Visual language of ltplabs.com applied to the challenge wireframes, implemented with Tailwind CSS v4
only. Specification: `PROJECT_PLAN.md` §1.4, §3.7 and §3.8.

## Tokens (`app/styles/tokens.css`)

Three layers, so that components only ever use **semantic** colour utilities:

1. **Raw palette** — `--palette-*` custom properties copied from ltplabs.com (plus one derived value,
   `--palette-error-text`). No Tailwind utility is generated from them.
2. **Semantic roles** — `--surface`, `--fg`, `--primary`, `--accent`, `--focus`… mapped to the
   palette for the light theme. `@media (prefers-contrast: more)` remaps `--border`, `--fg-muted`
   and `--surface-muted`. A dark or high-contrast theme is one extra `:root[data-theme="…"]` block.
3. **Tailwind theme** — `@theme { --color-*: initial; … }` removes the default palette and declares
   the type scale, weights, shadows and radii; `@theme inline` exposes the semantic roles as
   `bg-surface`, `text-fg`, `border-border`, `text-primary`, `bg-accent`, `outline-focus`…

### Contrast (computed by `app/styles/contrast.test.ts` from the palette, WCAG 2.2 AA)

| Palette token | Value     | vs white | Semantic roles                                               |
| ------------- | --------- | -------- | ------------------------------------------------------------ |
| `dark-blue`   | `#10131c` | 18.6:1   | `fg`, `surface-inverse`                                      |
| `medium-blue` | `#12173a` | 17.4:1   | `primary`, `link`, `focus-inner`, `accent-fg`                |
| `blue`        | `#16105f` | 16.5:1   | `link-hover`                                                 |
| `dark-gray`   | `#6a6a68` | 5.4:1    | `fg-muted`, `border-strong` — never on `surface-placeholder` |
| `medium-gray` | `#eaecf0` | 1.2:1    | `border`, `surface-placeholder` (decorative only)            |
| `orange`      | `#ff6a00` | 2.9:1    | `accent`, `focus` — **never text**                           |
| `light-green` | `#007474` | 5.6:1    | `success`                                                    |
| `error`       | `#e5484d` | 3.9:1    | `error-border` (non-text)                                    |
| `error-text`  | `#b42318` | 6.6:1    | `error` (text; derived because `#e5484d` fails AA)           |

Other pairs: `accent-fg` on `accent` (discount badge) 6.0:1; `fg` on `surface-muted` 17.2:1.
The test fails the build if any pairing drops under 4.5:1 (text) or 3:1 (UI components).

### Focus ring

`:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; box-shadow: 0 0 0 2px var(--color-focus-inner) }`
— orange alone is 2.9:1 on white, the inner medium-blue ring restores ≥ 3:1 (SC 1.4.11) and the
outline survives forced colours (`Highlight`). `outline-none` is banned except on `main`.

## Typography (`app/styles/fonts.css`, `app/fonts/`)

- **Manrope** variable, weights 400–600, latin subset, one 24 KB woff2 self-hosted from Google
  Fonts (SIL OFL 1.1, `app/fonts/OFL.txt`). `font-display: swap`; preloaded once from `root.tsx`
  through a `?url` import that resolves to the same hashed file as the CSS `url()` (verified:
  a single `manrope-latin-*.woff2` in `build/client/assets`).
- Bw Modelica (commercial) is replaced by Manrope on purpose (decision 3).
- Scale (ltplabs.com): `text-h1` 48/1.3/-1px · `text-h2` 36/1.3/-1px · `text-h3` 28/1.4 ·
  `text-h4` 22/1.4 · `text-h5` 18/1.4 · `text-body` 16/1.6 · `text-body-sm` 14/1.6 ·
  `text-tagline` 14/1.2. Headings are weight 400; **bold = `font-medium` (500), never 700**.
- Body: `bg-surface font-sans text-body text-fg antialiased`; in-text links underlined with
  `underline-offset-[0.15em]`; nav, cards, pagination and buttons opt out with `no-underline`.

## Radii, shadows, spacing, breakpoints

Tailwind defaults (identical to ltplabs.com) plus `rounded-block` (1.5 rem), `shadow-header`
(`0 4px 7.5px rgb(8 10 25 / 0.05)`), `min-h-header` (60 px) and `min-h-header-lg` (64 px).
Breakpoints: Tailwind defaults; every grid collapses to one column at 320 px. `html`
`scroll-padding-top: 6rem` keeps anchored targets under the sticky header.

## Motion and media

- Reduced motion: global kill switch in `base.css` (`animation/transition-duration: 0.01ms`,
  `scroll-behavior: auto`); components only use `motion-safe:` transitions.
- Forced colours: `forced-colors:border` on buttons, badges and cards; focus outline uses
  `Highlight`.
- `prefers-contrast: more`: stronger borders, muted text becomes full-contrast text.

## Components (`app/components/ui/`)

Primitives take every label as a prop — no text lives inside them — so they stay free of i18n
and pass `eslint-plugin-i18next/no-literal-string`. Each has a role/name test next to it.

| Component        | Props                                                                                           | Notes                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Button`         | `variant: primary \| secondary \| ghost \| icon`, `size: md \| sm`, `pending`, `pendingLabel`   | `type="button"` by default; pending keeps the button enabled with `aria-busy`; `disabled` only for out-of-stock |
| `ButtonLink`     | same variants, React Router `Link` props                                                        | never `aria-disabled` — blocked states omit the control                                                         |
| `Icon`           | `name: IconName`, SVG props                                                                     | `aria-hidden focusable="false" fill="currentColor"`, 16 Remix Icon paths                                        |
| `VisuallyHidden` | `as?`, `children`                                                                               | `sr-only`                                                                                                       |
| `Field`          | `name`, `label`, `hideLabel?`, `hint?`, `error?`, `errorPrefix`, `children: (ids) => ReactNode` | render-prop instead of `cloneElement`; error is `role="alert"` with icon + sr prefix                            |
| `useFieldIds`    | `name`, `{ hint, error }`                                                                       | `{ inputId, hintId, errorId, describedBy }`                                                                     |
| `Checkbox`       | `label`, input props                                                                            | 20 px box in a 44 px label row                                                                                  |
| `Select`         | `id`, `label`, `hideLabel?`, `options`                                                          | native `<select>` with chevron icon, 44 px                                                                      |
| `Alert`          | `prefix`, `children`                                                                            | `role="alert"`, icon, sr prefix                                                                                 |
| `Disclosure`     | `summary`, `summaryLabel?`, `children`                                                          | native `<details class="group">`; JS adds Escape (focus back to summary) and outside pointer-down               |
| `Price`          | `priceFormatted`, `originalPriceFormatted?`, `labels`                                           | sr "Price"/"Original price", `<s aria-hidden>`                                                                  |
| `DiscountBadge`  | `percentFormatted`                                                                              | `aria-hidden`, `bg-accent text-accent-fg`                                                                       |
| `Rating`         | `value`, `valueFormatted`, `label`                                                              | decorative stars, visible number, sr label                                                                      |
| `DefinitionList` | `items: { key, term, description, lang? }[]`                                                    | `<dl>` with `<div class="contents">` rows                                                                       |

### Icons

16 paths from **Remix Icon v4.8.0** — the last release published under the Apache License 2.0
(later releases use the custom "Remix Icon License v1.0", which is not on the licence allow-list;
see `DECISIONS.md` D-4). Path data is copied verbatim into `icon.tsx`; attribution in the README.
Icons never carry meaning alone: every icon-only control has an accessible name and every status
icon sits next to text.

## Header and footer anatomy

- Header wrapper: `sticky top-0 z-40 px-4 pt-4 lg:px-6 lg:pt-6 [@media(max-height:30rem)]:static`.
- Card: `relative mx-auto flex min-h-header max-w-[87rem] items-center justify-between gap-3 rounded-2xl bg-surface ps-4 pe-3 shadow-header sm:ps-6 lg:grid lg:min-h-header-lg lg:grid-cols-[1fr_auto_1fr]`
  — brand · centred nav · actions.
- Nav items: `flex min-h-11 items-center rounded-lg px-2.5 py-2 text-tagline font-medium text-primary hover:bg-surface-muted aria-[current=page]:bg-surface-muted aria-[current=page]:underline`.
- Icon links: `size-11 rounded-xl border border-border-strong text-primary hover:bg-surface-muted`
  (outlined instead of ltplabs' orange squares — contrast). Cart badge:
  `absolute -end-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-[0.6875rem] leading-5 font-medium text-accent-fg`.
- Language switcher: outlined pill `min-h-11 rounded-xl border border-border px-3`; panel
  `absolute end-0 mt-2 rounded-xl border bg-surface p-2 shadow-header`.
- Breakpoints: `< sm` logo + cart + menu (Search/Account inside the menu); `sm`–`lg` adds the
  Search and Account icons; `lg+` three-column card with the nav and the switcher inline.
- Loading bar: `h-0.5 bg-accent` under the card, revealed by a 300 ms CSS delay.
- Footer: `mt-16 rounded-t-3xl bg-surface-inverse px-4 py-8 text-fg-inverse lg:px-6 lg:py-12`;
  brand link, footer nav in header order, language links.

## Layout per screen

- **Home / catalogue**: `grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]`; results column
  `flex min-w-0 flex-col gap-6` (h1 `text-h4`, toolbar `flex flex-wrap items-center justify-between gap-4`,
  grid `grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`, pagination `flex-wrap justify-center sm:justify-end`);
  aside `lg:col-start-2 lg:row-start-1 lg:self-start` (not sticky — 24 rows exceed a tablet
  viewport), card `rounded-2xl border border-border p-4`, one 44 px checkbox row per category.
  Product card: `rounded-2xl border p-3`, `aspect-square rounded-xl bg-surface-placeholder object-contain`
  image, `focus-within` ring. First three images eager (first `fetchPriority="high"`), rest lazy.
- Other screens: filled in by `feature/product-detail` and `feature/cart-page`. Coming-soon, 404 and error
  pages: centred `max-w-prose`, `text-h2 md:text-h1` heading, body, `ButtonLink`.

## Deviations from ltplabs.com and the wireframes

| Deviation                                                                    | Reason                                                                     |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Header `sticky` instead of `fixed`, static under 30 rem viewport height      | no content hidden under the bar at 400 % zoom (reflow)                     |
| Outlined medium-blue icon buttons instead of orange squares                  | orange is 2.9:1; icons must reach 3:1                                      |
| `<nav><ul>` of links instead of ltplabs' `<div>` of `<button aria-haspopup>` | navigation semantics, `aria-current`                                       |
| Manrope logo instead of a condensed cut                                      | licence (Bw Modelica is commercial)                                        |
| Wireframe's thin header border replaced by the floating card shadow          | ltplabs identity                                                           |
| Visible page `<h1>` and minimal footer, absent from the wireframes           | heading structure, footer landmark and language links                      |
| Closed `<details>` content hidden with `display: none`                       | Chromium keeps layout boxes for closed panels, which overlap other content |
