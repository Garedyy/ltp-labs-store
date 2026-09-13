# Accessibility

Target: **WCAG 2.2 level AA, with and without JavaScript**, for every visual impairment
(blindness, low vision, colour-vision deficiency, motion sensitivity, high-contrast and forced-colour
modes). Accessibility is architectural — every rule below is enforced by structure, lint or tests,
not by a final pass. Specification: `PROJECT_PLAN.md` §3.6.

## Global rules

- **Landmarks, all named**: `<header>` (banner) → `<nav aria-label="Main">`; `<main id="main" tabIndex={-1}>`;
  `<footer>` (contentinfo) → `<nav aria-label="Footer">`; the language switcher is
  `<nav aria-label="Language">`. Desktop and mobile copies of the navigation use `hidden lg:block` /
  `lg:hidden` (removed from the accessibility tree), never `sr-only`.
- **Headings**: exactly one visible `<h1>` per page (asserted for every route × locale in
  `a11y.spec.ts`); levels never skipped.
- **Skip link**: first element in `<body>`, targets `#main`; `html { scroll-padding-top: 6rem }`
  keeps anchored targets clear of the sticky header.
- **Links**: underlined by default in running text; navigation, cards, pagination and buttons opt
  out with `no-underline`. Icon-only links carry `aria-label` (Search, Account, "Cart, 3 items").
