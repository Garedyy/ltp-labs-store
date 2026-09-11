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
    index                  catalogue.tsx
    search                 search.tsx            placeholder until feature/search
    cart                   cart.tsx              placeholder until feature/cart-page
    about|contact|blog|account                   translated "coming soon" pages
    *                      not-found.tsx         404 inside the shell
```

`products/:productId` and `checkout/confirmation` are added by their feature branches. The shell
(`locale-layout.tsx`) renders `SkipLink`, `SiteHeader` (with `cartCount` from its loader),
`<main id="main">`, `SiteFooter`, the announcer regions and `RouteAnnouncer`. Errors thrown by the
layout's own middleware (asset deny-list) reach the shell-less root boundary; every leaf error
renders inside the mounted shell through `locale-errors.tsx`. Loaders, actions and middleware
read `url` from their arguments — never `request.url`, which may carry `.data` suffixes.
Internal links use `href("/:lang/…", { lang })`.

## Error and notice codes

_TO DO (cart-session)._

## Data layer (DummyJSON)

_TO DO (dummyjson-client): endpoints, params, rate-limit strategy, guards, TTLs, fixture refresh._

## Cart session

_TO DO (cart-session / cart-page): flow, intents, PRG, concurrency._

## Progressive enhancement

_TO DO (app-shell)._

## Security

_TO DO (cart-session): signed `__cart`, validated `lng`, SameSite, headers rationale._

## Conventions and recipes

_TO DO (docs-release): file conventions, "add a page" recipe._
