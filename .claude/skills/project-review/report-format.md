# Report format for `/project-review`

Contract between the skill and the `review-*` agents. Each agent file inlines the block it
must emit; this page is the reference for the orchestrator and for humans.

## Reviewer block

The final message of a reviewer ends with exactly one fenced `json` block, nothing after it:

```json
{
  "perspective": "conventions",
  "verdict": "pass",
  "summary": "One sentence, English, no markdown.",
  "findings": [
    {
      "severity": "major",
      "rule": "8 - logical CSS properties",
      "file": "app/components/ui/button.tsx",
      "line": 42,
      "description": "Uses `pl-4`; physical padding breaks RTL readiness.",
      "suggestion": "Replace with `ps-4`."
    }
  ],
  "checks": { "ok": [1, 2, 3], "violated": [8], "na": [11, 14] }
}
```

- `perspective`: `correctness | conventions | security | a11y | i18n | architecture | data-layer |
  design-system | dependencies | testing | performance | docs | git`.
- `verdict`: `pass` (nothing above `info`), `warn` (only `minor`), `fail` (a `major` or
  `critical`), `skipped` (nothing in scope - say why in `summary`).
- `findings`: may be empty. `line` optional (whole or missing file). `file` repo-relative.
  `rule` starts with the checklist number of the agent.
- `checks`: checklist numbers by status; every number of the agent's checklist appears once.
  The synthesis prints `checks: 12 ok, 1 violated, 3 n/a`.

## Verifier block

`review-verifier` receives a batch and ends with one fenced `json` array, one entry per
finding id received:

```json
[{ "id": 1, "refuted": false, "confidence": "high", "reason": "file:line or doc section" }]
```

`refuted: true` = wrong, already handled, allowed by a documented decision, out of scope, or
inflated (`reason` starts with `severity:`). Undecidable = `refuted: true, confidence: "low"`.

## Severity guide (shared)

| Severity   | Meaning                                                                               |
| ---------- | ------------------------------------------------------------------------------------- |
| `critical` | Security hole, data loss, a user flow broken with or without JS, a licence violation   |
| `major`    | A documented rule broken (`Docs/PROJECT_PLAN.md`, `Docs/DECISIONS.md`, `CONTRIBUTING.md`, `CLAUDE.md`) |
| `minor`    | Style, naming, a missing test or doc line, a deviation with no user-facing effect     |
| `info`     | Observation or suggestion; no action required                                         |
