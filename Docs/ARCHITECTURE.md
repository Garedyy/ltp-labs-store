# Architecture

> The reference specification is [`PROJECT_PLAN.md`](PROJECT_PLAN.md) §3; the API contract is
> [`dummyjson-openapi.yaml`](dummyjson-openapi.yaml); deviations are recorded in
> [`DECISIONS.md`](DECISIONS.md).

## Request lifecycle

1. `root.tsx` middleware: `i18nextMiddleware` (locale from the URL prefix, per-request i18next
   instance in the router context) then `responseHeadersMiddleware` (`Cache-Control: private,
no-cache`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`).
2. `routes/locale-layout.tsx` middleware `validateLocale`: asset-like segment → 404; upper-case →
   301; unknown → 302 to the detected locale; otherwise `next()`.
3. Loaders run (root: `{ locale, origin, brand, theme }`; layout: `{ cartCount }`; leaf).
4. `entry.server.tsx` renders inside `I18nextProvider` with the request's instance (EN fallback
   instance when the middleware never ran).

## Routes (`app/routes.ts`)

```
/                          locale-redirect.tsx   302 → /{detected}
/:lang                     locale-layout.tsx     middleware + shell
  set-language             set-language.tsx      action only (lng cookie), GET → 405
  set-theme                set-theme.tsx         action only (theme cookie), GET → 405
  (pathless)               locale-errors.tsx     shared ErrorBoundary inside the shell
    index                  home.tsx              loader: 8 best-rated products (trending); catalogue params → 301 to shop
    shop                   catalogue.tsx         loader: categories → query → products → CatalogueView
    products/:productId    product.tsx           loader: getProduct → ProductView; ?image read client-side
    search                 search.tsx            ?q → searchProducts; empty q renders the prompt without fetching
    cart                   cart.tsx              loader: loadCartView; action: set-quantity | remove | apply-promo | remove-promo
    checkout               checkout.tsx          payment page: loader prices the cart or ?product=<id>; action: place-order
    checkout/confirmation  order-confirmation.tsx lastOrder from the session, lines priced again; never revalidates
    about                  about.tsx             static content (story, values, fictional team)
    contact                contact.tsx           details + form; action: send → 400 codes or 303 ?sent=1
    blog                   blog.tsx              three invented posts, dates formatted in the loader
    account                account.tsx           device session (cart count, lastOrder), demo profile; action: sign-in → 400 codes or 303 ?demo=1
    *                      not-found.tsx         404 inside the shell
```

Every route of the plan is in place. The shell
(`locale-layout.tsx`) renders `SkipLink`, `SiteHeader` (with `cartCount` from its loader),
`<main id="main">`, `SiteFooter`, the announcer regions and `RouteAnnouncer`. Errors thrown by the
layout's own middleware (asset deny-list) reach the shell-less root boundary; every leaf error
renders inside the mounted shell through `locale-errors.tsx`. Loaders, actions and middleware
read `url` from their arguments — never `request.url`, which may carry `.data` suffixes.
Internal links use `href("/:lang/…", { lang })`.

**Theme** (#47, D-20): the root loader reads the `theme` cookie (`app/theme/theme-cookie.server.ts`,
`light` | `dark`, anything else → `system`) and `root.tsx` renders `data-theme` on `<html>` plus
`<meta name="color-scheme">`, so an explicit choice is applied before any stylesheet or script;
`system` leaves the attribute off and the CSS follows `prefers-color-scheme`. The `set-theme`
action is the only writer of the cookie; choosing `system` deletes it. The root loader
revalidates on every submission (`revalidateOnPathnameOrSubmit`), which is what updates the
attribute after a client-side POST.

## Data layer (DummyJSON)

Contract: [`dummyjson-openapi.yaml`](dummyjson-openapi.yaml). Code: `app/services/dummyjson/`
(server-only). Base URL from `DUMMYJSON_BASE_URL` (the e2e suite points it at the mock API).

| Function (`products.server.ts`)                 | Endpoint                                   | Cache TTL |
| ----------------------------------------------- | ------------------------------------------ | --------- |
| `getProducts({ limit, skip, sortBy?, order? })` | `GET /products`                            | 5 min     |
| `getProductsByCategory(slug, params)`           | `GET /products/category/:slug`             | 5 min     |
| `searchProducts(q, params)`                     | `GET /products/search?q=`                  | 5 min     |
| `getProduct(id)` → `Product \| null`            | `GET /products/:id` (404 → `null`)         | 10 min    |
| `getProductsByIds(ids)`                         | parallel `getProduct` (≤ 50, the cart cap) | —         |
| `getCategories()`                               | `GET /products/categories`                 | 1 h       |

- **Client** (`client.server.ts`): `fetchJson(path, params, parse)` builds the URL without a
  trailing slash, skips `undefined` params, times out after 8 s and sends `accept: application/json`.
  `404` → `ApiError(404)`; any other failure — `429` rate limit, `5xx`, timeout, network error,
  HTML body, guard rejection — → `ApiError(502)`, rendered as "Product service unavailable".
- **Cache** (`cache.server.ts`): `cached(key, ttlMs, load)` — module-scope `Map`, successes only,
  cleared above 300 entries, **in-flight de-duplication** so concurrent SSR requests for the same
  key share one upstream call. Required because DummyJSON allows 100 requests / 10 s per IP and every
  visitor's SSR shares the server's budget.
- **Guards** (`guards.ts`): hand-written parsers following the contract's
  `required: [id, title, price, category]`; everything else is defaulted (`brand` is missing on 92
  products, `stock: 0` on 4, `images` falls back to `thumbnail`). Lists use
  `select=id,title,price,thumbnail,stock` (cards show title + price + stock only).
- **Pagination** (`app/lib/catalogue/pagination.ts`): `PAGE_SIZE = 9`; the API echoes the number
  of items returned as `limit`, so pages are always computed from `total`.
- **Rate-limit strategy**: cache + de-duplication, `select` to shrink payloads, one list call per
  page, categories cached for an hour, no fan-out beyond the cart's product lookups.

### Home loader (`app/routes/home.tsx`)

`/:lang` is the landing page since D-13 (#29): `getProducts({ limit: 8, skip: 0, sortBy: "rating",
order: "desc" })` through `cached` (5 min, one DummyJSON call shared by every visitor) →
`toCardView` per product (`formatPrice` in the loader) → `ProductGrid` named by the `<h1>` and a
"Browse the shop" link. No sort, filter or pagination: those live on `/shop`. A request that
carries any catalogue parameter (`q`, `category`, `sort`, `page`) — a link from before the
split — is answered **301 to `/:lang/shop` with the same search**.

### Catalogue loader (`app/routes/catalogue.tsx`, served at `/:lang/shop`)

`getCategories()` (1 h cache) → `parseCatalogueQuery(url.searchParams, slugs)` → unknown category
→ 302 to the canonical URL → `getProductsByCategory` / `getProducts` with `listParamsFor(query)`
→ `page > pageCount` with `total > 0` → 404 → `buildCatalogueView` (`formatPrice` per locale,
`href` per card). Every `ApiError` becomes a `data(null, { status })` through `toRouteError`, so the
boundary renders 404 or 502 inside the shell. Titles: "Shop" or the translated category name,
"— page N" appended above page 1.

Client-side behaviour is owned by `CatalogueResults`: on every search-param change it announces
`catalogue.results.announce` and, when only `page` changed, focuses `#results-heading`.
`CategoryFilter` and `SortForm` navigate on change with `buildSearch` and show an optimistic
selection while the navigation is pending (the sort reads it from the pending URL, D-11); the
filter focuses its fieldset after "Clear filter". Both are plain GET forms underneath (hidden
inputs ordered so native submits also produce `q, category, sort`), their Apply buttons `sr-only`
until focused once scripts run. The catalogue route passes `CategoryFilter` to `CatalogueResults`
as its `filters` slot: rendered last in the DOM (desktop tab order: products, pagination,
categories), placed under the toolbar below `lg` where a "Categories" button unfolds it and, on
opening, moves the focus into the panel (D-16); without scripts the panel is simply shown there.

### Search (`app/routes/search.tsx`)

Same query parsing and view builder as the catalogue, without categories. An empty or
whitespace-only `q` renders the form and a prompt with no API call; otherwise
`searchProducts(q, params)` with the same sort and pagination. `handle.initialFocus = "#search-q"`
makes `RouteAnnouncer` focus the search box on client navigation; results announce
`catalogue.search.announce{q,count}`. Search titles quote `q` in the locale's quotation marks.

### Product page (`app/routes/product.tsx`)

`getProduct(id)` (invalid or unknown id → 404 `product-not-found`, API failure → 502) →
`buildProductView` (`app/lib/product/view.server.ts`): integer-cent prices, original price derived
from `discountPercentage` (shown only when ≥ 1 % and ≥ 1 cent apart), `formatPercent`, rating and
review dates formatted per locale, practical-information rows (brand omitted when missing,
dimensions in cm, weight in kg — plan assumption). The gallery reads `?image` from the URL
(`clampImageIndex`) because thumbnails navigate with `replace` and `shouldRevalidate` returns
`false` when only `?image` changed — no `.data` request. Shell loaders (`root`, `locale-layout`,
`locale-errors`) share `revalidateOnPathnameOrSubmit` for the same reason.

## Error and notice codes

`app/lib/error-codes.ts` is the single source. Error codes: `page-not-found`,
`product-not-found`, `service-unavailable`, `invalid-intent`, `invalid-quantity`, `out-of-stock`,
`cart-full`, `promo-required`, `promo-invalid`, `empty-cart`. Notice codes: `added`,
`added-capped`, `quantity-updated`, `quantity-clamped`, `removed`, `promo-applied`,
`promo-removed`, `items-removed`, `quantities-adjusted`. Both map to translation keys with
`satisfies Record<Code, string>`. Loaders throw
`data({ code }, { status })` through `notFound(code)` / `toRouteError`; `RouteErrorBoundary` and
the `locale-errors` meta map the code to `errors.<key>` — a missing translation is a compile error.

### URL contract (`app/lib/catalogue/query.ts`)

`?q`, `?category`, `?sort`, `?page` written in that fixed order; `page=1` never written; `page`
dropped whenever `q`, `category` or `sort` change (`buildSearch`). `page` not a positive integer →
1; `sort` not a `SortKey` → default order; `category` not `/^[a-z-]+$/` or unknown → the loader
redirects to the same URL without it (`query.canonical`); `q` trimmed and truncated to 100 chars.

### Fixtures and mock API

`tests/fixtures/dummyjson/` holds `products-all.json` (194 summaries with
`title, price, thumbnail, stock, category, rating, discountPercentage`), `categories.json` and
ten full products (`1, 2, 3, 6, 16, 78, 117, 132, 153, 193` — the last four have `stock: 0`;
16 and 153 have no `brand`). `tests/e2e/mock-api.server.ts` (Node only, run directly as
TypeScript) serves them on port 4010 implementing `limit/skip/select/sortBy/order`, category and
search listing with the contract's quirks (echoed `limit`, `q` normalisation, empty list for an
unknown category, `{ message }` errors, HTML 404 for unknown paths, 301 on trailing slashes) and
fault injection: `/products/999` → 500, `/products/998` → 10 s delay,
`/products/categories?fail=1` → 500, `?rateLimit=1` → 429. `tests/e2e/mock-api.spec.ts` guards
these behaviours.

