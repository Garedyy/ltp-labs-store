import { closeAccessibilityChecker } from "./a11y-check";

export default async function globalTeardown(): Promise<void> {
  await closeAccessibilityChecker();
}
