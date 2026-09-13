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
  `scroll-behavior: auto`); components only use `motion-safe:` transitions and animations, so
  nothing moves at all under `prefers-reduced-motion: reduce` (the `delay-300` of the navigation
  bar stays ungated on purpose: it is the anti-flicker delay, not motion).
- Motion scale (#43, D-18), defined in the `@theme` block of `tokens.css` and following
  Emil Kowalski's rules (only `transform` and `opacity` move, entrances ease out, hover eases,
  never from `scale(0)`, the child moves on hover rather than the parent). His budget is 300 ms
  for product UI; this project keeps the product pages at 200 ms or less and, on the landing
  page only, uses the longer entrances he allows for marketing surfaces (up to 500 ms per element):

  | Token / utility                                        | Value                                                                                        | Applies to                                                                                                        |
  | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
  | `--ease-out-quart`                                     | `cubic-bezier(0.165, 0.84, 0.44, 1)`                                                         | every entrance below                                                                                              |
  | `animate-page-enter`                                   | opacity 0 → 1, `translateY(0.5rem)` → 0, 200 ms                                              | the page wrapper inside `<main>` (`data-page`), keyed by pathname                                                 |
  | `animate-pop-in`                                       | opacity 0 → 1, `scale(0.97)` → 1, 150 ms                                                     | language panel and mobile menu (`origin-top`), the header cart badge (keyed by count)                             |
  | `animate-fade-in`                                      | opacity 0 → 1, 150 ms                                                                        | `FormNotice`, `Alert`, the unfolded categories panel on phones                                                    |
  | `animate-hero-enter`                                   | opacity 0 → 1, `translateY(1.5rem)` → 0, 500 ms, fill both                                   | the landing page header in three beats (title, intro at 120 ms, Browse the shop at 240 ms) and See more at 900 ms |
  | `animate-card-enter`                                   | opacity 0 → 1, `translateY(1.5rem) scale(0.96)` → 1, 450 ms, fill both, one card every 80 ms | the eight trending cards (`ProductGrid stagger`); the shop grid stays still                                       |
  | `transition duration-150 active:scale-[0.97]`          | colours + press, Tailwind default easing                                                     | `Button` / `ButtonLink`, header icon links, the two disclosure summaries, the cart remove button                  |
  | `transition-colors duration-200`                       | border colour on hover                                                                       | product card (`hover:border-border-strong`)                                                                       |
  | `transition-transform duration-200 ease-[ease]`        | `group-hover:scale-[1.04]`                                                                   | product card image, inside its `overflow-hidden` frame                                                            |
  | `transition-[opacity,transform] duration-150 ease-out` | fade + 0.25 rem slide                                                                        | navigation progress bar                                                                                           |
  | `opacity-60 transition-opacity`                        | pending state                                                                                | product grid while results load, cart line while it is removed                                                    |

  The landing page is the one place with more motion than the rest (a marketing surface, the
  first thing a visitor sees): its header comes in three beats, its cards cascade and See more
  follows, the whole sequence about 1.3 s; it replays on every arrival on `/`. A delayed element
  is held invisible until its turn (fill both), so every focusable one - Browse the shop, the
  cards, See more - loses its delay the moment it receives focus (`focus-visible:` /
  `focus-within:[animation-delay:0s]`; the delay is a `--enter-delay` custom property on the
  cards): the running animation is not restarted, unlike `animation: none`, which would replay
  the whole entrance on blur. A small additive handler on the page (`data-entered`) keeps the
  reveal once the focus leaves; without JavaScript, only a focus that leaves before the original
  delay has elapsed lets the element wait for its turn again. Exits are not animated (closing a `<details>` panel or removing a cart line snaps): a CSS-only
  exit needs `@starting-style` / `transition-behavior: allow-discrete` on `display`, whose support
  is still partial. Value changes (quantities, totals) are not animated either: they are repeated
  actions and motion would slow them down. The fades do not move the LCP: Chrome dates it at the
  first painted frame, where the opacity is already above zero. Measured with the README's
  Lighthouse method (mobile, simulated throttling) on this build and on the build before the
  branch: same scores and same LCP on `/`, `/en/shop` and `/en/products/1` (README table).

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
| `BackLink`       | React Router `Link` props                                                                       | chevron + label above the h1, fixed destination (never `history.back()`), 44 px, `rtl:-scale-x-100` on the icon |
| `Icon`           | `name: IconName`, SVG props                                                                     | `aria-hidden focusable="false" fill="currentColor"`, 15 Remix Icon paths                                        |
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

