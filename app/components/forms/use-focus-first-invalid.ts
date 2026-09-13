import { useEffect } from "react";

// With JavaScript the page is not reloaded after a refused submission, so autoFocus never fires:
// move the focus to the first invalid control once the new action data is rendered.
export function useFocusFirstInvalid(result: unknown) {
  useEffect(() => {
    if (!result || typeof result !== "object" || !("ok" in result) || result.ok) return;
    document.querySelector<HTMLElement>('form [aria-invalid="true"]')?.focus();
  }, [result]);
}
