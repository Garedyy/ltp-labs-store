# The Online Store — LTP Labs frontend challenge

A small e-commerce app (catalogue, product detail, cart) built for the LTP Labs frontend coding
challenge. **Work in progress** — see [`Docs/PROGRESS.md`](Docs/PROGRESS.md) for the current state
and [`Docs/PROJECT_PLAN.md`](Docs/PROJECT_PLAN.md) for the full architecture.

## Remix → React Router v8

The challenge asks for a Remix app. Remix v2 is end-of-life: the framework merged into React Router,
whose **framework mode** (React Router v7+, here v8) is the direct successor — same loaders, actions,
nested routes, `<Form>` and progressive enhancement. LTP Labs confirmed that any Remix version,
including React Router v7+, is acceptable. This project therefore uses React Router v8 framework
mode with server-side rendering.

## Stack

- React 19, React Router 8 (framework mode, SSR via `@react-router/node` + `@react-router/serve`)
- Tailwind CSS 4 (`@tailwindcss/vite`)
- TypeScript 5 (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`), Vite 8
- Node 24, npm (no other package manager)

## Quick start

```sh
nvm use            # Node 24 (.nvmrc)
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
```

## Scripts

| Script              | Purpose                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`       | Development server with HMR                                                              |
| `npm run build`     | Production build into `build/`                                                           |
| `npm start`         | Serve the production build (`SESSION_SECRET` etc. must be exported — `.env` is not read) |
| `npm run typecheck` | `react-router typegen && tsc`                                                            |

More scripts (lint, format, unit, e2e, licence check) arrive with the tooling branch.

## Repository map

```
app/            application code (routes, components, services, i18n, styles)
public/         static assets (favicon, robots.txt)
Docs/           challenge brief, wireframes, API contract, plan, progress, architecture docs
```

## Licence policy and credits

Every dependency, font, icon and snippet must carry a permissive licence (MIT, ISC, BSD, Apache-2.0,
Unlicense, 0BSD, CC0, MIT-0, BlueOak-1.0.0, Python-2.0; OFL-1.1 for fonts) — never commercial,
never copyleft. `npm run check:licenses` walks the whole `node_modules` tree in CI. The project
itself ships no licence file (all rights reserved).

Documented exceptions (`Docs/DECISIONS.md` D-1) — unmodified, build- or lint-time only, never part
of the shipped bundle:

| Package                              | Licence   | Why it is there                                               |
| ------------------------------------ | --------- | ------------------------------------------------------------- |
| `lightningcss` (+ platform binaries) | MPL-2.0   | required by Vite 8 and Tailwind CSS 4                         |
| `caniuse-lite`                       | CC-BY-4.0 | browserslist data pulled by Babel through `@react-router/dev` |
| `axe-core`                           | MPL-2.0   | rule metadata used by `eslint-plugin-jsx-a11y`                |

Third-party credits:

- [DummyJSON](https://dummyjson.com) — product data.
- [Manrope](https://github.com/sharanda/manrope) — font, SIL Open Font License 1.1
  (`app/fonts/OFL.txt`), self-hosted latin subset from Google Fonts.
- [Remix Icon](https://remixicon.com) v4.8.0 — 16 icon paths, Apache License 2.0
  (`app/components/ui/icon.tsx`). Later Remix Icon releases use a custom licence and are not used.
- IBM Equal Access [`accessibility-checker`](https://github.com/IBMa/equal-access) — Apache-2.0.
