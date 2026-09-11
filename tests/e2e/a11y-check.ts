import {
  close,
  getCompliance,
  type ICheckerReport,
  type ReportResult,
  stringifyResults,
} from "accessibility-checker";
import { expect, type Page } from "@playwright/test";

const FAIL_LEVELS = new Set(["violation", "potentialviolation"]);

// Rules that only ask a human to verify something the engine cannot decide; covered by the manual
// audit protocol in Docs/ACCESSIBILITY.md. Every entry must be justified there.
const MANUAL_REVIEW_RULES = new Set([
  "style_color_misuse", // fires on any stylesheet that sets colours; verified by the audit log
]);

function isReport(result: ReportResult): result is ICheckerReport {
  return "results" in result;
}

// Labels must be unique per route x locale x state: they name the JSON report in test-results/a11y.
export async function expectAccessible(page: Page, label: string): Promise<void> {
  const { report } = await getCompliance(page, label);
  if (!isReport(report)) {
    throw new Error(
      `accessibility-checker failed to scan "${label}": ${JSON.stringify(report.details)}`,
    );
  }
  const failures = report.results.filter(
    (issue) => FAIL_LEVELS.has(issue.level) && !MANUAL_REVIEW_RULES.has(issue.ruleId),
  );
  expect(failures, stringifyResults(report)).toEqual([]);
}

export async function closeAccessibilityChecker(): Promise<void> {
  await close();
}