15 paths from **Remix Icon v4.8.0** — the last release published under the Apache License 2.0
(later releases use the custom "Remix Icon License v1.0", which is not on the licence allow-list;
see `DECISIONS.md` D-4). Path data is copied verbatim into `icon.tsx`; attribution in the README.
Icons never carry meaning alone: every icon-only control has an accessible name and every status
icon sits next to text.

## Header and footer anatomy

- Shell: `<body class="flex min-h-svh flex-col">` with `grow` on `<main>`, so the footer sits on the
  bottom edge of short pages and ends with the document on long ones (#26). No wrapper element:
  the skip link stays the first child of `<body>`; `svh` rather than `dvh` so the mobile browser
  bar never resizes the shell while scrolling.
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
  brand link, footer nav in header order, language links. The 4 rem gap above it is a margin, not
  `mt-auto`, so long pages keep the same spacing as short ones.

## Layout per screen

- **Home** (`/`): the catalogue's results column alone — `flex min-w-0 flex-col gap-6`, h1
  `text-h4`, intro `text-body-sm text-fg-muted`, the same product grid (8 cards) and a `primary`
  `ButtonLink` to the shop; no toolbar, no aside.
- **Catalogue** (`/shop`): `CatalogueResults` is a grid `gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]
lg:grid-rows-[auto_1fr] lg:gap-x-8` of three items — head (h1 `text-h4`, toolbar
  `flex flex-wrap items-center justify-between gap-4` with the sort form's hint on its own line
  `basis-full text-body-sm text-fg-muted`, its Apply button `sr-only` until focused when scripts
  run, and the "Categories" button `min-h-11` with a chevron that rotates when open, shown only
  below `lg` with scripts), body (grid `grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`,
  pagination `flex-wrap justify-center sm:justify-end`; `max-lg:order-last`) and the filters
  panel, last in the DOM, `lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start` (not sticky
  — 24 rows exceed a tablet viewport) and, below `lg`, placed between head and body, folded
  (`max-lg:[.js_&]:hidden`) until the button unfolds it (D-16, #31). The `1fr` body row absorbs
  an aside taller than the column. Card `rounded-2xl border border-border p-4`, one 44 px checkbox
  row per category.
  Product card: `rounded-2xl border p-3`, `aspect-square rounded-xl bg-surface-placeholder object-contain`
  image, `focus-within` ring. First three images eager (first `fetchPriority="high"`), rest lazy.
- **Product**: a `flex flex-col gap-4` column, the back link to the shop (`BackLink`, #45) first,
  then `grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12`; gallery image
  box `aspect-square md:aspect-[5/3] rounded-2xl bg-surface-placeholder object-contain` (the
  wireframe's landscape box from `md`, as wide as its column, so the thumbnails and the buy block
  share the first screen; the square image is centred inside it, #27), thumbnails
  `flex gap-2 overflow-x-auto size-16 rounded-lg border-2`; title `text-h3 md:text-h2 font-medium`,
  rating, price `text-h4` + badge, stock line, the buy block — Buy now (primary, the call to
  action, #28) then Add to cart (secondary), both full-width and stacked with `gap-3` at every
  width — "Product details" uppercase label + `text-body-sm` description, practical `<dl>`, tags; reviews
  `lg:col-span-2`.
- **Cart**: `grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12`; the back link to the shop
  above the h1 (#45), `<ul class="divide-y divide-border">`,
  line `grid grid-cols-[5rem_1fr] gap-4 py-6 sm:grid-cols-[7rem_1fr_auto]`, thumbnail `size-20 sm:size-28`,
  stepper `inline-flex rounded-lg border` with 44 px buttons; summary card
  `rounded-2xl border border-border p-6 lg:sticky lg:top-28` (static under 30 rem height) with the
  `<dl>`, Check out / PayPal links (`ButtonLink`, primary / secondary, to the payment page), demo
  note and promo form. Empty cart uses the centred `max-w-prose` recipe. 404 and
  error pages: centred `max-w-prose`, `text-h2 md:text-h1` heading, body, `ButtonLink`.
- **Order confirmation** (#38): a `max-w-2xl` column, `gap-8`. Success block centred: a
  `size-14 rounded-full bg-success text-fg-inverse` disc (`forced-colors:border`) holding the
  `check` icon at `size-8` (white on `light-green` 5.6:1, in the contrast test), the
  `text-h2 md:text-h1` `<h1>`, the lead, then the order number set apart as a two-line `<p>`
  (`text-body-sm text-fg-muted` label over a `text-h3 font-medium` `<strong>`). Below, an
  "Order summary" `<section aria-labelledby>` card (`rounded-2xl border border-border p-6`)
  reusing the payment page's `OrderLines` (`size-12` thumbnails, title, "Qty n", line price)
  followed by the items / payment method / total `DefinitionList` under a `border-t` rule; the
  demo note and the "Continue shopping" `ButtonLink` close the page. The green disc is the only
  place `success` is used as a background.
- **Payment page** (`/checkout`, D-15): `grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12`;
  the back link to the cart, or to the product after Buy now (#45), then
  `<h1 class="text-h4 font-medium">`, `text-body-sm text-fg-muted` intro, then the form as stacked
  `<fieldset class="flex flex-col gap-4">` blocks with `text-h5 font-medium` legends (contact,
  shipping address, payment method radios `size-5 accent-primary` in 44 px `<label>` rows, card
  details); two-column `sm:grid-cols-2` pairs for postal code / city and expiry / code; full-width
  primary "Pay {{total}}" on phones, `sm:w-auto` above. The summary card is the cart's
  (`CartSummary` with the "Your order" heading) preceded by `OrderLines`: `size-12` thumbnails,
  wrapping title, "Qty n", line price.
- **Content pages** (`about`, `contact`, `blog`, `account`, D-14): `PageHeader` = `text-h3
md:text-h2` `<h1>` + `text-fg-muted` lead inside `max-w-prose`; sections `flex flex-col gap-4`
  with `text-h4 font-medium` `<h2>`s, stacked with `gap-10`; two-column `lg:grid-cols-2` for
  Contact (details `DefinitionList` / form) and Account (sign-in / session + profile); About's
  values and team as `grid gap-4 sm:grid-cols-3` cards `rounded-2xl border border-border p-6`
  (team: `size-12` initials disc `bg-surface-muted text-primary`); Blog articles separated by
  `border-t border-border pt-8`, date in a `<time>`. Forms use `TextField`
  (`components/forms/`): the promo input's recipe `min-h-11 w-full rounded-lg border
border-border-strong bg-surface px-3` with `aria-[invalid]:border-error-border`, textarea
  `rows=5`; the `Select` primitive for the country; `FormNotice` (`rounded-lg border
border-border bg-surface-muted p-3`, `role="status"`) for a success.

## Deviations from ltplabs.com and the wireframes

| Deviation                                                                                                                                               | Reason                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Header `sticky` instead of `fixed`, static under 30 rem viewport height                                                                                 | no content hidden under the bar at 400 % zoom (reflow)                                                                                           |
| Outlined medium-blue icon buttons instead of orange squares                                                                                             | orange is 2.9:1; icons must reach 3:1                                                                                                            |
| `<nav><ul>` of links instead of ltplabs' `<div>` of `<button aria-haspopup>`                                                                            | navigation semantics, `aria-current`                                                                                                             |
| Manrope logo instead of a condensed cut                                                                                                                 | licence (Bw Modelica is commercial)                                                                                                              |
| Wireframe's thin header border replaced by the floating card shadow                                                                                     | ltplabs identity                                                                                                                                 |
| Visible page `<h1>` and minimal footer, absent from the wireframes                                                                                      | heading structure, footer landmark and language links                                                                                            |
| Closed `<details>` content hidden with `display: none`                                                                                                  | Chromium keeps layout boxes for closed panels, which overlap other content                                                                       |
| Product image box square on phones, 5:3 from `md` (the wireframe shows the 5:3 box only)                                                                | a square box as wide as its column is ~800 px tall on tablet and desktop, pushing the thumbnails and the buy block out of the first screen (#27) |
| Visible "Results update when you choose" hint under the sort select, Apply button `sr-only` until focused with JS (the wireframe shows the bare select) | the sort applies on selection (#25, D-11); SC 3.2.2 needs the user told before the change of context, and the form keeps a submit for every user |