**Refreshing fixtures**: `curl "https://dummyjson.com/products?limit=0&select=title,price,thumbnail,stock,category,rating,discountPercentage" > tests/fixtures/dummyjson/products-all.json`,
`curl https://dummyjson.com/products/categories > tests/fixtures/dummyjson/categories.json`, and
`curl https://dummyjson.com/products/<id> > tests/fixtures/dummyjson/product-<id>.json` for each
id above; then run `npm run test:e2e`.

## Cart session (`app/services/cart/`)

- **Cookie**: `createCookieSessionStorage` named `__cart`, signed with `SESSION_SECRET` (a fixed
  development secret with a console warning when unset; production throws at boot), `httpOnly`,
  `SameSite=Lax`, `secure` when `COOKIE_SECURE=true`, 30 days. Data:
  `{ cart: { productId, quantity }[], promoCode?, lastOrder? }` plus flash slots. A tampered cookie
  fails the signature and reads as an empty cart (`session.server.test.ts`, `cart-session.spec.ts`).
- **Sanitisation** (`cart.ts`): every read goes through `sanitiseLines` — array, integer ids,
  quantity 1..99, duplicates merged, first 50 lines — and `lastOrder` through `sanitiseOrder`
  (number pattern, method, integer cents, at least one sanitised line). A 50-line cart serialises under 4000 bytes
  (unit-tested).
