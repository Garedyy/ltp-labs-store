# Architecture

> Skeleton — filled in as the feature branches land. The reference specification is
> [`PROJECT_PLAN.md`](PROJECT_PLAN.md) §3; the API contract is
> [`dummyjson-openapi.yaml`](dummyjson-openapi.yaml).

## Request lifecycle

1. `root.tsx` middleware: `i18nextMiddleware` (locale from the URL prefix, per-request i18next
   instance in the router context) then `responseHeadersMiddleware` (`Cache-Control: private,
no-cache`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`).
2. `routes/locale-layout.tsx` middleware `validateLocale`: asset-like segment → 404; upper-case →
   301; unknown → 302 to the detected locale; otherwise `next()`.
3. Loaders run (root: `{ locale, origin, brand }`; layout: `{ cartCount }`; leaf).
4. `entry.server.tsx` renders inside `I18nextProvider` with the request's instance (EN fallback
   instance when the middleware never ran).

## Routes (`app/routes.ts`)

```
/                          locale-redirect.tsx   302 → /{detected}
/:lang                     locale-layout.tsx     middleware + shell
  set-language             set-language.tsx      action only (lng cookie), GET → 405
  (pathless)               locale-errors.tsx     shared ErrorBoundary inside the shell
    index                  catalogue.tsx         loader: categories → query → products → CatalogueView
    products/:productId    product.tsx           loader: getProduct → ProductView; ?image read client-side
    search                 search.tsx            ?q → searchProducts; empty q renders the prompt without fetching
    cart                   cart.tsx              placeholder until feature/cart-page
    about|contact|blog|account                   translated "coming soon" pages
    *                      not-found.tsx         404 inside the shell
```

`checkout/confirmation` is added by `feature/cart-page`. The shell
(`locale-layout.tsx`) renders `SkipLink`, `SiteHeader` (with `cartCount` from its loader),
`<main id="main">`, `SiteFooter`, the announcer regions and `RouteAnnouncer`. Errors thrown by the
layout's own middleware (asset deny-list) reach the shell-less root boundary; every leaf error
renders inside the mounted shell through `locale-errors.tsx`. Loaders, actions and middleware
read `url` from their arguments — never `request.url`, which may carry `.data` suffixes.
Internal links use `href("/:lang/…", { lang })`.

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

### Catalogue loader (`app/routes/catalogue.tsx`)

`getCategories()` (1 h cache) → `parseCatalogueQuery(url.searchParams, slugs)` → unknown category
→ 302 to the canonical URL → `getProductsByCategory` / `getProducts` with `listParamsFor(query)`
→ `page > pageCount` with `total > 0` → 404 → `buildCatalogueView` (`formatPrice` per locale,
`href` per card). Every `ApiError` becomes a `data(null, { status })` through `toRouteError`, so the
boundary renders 404 or 502 inside the shell. Titles: "Shop" or the translated category name,
"— page N" appended above page 1.

Client-side behaviour is owned by `CatalogueResults`: on every search-param change it announces
`catalogue.results.announce` and, when only `page` changed, focuses `#results-heading`.
`CategoryFilter` keeps an optimistic selection while the navigation is pending and focuses its
fieldset after "Clear filter". `SortForm` and the category form are plain GET forms (hidden inputs
ordered so native submits also produce `q, category, sort`).

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

`app/lib/error-codes.ts` is the single source: `page-not-found`, `product-not-found`,
`service-unavailable` (cart codes arrive with the cart branches). Loaders throw
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

## Cart session

_TO DO (cart-session / cart-page): flow, intents, PRG, concurrency._

## Progressive enhancement

_TO DO (app-shell)._

## Security

_TO DO (cart-session): signed `__cart`, validated `lng`, SameSite, headers rationale._

## Conventions and recipes

_TO DO (docs-release): file conventions, "add a page" recipe._
