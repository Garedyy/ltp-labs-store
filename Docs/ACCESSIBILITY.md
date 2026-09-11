# Accessibility

> Skeleton — v1 lands with `feature/app-shell`, completed by `feature/a11y-audit`.
> Target: WCAG 2.2 AA, with and without JavaScript. Specification: `PROJECT_PLAN.md` §3.6.

## Global rules

_TO DO._

## Component patterns

_TO DO._

## Announcements and focus

_TO DO: event → message key → focus target table._

## Automated coverage

- **Engine**: IBM Equal Access `accessibility-checker` (Apache-2.0), policy `WCAG_2_2`, configured
  in `.achecker.yml`; `tests/e2e/a11y-check.ts` exposes `expectAccessible(page, label)` and fails on
  every `violation` / `potentialviolation` except the manual-review rules below (`DECISIONS.md` D-3).
  Labels are unique per route × locale × state; JSON reports go to `test-results/a11y/`.
- **Coverage**: every route in `tests/e2e/routes.ts` (grown by each feature PR) × `en`/`pt`, plus
  open disclosures, error states, empty cart and media emulation (added by `feature/a11y-audit`).
- **Static**: `eslint-plugin-jsx-a11y` strict with the design-system primitives mapped to their
  native elements.

### Manual-review rules (excluded from the automated failure list)

| Rule id              | Why the engine cannot decide                                                                                                                      | How it is verified                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `style_color_misuse` | fires on any stylesheet that sets colours (Tailwind preflight is enough); asks a human to confirm colour is never the only carrier of information | design rule "never colour alone" (plan §3.6) + Chrome vision-deficiency emulation in the audit log |

Results located inside a **closed** `<details>` are also dropped (`DECISIONS.md` D-3 addendum): the
engine reports `element_tabbable_unobscured` for controls that are not rendered at all. Open
disclosures are scanned as a separate state.

## Manual audit log

| Date | Tool / AT | Scope | Result      |
| ---- | --------- | ----- | ----------- |
| —    | —         | —     | not run yet |

## Known limitations

_TO DO._