- **Back links** (#45): the product, cart and payment pages open with a `BackLink` above the
  `<h1>` — the first focusable element of the page content, before the heading — pointing at a
  fixed destination (shop, cart or product), so it is a plain `<a href>` with and without
  JavaScript; no `history.back()`. The chevron is `aria-hidden`; the label is the accessible
  name. It moves no focus and announces nothing: following it is a pathname change handled by
  `RouteAnnouncer`.
- **Focus ring**: two-tone `:focus-visible` (3 px orange outline + 2 px medium-blue inner ring,
  ≥ 3:1 on every surface); `outline-none` is banned except on `main`; forced colours use
  `Highlight`.
- **Focus management and announcements**: `AnnouncerProvider` renders two alternating
  `role="status" aria-live="polite" aria-atomic` regions and exposes `useAnnounce`.
  `RouteAnnouncer` reacts to **pathname changes only**: closes open `<details>`, focuses `#main`
  (or the element named by a route `handle.initialFocus`) with `preventScroll`, and announces
  `document.title`. Search-param changes and fetcher results are announced by the owning route.
  `NavigationStatus` shows a 2 px bar after 300 ms of pending navigation, sets `aria-busy` on
  `main`, and announces "Loading" once.
- **Disclosures**: native `<details>`/`<summary>` (Enter/Space and `aria-expanded` for free); JS
  adds Escape (closes, focus back to the summary, does not bubble to a parent disclosure), outside
  pointer-down, and **closing when focus leaves** so an open panel never covers the element that
  receives focus (SC 2.4.11). `base.css` hides closed `<details>` content with `display: none`
  (Chromium keeps layout boxes otherwise). **In-place disclosures** (the catalogue's categories
  below `lg`, D-16) are a `<button aria-expanded aria-controls>` folding a panel that sits _after_
  the products in the DOM: opening moves the focus into the panel (`preventScroll`) so Tab follows
  the visible order, Escape closes and refocuses the button; nothing closes on focus leaving,
  since an in-flow panel covers nothing. Without JavaScript the button is absent and the panel is
  shown.
- **Targets**: every control is at least 44 × 44 px (`min-h-11`, `size-11`).
- **Forms**: `noValidate`; the server validates and returns codes; on error the invalid control gets
  focus (`autoFocus` on no-JS renders); `Field` wires `aria-describedby` / `aria-invalid` and an
  `role="alert"` message prefixed "Error:" for screen readers. Pending submit buttons keep focus
  (`aria-busy`, never `disabled`).
- **Never colour alone**: `aria-current` + underline on the current nav item; `<s>` + "Original
  price" for discounts; icon + text for errors and stock; stars decorative + visible number.
- **Reduced motion**: global kill switch; only `motion-safe:` transitions and keyframes (motion
  scale in `Docs/DESIGN_SYSTEM.md`), and motion is never the only signal: `aria-busy`, the
  announcer and the focus moves stay in place under `prefers-reduced-motion: reduce`. The
  Playwright suite runs under reduced motion (D-18) and `layout.spec.ts` checks that nothing
  animates on any route in that state. On the landing page, a control focused before its
  delayed entrance loses the delay and stays revealed after blur (`home.spec.ts`), so a focus
  ring never sits on an invisible element.
- **Forced colours**: `forced-colors:border` on buttons, badges and cards; `forced-colors:underline`
  on `aria-current` links; icons use `fill="currentColor"`.
- **`prefers-contrast: more`**: stronger borders, muted text becomes full-contrast text, in both
  themes.
- **Dark theme** (#47, D-20): the page follows `prefers-color-scheme` when nothing is chosen
  and honours an explicit choice (system / light / dark) stored in the `theme` cookie and
  rendered as `data-theme` on `<html>` by the server, so no script runs and nothing flashes.
  Every role pair keeps AA in the dark theme (`contrast.test.ts`, `DESIGN_SYSTEM.md`); the
  focus ring keeps its orange outline and turns its inner ring dark so it reaches 3:1 on both
  sides even around the light primary button. `color-scheme: dark` lets native controls (select,
  checkbox, radio, scrollbars) follow. Forced colours and `prefers-contrast` apply unchanged.
- **Reflow**: rem units, `min-h` never `h` on text containers, grids collapse to one column at
  320 px, header `static` under `max-height: 30rem` so zoomed pages keep their content reachable.
- **Language**: `<html lang>` from the route locale; `lang` on language names and on API-sourced
  text when the locale is not `en`.

## Component patterns (shell)

| Component                               | Pattern                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SkipLink`                              | `sr-only` link, visible on focus, first in `<body>`                                                                                                                                                                                                                                                                                                                                    |
| `SiteHeader`                            | brand link with real text; desktop `<nav aria-label="Main">` → `<ul>` of `NavLink` (`end` on Home → `aria-current="page"` on `/`; Shop → `aria-current="page"` on `/shop`, D-13); icon links Search / Account / Cart (badge `aria-hidden`, count in the name); `LanguageSwitcher`; mobile `Disclosure` (`aria-label="Open menu"`) holding nav + Search/Account (below `sm`) + switcher |
| `LanguageSwitcher`                      | `<nav aria-label="Language">` → `<details>` pill; summary text "EN, English. Change language" (visible label first, SC 2.5.3); panel = POST form, current locale `aria-current="true"`, buttons with `lang`                                                                                                                                                                            |
| `ThemeSwitcher`                         | `<div>` (not a landmark) → `<details>` pill; summary = icon of the current theme + sr text "Theme: Dark. Change theme"; panel = POST form to `set-theme` with System / Light / Dark buttons (icon + text), current theme `aria-current="true"`; the instance that submitted closes its panel, focuses its summary and announces the new theme (the pathname does not change)           |
| `SiteFooter`                            | `<footer>` outside `<main>`; brand link, `<nav aria-label="Footer">` in header order, language links with `hrefLang`/`lang`/`aria-current`                                                                                                                                                                                                                                             |
| `ErrorPage` / `ComingSoon` / `NotFound` | static `<h1>`, description, `ButtonLink` home; rendered inside the shell by `locale-errors`                                                                                                                                                                                                                                                                                            |

## Announcements and focus

| Event                                                                                                                                 | Message                                                               | Focus target                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pathname change (client navigation)                                                                                                   | `document.title`                                                      | `#main` (or `handle.initialFocus`)                                                                                                                               |
| pending navigation > 300 ms                                                                                                           | `common.loading` (once)                                               | unchanged                                                                                                                                                        |
| Escape in an open disclosure                                                                                                          | —                                                                     | its `<summary>`                                                                                                                                                  |
| theme chosen in the `ThemeSwitcher` (POST → 303 to the same URL; `RouteAnnouncer` stays silent)                                       | `common.theme.applied` ("Dark theme applied")                         | the switcher's `<summary>` (panel closed; the mobile menu stays open); without JS, full reload with the panel closed                                             |
| focus leaves an open disclosure                                                                                                       | —                                                                     | wherever focus went (panel closes)                                                                                                                               |
| search-param change on `/search` (first search included; `CatalogueResults` stays mounted across the prompt and results states)       | `catalogue.search.announce`                                           | unchanged (`#results-heading` when only the page changed)                                                                                                        |
| query cleared on `/search`                                                                                                            | `catalogue.search.prompt`                                             | unchanged                                                                                                                                                        |
| arrival on `/search` (pathname change)                                                                                                | `document.title`                                                      | `#search-q` (`handle.initialFocus`)                                                                                                                              |
| search-param change on `/shop` (sort, category, page; `CatalogueResults`, once `navigation.state` is idle)                            | `catalogue.results.announce`                                          | unchanged (`#results-heading` when only the page changed)                                                                                                        |
| sort chosen in the `<select>` (`SortForm`, navigates on change behind the `#sort-hint` description, D-11)                             | `catalogue.results.announce` / `catalogue.search.announce`            | unchanged (the select)                                                                                                                                           |
| "Clear filter" in the category fieldset                                                                                               | `catalogue.results.announce`                                          | the category `<fieldset>`                                                                                                                                        |
| "Categories" button on `/shop` below `lg` (with JS, D-16): unfold                                                                     | —                                                                     | the `<aside id="categories">` (named "Categories", `preventScroll`)                                                                                              |
| Escape inside the unfolded categories panel; the button pressed again                                                                 | —                                                                     | the "Categories" button (Escape) / unchanged (the button)                                                                                                        |
| gallery image change (`?image`, `ProductGallery`)                                                                                     | `product.gallery.shown`                                               | unchanged                                                                                                                                                        |
| add to cart, with JS (`AddToCartForm` fetcher settles)                                                                                | `cart.notice.added` / `addedCapped` via the `role="status"` paragraph | the Add to cart button                                                                                                                                           |
| add to cart, without JS (303 back to the product, flash)                                                                              | same paragraph                                                        | the status paragraph (`autoFocus`)                                                                                                                               |
| add to cart or Buy now refused (`out-of-stock`, `cart-full`, `product-not-found`, 400)                                                | `role="alert"` message                                                | the button that was pressed (with JS); unchanged without JS                                                                                                      |
| Buy now accepted (303 to the payment page in product mode, followed as a navigation with JS, a full load without)                     | `document.title` (pathname change) / the new document                 | `#main` (route default) / document start                                                                                                                         |
| cart action result, with JS (`useFetchers` in `routes/cart.tsx`, every fetcher keyed)                                                 | `noticeText(result)` (`cart.notice.*`)                                | see the rows below                                                                                                                                               |
| cart action result, without JS (303 back to the cart, flash) and cart reconciliation on load (`items-removed`, `quantities-adjusted`) | `FormNotice` (`role="status"`)                                        | the notice (`autoFocus`, mount effect)                                                                                                                           |
| invalid quantity (`invalid-quantity`, 400)                                                                                            | `role="alert"` message                                                | the quantity input (`aria-invalid`, `autoFocus` without JS)                                                                                                      |
| line removed                                                                                                                          | `cart.notice.removed`                                                 | next line's Remove button, else the previous one, else `#cart-heading`                                                                                           |
| promo code refused (`promo-required` / `promo-invalid`)                                                                               | `role="alert"` message                                                | the promo input (`autoFocus` without JS)                                                                                                                         |
| promo code applied                                                                                                                    | `cart.notice.promoApplied`                                            | the "Remove code" button (the Apply form unmounts)                                                                                                               |
| promo code removed                                                                                                                    | `cart.notice.promoRemoved`                                            | the promo input                                                                                                                                                  |
| cart total changed (`CartSummary`)                                                                                                    | `cart.summary.totalUpdated`                                           | unchanged                                                                                                                                                        |
| payment page reached with an empty cart (loader 302 / `place-order` 303 back to the cart, `empty-cart` flashed)                       | `role="alert"` message on the cart                                    | the alert (`autoFocus` without JS; `handle.initialFocus` with it, since the pathname changed)                                                                    |
| payment / contact / sign-in form refused (400, navigation form; codes `field-required`, `email-invalid`, `card-*-invalid`)            | one `role="alert"` under each invalid field (`Field`)                 | the first invalid field in document order (`autoFocus` without JS, `useFocusFirstInvalid` with it)                                                               |
| order placed (303 to the confirmation)                                                                                                | `document.title` (pathname change) / the new document                 | `#main` / document start                                                                                                                                         |
| contact message accepted (303 to `?sent=1`), sign-in mock accepted (303 to `?demo=1`)                                                 | `FormNotice` (`role="status"`) rendered by the loader                 | the notice (`autoFocus` without JS, mount effect with it — same pathname, so the route announcer stays silent)                                                   |
| PayPal chosen on the payment page (with or without JS)                                                                                | —                                                                     | unchanged; the card `<fieldset>` folds away through a CSS `:has()` rule on the checked radio (no-JS covered by `no-js.spec.ts`), the PayPal note appears with JS |
| payment page reached with a reconciled cart (`items-removed`, `quantities-adjusted`)                                                  | `FormNotice` (`role="status"`)                                        | the notice (`handle.initialFocus`, mount effect)                                                                                                                 |

## Automated coverage

- **Engine**: IBM Equal Access `accessibility-checker` (Apache-2.0), policy `WCAG_2_2`, configured
  in `.achecker.yml`; `tests/e2e/a11y-check.ts` exposes `expectAccessible(page, label, options)` and
  fails on every `violation` / `potentialviolation` except the manual-review rules below
  (`DECISIONS.md` D-3). Labels are unique per route × locale × state; JSON reports go to
  `test-results/a11y/`.
- **Coverage**: every route in `tests/e2e/routes.ts` × `en`/`pt` on desktop and mobile
  (`a11y.spec.ts`) — the home page `/` and the catalogue `/shop` included —, plus the open
  mobile menu. `a11y-states.spec.ts` scans the states the route
  list cannot express: the 502 page (fault injection `/products/999`), the catalogue with a failing
  category service, the filled cart, the cart with an invalid quantity and an invalid promo code,
  the cart with a promo applied, the cart after a refused checkout, the product page after "Add to
  cart", the payment page (card, PayPal, refused fields, product mode after Buy now), the order
  confirmation (cart and Buy now), the contact form refused and sent, the sign-in form refused and
  its demo notice, the open language panel, the open theme panel, the explicit dark theme
  (cookie) on `/`, `/shop`, a product, the cart and the payment page plus the product page
  under `forced-colors: active` in the dark theme, and `/` + product under
  `prefers-reduced-motion: reduce` and `forced-colors: active`. The `dark-chromium` project
  (`colorScheme: "dark"`, no cookie) runs the whole `a11y.spec.ts` matrix under the system
  dark preference. The route list also carries the
  states a URL can express: `/checkout?product=1`, `/contact?sent=1`, `/account?demo=1`.
- **Engine quirks handled in markup or in the spec** (not excluded rules): `input_label_visible`
  only credits a visible `<label for>` to `input`/`button`, so the contact `<textarea>` also
  carries `aria-labelledby` pointing at the same label (name unchanged); `input_autocomplete_valid`
  rejects `street-address` on an `<input>` (`address-line1` is used) and `username` on
  `type="email"` (`email` is used); `element_tabbable_unobscured` reads the header links as
  obscured once the page is scrolled, so the PayPal state is scanned after scrolling back to the
  top; `text_sensory_misuse` flags "below" and "small" in instructions, which the copy avoids.
- **Reflow** (`reflow.spec.ts`): every route × locale at 320 × 256 px asserts
  `scrollWidth <= 320`, before and after injecting the WCAG 1.4.12 text-spacing CSS; plus the
  filled cart and the open mobile menu.
- **Keyboard** (`keyboard.spec.ts`): skip link first and functional; desktop tab order; Escape on
  the language panel restores focus; mobile menu Escape restores focus; navigating from the menu
  closes it and focuses `main`; client navigation announces the title.
- **Targets** (`targets.spec.ts`): every visible link, button and summary in the header and the
  footer, the sort Apply button (measured focused: with JavaScript it is `sr-only` until then)
  and the promo "Remove code" button measure at least 44 px tall (desktop and mobile). Stretched
  card links and links inside sentences are the exceptions.
- **Static**: `eslint-plugin-jsx-a11y` strict with the design-system primitives mapped to their
  native elements; `eslint-plugin-i18next` keeps UI text out of components.
- **Unit**: role/name tests for every primitive and shell component (`aria-current`, cart link
  name, announcer regions, disclosure focus rules).

### Manual-review rules (excluded from the automated failure list)

| Rule id                       | Scope                                                                                                                | Why the engine cannot decide                                                                                                                                                                                           | How it is verified                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `style_color_misuse`          | every scan                                                                                                           | fires on any stylesheet that sets colours; asks a human to confirm colour is never the only carrier of information                                                                                                     | "never colour alone" rules above + Chrome vision-deficiency emulation in the audit log |
| `element_tabbable_unobscured` | **open mobile menu** (`a11y.spec.ts`), **open language panel** and **open theme panel** (`a11y-states.spec.ts`) only | the overlay covers page content by user action; the engine cannot know it closes on Escape, outside click, focus leaving and navigation (D-5)                                                                          | `keyboard.spec.ts` + `disclosure.test.tsx`                                             |
| `input_label_visible`         | **cart scans only** (filled cart, invalid quantity and promo, promo applied — `a11y-states.spec.ts`)                 | the stepper `+`/`−` and Remove buttons are icon-only with `aria-label` names ("Decrease quantity of X", "Remove X"); their visible label is the icon, which SC 2.5.3 allows, and the engine asks a human to confirm it | keyboard and VoiceOver protocol (cart flow) + `cart.spec.ts` role/name queries         |

## Manual protocol

Run before each release and after any change to the shell or a page structure:

1. **VoiceOver + Safari** (macOS): full flows on the three challenge pages — rotor landmarks and
   headings, skip link, menu, language switch, catalogue sort/filter/pagination, product add to
   cart, cart quantity/remove/promo/checkout.
2. **NVDA + Firefox** when a Windows machine is available; otherwise logged as not run.
3. **400 % zoom** (1280 px window) and **320 px** viewport: no horizontal scroll, header static
   under 30 rem height.
4. **Chrome vision-deficiency emulation**: protanopia, deuteranopia, tritanopia, achromatopsia.
5. **Text-spacing bookmarklet** (WCAG 1.4.12) on every page.
6. **Keyboard-only** run of every flow; **reduced motion** and **forced colours** (Windows High
   Contrast or `emulateMedia`).
7. **Lighthouse** accessibility score.

## Findings fixed by the automated audit (2026-09-11)

| Finding                                                                                                       | Fix                                                                                                    |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Portuguese sort `<select>` overflowed 320 px (intrinsic width of the longest option, worse with text spacing) | `Select` shrinks inside its flex chain (`min-w-0`, `max-w-full`, `w-full`)                             |
| Quantity input had no visible label; cart forms shared the same (empty) name                                  | visible "Qty" / "Qtd." label + `aria-labelledby` (label + line title); `aria-label` on every cart form |
| Quantity submitted on every keystroke (React `onChange`), racing the focus handoff                            | submit on blur / Enter (native change semantics)                                                       |
| Header icon links stayed visible below 640 px (`inline-flex` beat `hidden`)                                   | display left to the caller                                                                             |
| Low-stock text "Only n left"                                                                                  | "Only n in stock" (sensory wording)                                                                    |
| Duplicate review labels                                                                                       | "Review n of N" + reviewer name                                                                        |

## Findings fixed after the 2026-09-12 project review (#19)

| Finding                                                                                                                                                                                                           | Fix                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| First search from `/search` never announced: the prompt state rendered another tree, so the results mounted fresh and the announcer hook only reacted to later changes; the way back to the prompt was silent too | `CatalogueResults` accepts `view: null` and stays mounted; the hook announces prompt → results and results → prompt (`emptyAnnouncement`) |
| `Button size="sm"` rendered 36 px (sort Apply, "Remove code"); footer brand, nav and language links and the header brand were text lines of ~26 px                                                                | `sm` keeps `min-h-11` with tighter horizontal padding; the links are `inline-flex min-h-11 items-center`                                  |
| Enter in the cart quantity field dropped the focus: the input was keyed on the in-flight value and remounted mid-submission (#18)                                                                                 | uncontrolled input, never remounted; the shown value is written back by an effect                                                         |
| Applying a promo code dropped the focus: the Apply form was swapped for the Remove form (#18)                                                                                                                     | "Remove code" receives the focus once the code is applied                                                                                 |
| A refused checkout (`empty-cart`) left the focus on `<body>` with JavaScript and answered a bare 400 without it (#18)                                                                                             | checkout form honours `noJs`; the alert is rendered in both cart states and takes the focus (`autoFocus` without JS, effect with it)      |

## Manual audit log

| Date       | Tool / AT                                   | Scope                                                                                                                                                                                                                                                                                              | Result                                                  |
| ---------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 2026-09-11 | Playwright keyboard specs (desktop, mobile) | shell: skip link, tab order, menus, navigation focus                                                                                                                                                                                                                                               | pass (automated stand-in; VoiceOver run pending)        |
| 2026-09-11 | Playwright specs                            | catalogue, search, product, cart focus handoffs and announcements                                                                                                                                                                                                                                  | pass                                                    |
| 2026-09-12 | Playwright specs (desktop, mobile)          | first search and cleared query announced; 44 px targets in the shell, sort Apply and "Remove code"                                                                                                                                                                                                 | pass                                                    |
| 2026-09-12 | Playwright specs (4 projects) + IBM checker | cart focus after Enter, Apply and a refused checkout, with and without JavaScript; `empty-cart` state scanned                                                                                                                                                                                      | pass                                                    |
| 2026-09-13 | Playwright specs (4 projects) + IBM checker | sort on selection: focus kept on the select, results announced, Apply shown on focus, GET form without JavaScript                                                                                                                                                                                  | pass                                                    |
| 2026-09-13 | Playwright specs (4 projects) + IBM checker | payment page (cart and Buy now modes), contact, blog, about and account: focus on the first invalid field and on the success status with and without JavaScript, `empty-cart` handoff to the cart alert, reflow at 320 px, scans of every new state                                                | pass (keyboard walkthrough by a person still to record) |
| 2026-09-13 | Playwright specs (5 projects) + IBM checker | dark theme: system preference on every route x locale (`dark-chromium`), explicit dark on the shell pages and under forced colours, the open theme panel; focus back on the switcher and the change announced, with and without JavaScript; contrast of every dark role pair in `contrast.test.ts` | pass                                                    |
| —          | VoiceOver + Safari                          | —                                                                                                                                                                                                                                                                                                  | not run yet (branch 12)                                 |
| —          | NVDA + Firefox                              | —                                                                                                                                                                                                                                                                                                  | not run yet (no Windows machine)                        |

## Known limitations

- `<details>`/`<summary>` is announced as "summary" or "details" by some screen readers; accepted
  for its native keyboard behaviour and no-JS support.
- The category filter (branch 7) renders a single-select as checkboxes to match the wireframe; an
  advisory hint explains the behaviour.
- ltplabs.com's own navigation (`<div>` of `<button aria-haspopup>`) is deliberately replaced by
  `<nav><ul>` of links.