- **Maths** (`totals.ts`): integer cents; shipping $20 on a non-empty cart; `LTP10` = 10 % of the
  subtotal (rounded); `FREESHIP` = free shipping (`promo-codes.ts`, case-insensitive, trimmed).
- **Intents** (`intents.ts`): `set-quantity | remove | apply-promo | remove-promo` for the cart
  route, all with **absolute** quantities (idempotent under rapid clicks); `add` and `buy-now`
  (`AddIntent`) belong to the product route; `place-order` belongs to the checkout route
  (`parsePaymentMethod` reads `card | paypal`, card by default). `noJs=1` (a hidden input inside
  `<noscript>`) marks a submission made without JavaScript.
- **`add` / `buy-now` action** (`routes/product.tsx`): unsets `lastOrder`, refuses a missing
  product (`product-not-found`, 400) or a sold-out one (`out-of-stock`). `add` then refuses a
  51st distinct line (`cart-full`), otherwise `addLine` (quantity +1 in place, capped at
  `min(99, stock)` → `added-capped`); with JavaScript the fetcher receives `data(result)` +
  `Set-Cookie`, without it the result is flashed into the session and the action answers **303
  back to the page** (Post/Redirect/Get), where the loader reads and clears the flash and the
  status paragraph receives focus. `buy-now` (#28, D-12, amended by D-15) is a one-unit purchase
  of this product alone: after the same checks the action answers **303 to
  `/:lang/checkout?product=<id>`** with or without JavaScript — the fetcher follows the redirect
  as a navigation — and the payment page prices that one unit (price + shipping, no promo code);
  the `cart` and `promoCode` slots are untouched. A refusal takes the `add` paths above. Both buttons live in
  the one `AddToCartForm` fetcher form (landmark `product.buyBlock`) as submit buttons named
  `intent`, so a refusal renders in the same alert and the focus returns to the button that was
  pressed.
- **Header count**: the locale layout loader counts the sanitised cookie (no API call, no
  commit) and revalidates after every submission. On the cart page `SiteHeader` prefers the
  reconciled `useRouteLoaderData("routes/cart")?.view.cartCount`, so dropped or clamped lines
  never leave a stale badge.
- **Concurrency**: `AddToCartForm` ignores submits while its fetcher is pending; the cookie is
  last-write-wins across tabs (documented limitation).
- **Cart page** (`routes/cart.tsx`): the loader runs `loadCartView` — vanished or sold-out
  products dropped (`items-removed`), quantities above stock clamped (`quantities-adjusted`),
  totals per locale — reads a flashed result from a no-JS submission and commits the session when
  anything changed. The action parses the intent, unsets `lastOrder`, then: `set-quantity`
  (the stepper's `+`/`−` buttons submit `setQuantity`, which overrides the input's `quantity` —
  browsers serialise the submitter at its DOM position, so the two need distinct names, D-8;
  non-integer → `invalid-quantity` 400; clamped to `1..min(99, stock)` → `quantity-clamped`;
  product vanished → line removed + `items-removed`), `remove` (→ `removed{title}`), `apply-promo`
  (`promo-required` / `promo-invalid` / `promo-applied{code}`; a new code replaces the old one),
  `remove-promo`. With JavaScript every form is a keyed `fetcher.Form` and the page handles
  results centrally through `useFetchers` (announcements, removal focus handoff). Without
  JavaScript the result is flashed and the action redirects back (303). "Check out" and "Or pay
  with PayPal" are links to the payment page (`/checkout`, `/checkout?method=paypal`); the route
  exports `handle.initialFocus = "#checkout-refused"` so that, arriving back from the payment
  page with a flashed `empty-cart`, the route announcer focuses the alert rather than `main`.
- **Payment page** (`routes/checkout.tsx`, D-15): the loader runs `loadCheckout`
  (`services/cart/checkout.server.ts`) — cart mode reuses `loadCartView` (reconciliation, promo,
  totals) and an empty cart is sent **back to the cart** with `empty-cart` flashed
  (302 from the loader, 303 from the action); product mode (`?product=<id>`, Buy now) prices one
  unit through `toLineView` / `toTotalsView` without the promo code, answers 404
  (`product-not-found`) for an unknown product and redirects a sold-out one to its page.
  `?method=paypal` preselects PayPal. The form (`components/cart/checkout-form.tsx`) is a
  navigation `<Form>`: e-mail, shipping address (name, address, postal code, city, country
  `<select>`), payment method radios and card fields (name on card, number, MM/YY, security
  code). The `place-order` action validates with `lib/validation.ts` (`isEmail`, Luhn
  `isCardNumber` 13–19 digits, `isCardExpiry` not before the current month, `isCardCode` 3–4
  digits) into per-field codes (`field-required`, `email-invalid`, `card-*-invalid`); card
  fields are only required for `card` and fold away while the PayPal radio is checked (a CSS
  `:has()` rule on the form, so it works without JavaScript). A refusal is a **400 with the typed
  values** re-rendered (`defaultValue`; card number, expiry and security code never echoed) and
  the focus on the first invalid field
  (`autoFocus` on the no-JS document, `useFocusFirstInvalid` with JavaScript). On success the
  action writes `lastOrder = { number: "LTP-" + base36 time, method, totalCents, lines }` (the
  `{ productId, quantity }` lines of the order, D-17), clears `cart` and `promoCode` in cart mode
  only, and answers 303 to the confirmation. **Card data is checked for its format and dropped**: it is never stored, logged
  or sent anywhere. In cart mode the loader passes the reconciliation notice through
  (`FormNotice`, `handle.initialFocus`), and `readFields` caps every field (200 characters, 2 000
  for the contact message).
- **Content forms** (`routes/contact.tsx`, `routes/account.tsx`): the same pattern without a
  session — `readFields` / `fieldProps` (`lib/forms.ts`), `TextField` and `FormNotice`
  (`components/forms/`), errors as a 400 with values kept, success as **303 to `?sent=1` /
  `?demo=1`** (the URL is the state, no flash) where the loader renders a focused
  `role="status"`. Nothing is sent, created or stored: both are demo forms and say so.
- **Confirmation** (`routes/order-confirmation.tsx`): `lastOrder` persists until the next cart
  mutation, so reloads and language switches keep it; it goes through `sanitiseOrder` (an older
  cookie without `lines`, or a malformed one, reads as no order); missing → redirect to the cart.
  The loader fetches the ordered products again (`getProductsByIds`, cached) to render the lines
  with `toLineView`, skipping a product gone from the catalogue, derives the item count from the
  lines and formats the total from `totalCents` in the current locale; `shouldRevalidate: () =>
false`.

## Progressive enhancement

JavaScript is additive. Every flow is verified with it disabled (Playwright `no-js` project).

| Interaction                          | Without JavaScript                                                                                                                                               | With JavaScript                                                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sort                                 | GET form, visible Apply                                                                                                                                          | `onChange` navigates in place, optimistic selection, Apply shown on focus                                                                                                                    |
| Category                             | checkbox + Apply button; below `lg` the panel is shown in place under the toolbar                                                                                | `onChange` navigates in place, optimistic selection, Apply shown on focus; below `lg` a "Categories" button (`aria-expanded`) unfolds the panel, focus moves into it, Escape folds it (D-16) |
| Page / search                        | links and GET form → full document                                                                                                                               | client navigation; page change focuses the results summary                                                                                                                                   |
| Gallery thumbnail                    | link `?image=n`                                                                                                                                                  | client navigation with `replace`, no refetch                                                                                                                                                 |
| Add to cart, stepper, remove, promo  | POST → 303 back with a flashed result (`noJs` hidden input inside `<noscript>`), focused notice                                                                  | `fetcher.Form`, stay in place, announcements, focus handoff                                                                                                                                  |
| Check out / PayPal (cart)            | links to `/checkout` (`?method=paypal`); empty cart → 302 back with a flashed, focused alert                                                                     | same (client navigation, `handle.initialFocus` targets the alert)                                                                                                                            |
| Payment page                         | POST → 400 with values kept and `autofocus` on the first invalid field; success → 303 to the confirmation; card fields fold away for PayPal through CSS `:has()` | same navigation form; effect focuses the first invalid field; same CSS fold                                                                                                                  |
| Contact / sign-in forms              | POST → 400 with values kept, `autofocus` on the first invalid field; success → 303 to `?sent=1` / `?demo=1` with a focused status                                | same; the status mounts after the navigation and takes the focus                                                                                                                             |
| Language switch                      | POST form → 303 + cookie                                                                                                                                         | same                                                                                                                                                                                         |
| Theme switch                         | POST form → 303 to the same URL + cookie (`system` deletes it); `data-theme` rendered by the server                                                              | same navigation; the switcher closes its panel, focuses its summary and announces the theme                                                                                                  |
| Mobile menu / language / theme panel | native `<details>`                                                                                                                                               | Escape, outside click, focus leaving, close on navigation                                                                                                                                    |

## Security

- `__cart` is signed (tampering → empty cart) and `httpOnly`; `lng` is validated against
  `LOCALES` and written only by the `set-language` action with a same-origin `redirectTo`;
  `theme` is validated against `THEMES` and written only by the `set-theme` action, same rules.
- Every mutation is a same-origin `POST` on a `SameSite=Lax` cookie: no CSRF token is needed.
- `SESSION_SECRET` rotation empties every cart (documented); no user-generated HTML is rendered.
- Response headers: `Cache-Control: private, no-cache` (pages depend on cookies),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY`. No CSP: the app has one inline script (the `js` class) and no
  third-party scripts; adding a nonce-based CSP is a documented follow-up.

## Conventions and recipes

- `*.server.ts` files never reach the client bundle; `Intl`, cookies and the API client live
  there. Preferences follow one pattern: a validated cookie (`lng`, `theme`), one action-only
  resource route as its single writer, a POST form with a same-origin `redirectTo`. Components receive preformatted strings.
- Route modules import `type { Route } from "./+types/<name>"`; loaders read `url` from their
  arguments; links use `href("/:lang/…", { lang })`.
- UI text lives in `app/locales/<lang>/<domain>.ts`; primitives take labels as props;
  `eslint-plugin-i18next` blocks literals in JSX.
- Error and notice codes are unions in `app/lib/error-codes.ts`, mapped to translation keys with
  `satisfies` so a missing translation fails `tsc`.
- Tests: `*.test.ts(x)` next to the code for pure logic and components; `tests/e2e/*.spec.ts`
  for routes, with `tests/e2e/routes.ts` feeding the accessibility and reflow matrices.

### Adding a page

1. Create `app/routes/<name>.tsx` with a `loader` that reads `getLocale(context)` /
   `getInstance(context).t`, a `meta` built with `pageMeta`, and a component with one `<h1>`.
2. Register it in `app/routes.ts` inside the `locale-errors` layout.
3. Add its strings to `app/locales/en/pages.ts` and `pt/pages.ts` (`tsc` checks parity).
4. Link it from `SiteNav` / `SiteFooter` if it belongs to the navigation.
5. Append its path to `tests/e2e/routes.ts` — the WCAG scan and the reflow test pick it up.
