## Summary

<!-- What and why, in a few sentences. Link the plan branch (Docs/PROJECT_PLAN.md section 4). -->

## Scope

<!-- Routes, components, services touched. What is deliberately left out. -->

## Screenshots

<!-- 1440 / 390 / 320 px, and the no-JS render when relevant. -->

## Checklist

- [ ] `npm run check` passes (typecheck, lint, format, licences, unit tests)
- [ ] `npm run test:e2e` passes, including the accessibility scan
- [ ] Every flow works with JavaScript disabled
- [ ] Keyboard walkthrough done (tab order, focus visible, Escape/outside-click where relevant)
- [ ] VoiceOver walkthrough done, or N/A with a reason
- [ ] 400 % zoom / 320 px reflow checked
- [ ] Reduced motion and forced colours checked
- [ ] Every new string exists in EN and PT and follows the glossary in `Docs/I18N.md`
- [ ] Logical CSS properties only (`ps-`, `pe-`, `start`, `end`)
- [ ] No new dependency without approval
- [ ] Every new dependency, font, icon or snippet has a permissive licence (no commercial, no copyleft) and `npm run check:licenses` passes
- [ ] Documentation updated (`README.md`, `CHANGELOG.md`, `Docs/*`, `Docs/PROGRESS.md`)
- [ ] Bundle reviewed when client code changed
- [ ] `tests/e2e/routes.ts` updated with the new routes
